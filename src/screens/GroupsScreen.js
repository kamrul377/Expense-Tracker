

// screens/GroupsScreen.js
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { EmptyState, Fab } from '../components/ui';
import { radius } from '../constants/theme';
import CustomAlert from '../components/CustomAlert'; // Import your custom alert component
import {
  acceptInvite,
  createGroup,
  declineInvite,
  joinByCode,
  subscribeMyGroups,
  subscribeMyInvites,
} from '../services/groupService';

export default function GroupsScreen({ navigation, route }) {
  const { user, profile, colors, isGuest } = useAuth();
  const noAccount = isGuest || !user.email;
  const primary = colors.primary || '#059669';

  const [groups, setGroups] = useState(null);
  const [invites, setInvites] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error',
    showCancel: false,
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = (title, message, type = 'error', options = {}) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      ...options,
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    if (noAccount) return undefined;
    const u1 = subscribeMyGroups(user.uid, setGroups, () => setGroups([]));
    const u2 = subscribeMyInvites(user.email, setInvites, () => setInvites([]));
    return () => {
      u1();
      u2();
    };
  }, [user.uid, user.email, noAccount]);

  // Deep link (myapp://join/CODE) theke ashle auto join
  useEffect(() => {
    const c = route?.params?.joinCode;
    if (c) {
      setCode(String(c));
      doJoin(String(c));
      navigation.setParams({ joinCode: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params?.joinCode]);

  const doCreate = async () => {
    if (!name.trim()) return;
    try {
      setBusy(true);
      const id = await createGroup({ name, user, profile });
      setName('');
      setCreateOpen(false);
      navigation.navigate('GroupDetail', { groupId: id });
    } catch (e) {
      showAlert('Error', 'Group create kora jayni.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const doJoin = async (c) => {
    try {
      setBusy(true);
      const id = await joinByCode(c || code, user, profile);
      setCode('');
      setJoinOpen(false);
      navigation.navigate('GroupDetail', { groupId: id });
    } catch (e) {
      showAlert('Join failed', 'The code is incorrect, or the group could not be found.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const doAccept = async (g) => {
    try {
      await acceptInvite(g.id, user, profile);
    } catch (e) {
      showAlert('Error', 'Invite accept kora jayni.', 'error');
    }
  };

  const doDecline = async (g) => {
    try {
      await declineInvite(g.id, user.email);
    } catch (e) {
      showAlert('Error', 'Decline kora jayni.', 'error');
    }
  };

  if (noAccount) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <EmptyState
          icon="account-lock-outline"
          title="Account Required"
          subtitle="Please create an account using your email and log in to use group features. Group features are not available in guest mode."
        />
      </View>
    );
  }

  if (groups === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <TouchableOpacity
              onPress={() => setJoinOpen(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: 12,
                marginBottom: 14,
              }}
            >
              <Icon name="link-variant" size={20} color={primary} />
              <Text style={{ color: colors.text, fontWeight: '600', flex: 1 }}>Join with invite code</Text>
              <Icon name="chevron-right" size={20} color={colors.dim} />
            </TouchableOpacity>

            {invites.length > 0 && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: colors.muted, fontWeight: '700', marginBottom: 8 }}>Invitations ({invites.length})</Text>
                {invites.map((g) => (
                  <View
                    key={g.id}
                    style={{
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: primary,
                      borderRadius: radius.md,
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: colors.text, fontWeight: '700' }}>{g.name}</Text>
                    <Text style={{ color: colors.dim, fontSize: 12, marginTop: 2 }}>
                      {Object.values(g.members || {})
                        .map((m) => m.name)
                        .join(', ')}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                      <TouchableOpacity
                        onPress={() => doAccept(g)}
                        style={{ flex: 1, backgroundColor: primary, borderRadius: 10, paddingVertical: 9, alignItems: 'center' }}
                      >
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => doDecline(g)}
                        style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 9, alignItems: 'center' }}
                      >
                        <Text style={{ color: colors.muted, fontWeight: '700' }}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {groups.length > 0 && <Text style={{ color: colors.muted, fontWeight: '700', marginBottom: 8 }}>My groups</Text>}
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="account-group-outline" title="No groups yet" subtitle="Shared Expenses for Tours or Trips" />
        }
        renderItem={({ item: g }) => {
          const count = (g.memberUids || []).length;
          const mine = g.createdBy === user.uid;
          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('GroupDetail', { groupId: g.id })}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: primary + '22', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="account-group" size={24} color={primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
                  {g.name}
                </Text>
                <Text style={{ color: colors.dim, fontSize: 12, marginTop: 2 }}>
                  {count} {count === 1 ? 'member' : 'members'}
                  {mine ? ' - You created' : ''}
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color={colors.dim} />
            </TouchableOpacity>
          );
        }}
      />
      <Fab onPress={() => setCreateOpen(true)} />

      <SmallModal visible={createOpen} onClose={() => setCreateOpen(false)} title="New group" colors={colors}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Group name (e.g. Cox's Bazar Tour)"
          placeholderTextColor={colors.dim}
          style={inputStyle(colors)}
          autoFocus
        />
        <PrimaryBtn label="Create group" onPress={doCreate} busy={busy} color={primary} />
      </SmallModal>

      <SmallModal visible={joinOpen} onClose={() => setJoinOpen(false)} title="Join a group" colors={colors}>
        <TextInput
          value={code}
          onChangeText={(v) => setCode(v.toUpperCase())}
          placeholder="Invite code"
          autoCapitalize="characters"
          placeholderTextColor={colors.dim}
          style={inputStyle(colors)}
          autoFocus
        />
        <PrimaryBtn label="Join" onPress={() => doJoin()} busy={busy} color={primary} />
      </SmallModal>

      {/* Custom Alert Component */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showCancel={alertConfig.showCancel}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
    </View>
  );
}

const inputStyle = (colors) => ({
  backgroundColor: colors.bg,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  color: colors.text,
  marginBottom: 14,
});

export function PrimaryBtn({ label, onPress, busy, color }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={busy}
      style={{ backgroundColor: color, borderRadius: 14, paddingVertical: 14, alignItems: 'center', opacity: busy ? 0.7 : 1 }}
    >
      {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800' }}>{label}</Text>}
    </TouchableOpacity>
  );
}

export function SmallModal({ visible, onClose, title, colors, children }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={22} color={colors.dim} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}