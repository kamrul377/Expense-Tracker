
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { EmptyState, Fab } from '../components/ui';
import { formatMoney } from '../utils/format';
import CustomAlert from '../components/CustomAlert';
import ShareTransactionModal from '../components/ShareTransactionModal';
import {
  cancelInvite,
  displayName,
  deleteExpense,
  deleteGroup,
  inviteByEmail,
  leaveGroup,
  norm,
  subscribeExpenses,
  subscribeGroup,
} from '../services/groupService';
import { sendPush } from '../services/pushService';
import { PrimaryBtn, SmallModal } from './GroupsScreen';

const activeMembersOf = (g) =>
  Object.fromEntries(Object.entries(g?.members || {}).filter(([uid]) => (g?.memberUids || []).includes(uid)));

const memberPhoto = (m) => m?.photoURL || m?.photo || m?.avatar || null;

/* ---------- Animated UI Helpers ---------- */

function FadeSlide({ index = 0, children, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 420,
      delay: Math.min(index, 8) * 60,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, index]);
  return (
    <Animated.View
      style={[
        { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

function Press({ onPress, onLongPress, style, children, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (val) =>
    Animated.spring(scale, { toValue: val, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => to(0.97)}
      onPressOut={() => to(1)}
      disabled={disabled}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </TouchableWithoutFeedback>
  );
}

function UserAvatar({ uri, name, size = 40, color, bg }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: color + '35',
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
      ) : (
        <Text style={{ color, fontWeight: '800', fontSize: size * 0.42 }}>{initial}</Text>
      )}
    </View>
  );
}

/* ---------- Main Screen ---------- */

export default function GroupDetailScreen({ route, navigation }) {
  const { groupId } = route.params;
  const { user, profile, colors } = useAuth();
  const { symbol } = useData();
  const primary = colors.primary || '#059669';

  const [group, setGroup] = useState(undefined);
  const [expenses, setExpenses] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  // Initial deposit modal state
  const [depositModal, setDepositModal] = useState({ visible: false, uid: null, name: '', amount: '' });

  // Share card modal state
  const [shareItem, setShareItem] = useState(null);

  // Live member profiles state
  const [profiles, setProfiles] = useState({});
  const profileSubs = useRef({});

  // Custom alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error',
    showCancel: false,
    confirmText: 'Okay, Got it',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = (title, message, type = 'error', options = {}) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      showCancel: options.showCancel || false,
      confirmText: options.confirmText || 'Okay, Got it',
      cancelText: options.cancelText || 'Cancel',
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
    });
  };

  const hideAlert = () => setAlertConfig((prev) => ({ ...prev, visible: false }));

  // Subscribe to group & expenses
  useEffect(() => {
    const u1 = subscribeGroup(groupId, setGroup, () => setGroup(null));
    const u2 = subscribeExpenses(groupId, setExpenses, () => { });
    return () => {
      u1();
      u2();
    };
  }, [groupId]);

  // Subscribe to live member profiles from users/{uid}
  useEffect(() => {
    if (!group) return;
    const uids = new Set([...(group.memberUids || []), ...Object.keys(group.members || {})]);
    uids.forEach((uid) => {
      if (profileSubs.current[uid]) return;
      profileSubs.current[uid] = onSnapshot(
        doc(db, 'users', uid),
        (snap) => {
          if (snap.exists()) setProfiles((p) => ({ ...p, [uid]: snap.data() }));
        },
        () => { }
      );
    });
  }, [group]);

  useEffect(
    () => () => {
      Object.values(profileSubs.current).forEach((unsub) => unsub());
      profileSubs.current = {};
    },
    []
  );

  useEffect(() => {
    if (group) navigation.setOptions({ title: group.name });
  }, [group, navigation]);

  const isOwner = group?.createdBy === user.uid;

  // Calculations: total expense, total deposit, per person share, member paid
  const totalExpense = useMemo(() => expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0), [expenses]);

  const paidByMember = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.paidBy] = (map[e.paidBy] || 0) + (Number(e.amount) || 0);
    });
    return map;
  }, [expenses]);

  const deposits = group?.deposits || {};
  const members = useMemo(() => Object.entries(activeMembersOf(group)), [group]);
  const memberCount = members.length || 1;
  const perPersonShare = totalExpense / memberCount;

  const totalDeposit = useMemo(
    () => members.reduce((sum, [uid]) => sum + (Number(deposits[uid]) || 0), 0),
    [members, deposits]
  );

  // Save initial deposit to Firestore
  const saveDeposit = async () => {
    if (!depositModal.uid) return;
    const val = Math.max(0, parseFloat(depositModal.amount) || 0);
    try {
      setBusy(true);
      await updateDoc(doc(db, 'groups', groupId), {
        [`deposits.${depositModal.uid}`]: val,
      });
      setDepositModal({ visible: false, uid: null, name: '', amount: '' });
    } catch (e) {
      showAlert('Error', 'Failed to update initial deposit.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const sendInvite = async () => {
    const em = norm(email);
    if (!/^\S+@\S+\.\S+$/.test(em)) {
      showAlert('Invalid Email', 'Please enter a valid email address.', 'error');
      return;
    }
    if (Object.values(activeMembersOf(group)).some((m) => m.email === em)) {
      showAlert('Already Member', 'This email is already a member of the group.', 'warning');
      return;
    }
    try {
      setBusy(true);
      await inviteByEmail(groupId, em);
      sendPush([em], {
        title: 'Group Invitation',
        body: `${displayName(user, profile)} has invited you to join "${group.name}".`,
        data: { type: 'invite', groupId },
      });
      setEmail('');
      setInviteOpen(false);
      showAlert('Invitation Sent', 'The user will see the invitation in their Groups screen once they log in.', 'success');
    } catch (e) {
      showAlert('Error', 'Failed to send invitation.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const shareLink = async () => {
    const link = Linking.createURL(`join/${group.inviteCode}`);
    await Share.share({
      message: `Join the group "${group.name}" using the invite code or link.\nCode: ${group.inviteCode}\nLink: ${link}`,
    });
  };

  const confirmDeleteExpense = (e) => {
    const canDelete = e.createdBy === user.uid || isOwner;
    if (!canDelete) {
      showAlert('Not Allowed', 'Only the person who added this expense or the group creator can delete it.', 'warning');
      return;
    }
    showAlert('Delete Entry', 'Are you sure you want to delete this expense entry?', 'warning', {
      showCancel: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        hideAlert();
        deleteExpense(groupId, e.id).catch(() => { });
      },
      onCancel: hideAlert,
    });
  };

  const openEdit = (e) => {
    if (e.createdBy !== user.uid) {
      showAlert('Not Allowed', 'You cannot edit an entry created by another member.', 'warning');
      return;
    }
    navigation.navigate('AddGroupExpense', { groupId, groupName: group.name, members: activeMembersOf(group), expense: e });
  };

  const leaveOrDelete = () => {
    if (isOwner) {
      showAlert('Delete Group', 'This will permanently delete the group and all its records. Are you sure?', 'warning', {
        showCancel: true,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        onConfirm: async () => {
          hideAlert();
          try {
            await deleteGroup(group);
            navigation.goBack();
          } catch (e) {
            showAlert('Error', 'Failed to delete group.', 'error');
          }
        },
        onCancel: hideAlert,
      });
    } else {
      showAlert('Leave Group', 'Are you sure you want to leave this group?', 'warning', {
        showCancel: true,
        confirmText: 'Leave',
        cancelText: 'Cancel',
        onConfirm: async () => {
          hideAlert();
          try {
            await leaveGroup(groupId, user.uid);
            navigation.goBack();
          } catch (e) {
            showAlert('Error', 'Failed to leave group.', 'error');
          }
        },
        onCancel: hideAlert,
      });
    }
  };

  if (group === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={primary} />
      </View>
    );
  }
  if (group === null || !(group.memberUids || []).includes(user.uid)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <EmptyState icon="account-off-outline" title="Group Not Found" subtitle="The group may have been deleted or you are no longer a member." />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={expenses}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 115 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* ===== Hero Summary Card ===== */}
            <FadeSlide index={0}>
              <View
                style={{
                  backgroundColor: primary,
                  borderRadius: 28,
                  padding: 20,
                  marginBottom: 20,
                  overflow: 'hidden',
                  shadowColor: primary,
                  shadowOpacity: 0.25,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 6,
                }}
              >
                <View style={{ position: 'absolute', top: -50, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.12)' }} />
                <View style={{ position: 'absolute', bottom: -60, left: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(0,0,0,0.12)' }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' }}>Total Group Expense</Text>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                      {expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}
                    </Text>
                  </View>
                </View>

                <Text style={{ color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 4, letterSpacing: -0.5 }}>
                  {formatMoney(totalExpense, symbol)}
                </Text>

                {/* Split & deposit mini stats */}
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: 'rgba(0,0,0,0.16)',
                    borderRadius: 16,
                    padding: 12,
                    marginTop: 16,
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' }}>Per Person ({members.length})</Text>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 2 }}>{formatMoney(perPersonShare, symbol)}</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' }}>Total Deposited</Text>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 2 }}>{formatMoney(totalDeposit, symbol)}</Text>
                  </View>
                </View>
              </View>
            </FadeSlide>

            {/* ===== Members & Balance ===== */}
            <FadeSlide index={1}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ color: colors.muted, fontWeight: '800', fontSize: 13, letterSpacing: 0.4 }}>
                  MEMBERS & BALANCE
                </Text>
                <TouchableOpacity
                  onPress={() => setInviteOpen(true)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: primary + '18',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 12,
                  }}
                >
                  <Icon name="account-plus-outline" size={16} color={primary} />
                  <Text style={{ color: primary, fontWeight: '700', fontSize: 12 }}>Invite</Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 14,
                  marginBottom: 20,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 2,
                }}
              >
                {members.map(([uid, m], i) => {
                  const liveProfile = profiles[uid];
                  const mName = liveProfile?.name || m.name || 'Member';
                  const mAvatar = liveProfile?.avatar || memberPhoto(m);

                  const deposited = Number(deposits[uid]) || 0;
                  const paid = paidByMember[uid] || 0;

                  // Balance = deposit minus this member's share of the total expense
                  // Example: deposit 100, total expense 50, 2 members -> 100 - 25 = 75
                  const balance = deposited - perPersonShare;
                  const isSettled = Math.abs(balance) < 0.5;
                  const hasBalance = balance >= 0.5;

                  return (
                    <View
                      key={uid}
                      style={{
                        paddingVertical: 14,
                        borderTopWidth: i === 0 ? 0 : 1,
                        borderTopColor: colors.border,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <UserAvatar uri={mAvatar} name={mName} size={42} color={primary} bg={primary + '1F'} />

                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }} numberOfLines={1}>
                              {mName}
                            </Text>
                            {uid === user.uid && (
                              <View style={{ backgroundColor: primary + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                <Text style={{ color: primary, fontSize: 10, fontWeight: '800' }}>YOU</Text>
                              </View>
                            )}
                            {uid === group.createdBy && (
                              <Icon name="crown" size={14} color="#F59E0B" />
                            )}
                          </View>

                          {/* Deposit & paid sub-row */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                            <TouchableOpacity
                              onPress={() =>
                                setDepositModal({
                                  visible: true,
                                  uid,
                                  name: mName,
                                  amount: deposited ? String(deposited) : '',
                                })
                              }
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                                backgroundColor: colors.bg,
                                borderWidth: 1,
                                borderColor: colors.border,
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 8,
                              }}
                            >
                              <Icon name="piggy-bank-outline" size={12} color={primary} />
                              <Text style={{ color: colors.text, fontSize: 11, fontWeight: '700' }}>
                                Deposit: {formatMoney(deposited, symbol)}
                              </Text>
                              <Icon name="pencil" size={10} color={colors.dim} />
                            </TouchableOpacity>

                            <Text style={{ color: colors.dim, fontSize: 11, fontWeight: '600' }}>
                              Paid: {formatMoney(paid, symbol)}
                            </Text>
                          </View>
                        </View>

                        {/* Balance status badge */}
                        <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                          {isSettled ? (
                            <View style={{ backgroundColor: colors.border + '80', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
                              <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '800' }}>Settled</Text>
                            </View>
                          ) : hasBalance ? (
                            <View style={{ backgroundColor: '#10B9811F', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignItems: 'flex-end' }}>
                              <Text style={{ color: '#059669', fontSize: 10, fontWeight: '700' }}>Balance</Text>
                              <Text style={{ color: '#059669', fontSize: 13, fontWeight: '900' }}>{formatMoney(balance, symbol)}</Text>
                            </View>
                          ) : (
                            <View style={{ backgroundColor: '#EF44441F', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignItems: 'flex-end' }}>
                              <Text style={{ color: '#DC2626', fontSize: 10, fontWeight: '700' }}>Due</Text>
                              <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '900' }}>{formatMoney(Math.abs(balance), symbol)}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}

                {/* Pending invites */}
                {(group.invitedEmails || []).map((em) => (
                  <View
                    key={em}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border }}
                  >
                    <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="email-outline" size={18} color={colors.dim} />
                    </View>
                    <Text style={{ color: colors.dim, marginLeft: 12, flex: 1, fontSize: 13 }} numberOfLines={1}>
                      {em} (pending)
                    </Text>
                    {isOwner && (
                      <TouchableOpacity onPress={() => cancelInvite(groupId, em).catch(() => { })}>
                        <Icon name="close-circle-outline" size={20} color={colors.dim} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              <Text style={{ color: colors.muted, fontWeight: '800', fontSize: 13, letterSpacing: 0.4, marginBottom: 10 }}>
                EXPENSES
              </Text>
            </FadeSlide>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="receipt-text-outline" title="No expenses yet" subtitle="Tap the + button to add your first expense" />}
        ListFooterComponent={
          <TouchableOpacity onPress={leaveOrDelete} style={{ alignItems: 'center', marginTop: 24, paddingVertical: 10 }}>
            <Text style={{ color: colors.expense || '#DC2626', fontWeight: '800', fontSize: 14 }}>
              {isOwner ? 'Delete group' : 'Leave group'}
            </Text>
          </TouchableOpacity>
        }
        renderItem={({ item: e, index }) => {
          const payerProfile = profiles[e.paidBy];
          const who = payerProfile?.name || group.members?.[e.paidBy]?.name || e.paidByName || 'Someone';
          const payerPhoto = payerProfile?.avatar || memberPhoto(group.members?.[e.paidBy]);
          const d = e.date ? new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '';

          return (
            <FadeSlide index={index + 2}>
              <Press
                onPress={() => openEdit(e)}
                onLongPress={() => confirmDeleteExpense(e)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.card,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 14,
                  marginBottom: 10,
                  shadowColor: '#000',
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                {/* Payer profile picture */}
                <UserAvatar uri={payerPhoto} name={who} size={44} color={primary} bg={primary + '1A'} />

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }} numberOfLines={1}>
                    {e.title}
                  </Text>
                  <Text style={{ color: colors.dim, fontSize: 12, marginTop: 3 }} numberOfLines={1}>
                    {who} paid · {d}
                    {e.note ? ` · ${e.note}` : ''}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 6, marginLeft: 8 }}>
                  <Text style={{ color: colors.text, fontWeight: '900', fontSize: 15 }}>{formatMoney(e.amount, symbol)}</Text>

                  {/* Opens ShareTransactionModal */}
                  <TouchableOpacity
                    onPress={() =>
                      setShareItem({
                        ...e,
                        type: 'expense',
                        paidByName: who,
                        paidByAvatar: payerPhoto,
                        groupName: group.name,
                      })
                    }
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: primary + '15',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Icon name="share-variant-outline" size={13} color={primary} />
                    <Text style={{ color: primary, fontSize: 11, fontWeight: '700' }}>Card</Text>
                  </TouchableOpacity>
                </View>
              </Press>
            </FadeSlide>
          );
        }}
      />

      <Fab onPress={() => navigation.navigate('AddGroupExpense', { groupId, groupName: group.name, members: activeMembersOf(group) })} />

      {/* ===== Initial Deposit Edit Modal ===== */}
      <SmallModal
        visible={depositModal.visible}
        onClose={() => setDepositModal({ visible: false, uid: null, name: '', amount: '' })}
        title={`Initial Deposit (${depositModal.name})`}
        colors={colors}
      >
        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>
          Enter the initial amount deposited by {depositModal.name}:
        </Text>
        <TextInput
          value={depositModal.amount}
          onChangeText={(v) => setDepositModal((prev) => ({ ...prev, amount: v }))}
          placeholder="0"
          placeholderTextColor={colors.dim}
          keyboardType="numeric"
          style={{
            backgroundColor: colors.bg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: colors.text,
            fontSize: 18,
            fontWeight: '800',
            marginBottom: 14,
          }}
          autoFocus
        />
        <PrimaryBtn label="Save Deposit" onPress={saveDeposit} busy={busy} color={primary} />
      </SmallModal>

      {/* ===== Invite Friends Modal ===== */}
      <SmallModal visible={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite friends" colors={colors}>
        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>Enter your friend's registered email:</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="friend@email.com"
          placeholderTextColor={colors.dim}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            backgroundColor: colors.bg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: colors.text,
            marginBottom: 12,
          }}
        />
        <PrimaryBtn label="Send invite" onPress={sendInvite} busy={busy} color={primary} />
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />
        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>Or share invite link / code:</Text>
        <TouchableOpacity
          onPress={shareLink}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: primary,
            borderRadius: 14,
            paddingVertical: 13,
          }}
        >
          <Icon name="share-variant" size={18} color={primary} />
          <Text style={{ color: primary, fontWeight: '800' }}>Share link ({group.inviteCode})</Text>
        </TouchableOpacity>
      </SmallModal>

      {/* ===== Share Transaction Modal ===== */}
      <ShareTransactionModal
        visible={!!shareItem}
        onClose={() => setShareItem(null)}
        item={shareItem}
        symbol={symbol}
        colors={colors}
      />

      {/* Custom alert component */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm || hideAlert}
        onCancel={alertConfig.onCancel || hideAlert}
      />
    </View>
  );
}