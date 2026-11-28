

// // screens/GroupsScreen.js
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Animated,
//   Easing,
//   FlatList,
//   Image,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   Pressable,
//   Text,
//   TextInput,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import { doc, onSnapshot } from 'firebase/firestore';
// import { db } from '../firebase';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import { useAuth } from '../context/AuthContext';
// import { EmptyState, Fab } from '../components/ui';
// import CustomAlert from '../components/CustomAlert';
// import { uploadGroupPhoto } from '../services/groupPhotoService';
// import {
//   acceptInvite,
//   createGroup,
//   declineInvite,
//   joinByCode,
//   subscribeMyGroups,
//   subscribeMyInvites,
// } from '../services/groupService';

// /* ---------- helpers ---------- */

// const memberPhoto = (m) => m?.photoURL || m?.photo || m?.avatar || null;

// /* ---------- building blocks ---------- */

// // Only the first screen load animates; later rows appear instantly.
// function FadeSlide({ index = 0, children, style }) {
//   const v = useRef(new Animated.Value(0)).current;
//   useEffect(() => {
//     Animated.timing(v, {
//       toValue: 1,
//       duration: 380,
//       delay: Math.min(index, 6) * 60,
//       easing: Easing.out(Easing.cubic),
//       useNativeDriver: true,
//     }).start();
//   }, [v, index]);
//   return (
//     <Animated.View
//       style={[
//         { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] },
//         style,
//       ]}
//     >
//       {children}
//     </Animated.View>
//   );
// }

// function Press({ onPress, style, children, disabled }) {
//   const scale = useRef(new Animated.Value(1)).current;
//   const to = (val) =>
//     Animated.spring(scale, { toValue: val, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
//   return (
//     <TouchableWithoutFeedback onPress={onPress} onPressIn={() => to(0.97)} onPressOut={() => to(1)} disabled={disabled}>
//       <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
//     </TouchableWithoutFeedback>
//   );
// }

// function Avatar({ uri, name, size = 28, color, bg, border }) {
//   const initial = (name || '?').trim().charAt(0).toUpperCase();
//   return (
//     <View
//       style={{
//         width: size,
//         height: size,
//         borderRadius: size / 2,
//         backgroundColor: bg,
//         borderWidth: 2,
//         borderColor: border,
//         alignItems: 'center',
//         justifyContent: 'center',
//         overflow: 'hidden',
//       }}
//     >
//       {uri ? (
//         <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
//       ) : (
//         <Text style={{ color, fontWeight: '800', fontSize: size * 0.4 }}>{initial}</Text>
//       )}
//     </View>
//   );
// }

// function AvatarStack({ members, profiles, colors, primary, max = 4, size = 26 }) {
//   const list = Object.entries(members || {}).map(([uid, m]) => {
//     const p = profiles?.[uid];
//     return { name: p?.name || m?.name, photo: p?.avatar || memberPhoto(m) };
//   });
//   const shown = list.slice(0, max);
//   const extra = list.length - shown.length;
//   const overlap = -size * 0.32;
//   return (
//     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//       {shown.map((m, i) => (
//         <View key={i} style={{ marginLeft: i === 0 ? 0 : overlap }}>
//           <Avatar uri={m.photo} name={m.name} size={size} color={primary} bg={primary + '22'} border={colors.card} />
//         </View>
//       ))}
//       {extra > 0 && (
//         <View style={{ marginLeft: overlap }}>
//           <Avatar name={`+${extra}`} size={size} color={colors.muted} bg={colors.border} border={colors.card} />
//         </View>
//       )}
//     </View>
//   );
// }

// function GroupThumb({ uri, primary, size }) {
//   return (
//     <View
//       style={{
//         width: size,
//         height: size,
//         borderRadius: size * 0.32,
//         backgroundColor: primary + '1F',
//         alignItems: 'center',
//         justifyContent: 'center',
//         overflow: 'hidden',
//       }}
//     >
//       {uri ? (
//         <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
//       ) : (
//         <Icon name="account-group" size={size * 0.48} color={primary} />
//       )}
//     </View>
//   );
// }

// function Chip({ label, color }) {
//   return (
//     <View
//       style={{
//         backgroundColor: color + '1F',
//         borderRadius: 8,
//         paddingHorizontal: 8,
//         paddingVertical: 3,
//         marginLeft: 8,
//       }}
//     >
//       <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{label}</Text>
//     </View>
//   );
// }

// /* ---------- screen ---------- */

// export default function GroupsScreen({ navigation, route }) {
//   const { user, profile, colors, isGuest } = useAuth();
//   const noAccount = isGuest || !user.email;
//   const primary = colors.primary || '#059669';

