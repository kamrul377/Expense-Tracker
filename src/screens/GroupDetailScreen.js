

// // screens/GroupDetailScreen.js
// import React, { useEffect, useMemo, useState } from 'react';
// import { ActivityIndicator, Alert, FlatList, Share, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import * as Linking from 'expo-linking';
// import { useAuth } from '../context/AuthContext';
// import { useData } from '../context/DataContext';
// import { EmptyState, Fab } from '../components/ui';
// import { radius } from '../constants/theme';
// import { formatMoney } from '../utils/format';
// import {
//   cancelInvite,
//   displayName,
//   deleteExpense,
//   deleteGroup,
//   inviteByEmail,
//   leaveGroup,
//   norm,
//   subscribeExpenses,
//   subscribeGroup,
// } from '../services/groupService';
// import { sendPush } from '../services/pushService';
// import { PrimaryBtn, SmallModal } from './GroupsScreen';

// // Je member ekhono group e ache shudhu tader (ber hoye gele members map e naam thake, kintu list e dekhabo na)
// const activeMembersOf = (g) =>
//   Object.fromEntries(Object.entries(g?.members || {}).filter(([uid]) => (g?.memberUids || []).includes(uid)));

// export default function GroupDetailScreen({ route, navigation }) {
//   const { groupId } = route.params;
//   const { user, profile, colors } = useAuth();
//   const { symbol } = useData();
//   const primary = colors.primary || '#059669';

//   const [group, setGroup] = useState(undefined);
//   const [expenses, setExpenses] = useState([]);
//   const [inviteOpen, setInviteOpen] = useState(false);
//   const [email, setEmail] = useState('');
//   const [busy, setBusy] = useState(false);

//   useEffect(() => {
//     const u1 = subscribeGroup(groupId, setGroup, () => setGroup(null));
//     const u2 = subscribeExpenses(groupId, setExpenses, () => { });
//     return () => {
//       u1();
//       u2();
//     };
//   }, [groupId]);

//   useEffect(() => {
//     if (group) navigation.setOptions({ title: group.name });
//   }, [group, navigation]);

//   const isOwner = group?.createdBy === user.uid;

//   const total = useMemo(() => expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0), [expenses]);

//   const perMember = useMemo(() => {
//     const map = {};
//     expenses.forEach((e) => {
//       map[e.paidBy] = (map[e.paidBy] || 0) + (Number(e.amount) || 0);
//     });
//     return map;
//   }, [expenses]);

//   const sendInvite = async () => {
//     const em = norm(email);
//     if (!/^\S+@\S+\.\S+$/.test(em)) {
//       Alert.alert('Email', 'Sothik email din.');
//       return;
//     }
//     if (Object.values(activeMembersOf(group)).some((m) => m.email === em)) {
//       Alert.alert('Already member', 'This email is already in the group.');
//       return;
//     }
//     try {
//       setBusy(true);
//       await inviteByEmail(groupId, em);
//       sendPush([em], {
//         title: 'Group invitation',
//         body: `${displayName(user, profile)} apnake "${group.name}" group e invite korechhen`,
//         data: { type: 'invite', groupId },
//       });
//       setEmail('');
//       Alert.alert('Invited', 'Se app e login korle Groups screen e invitation dekhte pabe.');
//     } catch (e) {
//       Alert.alert('Error', 'Invite pathano jayni.');
//     } finally {
//       setBusy(false);
//     }
//   };

//   const shareLink = async () => {
//     const link = Linking.createURL(`join/${group.inviteCode}`);
//     await Share.share({
//       message: `"${group.name}" group e join korte amar app e invite code ba link use koro.\nCode: ${group.inviteCode}\nLink: ${link}`,
//     });
//   };

//   const confirmDeleteExpense = (e) => {
//     const canDelete = e.createdBy === user.uid || isOwner;
//     if (!canDelete) {
//       Alert.alert('Not allowed', 'Shudhu je add korse se ba group creator delete korte pare.');
//       return;
//     }
//     Alert.alert('Delete', 'Delete this entry?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(groupId, e.id).catch(() => { }) },
//     ]);
//   };

