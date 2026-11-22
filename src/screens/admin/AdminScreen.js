

// import React, { useEffect, useMemo, useState } from 'react';
// import { Alert, FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
// import { db } from '../../firebase';
// import { Button, Card, EmptyState } from '../../components/ui';
// import { useAuth } from '../../context/AuthContext';
// import { radius } from '../../constants/theme';
// import { ROLES, ROLE_COLORS, ROLE_LABELS } from '../../constants/roles';

// const roleColor = (r) => ROLE_COLORS[r] || ROLE_COLORS.user;
// const roleLabel = (r) => ROLE_LABELS[r] || ROLE_LABELS.user;

// // Helper to format last logout timestamp nicely
// const formatLastLogout = (timestamp) => {
//   if (!timestamp) return 'Never / Unknown';
//   const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
//   return date.toLocaleString('en-US', {
//     month: 'short',
//     day: 'numeric',
//     hour: 'numeric',
//     minute: '2-digit',
//     hour12: true,
//   });
// };

// export default function AdminScreen() {
//   const { user, colors } = useAuth();
//   const [users, setUsers] = useState([]);
//   const [search, setSearch] = useState('');
//   const [selected, setSelected] = useState(null);

//   useEffect(
//     () =>
//       onSnapshot(
//         collection(db, 'users'),
//         (snap) => setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() }))),
//         (e) => Alert.alert('Error', e.message)
//       ),
//     []
//   );

//   const stats = useMemo(
//     () => ({
//       total: users.length,
//       admins: users.filter((u) => u.role === ROLES.ADMIN).length,
//       disabled: users.filter((u) => u.disabled).length,
//       online: users.filter((u) => u.isOnline).length,
//     }),
//     [users]
//   );

//   const list = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return users
//       .filter((u) => !q || `${u.name} ${u.email}`.toLowerCase().includes(q))
//       .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
//   }, [users, search]);

//   const update = (uid, patch) =>
//     updateDoc(doc(db, 'users', uid), patch).catch((e) => Alert.alert('Error', e.message));

//   const selectedUser = selected && users.find((u) => u.uid === selected);
//   const isSelf = selectedUser?.uid === user.uid;

//   const setRole = (r) => update(selectedUser.uid, { role: r });

//   const toggleDisabled = () => {
//     update(selectedUser.uid, { disabled: !selectedUser.disabled });
//     setSelected(null);
//   };

//   const Stat = ({ label, value, color }) => (
//     <Card style={{ flex: 1, padding: 12, marginBottom: 0, alignItems: 'center' }}>
//       <Text style={{ color, fontSize: 20, fontWeight: '800' }}>{value}</Text>
//       <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{label}</Text>
//     </Card>
//   );

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.bg }}>
//       <FlatList
//         data={list}
//         keyExtractor={(u) => u.uid}
//         contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
//         ListHeaderComponent={
//           <View style={{ marginBottom: 12 }}>
//             <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
//               <Stat label="Total" value={stats.total} color={colors.primaryLight} />
//               <Stat label="Online" value={stats.online} color="#10B981" />
//               <Stat label="Admins" value={stats.admins} color={ROLE_COLORS.admin} />
//               <Stat label="Disabled" value={stats.disabled} color={colors.dim} />
//             </View>
//             <Text style={{ color: colors.dim, fontSize: 12, marginBottom: 12 }}>
//               Tap a user to change their role or enable/disable their account.
//             </Text>
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 backgroundColor: colors.card,
//                 borderRadius: radius.md,
//                 paddingHorizontal: 12,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//               }}
//             >
//               <Icon name="magnify" size={20} color={colors.dim} />
//               <TextInput
//                 value={search}
//                 onChangeText={setSearch}
//                 placeholder="Search by name or email"
//                 placeholderTextColor={colors.dim}
//                 autoCapitalize="none"
//                 style={{ flex: 1, color: colors.text, paddingVertical: 11, paddingHorizontal: 8 }}
//               />
//             </View>
//           </View>
//         }
//         ListEmptyComponent={<EmptyState icon="account-search" title="No users found" />}
//         renderItem={({ item }) => (
//           <TouchableOpacity activeOpacity={0.8} onPress={() => setSelected(item.uid)}>
//             <Card
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 paddingVertical: 12,
//                 marginBottom: 10,
//                 opacity: item.disabled ? 0.55 : 1,
//               }}
//             >
//               <View style={{ position: 'relative' }}>
//                 <View
//                   style={{
//                     width: 40,
//                     height: 40,
//                     borderRadius: 20,
//                     backgroundColor: roleColor(item.role) + '30',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     overflow: 'hidden',
//                   }}
//                 >
//                   {item.avatar ? (
//                     <Image source={{ uri: item.avatar }} style={{ width: '100%', height: '100%' }} />
//                   ) : (
//                     <Text style={{ color: roleColor(item.role), fontWeight: '800' }}>
//                       {(item.name || '?')[0].toUpperCase()}
//                     </Text>
//                   )}
//                 </View>
//                 {/* Active Status Indicator Dot */}
//                 <View
//                   style={{
//                     position: 'absolute',
//                     bottom: 0,
//                     right: 0,
//                     width: 11,
//                     height: 11,
//                     borderRadius: 6,
//                     backgroundColor: item.isOnline ? '#10B981' : '#94A3B8',
//                     borderWidth: 2,
//                     borderColor: colors.card,
//                   }}
//                 />
//               </View>