//   const [groups, setGroups] = useState(null);
//   const [invites, setInvites] = useState([]);
//   const [createOpen, setCreateOpen] = useState(false);
//   const [joinOpen, setJoinOpen] = useState(false);
//   const [name, setName] = useState('');
//   const [code, setCode] = useState('');
//   const [photoUri, setPhotoUri] = useState(null);
//   const [photoBase64, setPhotoBase64] = useState(null);
//   const [busy, setBusy] = useState(false);

//   const [alertConfig, setAlertConfig] = useState({
//     visible: false,
//     title: '',
//     message: '',
//     type: 'error',
//     showCancel: false,
//     onConfirm: null,
//     onCancel: null,
//   });

//   const showAlert = (title, message, type = 'error', options = {}) =>
//     setAlertConfig({ visible: true, title, message, type, ...options });
//   const hideAlert = () => setAlertConfig((prev) => ({ ...prev, visible: false }));

//   // live member profiles
//   const [profiles, setProfiles] = useState({});
//   const profileSubs = useRef({});

//   useEffect(() => {
//     const uids = new Set();
//     [...(groups || []), ...invites].forEach((g) => {
//       (g.memberUids || []).forEach((u) => uids.add(u));
//       Object.keys(g.members || {}).forEach((u) => uids.add(u));
//     });
//     uids.forEach((uid) => {
//       if (profileSubs.current[uid]) return;
//       profileSubs.current[uid] = onSnapshot(
//         doc(db, 'users', uid),
//         (snap) => {
//           if (snap.exists()) setProfiles((p) => ({ ...p, [uid]: snap.data() }));
//         },
//         () => { }
//       );
//     });
//   }, [groups, invites]);

//   useEffect(
//     () => () => {
//       Object.values(profileSubs.current).forEach((unsub) => unsub());
//       profileSubs.current = {};
//     },
//     []
//   );

//   useEffect(() => {
//     if (noAccount) return undefined;
//     const u1 = subscribeMyGroups(user.uid, setGroups, () => setGroups([]));
//     const u2 = subscribeMyInvites(user.email, setInvites, () => setInvites([]));
//     return () => {
//       u1();
//       u2();
//     };
//   }, [user.uid, user.email, noAccount]);

//   // Deep link: myapp://join/CODE
//   useEffect(() => {
//     const c = route?.params?.joinCode;
//     if (c) {
//       setCode(String(c));
//       doJoin(String(c));
//       navigation.setParams({ joinCode: undefined });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [route?.params?.joinCode]);

//   const pickPhoto = async () => {
//     const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!perm.granted) {
//       showAlert('Photo access needed', 'Allow photo access in Settings to choose a group photo.', 'error');
//       return;
//     }
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaType ? ['images'] : ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.6,
//       base64: true,
//     });
//     if (!res.canceled && res.assets?.[0]?.base64) {
//       setPhotoUri(res.assets[0].uri);
//       setPhotoBase64(res.assets[0].base64);
//     }
//   };

//   const closeCreate = () => {
//     setCreateOpen(false);
//     setName('');
//     setPhotoUri(null);
//     setPhotoBase64(null);
//   };

//   const doCreate = async () => {
//     if (!name.trim() || busy) return;
//     try {
//       setBusy(true);
//       let photoURL = null;
//       if (photoBase64) photoURL = await uploadGroupPhoto(photoBase64);
//       const id = await createGroup({ name: name.trim(), user, profile, photoURL });
//       closeCreate();
//       navigation.navigate('GroupDetail', { groupId: id });
//     } catch (e) {
//       showAlert('Could not create group', e?.message || 'Check your connection and try again.', 'error');
//     } finally {
//       setBusy(false);
//     }
//   };

//   const doJoin = async (c) => {
//     const value = (c || code || '').trim();
//     if (!value || busy) return;
//     try {
//       setBusy(true);
//       const id = await joinByCode(value, user, profile);
//       setCode('');
//       setJoinOpen(false);
//       navigation.navigate('GroupDetail', { groupId: id });
//     } catch (e) {
//       showAlert('Could not join', 'Check the invite code and try again.', 'error');
//     } finally {
//       setBusy(false);
//     }
//   };

//   const doAccept = async (g) => {
//     try {
//       await acceptInvite(g.id, user, profile);
//     } catch (e) {
//       showAlert('Could not accept', 'Try accepting the invite again.', 'error');
//     }
//   };

//   const doDecline = async (g) => {
//     try {
//       await declineInvite(g.id, user.email);
//     } catch (e) {
//       showAlert('Could not decline', 'Try declining the invite again.', 'error');
//     }
//   };

