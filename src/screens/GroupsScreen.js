


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

// /* ---------- helpers ----------
//    Bug fix: ছবি users/{uid} doc-এ photoURL / photo / avatar / profileImage ...
//    যেকোনো নামে থাকতে পারে। আগে শুধু `avatar` আর member-এর photoURL/photo/avatar
//    চেক হত। এখন সব field চেক হয়, আর logged-in user-এর জন্য AuthContext
//    `profile` ও Firebase `user.photoURL` fallback আছে। */

// const PHOTO_KEYS = ['photoURL', 'photoUrl', 'avatar', 'avatarUrl', 'photo', 'profilePic', 'profileImage', 'image', 'picture'];

// const normalizeUri = (v) => {
//   if (typeof v !== 'string') return null;
//   const s = v.trim();
//   if (!s) return null;
//   if (/^(https?:|file:|content:|data:|asset:|ph:)/i.test(s)) return s;
//   if (s.length > 200 && /^[A-Za-z0-9+/=\s]+$/.test(s)) return `data:image/jpeg;base64,${s.replace(/\s/g, '')}`;
//   return s;
// };

// export const pickPhoto = (...sources) => {
//   for (const src of sources) {
//     if (!src) continue;
//     if (typeof src === 'string') {
//       const u = normalizeUri(src);
//       if (u) return u;
//       continue;
//     }
//     for (const k of PHOTO_KEYS) {
//       const u = normalizeUri(src[k]);
//       if (u) return u;
//     }
//   }
//   return null;
// };

// export const pickName = (...sources) => {
//   for (const s of sources) {
//     const n = s?.name || s?.displayName || s?.fullName;
//     if (typeof n === 'string' && n.trim()) return n.trim();
//   }
//   return null;
// };

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
//   const [failed, setFailed] = useState(false);
//   useEffect(() => setFailed(false), [uri]);
//   const initial = (name || '?').trim().charAt(0).toUpperCase();
//   const showImage = !!uri && !failed;
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
//       {showImage ? (
//         <Image
//           source={{ uri }}
//           style={{ width: size, height: size }}
//           resizeMode="cover"
//           onError={() => setFailed(true)}
//         />
//       ) : (
//         <Text style={{ color, fontWeight: '800', fontSize: size * 0.4 }}>{initial}</Text>
//       )}
//     </View>
//   );
// }

// // `me` = { uid, profile, user } of the logged-in user, used as a photo/name fallback.
// function AvatarStack({ members, profiles, me, colors, primary, max = 4, size = 26 }) {
//   const list = Object.entries(members || {}).map(([uid, m]) => {
//     const p = profiles?.[uid];
//     const isMe = me && uid === me.uid;
//     return {
//       name: pickName(p, isMe ? me.profile : null, m) || (isMe ? me.user?.displayName : null),
//       photo: pickPhoto(p, isMe ? me.profile : null, isMe ? me.user : null, m),
//     };
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
//   const [failed, setFailed] = useState(false);
//   useEffect(() => setFailed(false), [uri]);
//   const src = normalizeUri(uri);
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
//       {src && !failed ? (
//         <Image source={{ uri: src }} style={{ width: size, height: size }} resizeMode="cover" onError={() => setFailed(true)} />
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
//   const me = { uid: user?.uid, profile, user };

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

//   const pickGroupPhoto = async () => {
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
//                           <AvatarStack members={g.members} profiles={profiles} me={me} colors={colors} primary={primary} size={22} />
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
//                   <AvatarStack members={g.members} profiles={profiles} me={me} colors={colors} primary={primary} />
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
//           <Press onPress={pickGroupPhoto}>
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
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';
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
   ছবি users/{uid} doc-এ photoURL / photo / avatar / profileImage ...
   যেকোনো নামে থাকতে পারে। সব field চেক হয়, আর logged-in user-এর জন্য
   AuthContext `profile` ও Firebase `user.photoURL` fallback আছে। */

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

