
// import React, { useState } from 'react';
// import { Modal, Text, TouchableOpacity, View, StyleSheet, Image, Switch } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import Screen from '../components/Screen';
// import { Button, Card, Chip, Input } from '../components/ui';
// import { useAuth } from '../context/AuthContext';
// import { radius } from '../constants/theme';
// import { CURRENCIES } from '../constants/categories';
// import { ROLE_COLORS, ROLE_LABELS, isStaff } from '../constants/roles';
// import { authMessage } from '../utils/authErrors';
// import CustomAlert from '../components/CustomAlert';

// export default function ProfileScreen({ navigation }) {
//   const { profile, role, updateMyProfile, changePassword, signOut, theme, toggleTheme, colors } = useAuth();

//   const [name, setName] = useState(profile?.name || '');
//   const [avatarUrl, setAvatarUrl] = useState(profile?.avatar || '');
//   const [saving, setSaving] = useState(false);

//   // Modals state
//   const [pwOpen, setPwOpen] = useState(false);
//   const [avatarOpen, setAvatarOpen] = useState(false);

//   const [cur, setCur] = useState('');
//   const [next, setNext] = useState('');
//   const [pwBusy, setPwBusy] = useState(false);

//   // Custom Alert State
//   const [alertData, setAlertData] = useState({
//     visible: false,
//     title: '',
//     message: '',
//     type: 'error',
//     showCancel: false,
//     onConfirm: null,
//     confirmText: 'Okay, Got it'
//   });

//   const showAlert = (title, message, type = 'warning', showCancel = false, onConfirm = null, confirmText = 'Okay, Got it') => {
//     setAlertData({ visible: true, title, message, type, showCancel, onConfirm, confirmText });
//   };

//   const saveProfileInfo = async () => {
//     if (!name.trim()) return showAlert('Missing name', 'Name cannot be empty.', 'warning');
//     setSaving(true);
//     try {
//       await updateMyProfile({ name: name.trim(), avatar: avatarUrl.trim() });
//       showAlert('Saved', 'Profile updated successfully.', 'success');
//     } catch (e) {
//       showAlert('Error', e.message, 'error');
//     }
//     setSaving(false);
//   };

//   const submitPw = async () => {
//     if (!cur || next.length < 6) return showAlert('Check input', 'Enter current password and a new password (min 6 chars).', 'warning');
//     setPwBusy(true);
//     try {
//       await changePassword(cur, next);
//       setPwOpen(false);
//       setCur('');
//       setNext('');
//       showAlert('Done', 'Password changed successfully.', 'success');
//     } catch (e) {
//       showAlert('Error', authMessage(e), 'error');
//     }
//     setPwBusy(false);
//   };

//   const confirmLogout = () => {
//     showAlert(
//       'Log out',
//       'Do you want to log out from your account?',
//       'warning',
//       true,
//       signOut,
//       'Log out'
//     );
//   };

//   const Item = ({ icon, label, onPress, rightElement }) => (
//     <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1} style={styles.itemRow}>
//       <Icon name={icon} size={22} color={colors.primaryLight || '#818CF8'} />
//       <Text style={[styles.itemText, { color: colors.text }]}>{label}</Text>
//       {rightElement || <Icon name="chevron-right" size={22} color={colors.dim || '#64748B'} />}
//     </TouchableOpacity>
//   );

//   return (
//     <Screen contentStyle={styles.screenContainer}>
//       {/* Profile Header with Avatar & Picture Edit Button */}
//       <View style={styles.headerContainer}>
//         <TouchableOpacity activeOpacity={0.8} onPress={() => setAvatarOpen(true)} style={[styles.avatarContainer, { backgroundColor: colors.primary, borderColor: colors.primaryLight + '66' }]}>
//           {profile?.avatar ? (
//             <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
//           ) : (
//             <Text style={styles.avatarText}>{(profile?.name || '?')[0].toUpperCase()}</Text>
//           )}
//           <View style={[styles.cameraBadge, { backgroundColor: colors.primaryDark, borderColor: colors.card }]}>
//             <Icon name="camera" size={12} color="#FFFFFF" />
//           </View>
//         </TouchableOpacity>

//         <Text style={[styles.userName, { color: colors.text }]}>{profile?.name}</Text>
//         <Text style={[styles.userEmail, { color: colors.muted }]}>{profile?.email}</Text>