//   if (noAccount) {
//     return (
//       <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
//         <EmptyState
//           icon="account-lock-outline"
//           title="Sign in to use groups"
//           subtitle="Groups need an email account. Create one or log in to share expenses with friends."
//         />
//       </View>
//     );
//   }

//   if (groups === null) {
//     return (
//       <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
//         <ActivityIndicator color={primary} />
//       </View>
//     );
//   }

//   const card = {
//     backgroundColor: colors.card,
//     borderRadius: 22,
//     borderWidth: 1,
//     borderColor: colors.border,
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.bg }}>
//       <FlatList
//         data={groups}
//         keyExtractor={(g) => g.id}
//         contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
//         showsVerticalScrollIndicator={false}
//         ListHeaderComponent={
//           <View>
//             {/* Summary header */}
//             <FadeSlide index={0}>
//               <View style={{ marginBottom: 18 }}>
//                 <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
//                   Groups
//                 </Text>
//                 <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
//                   {groups.length === 0
//                     ? 'Split trip and tour costs with friends.'
//                     : `${groups.length} ${groups.length === 1 ? 'group' : 'groups'}${invites.length ? ` · ${invites.length} pending ${invites.length === 1 ? 'invite' : 'invites'}` : ''
//                     }`}
//                 </Text>
//               </View>
//             </FadeSlide>

//             {/* Join with code */}
//             <FadeSlide index={1}>
//               <Press
//                 onPress={() => setJoinOpen(true)}
//                 style={[card, { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 22 }]}
//               >
//                 <View
//                   style={{
//                     width: 42,
//                     height: 42,
//                     borderRadius: 14,
//                     backgroundColor: primary + '1F',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                   }}
//                 >
//                   <Icon name="ticket-confirmation-outline" size={22} color={primary} />
//                 </View>
//                 <View style={{ flex: 1, marginLeft: 12 }}>
//                   <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>Join with a code</Text>
//                   <Text style={{ color: colors.dim, fontSize: 12, marginTop: 2 }}>Enter the code a friend shared</Text>
//                 </View>
//                 <Icon name="chevron-right" size={22} color={colors.dim} />
//               </Press>
//             </FadeSlide>

//             {/* Invites */}
//             {invites.length > 0 && (
//               <View style={{ marginBottom: 10 }}>
//                 <Text style={{ color: colors.text, fontWeight: '800', fontSize: 17, marginBottom: 12 }}>
//                   Invitations
//                 </Text>
//                 {invites.map((g, i) => (
//                   <FadeSlide key={g.id} index={i + 2}>
//                     <View style={[card, { borderColor: primary + '66', padding: 14, marginBottom: 12 }]}>
//                       <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                         <GroupThumb uri={g.photoURL} primary={primary} size={48} />
//                         <View style={{ flex: 1, marginLeft: 12 }}>
//                           <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }} numberOfLines={1}>
//                             {g.name}
//                           </Text>
//                           <Text style={{ color: colors.dim, fontSize: 12, marginTop: 2, marginBottom: 6 }}>
//                             You were invited to join
//                           </Text>
//                           <AvatarStack members={g.members} profiles={profiles} colors={colors} primary={primary} size={22} />
//                         </View>
//                       </View>
//                       <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
//                         <Press
//                           onPress={() => doDecline(g)}
//                           style={{
//                             flex: 1,
//                             borderWidth: 1,
//                             borderColor: colors.border,
//                             borderRadius: 14,
//                             paddingVertical: 11,
//                             alignItems: 'center',
//                           }}
//                         >
//                           <Text style={{ color: colors.muted, fontWeight: '700' }}>Decline</Text>
//                         </Press>
//                         <Press
//                           onPress={() => doAccept(g)}
//                           style={{ flex: 1.4, backgroundColor: primary, borderRadius: 14, paddingVertical: 11, alignItems: 'center' }}
//                         >
//                           <Text style={{ color: '#fff', fontWeight: '800' }}>Accept</Text>
//                         </Press>
//                       </View>
//                     </View>
//                   </FadeSlide>
//                 ))}
//               </View>
//             )}