//   const openEdit = (e) => {
//     if (e.createdBy !== user.uid) {
//       Alert.alert('Not allowed', 'Onner entry edit kora jabe na.');
//       return;
//     }
//     navigation.navigate('AddGroupExpense', { groupId, groupName: group.name, members: activeMembersOf(group), expense: e });
//   };

//   const leaveOrDelete = () => {
//     if (isOwner) {
//       Alert.alert('Delete group', 'Group ar tar shob hisab delete hoye jabe. Nishchit?', [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await deleteGroup(group);
//               navigation.goBack();
//             } catch (e) {
//               Alert.alert('Error', 'Delete kora jayni.');
//             }
//           },
//         },
//       ]);
//     } else {
//       Alert.alert('Leave group', 'Group theke ber hoye jaben?', [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Leave',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await leaveGroup(groupId, user.uid);
//               navigation.goBack();
//             } catch (e) {
//               Alert.alert('Error', 'Leave kora jayni.');
//             }
//           },
//         },
//       ]);
//     }
//   };

//   if (group === undefined) {
//     return (
//       <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
//         <ActivityIndicator color={primary} />
//       </View>
//     );
//   }
//   if (group === null || !(group.memberUids || []).includes(user.uid)) {
//     return (
//       <View style={{ flex: 1, backgroundColor: colors.bg }}>
//         <EmptyState icon="account-off-outline" title="Group paoya jayni" subtitle="Group ta delete hoye gese ba apni member na." />
//       </View>
//     );
//   }

//   const members = Object.entries(activeMembersOf(group));

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.bg }}>
//       <FlatList
//         data={expenses}
//         keyExtractor={(e) => e.id}
//         contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
//         showsVerticalScrollIndicator={false}
//         ListHeaderComponent={
//           <View>
//             {/* Total */}
//             <View style={{ backgroundColor: primary, borderRadius: 24, padding: 18, marginBottom: 14, overflow: 'hidden' }}>
//               <View style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.14)' }} />
//               <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Total group expense</Text>
//               <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 2 }}>{formatMoney(total, symbol)}</Text>
//               <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 }}>
//                 {expenses.length} entries - {members.length} members
//               </Text>
//             </View>

//             {/* Members */}
//             <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
//               <Text style={{ color: colors.muted, fontWeight: '700' }}>Members</Text>
//               <TouchableOpacity onPress={() => setInviteOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//                 <Icon name="account-plus-outline" size={18} color={primary} />
//                 <Text style={{ color: primary, fontWeight: '700', fontSize: 13 }}>Invite</Text>
//               </TouchableOpacity>
//             </View>
//             <View
//               style={{
//                 backgroundColor: colors.card,
//                 borderRadius: radius.md,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//                 paddingHorizontal: 12,
//                 marginBottom: 16,
//               }}
//             >
//               {members.map(([uid, m], i) => (
//                 <View
//                   key={uid}
//                   style={{
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     paddingVertical: 10,
//                     borderTopWidth: i === 0 ? 0 : 1,
//                     borderTopColor: colors.border,
//                   }}
//                 >
//                   <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: primary + '22', alignItems: 'center', justifyContent: 'center' }}>
//                     <Text style={{ color: primary, fontWeight: '800' }}>{(m.name || '?').charAt(0).toUpperCase()}</Text>
//                   </View>
//                   <Text style={{ color: colors.text, marginLeft: 10, flex: 1 }} numberOfLines={1}>
//                     {m.name}
//                     {uid === user.uid ? ' (You)' : ''}
//                     {uid === group.createdBy ? '  *' : ''}
//                   </Text>
//                   <Text style={{ color: colors.muted, fontWeight: '700' }}>{formatMoney(perMember[uid] || 0, symbol)}</Text>
//                 </View>
//               ))}
//               {(group.invitedEmails || []).map((em) => (
//                 <View
//                   key={em}
//                   style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border }}
//                 >
//                   <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
//                     <Icon name="email-outline" size={16} color={colors.dim} />
//                   </View>
//                   <Text style={{ color: colors.dim, marginLeft: 10, flex: 1 }} numberOfLines={1}>
//                     {em} (pending)
//                   </Text>
//                   {isOwner && (
//                     <TouchableOpacity onPress={() => cancelInvite(groupId, em).catch(() => { })}>
//                       <Icon name="close-circle-outline" size={18} color={colors.dim} />
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               ))}
//             </View>