//         <View style={[styles.roleBadge, { backgroundColor: (ROLE_COLORS[role] || colors.primary) + '26' }]}>
//           <Text style={[styles.roleText, { color: ROLE_COLORS[role] || colors.primary }]}>{ROLE_LABELS[role] || role}</Text>
//         </View>
//       </View>

//       {/* Save Name Card */}
//       <Card style={styles.cardSpacing}>
//         <Input label="Display name" autoCapitalize="words" value={name} onChangeText={setName} />
//         <Button title="Save changes" onPress={saveProfileInfo} loading={saving} variant="secondary" />
//       </Card>

//       {/* Currency Card */}
//       <Card style={styles.cardSpacing}>
//         <Text style={[styles.sectionTitle, { color: colors.muted }]}>Currency</Text>
//         <View style={styles.currencyWrap}>
//           {CURRENCIES.map((c) => (
//             <Chip
//               key={c.code}
//               label={`${c.symbol} ${c.code}`}
//               active={(profile?.currency || 'BDT') === c.code}
//               onPress={() => updateMyProfile({ currency: c.code }).catch((e) => showAlert('Error', e.message, 'error'))}
//             />
//           ))}
//         </View>
//       </Card>

//       {/* Preferences & Menu Options */}
//       <Card style={[styles.cardSpacing, { paddingVertical: 4 }]}>
//         <Item
//           icon="theme-light-dark"
//           label="Dark Mode"
//           rightElement={
//             <Switch
//               value={theme === 'dark'}
//               onValueChange={toggleTheme}
//               trackColor={{ false: colors.border, true: colors.primary }}
//               thumbColor="#FFFFFF"
//             />
//           }
//         />
//         <Item icon="shape-outline" label="Manage categories" onPress={() => navigation.navigate('Categories')} />
//         <Item icon="lock-reset" label="Change password" onPress={() => setPwOpen(true)} />
//         {isStaff(role) && <Item icon="shield-account" label="Admin panel" onPress={() => navigation.navigate('Admin')} />}
//       </Card>

//       {/* Logout Button */}
//       <Button title="Log Out" variant="danger" icon="logout" onPress={confirmLogout} />

//       {/* Profile Picture Update Modal */}
//       <Modal visible={avatarOpen} transparent animationType="fade" onRequestClose={() => setAvatarOpen(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
//             <Text style={[styles.modalTitle, { color: colors.text }]}>Update Profile Picture</Text>
//             <Input
//               label="Avatar Image URL"
//               placeholder="https://example.com/photo.jpg"
//               value={avatarUrl}
//               onChangeText={setAvatarUrl}
//               autoCapitalize="none"
//             />
//             <Button title="Save Picture" onPress={async () => {
//               setAvatarOpen(false);
//               await updateMyProfile({ avatar: avatarUrl.trim() }).catch((e) => showAlert('Error', e.message, 'error'));
//             }} />
//             <Button title="Cancel" variant="secondary" onPress={() => setAvatarOpen(false)} style={styles.cancelBtn} />
//           </View>
//         </View>
//       </Modal>

//       {/* Password Change Modal */}
//       <Modal visible={pwOpen} transparent animationType="fade" onRequestClose={() => setPwOpen(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
//             <Text style={[styles.modalTitle, { color: colors.text }]}>Change password</Text>
//             <Input label="Current password" secureTextEntry value={cur} onChangeText={setCur} />
//             <Input label="New password" secureTextEntry value={next} onChangeText={setNext} placeholder="At least 6 characters" />
//             <Button title="Update password" onPress={submitPw} loading={pwBusy} />
//             <Button title="Cancel" variant="secondary" onPress={() => setPwOpen(false)} style={styles.cancelBtn} />
//           </View>
//         </View>
//       </Modal>

//       {/* Custom Animated Alert Modal */}
//       <CustomAlert
//         visible={alertData.visible}
//         title={alertData.title}
//         message={alertData.message}
//         type={alertData.type}
//         showCancel={alertData.showCancel}
//         confirmText={alertData.confirmText}
//         cancelText="Cancel"
//         onCancel={() => setAlertData({ ...alertData, visible: false })}
//         onClose={() => {
//           setAlertData({ ...alertData, visible: false });
//           if (alertData.onConfirm) {
//             alertData.onConfirm();
//           }
//         }}
//       />
//     </Screen>
//   );
// }