//             {groups.length > 0 && (
//               <Text style={{ color: colors.text, fontWeight: '800', fontSize: 17, marginBottom: 12, marginTop: 4 }}>
//                 My groups
//               </Text>
//             )}
//           </View>
//         }
//         ListEmptyComponent={
//           <EmptyState
//             icon="account-group-outline"
//             title="Create your first group"
//             subtitle="Tap + to start a group for a trip or tour and split expenses."
//           />
//         }
//         renderItem={({ item: g, index }) => {
//           const count = (g.memberUids || []).length;
//           const mine = g.createdBy === user.uid;
//           return (
//             <FadeSlide index={index + 2}>
//               <Press
//                 onPress={() => navigation.navigate('GroupDetail', { groupId: g.id })}
//                 style={[
//                   card,
//                   {
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     padding: 14,
//                     marginBottom: 12,
//                     shadowColor: '#000',
//                     shadowOpacity: 0.06,
//                     shadowRadius: 12,
//                     shadowOffset: { width: 0, height: 4 },
//                     elevation: 2,
//                   },
//                 ]}
//               >
//                 <GroupThumb uri={g.photoURL} primary={primary} size={60} />
//                 <View style={{ flex: 1, marginLeft: 14 }}>
//                   <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                     <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, flexShrink: 1 }} numberOfLines={1}>
//                       {g.name}
//                     </Text>
//                     {mine && <Chip label="Owner" color={primary} />}
//                   </View>
//                   <Text style={{ color: colors.dim, fontSize: 12, marginTop: 3, marginBottom: 9 }}>
//                     {count} {count === 1 ? 'member' : 'members'}
//                   </Text>
//                   <AvatarStack members={g.members} profiles={profiles} colors={colors} primary={primary} />
//                 </View>
//                 <Icon name="chevron-right" size={22} color={colors.dim} />
//               </Press>
//             </FadeSlide>
//           );
//         }}
//       />
//       <Fab onPress={() => setCreateOpen(true)} />

//       {/* Create group */}
//       <SmallModal visible={createOpen} onClose={closeCreate} title="New group" colors={colors}>
//         <View style={{ alignItems: 'center', marginBottom: 20 }}>
//           <Press onPress={pickPhoto}>
//             <View>
//               <View
//                 style={{
//                   width: 100,
//                   height: 100,
//                   borderRadius: 32,
//                   backgroundColor: primary + '1A',
//                   borderWidth: 2,
//                   borderColor: primary + '55',
//                   borderStyle: photoUri ? 'solid' : 'dashed',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   overflow: 'hidden',
//                 }}
//               >
//                 {photoUri ? (
//                   <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} />
//                 ) : (
//                   <Icon name="camera-plus-outline" size={32} color={primary} />
//                 )}
//               </View>
//               {photoUri && (
//                 <View
//                   style={{
//                     position: 'absolute',
//                     right: -6,
//                     bottom: -6,
//                     width: 30,
//                     height: 30,
//                     borderRadius: 15,
//                     backgroundColor: primary,
//                     borderWidth: 3,
//                     borderColor: colors.card,
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                   }}
//                 >
//                   <Icon name="pencil" size={14} color="#fff" />
//                 </View>
//               )}
//             </View>
//           </Press>
//           <Text style={{ color: colors.dim, fontSize: 12, marginTop: 10 }}>
//             {photoUri ? 'Tap to change photo' : 'Add a group photo (optional)'}
//           </Text>
//         </View>
//         <Text style={labelStyle(colors)}>Group name</Text>
//         <TextInput
//           value={name}
//           onChangeText={setName}
//           placeholder="e.g. Cox's Bazar Tour"
//           placeholderTextColor={colors.dim}
//           style={inputStyle(colors)}
//           returnKeyType="done"
//           onSubmitEditing={doCreate}
//         />
//         <PrimaryBtn label="Create group" onPress={doCreate} busy={busy} disabled={!name.trim()} color={primary} />
//       </SmallModal>

//       {/* Join group */}
//       <SmallModal visible={joinOpen} onClose={() => setJoinOpen(false)} title="Join a group" colors={colors}>
//         <Text style={{ color: colors.dim, fontSize: 13, marginBottom: 14 }}>
//           Ask a group member for the invite code, then enter it below.
//         </Text>
//         <TextInput
//           value={code}
//           onChangeText={(v) => setCode(v.toUpperCase())}
//           placeholder="INVITE CODE"
//           autoCapitalize="characters"
//           autoCorrect={false}
//           placeholderTextColor={colors.dim}
//           style={[inputStyle(colors), { textAlign: 'center', fontSize: 20, fontWeight: '800', letterSpacing: 4, paddingVertical: 16 }]}
//           returnKeyType="go"
//           onSubmitEditing={() => doJoin()}
//         />
//         <PrimaryBtn label="Join group" onPress={() => doJoin()} busy={busy} disabled={!code.trim()} color={primary} />
//       </SmallModal>