//               <View style={{ flex: 1, marginLeft: 12 }}>
//                 <Text style={{ color: colors.text, fontWeight: '600' }}>
//                   {item.name} {item.uid === user.uid ? '(you)' : ''}
//                 </Text>
//                 <Text style={{ color: colors.muted, fontSize: 12 }}>
//                   {item.isOnline ? (
//                     <Text style={{ color: '#10B981', fontWeight: '600' }}>Active now</Text>
//                   ) : (
//                     `Last logout: ${formatLastLogout(item.lastLogout)}`
//                   )}
//                 </Text>
//               </View>

//               <View style={{ alignItems: 'flex-end' }}>
//                 <Text style={{ color: roleColor(item.role), fontWeight: '700', fontSize: 12 }}>
//                   {roleLabel(item.role)}
//                 </Text>
//                 {item.disabled ? <Text style={{ color: colors.expense, fontSize: 11 }}>Disabled</Text> : null}
//               </View>
//             </Card>
//           </TouchableOpacity>
//         )}
//       />

//       <Modal visible={!!selectedUser} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
//         <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
//           {selectedUser && (
//             <View
//               style={{
//                 backgroundColor: colors.card,
//                 borderRadius: radius.lg,
//                 padding: 20,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//               }}
//             >
//               <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
//                 <View
//                   style={{
//                     width: 48,
//                     height: 48,
//                     borderRadius: 24,
//                     backgroundColor: roleColor(selectedUser.role) + '30',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     overflow: 'hidden',
//                     marginRight: 12,
//                   }}
//                 >
//                   {selectedUser.avatar ? (
//                     <Image source={{ uri: selectedUser.avatar }} style={{ width: '100%', height: '100%' }} />
//                   ) : (
//                     <Text style={{ color: roleColor(selectedUser.role), fontWeight: '800', fontSize: 18 }}>
//                       {(selectedUser.name || '?')[0].toUpperCase()}
//                     </Text>
//                   )}
//                 </View>
//                 <View style={{ flex: 1 }}>
//                   <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{selectedUser.name}</Text>
//                   <Text style={{ color: colors.muted, fontSize: 13 }}>{selectedUser.email}</Text>
//                   <Text style={{ color: selectedUser.isOnline ? '#10B981' : colors.muted, fontSize: 12, marginTop: 2 }}>
//                     {selectedUser.isOnline ? '● Active now' : `Last logout: ${formatLastLogout(selectedUser.lastLogout)}`}
//                   </Text>
//                 </View>
//               </View>