// const styles = StyleSheet.create({
//   screenContainer: {
//     paddingBottom: 30,
//   },
//   headerContainer: {
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   avatarContainer: {
//     width: 82,
//     height: 82,
//     borderRadius: 41,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   avatarImage: {
//     width: '100%',
//     height: '100%',
//   },
//   avatarText: {
//     color: '#fff',
//     fontSize: 34,
//     fontWeight: '800',
//   },
//   cameraBadge: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     padding: 6,
//     borderRadius: 12,
//     borderWidth: 1.5,
//   },
//   userName: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginTop: 10,
//   },
//   userEmail: {
//     marginTop: 2,
//     fontSize: 14,
//   },
//   roleBadge: {
//     marginTop: 10,
//     paddingHorizontal: 14,
//     paddingVertical: 5,
//     borderRadius: radius.pill,
//   },
//   roleText: {
//     fontWeight: '700',
//     fontSize: 12,
//     textTransform: 'uppercase',
//   },
//   cardSpacing: {
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 12,
//     fontWeight: '600',
//     textTransform: 'uppercase',
//     marginBottom: 10,
//   },
//   currencyWrap: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//   },
//   itemText: {
//     flex: 1,
//     marginLeft: 12,
//     fontSize: 15,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(15, 23, 42, 0.8)',
//     justifyContent: 'center',
//     padding: 24,
//   },
//   modalBox: {
//     borderRadius: radius.lg,
//     padding: 24,
//     borderWidth: 1,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 16,
//   },
//   cancelBtn: {
//     marginTop: 12,
//   },
// });











import React, { useState } from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View, StyleSheet, Image, Switch } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../components/Screen';
import { Button, Card, Chip, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { radius } from '../constants/theme';
import { CURRENCIES } from '../constants/categories';
import { ROLE_COLORS, ROLE_LABELS, isStaff } from '../constants/roles';
import { authMessage } from '../utils/authErrors';
import CustomAlert from '../components/CustomAlert';

const CLOUD_NAME = 'y84gtvow';
const UPLOAD_PRESET = 'expense_tracker';

export default function ProfileScreen({ navigation }) {
  const { profile, role, updateMyProfile, changePassword, signOut, theme, toggleTheme, colors } = useAuth();

  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password Modal state
  const [pwOpen, setPwOpen] = useState(false);
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  // Custom Alert State
  const [alertData, setAlertData] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error',
    showCancel: false,
    onConfirm: null,
    confirmText: 'Okay, Got it',
  });

  const showAlert = (title, message, type = 'warning', showCancel = false, onConfirm = null, confirmText = 'Okay, Got it') => {
    setAlertData({ visible: true, title, message, type, showCancel, onConfirm, confirmText });
  };

  // গ্যালারি থেকে ছবি সিলেক্ট করে Base64 আকারে Cloudinary-তে আপলোড ও Firestore-এ সেভ
  const pickAndUploadAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return showAlert('Permission needed', 'Please allow gallery access to upload a profile picture.', 'warning');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true, // সরাসরি base64 নেওয়া হচ্ছে যাতে FormData এরর না আসে
      });

      if (result.canceled || !result.assets?.[0]?.base64) return;

      setUploadingAvatar(true);
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64Img,
          upload_preset: UPLOAD_PRESET,
        }),
      });

      const data = await res.json();
      if (!data.secure_url) {
        throw new Error(data.error?.message || 'Image upload failed');
      }

      await updateMyProfile({ avatar: data.secure_url });
      showAlert('Success', 'Profile picture updated!', 'success');
    } catch (e) {
      showAlert('Upload failed', e.message || 'Could not upload image.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveProfileInfo = async () => {
    if (!name.trim()) return showAlert('Missing name', 'Name cannot be empty.', 'warning');
    setSaving(true);
    try {
      await updateMyProfile({ name: name.trim() });
      showAlert('Saved', 'Profile updated successfully.', 'success');
    } catch (e) {
      showAlert('Error', e.message, 'error');
    }
    setSaving(false);
  };

  const submitPw = async () => {
    if (!cur || next.length < 6) return showAlert('Check input', 'Enter current password and a new password (min 6 chars).', 'warning');
    setPwBusy(true);
    try {
      await changePassword(cur, next);
      setPwOpen(false);
      setCur('');
      setNext('');
      showAlert('Done', 'Password changed successfully.', 'success');
    } catch (e) {
      showAlert('Error', authMessage(e), 'error');
    }
    setPwBusy(false);
  };

  const confirmLogout = () => {
    showAlert(
      'Log out',
      'Do you want to log out from your account?',
      'warning',
      true,
      signOut,
      'Log out'
    );
  };

  const Item = ({ icon, label, onPress, rightElement }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1} style={styles.itemRow}>
      <Icon name={icon} size={22} color={colors.primaryLight || '#818CF8'} />
      <Text style={[styles.itemText, { color: colors.text }]}>{label}</Text>
      {rightElement || <Icon name="chevron-right" size={22} color={colors.dim || '#64748B'} />}
    </TouchableOpacity>
  );

  return (
    <Screen contentStyle={styles.screenContainer}>
      {/* Profile Header with Avatar & Direct Gallery Upload */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={uploadingAvatar}
          onPress={pickAndUploadAvatar}
          style={[styles.avatarContainer, { backgroundColor: colors.primary, borderColor: colors.primaryLight + '66' }]}
        >
          {uploadingAvatar ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : profile?.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{(profile?.name || '?')[0].toUpperCase()}</Text>
          )}
          <View style={[styles.cameraBadge, { backgroundColor: colors.primaryDark, borderColor: colors.card }]}>
            <Icon name="camera" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <Text style={[styles.userName, { color: colors.text }]}>{profile?.name}</Text>
        <Text style={[styles.userEmail, { color: colors.muted }]}>{profile?.email}</Text>

        <View style={[styles.roleBadge, { backgroundColor: (ROLE_COLORS[role] || colors.primary) + '26' }]}>
          <Text style={[styles.roleText, { color: ROLE_COLORS[role] || colors.primary }]}>{ROLE_LABELS[role] || role}</Text>
        </View>
      </View>

      {/* Save Name Card */}
      <Card style={styles.cardSpacing}>
        <Input label="Display name" autoCapitalize="words" value={name} onChangeText={setName} />
        <Button title="Save changes" onPress={saveProfileInfo} loading={saving} variant="secondary" />
      </Card>

      {/* Currency Card */}
      <Card style={styles.cardSpacing}>
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>Currency</Text>
        <View style={styles.currencyWrap}>
          {CURRENCIES.map((c) => (
            <Chip
              key={c.code}
              label={`${c.symbol} ${c.code}`}
              active={(profile?.currency || 'BDT') === c.code}
              onPress={() => updateMyProfile({ currency: c.code }).catch((e) => showAlert('Error', e.message, 'error'))}
            />
          ))}
        </View>
      </Card>

      {/* Preferences & Menu Options */}
      <Card style={[styles.cardSpacing, { paddingVertical: 4 }]}>
        <Item
          icon="theme-light-dark"
          label="Dark Mode"
          rightElement={
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <Item icon="shape-outline" label="Manage categories" onPress={() => navigation.navigate('Categories')} />
        <Item icon="lock-reset" label="Change password" onPress={() => setPwOpen(true)} />
        {isStaff(role) && <Item icon="shield-account" label="Admin panel" onPress={() => navigation.navigate('Admin')} />}
      </Card>

      {/* Logout Button */}
      <Button title="Log Out" variant="danger" icon="logout" onPress={confirmLogout} />

      {/* Password Change Modal */}
      <Modal visible={pwOpen} transparent animationType="fade" onRequestClose={() => setPwOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Change password</Text>
            <Input label="Current password" secureTextEntry value={cur} onChangeText={setCur} />
            <Input label="New password" secureTextEntry value={next} onChangeText={setNext} placeholder="At least 6 characters" />
            <Button title="Update password" onPress={submitPw} loading={pwBusy} />
            <Button title="Cancel" variant="secondary" onPress={() => setPwOpen(false)} style={styles.cancelBtn} />
          </View>
        </View>
      </Modal>

      {/* Custom Animated Alert Modal */}
      <CustomAlert
        visible={alertData.visible}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        showCancel={alertData.showCancel}
        confirmText={alertData.confirmText}
        cancelText="Cancel"
        onCancel={() => setAlertData({ ...alertData, visible: false })}
        onClose={() => {
          setAlertData({ ...alertData, visible: false });
          if (alertData.onConfirm) {
            alertData.onConfirm();
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    paddingBottom: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 6,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
  },
  userEmail: {
    marginTop: 2,
    fontSize: 14,
  },
  roleBadge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  roleText: {
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  cardSpacing: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  currencyWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    borderRadius: radius.lg,
    padding: 24,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  cancelBtn: {
    marginTop: 12,
  },
});