//       <CustomAlert
//         visible={alertConfig.visible}
//         title={alertConfig.title}
//         message={alertConfig.message}
//         type={alertConfig.type}
//         showCancel={alertConfig.showCancel}
//         onClose={hideAlert}
//         onConfirm={alertConfig.onConfirm}
//         onCancel={alertConfig.onCancel}
//       />
//     </View>
//   );
// }

// /* ---------- shared pieces (exports kept for other screens) ---------- */

// const labelStyle = (colors) => ({
//   color: colors.muted,
//   fontSize: 13,
//   fontWeight: '700',
//   marginBottom: 8,
// });

// const inputStyle = (colors) => ({
//   backgroundColor: colors.bg,
//   borderWidth: 1,
//   borderColor: colors.border,
//   borderRadius: 16,
//   paddingHorizontal: 16,
//   paddingVertical: 14,
//   fontSize: 15,
//   color: colors.text,
//   marginBottom: 16,
// });

// export function PrimaryBtn({ label, onPress, busy, color, disabled }) {
//   const off = busy || disabled;
//   return (
//     <Press onPress={onPress} disabled={off}>
//       <View
//         style={{
//           backgroundColor: color,
//           borderRadius: 16,
//           paddingVertical: 15,
//           alignItems: 'center',
//           opacity: off ? 0.55 : 1,
//         }}
//       >
//         {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>{label}</Text>}
//       </View>
//     </Press>
//   );
// }

// // Bottom sheet style modal (same props as before)
// export function SmallModal({ visible, onClose, title, colors, children }) {
//   const anim = useRef(new Animated.Value(0)).current;
//   useEffect(() => {
//     if (visible) {
//       anim.setValue(0);
//       Animated.timing(anim, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
//     }
//   }, [visible, anim]);

//   return (
//     <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
//       <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
//         <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }} onPress={onClose}>
//           <Animated.View
//             style={{
//               transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }],
//               opacity: anim,
//             }}
//           >
//             <Pressable
//               onPress={() => { }}
//               style={{
//                 backgroundColor: colors.card,
//                 borderTopLeftRadius: 28,
//                 borderTopRightRadius: 28,
//                 padding: 22,
//                 paddingBottom: 30,
//                 borderWidth: 1,
//                 borderBottomWidth: 0,
//                 borderColor: colors.border,
//               }}
//             >
//               <View
//                 style={{
//                   alignSelf: 'center',
//                   width: 40,
//                   height: 4,
//                   borderRadius: 2,
//                   backgroundColor: colors.border,
//                   marginBottom: 16,
//                 }}
//               />
//               <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
//                 <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{title}</Text>
//                 <Press onPress={onClose}>
//                   <View
//                     style={{
//                       width: 32,
//                       height: 32,
//                       borderRadius: 16,
//                       backgroundColor: colors.bg,
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                     }}
//                   >
//                     <Icon name="close" size={18} color={colors.dim} />
//                   </View>
//                 </Press>
//               </View>
//               {children}
//             </Pressable>
//           </Animated.View>
//         </Pressable>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// }






// screens/GroupsScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { EmptyState, Fab } from '../components/ui';
import CustomAlert from '../components/CustomAlert';
import { uploadGroupPhoto } from '../services/groupPhotoService';
import {
  acceptInvite,
  createGroup,
  declineInvite,
  joinByCode,
  subscribeMyGroups,
  subscribeMyInvites,
} from '../services/groupService';

/* ---------- helpers ----------
   Bug fix: ছবি users/{uid} doc-এ photoURL / photo / avatar / profileImage ...
   যেকোনো নামে থাকতে পারে। আগে শুধু `avatar` আর member-এর photoURL/photo/avatar
   চেক হত। এখন সব field চেক হয়, আর logged-in user-এর জন্য AuthContext
   `profile` ও Firebase `user.photoURL` fallback আছে। */

const PHOTO_KEYS = ['photoURL', 'photoUrl', 'avatar', 'avatarUrl', 'photo', 'profilePic', 'profileImage', 'image', 'picture'];

const normalizeUri = (v) => {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!s) return null;
  if (/^(https?:|file:|content:|data:|asset:|ph:)/i.test(s)) return s;
  if (s.length > 200 && /^[A-Za-z0-9+/=\s]+$/.test(s)) return `data:image/jpeg;base64,${s.replace(/\s/g, '')}`;
  return s;
};

export const pickPhoto = (...sources) => {
  for (const src of sources) {
    if (!src) continue;
    if (typeof src === 'string') {
      const u = normalizeUri(src);
      if (u) return u;
      continue;
    }
    for (const k of PHOTO_KEYS) {
      const u = normalizeUri(src[k]);
      if (u) return u;
    }
  }
  return null;
};