//             <Text style={{ color: colors.muted, fontWeight: '700', marginBottom: 8 }}>Expenses</Text>
//           </View>
//         }
//         ListEmptyComponent={<EmptyState icon="receipt-text-outline" title="No expenses yet" subtitle="Tap the + button to add your first expense" />}
//         ListFooterComponent={
//           <TouchableOpacity onPress={leaveOrDelete} style={{ alignItems: 'center', marginTop: 20 }}>
//             <Text style={{ color: colors.expense || '#DC2626', fontWeight: '700' }}>{isOwner ? 'Delete group' : 'Leave group'}</Text>
//           </TouchableOpacity>
//         }
//         renderItem={({ item: e }) => {
//           const who = group.members?.[e.paidBy]?.name || e.paidByName || 'Someone';
//           const d = e.date ? new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '';
//           return (
//             <TouchableOpacity
//               onPress={() => openEdit(e)}
//               onLongPress={() => confirmDeleteExpense(e)}
//               activeOpacity={0.8}
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 backgroundColor: colors.card,
//                 borderRadius: radius.md,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//                 padding: 12,
//                 marginBottom: 10,
//               }}
//             >
//               <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: (colors.expense || '#DC2626') + '1F', alignItems: 'center', justifyContent: 'center' }}>
//                 <Icon name="receipt" size={20} color={colors.expense || '#DC2626'} />
//               </View>
//               <View style={{ flex: 1, marginLeft: 12 }}>
//                 <Text style={{ color: colors.text, fontWeight: '700' }} numberOfLines={1}>
//                   {e.title}
//                 </Text>
//                 <Text style={{ color: colors.dim, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
//                   {who} paid - {d}
//                   {e.note ? ` - ${e.note}` : ''}
//                 </Text>
//               </View>
//               <Text style={{ color: colors.text, fontWeight: '800' }}>{formatMoney(e.amount, symbol)}</Text>
//             </TouchableOpacity>
//           );
//         }}
//       />
//       <Fab onPress={() => navigation.navigate('AddGroupExpense', { groupId, groupName: group.name, members: activeMembersOf(group) })} />

//       <SmallModal visible={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite friends" colors={colors}>
//         <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>Friend er registered email din:</Text>
//         <TextInput
//           value={email}
//           onChangeText={setEmail}
//           placeholder="friend@email.com"
//           placeholderTextColor={colors.dim}
//           autoCapitalize="none"
//           keyboardType="email-address"
//           style={{
//             backgroundColor: colors.bg,
//             borderWidth: 1,
//             borderColor: colors.border,
//             borderRadius: 14,
//             paddingHorizontal: 14,
//             paddingVertical: 12,
//             color: colors.text,
//             marginBottom: 12,
//           }}
//         />
//         <PrimaryBtn label="Send invite" onPress={sendInvite} busy={busy} color={primary} />
//         <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />
//         <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>Ba link / code share korun:</Text>
//         <TouchableOpacity
//           onPress={shareLink}
//           style={{
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'center',
//             gap: 8,
//             borderWidth: 1,
//             borderColor: primary,
//             borderRadius: 14,
//             paddingVertical: 13,
//           }}
//         >
//           <Icon name="share-variant" size={18} color={primary} />
//           <Text style={{ color: primary, fontWeight: '800' }}>Share link ({group.inviteCode})</Text>
//         </TouchableOpacity>
//       </SmallModal>
//     </View>
//   );
// }






// screens/GroupDetailScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Share, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { EmptyState, Fab } from '../components/ui';
import { radius } from '../constants/theme';
import { formatMoney } from '../utils/format';
import CustomAlert from '../components/CustomAlert'; // Import your CustomAlert component
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