//               <Text
//                 style={{
//                   color: colors.muted,
//                   fontSize: 12,
//                   fontWeight: '600',
//                   textTransform: 'uppercase',
//                   marginBottom: 8,
//                 }}
//               >
//                 Role
//               </Text>
//               <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
//                 {Object.values(ROLES).map((r) => {
//                   const active = selectedUser.role === r;
//                   return (
//                     <TouchableOpacity
//                       key={r}
//                       disabled={isSelf}
//                       onPress={() => setRole(r)}
//                       style={{
//                         flex: 1,
//                         paddingVertical: 10,
//                         alignItems: 'center',
//                         borderRadius: radius.md,
//                         borderWidth: 1,
//                         borderColor: active ? ROLE_COLORS[r] : colors.border,
//                         backgroundColor: active ? ROLE_COLORS[r] + '26' : colors.bg,
//                         opacity: isSelf && !active ? 0.4 : 1,
//                       }}
//                     >
//                       <Text style={{ color: active ? ROLE_COLORS[r] : colors.muted, fontWeight: '700', fontSize: 13 }}>
//                         {ROLE_LABELS[r]}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </View>

//               {isSelf ? (
//                 <Text style={{ color: colors.dim, fontSize: 12, marginBottom: 12 }}>
//                   You cannot change your own role or disable your own account.
//                 </Text>
//               ) : (
//                 <Button
//                   title={selectedUser.disabled ? 'Enable account' : 'Disable account'}
//                   variant={selectedUser.disabled ? 'primary' : 'danger'}
//                   onPress={toggleDisabled}
//                 />
//               )}
//               <Button title="Close" variant="secondary" onPress={() => setSelected(null)} style={{ marginTop: 10 }} />
//             </View>
//           )}
//         </View>
//       </Modal>
//     </View>
//   );
// }











import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Button, Card, EmptyState } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { radius } from '../../constants/theme';
import { ROLES, ROLE_COLORS, ROLE_LABELS } from '../../constants/roles';

const roleColor = (r) => ROLE_COLORS[r] || ROLE_COLORS.user;
const roleLabel = (r) => ROLE_LABELS[r] || ROLE_LABELS.user;

const ONLINE_WINDOW_MS = 2 * 60 * 1000; // 2 minute er moddhe seen hole online

const toMillis = (ts) => {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate().getTime();
  return new Date(ts).getTime();
};

// Online = isOnline true AND lastSeen last 2 minute er moddhe
const isUserOnline = (u) => {
  if (!u.isOnline) return false;
  const t = toMillis(u.lastSeen);
  if (!t) return false;
  return Date.now() - t < ONLINE_WINDOW_MS;
};