export const pickName = (...sources) => {
  for (const s of sources) {
    const n = s?.name || s?.displayName || s?.fullName;
    if (typeof n === 'string' && n.trim()) return n.trim();
  }
  return null;
};

/* ---------- building blocks ---------- */

// Only the first screen load animates; later rows appear instantly.
function FadeSlide({ index = 0, children, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 380,
      delay: Math.min(index, 6) * 60,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, index]);
  return (
    <Animated.View
      style={[
        { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

function Press({ onPress, style, children, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (val) =>
    Animated.spring(scale, { toValue: val, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  return (
    <TouchableWithoutFeedback onPress={onPress} onPressIn={() => to(0.97)} onPressOut={() => to(1)} disabled={disabled}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </TouchableWithoutFeedback>
  );
}

function Avatar({ uri, name, size = 28, color, bg, border }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  const showImage = !!uri && !failed;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        borderWidth: 2,
        borderColor: border,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={{ color, fontWeight: '800', fontSize: size * 0.4 }}>{initial}</Text>
      )}
    </View>
  );
}

// `me` = { uid, profile, user } of the logged-in user, used as a photo/name fallback.
function AvatarStack({ members, profiles, me, colors, primary, max = 4, size = 26 }) {
  const list = Object.entries(members || {}).map(([uid, m]) => {
    const p = profiles?.[uid];
    const isMe = me && uid === me.uid;
    return {
      name: pickName(p, isMe ? me.profile : null, m) || (isMe ? me.user?.displayName : null),
      photo: pickPhoto(p, isMe ? me.profile : null, isMe ? me.user : null, m),
    };
  });
  const shown = list.slice(0, max);
  const extra = list.length - shown.length;
  const overlap = -size * 0.32;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {shown.map((m, i) => (
        <View key={i} style={{ marginLeft: i === 0 ? 0 : overlap }}>
          <Avatar uri={m.photo} name={m.name} size={size} color={primary} bg={primary + '22'} border={colors.card} />
        </View>
      ))}
      {extra > 0 && (
        <View style={{ marginLeft: overlap }}>
          <Avatar name={`+${extra}`} size={size} color={colors.muted} bg={colors.border} border={colors.card} />
        </View>
      )}
    </View>
  );
}

function GroupThumb({ uri, primary, size }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  const src = normalizeUri(uri);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: primary + '1F',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {src && !failed ? (
        <Image source={{ uri: src }} style={{ width: size, height: size }} resizeMode="cover" onError={() => setFailed(true)} />
      ) : (
        <Icon name="account-group" size={size * 0.48} color={primary} />
      )}
    </View>
  );
}

function Chip({ label, color }) {
  return (
    <View
      style={{
        backgroundColor: color + '1F',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginLeft: 8,
      }}
    >
      <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

/* ---------- screen ---------- */

export default function GroupsScreen({ navigation, route }) {
  const { user, profile, colors, isGuest } = useAuth();
  const noAccount = isGuest || !user.email;
  const primary = colors.primary || '#059669';
  const me = { uid: user?.uid, profile, user };

  const [groups, setGroups] = useState(null);
  const [invites, setInvites] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [busy, setBusy] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error',
    showCancel: false,
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = (title, message, type = 'error', options = {}) =>
    setAlertConfig({ visible: true, title, message, type, ...options });
  const hideAlert = () => setAlertConfig((prev) => ({ ...prev, visible: false }));

  // live member profiles
  const [profiles, setProfiles] = useState({});
  const profileSubs = useRef({});

  useEffect(() => {
    const uids = new Set();
    [...(groups || []), ...invites].forEach((g) => {
      (g.memberUids || []).forEach((u) => uids.add(u));
      Object.keys(g.members || {}).forEach((u) => uids.add(u));
    });
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
  }, [groups, invites]);

  useEffect(
    () => () => {
      Object.values(profileSubs.current).forEach((unsub) => unsub());
      profileSubs.current = {};
    },
    []
  );

  useEffect(() => {
    if (noAccount) return undefined;
    const u1 = subscribeMyGroups(user.uid, setGroups, () => setGroups([]));
    const u2 = subscribeMyInvites(user.email, setInvites, () => setInvites([]));
    return () => {
      u1();
      u2();
    };
  }, [user.uid, user.email, noAccount]);

  // Deep link: myapp://join/CODE
  useEffect(() => {
    const c = route?.params?.joinCode;
    if (c) {
      setCode(String(c));
      doJoin(String(c));
      navigation.setParams({ joinCode: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params?.joinCode]);

  const pickGroupPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showAlert('Photo access needed', 'Allow photo access in Settings to choose a group photo.', 'error');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType ? ['images'] : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (!res.canceled && res.assets?.[0]?.base64) {
      setPhotoUri(res.assets[0].uri);
      setPhotoBase64(res.assets[0].base64);
    }
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setName('');
    setPhotoUri(null);
    setPhotoBase64(null);
  };

  const doCreate = async () => {
    if (!name.trim() || busy) return;
    try {
      setBusy(true);
      let photoURL = null;
      if (photoBase64) photoURL = await uploadGroupPhoto(photoBase64);
      const id = await createGroup({ name: name.trim(), user, profile, photoURL });
      closeCreate();
      navigation.navigate('GroupDetail', { groupId: id });
    } catch (e) {
      showAlert('Could not create group', e?.message || 'Check your connection and try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const doJoin = async (c) => {
    const value = (c || code || '').trim();
    if (!value || busy) return;
    try {
      setBusy(true);
      const id = await joinByCode(value, user, profile);
      setCode('');
      setJoinOpen(false);
      navigation.navigate('GroupDetail', { groupId: id });
    } catch (e) {
      showAlert('Could not join', 'Check the invite code and try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const doAccept = async (g) => {
    try {
      await acceptInvite(g.id, user, profile);
    } catch (e) {
      showAlert('Could not accept', 'Try accepting the invite again.', 'error');
    }
  };

  const doDecline = async (g) => {
    try {
      await declineInvite(g.id, user.email);
    } catch (e) {
      showAlert('Could not decline', 'Try declining the invite again.', 'error');
    }
  };

  if (noAccount) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <EmptyState
          icon="account-lock-outline"
          title="Sign in to use groups"
          subtitle="Groups need an email account. Create one or log in to share expenses with friends."
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

  const card = {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Summary header */}
            <FadeSlide index={0}>
              <View style={{ marginBottom: 18 }}>
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
                  Groups
                </Text>
                <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
                  {groups.length === 0
                    ? 'Split trip and tour costs with friends.'
                    : `${groups.length} ${groups.length === 1 ? 'group' : 'groups'}${invites.length ? ` · ${invites.length} pending ${invites.length === 1 ? 'invite' : 'invites'}` : ''
                    }`}
                </Text>
              </View>
            </FadeSlide>

            {/* Join with code */}
            <FadeSlide index={1}>
              <Press
                onPress={() => setJoinOpen(true)}
                style={[card, { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 22 }]}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    backgroundColor: primary + '1F',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="ticket-confirmation-outline" size={22} color={primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>Join with a code</Text>
                  <Text style={{ color: colors.dim, fontSize: 12, marginTop: 2 }}>Enter the code a friend shared</Text>
                </View>
                <Icon name="chevron-right" size={22} color={colors.dim} />
              </Press>
            </FadeSlide>

            {/* Invites */}
            {invites.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 17, marginBottom: 12 }}>
                  Invitations
                </Text>
                {invites.map((g, i) => (
                  <FadeSlide key={g.id} index={i + 2}>
                    <View style={[card, { borderColor: primary + '66', padding: 14, marginBottom: 12 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <GroupThumb uri={g.photoURL} primary={primary} size={48} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }} numberOfLines={1}>
                            {g.name}
                          </Text>
                          <Text style={{ color: colors.dim, fontSize: 12, marginTop: 2, marginBottom: 6 }}>
                            You were invited to join
                          </Text>
                          <AvatarStack members={g.members} profiles={profiles} me={me} colors={colors} primary={primary} size={22} />
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                        <Press
                          onPress={() => doDecline(g)}
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 14,
                            paddingVertical: 11,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: colors.muted, fontWeight: '700' }}>Decline</Text>
                        </Press>
                        <Press
                          onPress={() => doAccept(g)}
                          style={{ flex: 1.4, backgroundColor: primary, borderRadius: 14, paddingVertical: 11, alignItems: 'center' }}
                        >
                          <Text style={{ color: '#fff', fontWeight: '800' }}>Accept</Text>
                        </Press>
                      </View>
                    </View>
                  </FadeSlide>
                ))}
              </View>
            )}

            {groups.length > 0 && (
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 17, marginBottom: 12, marginTop: 4 }}>
                My groups
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="account-group-outline"
            title="Create your first group"
            subtitle="Tap + to start a group for a trip or tour and split expenses."
          />
        }
        renderItem={({ item: g, index }) => {
          const count = (g.memberUids || []).length;
          const mine = g.createdBy === user.uid;
          return (
            <FadeSlide index={index + 2}>
              <Press
                onPress={() => navigation.navigate('GroupDetail', { groupId: g.id })}
                style={[
                  card,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 2,
                  },
                ]}
              >
                <GroupThumb uri={g.photoURL} primary={primary} size={60} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, flexShrink: 1 }} numberOfLines={1}>
                      {g.name}
                    </Text>
                    {mine && <Chip label="Owner" color={primary} />}
                  </View>
                  <Text style={{ color: colors.dim, fontSize: 12, marginTop: 3, marginBottom: 9 }}>
                    {count} {count === 1 ? 'member' : 'members'}
                  </Text>
                  <AvatarStack members={g.members} profiles={profiles} me={me} colors={colors} primary={primary} />
                </View>
                <Icon name="chevron-right" size={22} color={colors.dim} />
              </Press>
            </FadeSlide>
          );
        }}
      />
      <Fab onPress={() => setCreateOpen(true)} />

      {/* Create group */}
      <SmallModal visible={createOpen} onClose={closeCreate} title="New group" colors={colors}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Press onPress={pickGroupPhoto}>
            <View>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 32,
                  backgroundColor: primary + '1A',
                  borderWidth: 2,
                  borderColor: primary + '55',
                  borderStyle: photoUri ? 'solid' : 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Icon name="camera-plus-outline" size={32} color={primary} />
                )}
              </View>
              {photoUri && (
                <View
                  style={{
                    position: 'absolute',
                    right: -6,
                    bottom: -6,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: primary,
                    borderWidth: 3,
                    borderColor: colors.card,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="pencil" size={14} color="#fff" />
                </View>
              )}
            </View>
          </Press>
          <Text style={{ color: colors.dim, fontSize: 12, marginTop: 10 }}>
            {photoUri ? 'Tap to change photo' : 'Add a group photo (optional)'}
          </Text>
        </View>
        <Text style={labelStyle(colors)}>Group name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Cox's Bazar Tour"
          placeholderTextColor={colors.dim}
          style={inputStyle(colors)}
          returnKeyType="done"
          onSubmitEditing={doCreate}
        />
        <PrimaryBtn label="Create group" onPress={doCreate} busy={busy} disabled={!name.trim()} color={primary} />
      </SmallModal>

      {/* Join group */}
      <SmallModal visible={joinOpen} onClose={() => setJoinOpen(false)} title="Join a group" colors={colors}>
        <Text style={{ color: colors.dim, fontSize: 13, marginBottom: 14 }}>
          Ask a group member for the invite code, then enter it below.
        </Text>
        <TextInput
          value={code}
          onChangeText={(v) => setCode(v.toUpperCase())}
          placeholder="INVITE CODE"
          autoCapitalize="characters"
          autoCorrect={false}
          placeholderTextColor={colors.dim}
          style={[inputStyle(colors), { textAlign: 'center', fontSize: 20, fontWeight: '800', letterSpacing: 4, paddingVertical: 16 }]}
          returnKeyType="go"
          onSubmitEditing={() => doJoin()}
        />
        <PrimaryBtn label="Join group" onPress={() => doJoin()} busy={busy} disabled={!code.trim()} color={primary} />
      </SmallModal>

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

/* ---------- shared pieces (exports kept for other screens) ---------- */

const labelStyle = (colors) => ({
  color: colors.muted,
  fontSize: 13,
  fontWeight: '700',
  marginBottom: 8,
});

const inputStyle = (colors) => ({
  backgroundColor: colors.bg,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 16,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 15,
  color: colors.text,
  marginBottom: 16,
});

export function PrimaryBtn({ label, onPress, busy, color, disabled }) {
  const off = busy || disabled;
  return (
    <Press onPress={onPress} disabled={off}>
      <View
        style={{
          backgroundColor: color,
          borderRadius: 16,
          paddingVertical: 15,
          alignItems: 'center',
          opacity: off ? 0.55 : 1,
        }}
      >
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>{label}</Text>}
      </View>
    </Press>
  );
}

// Bottom sheet style modal (same props as before)
export function SmallModal({ visible, onClose, title, colors, children }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      anim.setValue(0);
      Animated.timing(anim, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }
  }, [visible, anim]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }} onPress={onClose}>
          <Animated.View
            style={{
              transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }],
              opacity: anim,
            }}
          >
            <Pressable
              onPress={() => { }}
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                padding: 22,
                paddingBottom: 30,
                borderWidth: 1,
                borderBottomWidth: 0,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  alignSelf: 'center',
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border,
                  marginBottom: 16,
                }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{title}</Text>
                <Press onPress={onClose}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="close" size={18} color={colors.dim} />
                  </View>
                </Press>
              </View>
              {children}
            </Pressable>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}