// Only include active members (if someone left, their uid is removed from memberUids)
const activeMembersOf = (g) =>
  Object.fromEntries(Object.entries(g?.members || {}).filter(([uid]) => (g?.memberUids || []).includes(uid)));

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

  // Custom Alert State
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

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    const u1 = subscribeGroup(groupId, setGroup, () => setGroup(null));
    const u2 = subscribeExpenses(groupId, setExpenses, () => { });
    return () => {
      u1();
      u2();
    };
  }, [groupId]);

  useEffect(() => {
    if (group) navigation.setOptions({ title: group.name });
  }, [group, navigation]);

  const isOwner = group?.createdBy === user.uid;

  const total = useMemo(() => expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0), [expenses]);

  const perMember = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.paidBy] = (map[e.paidBy] || 0) + (Number(e.amount) || 0);
    });
    return map;
  }, [expenses]);

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
        deleteExpense(groupId, e.id).catch(() => {});
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

  const members = Object.entries(activeMembersOf(group));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={expenses}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Total */}
            <View style={{ backgroundColor: primary, borderRadius: 24, padding: 18, marginBottom: 14, overflow: 'hidden' }}>
              <View style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.14)' }} />
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Total group expense</Text>
              <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 2 }}>{formatMoney(total, symbol)}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 }}>
                {expenses.length} entries - {members.length} members
              </Text>
            </View>

            {/* Members */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: colors.muted, fontWeight: '700' }}>Members</Text>
              <TouchableOpacity onPress={() => setInviteOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="account-plus-outline" size={18} color={primary} />
                <Text style={{ color: primary, fontWeight: '700', fontSize: 13 }}>Invite</Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 12,
                marginBottom: 16,
              }}
            >
              {members.map(([uid, m], i) => (
                <View
                  key={uid}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: primary + '22', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: primary, fontWeight: '800' }}>{(m.name || '?').charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={{ color: colors.text, marginLeft: 10, flex: 1 }} numberOfLines={1}>
                    {m.name}
                    {uid === user.uid ? ' (You)' : ''}
                    {uid === group.createdBy ? '  *' : ''}
                  </Text>
                  <Text style={{ color: colors.muted, fontWeight: '700' }}>{formatMoney(perMember[uid] || 0, symbol)}</Text>
                </View>
              ))}
              {(group.invitedEmails || []).map((em) => (
                <View
                  key={em}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border }}
                >
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="email-outline" size={16} color={colors.dim} />
                  </View>
                  <Text style={{ color: colors.dim, marginLeft: 10, flex: 1 }} numberOfLines={1}>
                    {em} (pending)
                  </Text>
                  {isOwner && (
                    <TouchableOpacity onPress={() => cancelInvite(groupId, em).catch(() => { })}>
                      <Icon name="close-circle-outline" size={18} color={colors.dim} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <Text style={{ color: colors.muted, fontWeight: '700', marginBottom: 8 }}>Expenses</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="receipt-text-outline" title="No expenses yet" subtitle="Tap the + button to add your first expense" />}
        ListFooterComponent={
          <TouchableOpacity onPress={leaveOrDelete} style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: colors.expense || '#DC2626', fontWeight: '700' }}>{isOwner ? 'Delete group' : 'Leave group'}</Text>
          </TouchableOpacity>
        }
        renderItem={({ item: e }) => {
          const who = group.members?.[e.paidBy]?.name || e.paidByName || 'Someone';
          const d = e.date ? new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '';
          return (
            <TouchableOpacity
              onPress={() => openEdit(e)}
              onLongPress={() => confirmDeleteExpense(e)}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: (colors.expense || '#DC2626') + '1F', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="receipt" size={20} color={colors.expense || '#DC2626'} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }} numberOfLines={1}>
                  {e.title}
                </Text>
                <Text style={{ color: colors.dim, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                  {who} paid - {d}
                  {e.note ? ` - ${e.note}` : ''}
                </Text>
              </View>
              <Text style={{ color: colors.text, fontWeight: '800' }}>{formatMoney(e.amount, symbol)}</Text>
            </TouchableOpacity>
          );
        }}
      />
      <Fab onPress={() => navigation.navigate('AddGroupExpense', { groupId, groupName: group.name, members: activeMembersOf(group) })} />

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

      {/* Custom Alert Component */}
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