const formatTime = (timestamp) => {
  if (!timestamp) return 'Never / Unknown';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Offline hole last logout, na thakle last seen dekhabe (app kill korle logout hoy na)
const offlineText = (u) =>
  u.lastLogout && (!u.lastSeen || toMillis(u.lastLogout) >= toMillis(u.lastSeen) - 5000)
    ? `Last logout: ${formatTime(u.lastLogout)}`
    : `Last seen: ${formatTime(u.lastSeen || u.lastLogout)}`;

export default function AdminScreen() {
  const { user, colors } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [, setTick] = useState(0);

  useEffect(
    () =>
      onSnapshot(
        collection(db, 'users'),
        (snap) => setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() }))),
        (e) => Alert.alert('Error', e.message)
      ),
    []
  );

  // 30 second por por re-render, jate online status refresh hoy
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === ROLES.ADMIN).length,
    disabled: users.filter((u) => u.disabled).length,
    online: users.filter(isUserOnline).length,
  };

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => !q || `${u.name} ${u.email}`.toLowerCase().includes(q))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [users, search]);

  const update = (uid, patch) =>
    updateDoc(doc(db, 'users', uid), patch).catch((e) => Alert.alert('Error', e.message));

  const selectedUser = selected && users.find((u) => u.uid === selected);
  const isSelf = selectedUser?.uid === user.uid;

  const setRole = (r) => update(selectedUser.uid, { role: r });

  const toggleDisabled = () => {
    update(selectedUser.uid, { disabled: !selectedUser.disabled });
    setSelected(null);
  };

  const Stat = ({ label, value, color }) => (
    <Card style={{ flex: 1, padding: 12, marginBottom: 0, alignItems: 'center' }}>
      <Text style={{ color, fontSize: 20, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={list}
        extraData={stats.online}
        keyExtractor={(u) => u.uid}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              <Stat label="Total" value={stats.total} color={colors.primaryLight} />
              <Stat label="Online" value={stats.online} color="#10B981" />
              <Stat label="Admins" value={stats.admins} color={ROLE_COLORS.admin} />
              <Stat label="Disabled" value={stats.disabled} color={colors.dim} />
            </View>
            <Text style={{ color: colors.dim, fontSize: 12, marginBottom: 12 }}>
              Tap a user to change their role or enable/disable their account.
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: radius.md,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Icon name="magnify" size={20} color={colors.dim} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search by name or email"
                placeholderTextColor={colors.dim}
                autoCapitalize="none"
                style={{ flex: 1, color: colors.text, paddingVertical: 11, paddingHorizontal: 8 }}
              />
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="account-search" title="No users found" />}
        renderItem={({ item }) => {
          const online = isUserOnline(item);
          return (
            <TouchableOpacity activeOpacity={0.8} onPress={() => setSelected(item.uid)}>
              <Card
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  marginBottom: 10,
                  opacity: item.disabled ? 0.55 : 1,
                }}
              >
                <View style={{ position: 'relative' }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: roleColor(item.role) + '30',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {item.avatar ? (
                      <Image source={{ uri: item.avatar }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Text style={{ color: roleColor(item.role), fontWeight: '800' }}>
                        {(item.name || '?')[0].toUpperCase()}
                      </Text>
                    )}
                  </View>
                  {/* Active Status Indicator Dot */}
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 11,
                      height: 11,
                      borderRadius: 6,
                      backgroundColor: online ? '#10B981' : '#94A3B8',
                      borderWidth: 2,
                      borderColor: colors.card,
                    }}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>
                    {item.name} {item.uid === user.uid ? '(you)' : ''}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    {online ? (
                      <Text style={{ color: '#10B981', fontWeight: '600' }}>Active now</Text>
                    ) : (
                      offlineText(item)
                    )}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: roleColor(item.role), fontWeight: '700', fontSize: 12 }}>
                    {roleLabel(item.role)}
                  </Text>
                  {item.disabled ? <Text style={{ color: colors.expense, fontSize: 11 }}>Disabled</Text> : null}
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={!!selectedUser} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
          {selectedUser && (
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: radius.lg,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: roleColor(selectedUser.role) + '30',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    marginRight: 12,
                  }}
                >
                  {selectedUser.avatar ? (
                    <Image source={{ uri: selectedUser.avatar }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Text style={{ color: roleColor(selectedUser.role), fontWeight: '800', fontSize: 18 }}>
                      {(selectedUser.name || '?')[0].toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{selectedUser.name}</Text>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>{selectedUser.email}</Text>
                  <Text
                    style={{
                      color: isUserOnline(selectedUser) ? '#10B981' : colors.muted,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {isUserOnline(selectedUser) ? '● Active now' : offlineText(selectedUser)}
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  color: colors.muted,
                  fontSize: 12,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Role
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {Object.values(ROLES).map((r) => {
                  const active = selectedUser.role === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      disabled={isSelf}
                      onPress={() => setRole(r)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        alignItems: 'center',
                        borderRadius: radius.md,
                        borderWidth: 1,
                        borderColor: active ? ROLE_COLORS[r] : colors.border,
                        backgroundColor: active ? ROLE_COLORS[r] + '26' : colors.bg,
                        opacity: isSelf && !active ? 0.4 : 1,
                      }}
                    >
                      <Text style={{ color: active ? ROLE_COLORS[r] : colors.muted, fontWeight: '700', fontSize: 13 }}>
                        {ROLE_LABELS[r]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {isSelf ? (
                <Text style={{ color: colors.dim, fontSize: 12, marginBottom: 12 }}>
                  You cannot change your own role or disable your own account.
                </Text>
              ) : (
                <Button
                  title={selectedUser.disabled ? 'Enable account' : 'Disable account'}
                  variant={selectedUser.disabled ? 'primary' : 'danger'}
                  onPress={toggleDisabled}
                />
              )}
              <Button title="Close" variant="secondary" onPress={() => setSelected(null)} style={{ marginTop: 10 }} />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}