// design only: group-er jonno stable accent color
const ACCENTS = ['#059669', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#F97316'];
const accentFor = (seed = '') => {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
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

// Soft decorative background behind the whole screen
function Backdrop({ primary, colors }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height={340}>
        <Defs>
          <LinearGradient id="gsGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={primary} stopOpacity="0.2" />
            <Stop offset="0.65" stopColor={primary} stopOpacity="0.05" />
            <Stop offset="1" stopColor={primary} stopOpacity="0" />
          </LinearGradient>
          <Pattern id="gsDots" patternUnits="userSpaceOnUse" width="26" height="26">
            <Circle cx="3" cy="3" r="1.4" fill={primary} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#gsGrad)" />
        <Rect width="100%" height="100%" fill="url(#gsDots)" opacity={0.09} />
        <Circle cx="92%" cy="48" r="90" fill={primary} opacity={0.07} />
        <Circle cx="82%" cy="120" r="46" fill={primary} opacity={0.06} />
        <Circle cx="-4%" cy="210" r="70" fill={primary} opacity={0.05} />
        <Path d="M0 300 Q 120 270 240 300 T 480 300 V340 H0 Z" fill={colors.bg} opacity={0.6} />
      </Svg>
    </View>
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

function GroupThumb({ uri, primary, size, seed }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  const src = normalizeUri(uri);
  const accent = seed ? accentFor(seed) : primary;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: accent + '1F',
        borderWidth: 1,
        borderColor: accent + '33',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {src && !failed ? (
        <Image source={{ uri: src }} style={{ width: size, height: size }} resizeMode="cover" onError={() => setFailed(true)} />
      ) : (
        <Icon name="account-group" size={size * 0.48} color={accent} />
      )}
    </View>
  );
}

function OwnerBadge({ color }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: color + '1F',
        borderRadius: 8,
        paddingHorizontal: 7,
        paddingVertical: 3,
        marginLeft: 8,
      }}
    >
      <Icon name="crown" size={11} color={color} />
      <Text style={{ color, fontSize: 10.5, fontWeight: '800' }}>Owner</Text>
    </View>
  );
}

function StatTile({ icon, value, label, color, colors }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 18,
        paddingVertical: 12,
        paddingHorizontal: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: color + '1F',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={19} color={color} />
      </View>
      <View>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', lineHeight: 21 }}>{value}</Text>
        <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '600' }}>{label}</Text>
      </View>
    </View>
  );
}

function SectionTitle({ title, count, colors, primary }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 6 }}>
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 17 }}>{title}</Text>
      {count > 0 && (
        <View
          style={{
            backgroundColor: primary + '22',
            borderRadius: 10,
            paddingHorizontal: 8,
            paddingVertical: 2,
            marginLeft: 8,
          }}
        >
          <Text style={{ color: primary, fontSize: 12, fontWeight: '800' }}>{count}</Text>
        </View>
      )}
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
        <Backdrop primary={primary} colors={colors} />
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
        <Backdrop primary={primary} colors={colors} />
        <ActivityIndicator color={primary} />
      </View>
    );
  }

  const card = {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Backdrop primary={primary} colors={colors} />

      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Hero header */}
            <FadeSlide index={0}>
              <View style={{ marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <View style={{ width: 18, height: 3, borderRadius: 2, backgroundColor: primary }} />
                  <Text style={{ color: primary, fontSize: 11.5, fontWeight: '800', letterSpacing: 1.2 }}>
                    SHARED EXPENSES
                  </Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -0.8 }}>Groups</Text>
                <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4, lineHeight: 20 }}>
                  {groups.length === 0
                    ? 'Split trip and tour costs with friends, fair and simple.'
                    : 'Track who paid, who owes, and settle up easily.'}
                </Text>
              </View>
            </FadeSlide>

            {/* Quick stats */}
            <FadeSlide index={1}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <StatTile icon="account-group" value={groups.length} label={groups.length === 1 ? 'Group' : 'Groups'} color={primary} colors={colors} />
                <StatTile
                  icon="email-fast-outline"
                  value={invites.length}
                  label={invites.length === 1 ? 'Invite' : 'Invites'}
                  color={invites.length ? '#F59E0B' : colors.dim}
                  colors={colors}
                />
              </View>
            </FadeSlide>

            {/* Join with code (CTA) */}
            <FadeSlide index={2}>
              <Press
                onPress={() => setJoinOpen(true)}
                style={{
                  backgroundColor: primary,
                  borderRadius: 24,
                  padding: 16,
                  marginBottom: 24,
                  overflow: 'hidden',
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: primary,
                  shadowOpacity: 0.3,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 5,
                }}
              >
                <View
                  pointerEvents="none"
                  style={{ position: 'absolute', right: -24, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFFFFF', opacity: 0.12 }}
                />
                <View
                  pointerEvents="none"
                  style={{ position: 'absolute', right: 40, bottom: -40, width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', opacity: 0.09 }}
                />
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 15,
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="ticket-confirmation-outline" size={24} color="#fff" />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Have an invite code?</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 12.5, marginTop: 2 }}>
                    Tap here to join a friend's group
                  </Text>
                </View>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="arrow-right" size={19} color="#fff" />
                </View>
              </Press>
            </FadeSlide>

            {/* Invites */}
            {invites.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <SectionTitle title="Invitations" count={invites.length} colors={colors} primary="#F59E0B" />
                {invites.map((g, i) => (
                  <FadeSlide key={g.id} index={i + 3}>
                    <View style={[card, { borderColor: '#F59E0B55', padding: 16, marginBottom: 12, overflow: 'hidden' }]}>
                      <View
                        pointerEvents="none"
                        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#F59E0B' }}
                      />
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 }}>
                        <Icon name="bell-ring-outline" size={14} color="#F59E0B" />
                        <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 }}>
                          NEW INVITATION
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <GroupThumb uri={g.photoURL} primary={primary} size={54} seed={g.name || g.id} />
                        <View style={{ flex: 1, marginLeft: 14 }}>
                          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }} numberOfLines={1}>
                            {g.name}
                          </Text>
                          <Text style={{ color: colors.dim, fontSize: 12, marginTop: 2, marginBottom: 8 }}>
                            You were invited to join
                          </Text>
                          <AvatarStack members={g.members} profiles={profiles} me={me} colors={colors} primary={primary} size={24} />
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                        <Press
                          onPress={() => doDecline(g)}
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: colors.border,
                            backgroundColor: colors.bg,
                            borderRadius: 14,
                            paddingVertical: 12,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: colors.muted, fontWeight: '700' }}>Decline</Text>
                        </Press>
                        <Press
                          onPress={() => doAccept(g)}
                          style={{
                            flex: 1.5,
                            backgroundColor: primary,
                            borderRadius: 14,
                            paddingVertical: 12,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 6,
                          }}
                        >
                          <Icon name="check" size={17} color="#fff" />
                          <Text style={{ color: '#fff', fontWeight: '800' }}>Accept</Text>
                        </Press>
                      </View>
                    </View>
                  </FadeSlide>
                ))}
              </View>
            )}

            {groups.length > 0 && <SectionTitle title="My groups" count={groups.length} colors={colors} primary={primary} />}
          </View>
        }
        ListEmptyComponent={
          <FadeSlide index={3}>
            <View style={[card, { alignItems: 'center', paddingVertical: 34, paddingHorizontal: 24 }]}>
              <View
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 55,
                  backgroundColor: primary + '12',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18,
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: primary + '1F',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="account-group-outline" size={40} color={primary} />
                </View>
              </View>
              <Text style={{ color: colors.text, fontSize: 19, fontWeight: '800', textAlign: 'center' }}>
                Create your first group
              </Text>
              <Text style={{ color: colors.muted, fontSize: 13.5, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
                Start a group for a trip or tour, add friends and split every expense.
              </Text>
              <Press
                onPress={() => setCreateOpen(true)}
                style={{
                  marginTop: 20,
                  backgroundColor: primary,
                  borderRadius: 16,
                  paddingVertical: 13,
                  paddingHorizontal: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name="plus" size={20} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>New group</Text>
              </Press>
            </View>
          </FadeSlide>
        }
        renderItem={({ item: g, index }) => {
          const count = (g.memberUids || []).length;
          const mine = g.createdBy === user.uid;
          const accent = accentFor(g.name || g.id);
          return (
            <FadeSlide index={index + 3}>
              <Press
                onPress={() => navigation.navigate('GroupDetail', { groupId: g.id })}
                style={[
                  card,
                  {
                    padding: 16,
                    marginBottom: 14,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOpacity: 0.07,
                    shadowRadius: 14,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 3,
                  },
                ]}
              >
                <View
                  pointerEvents="none"
                  style={{ position: 'absolute', right: -30, top: -30, width: 110, height: 110, borderRadius: 55, backgroundColor: accent, opacity: 0.07 }}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <GroupThumb uri={g.photoURL} primary={primary} size={62} seed={g.name || g.id} />
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 17, flexShrink: 1 }} numberOfLines={1}>
                        {g.name}
                      </Text>
                      {mine && <OwnerBadge color={primary} />}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 }}>
                      <Icon name="account-multiple-outline" size={14} color={colors.dim} />
                      <Text style={{ color: colors.dim, fontSize: 12.5, fontWeight: '600' }}>
                        {count} {count === 1 ? 'member' : 'members'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 14 }} />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <AvatarStack members={g.members} profiles={profiles} me={me} colors={colors} primary={primary} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Text style={{ color: primary, fontWeight: '800', fontSize: 13 }}>Open</Text>
                    <Icon name="chevron-right" size={18} color={primary} />
                  </View>
                </View>
              </Press>
            </FadeSlide>
          );
        }}
      />
      <Fab onPress={() => setCreateOpen(true)} />

      {/* Create group */}
      <SmallModal visible={createOpen} onClose={closeCreate} title="New group" colors={colors}>
        <View style={{ alignItems: 'center', marginBottom: 22 }}>
          <Press onPress={pickGroupPhoto}>
            <View>
              <View
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: 34,
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
                  <Icon name="camera-plus-outline" size={34} color={primary} />
                )}
              </View>
              <View
                style={{
                  position: 'absolute',
                  right: -6,
                  bottom: -6,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: primary,
                  borderWidth: 3,
                  borderColor: colors.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={photoUri ? 'pencil' : 'plus'} size={15} color="#fff" />
              </View>
            </View>
          </Press>
          <Text style={{ color: colors.dim, fontSize: 12, marginTop: 12 }}>
            {photoUri ? 'Tap to change photo' : 'Add a group photo (optional)'}
          </Text>
        </View>

        <Text style={labelStyle(colors)}>Group name</Text>
        <Field icon="tag-outline" colors={colors} primary={primary}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Cox's Bazar Tour"
            placeholderTextColor={colors.dim}
            style={fieldInput(colors)}
            returnKeyType="done"
            onSubmitEditing={doCreate}
          />
        </Field>
        <PrimaryBtn label="Create group" onPress={doCreate} busy={busy} disabled={!name.trim()} color={primary} />
      </SmallModal>

      {/* Join group */}
      <SmallModal visible={joinOpen} onClose={() => setJoinOpen(false)} title="Join a group" colors={colors}>
        <View style={{ alignItems: 'center', marginBottom: 18 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 22,
              backgroundColor: primary + '1F',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Icon name="ticket-confirmation-outline" size={30} color={primary} />
          </View>
          <Text style={{ color: colors.dim, fontSize: 13, textAlign: 'center', lineHeight: 19 }}>
            Ask a group member for the invite code, then enter it below.
          </Text>
        </View>
        <TextInput
          value={code}
          onChangeText={(v) => setCode(v.toUpperCase())}
          placeholder="INVITE CODE"
          autoCapitalize="characters"
          autoCorrect={false}
          placeholderTextColor={colors.dim}
          style={[
            inputStyle(colors),
            { textAlign: 'center', fontSize: 22, fontWeight: '800', letterSpacing: 5, paddingVertical: 18, borderColor: primary + '55', borderStyle: 'dashed', borderWidth: 2 },
          ]}
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

// input with leading icon
const fieldInput = (colors) => ({ flex: 1, fontSize: 15, color: colors.text, paddingVertical: 14 });

function Field({ icon, colors, primary, children }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        paddingHorizontal: 14,
        marginBottom: 18,
      }}
    >
      <Icon name={icon} size={20} color={primary} />
      {children}
    </View>
  );
}

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
          opacity: off ? 0.5 : 1,
          shadowColor: color,
          shadowOpacity: off ? 0 : 0.28,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          elevation: off ? 0 : 4,
        }}
      >
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15.5 }}>{label}</Text>}
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
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' }} onPress={onClose}>
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
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                padding: 22,
                paddingBottom: 32,
                borderWidth: 1,
                borderBottomWidth: 0,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  alignSelf: 'center',
                  width: 44,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: colors.border,
                  marginBottom: 16,
                }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ color: colors.text, fontSize: 21, fontWeight: '800', letterSpacing: -0.3 }}>{title}</Text>
                <Press onPress={onClose}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: colors.bg,
                      borderWidth: 1,
                      borderColor: colors.border,
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