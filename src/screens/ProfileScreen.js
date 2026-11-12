// import React, { useState } from 'react';
// import { Alert, Modal, Text, TouchableOpacity, View } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import Screen from '../components/Screen';
// import { Button, Card, Chip, Input } from '../components/ui';
// import { useAuth } from '../context/AuthContext';
// import { colors, radius } from '../constants/theme';
// import { CURRENCIES } from '../constants/categories';
// import { ROLE_COLORS, ROLE_LABELS, isStaff } from '../constants/roles';
// import { authMessage } from '../utils/authErrors';

// export default function ProfileScreen({ navigation }) {
//   const { profile, role, updateMyProfile, changePassword, signOut } = useAuth();
//   const [name, setName] = useState(profile?.name || '');
//   const [saving, setSaving] = useState(false);
//   const [pwOpen, setPwOpen] = useState(false);
//   const [cur, setCur] = useState('');
//   const [next, setNext] = useState('');
//   const [pwBusy, setPwBusy] = useState(false);

//   const saveName = async () => {
//     if (!name.trim()) return Alert.alert('Missing name', 'Name cannot be empty.');
//     setSaving(true);
//     try {
//       await updateMyProfile({ name: name.trim() });
//       Alert.alert('Saved', 'Profile updated.');
//     } catch (e) {
//       Alert.alert('Error', e.message);
//     }
//     setSaving(false);
//   };

//   const submitPw = async () => {
//     if (!cur || next.length < 6) return Alert.alert('Check input', 'Enter current password and a new password (min 6 chars).');
//     setPwBusy(true);
//     try {
//       await changePassword(cur, next);
//       setPwOpen(false);
//       setCur('');
//       setNext('');
//       Alert.alert('Done', 'Password changed.');
//     } catch (e) {
//       Alert.alert('Error', authMessage(e));
//     }
//     setPwBusy(false);
//   };

//   const confirmLogout = () =>
//     Alert.alert('Log out', 'Do you want to log out?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Log out', style: 'destructive', onPress: signOut },
//     ]);

//   const Item = ({ icon, label, onPress }) => (
//     <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
//       <Icon name={icon} size={22} color={colors.primaryLight} />
//       <Text style={{ flex: 1, color: colors.text, marginLeft: 12, fontSize: 15 }}>{label}</Text>
//       <Icon name="chevron-right" size={22} color={colors.dim} />
//     </TouchableOpacity>
//   );

//   return (
//     <Screen>
//       <View style={{ alignItems: 'center', marginBottom: 20 }}>
//         <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
//           <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800' }}>{(profile?.name || '?')[0].toUpperCase()}</Text>
//         </View>
//         <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 10 }}>{profile?.name}</Text>
//         <Text style={{ color: colors.muted, marginTop: 2 }}>{profile?.email}</Text>
//         <View style={{ marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: ROLE_COLORS[role] + '26' }}>
//           <Text style={{ color: ROLE_COLORS[role], fontWeight: '700', fontSize: 12 }}>{ROLE_LABELS[role]}</Text>
//         </View>
//       </View>

//       <Card>
//         <Input label="Display name" autoCapitalize="words" value={name} onChangeText={setName} />
//         <Button title="Save name" onPress={saveName} loading={saving} variant="secondary" />
//       </Card>

//       <Card>
//         <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 10 }}>Currency</Text>
//         <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//           {CURRENCIES.map((c) => (
//             <Chip
//               key={c.code}
//               label={`${c.symbol} ${c.code}`}
//               active={(profile?.currency || 'BDT') === c.code}
//               onPress={() => updateMyProfile({ currency: c.code }).catch((e) => Alert.alert('Error', e.message))}
//             />
//           ))}
//         </View>
//       </Card>

//       <Card style={{ paddingVertical: 4 }}>
//         <Item icon="shape-outline" label="Manage categories" onPress={() => navigation.navigate('Categories')} />
//         <Item icon="lock-reset" label="Change password" onPress={() => setPwOpen(true)} />
//         {isStaff(role) && <Item icon="shield-account" label="Admin panel" onPress={() => navigation.navigate('Admin')} />}
//       </Card>

//       <Button title="Log Out" variant="danger" icon="logout" onPress={confirmLogout} />

//       <Modal visible={pwOpen} transparent animationType="fade" onRequestClose={() => setPwOpen(false)}>
//         <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
//           <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: 20, borderWidth: 1, borderColor: colors.border }}>
//             <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 14 }}>Change password</Text>
//             <Input label="Current password" secureTextEntry value={cur} onChangeText={setCur} />
//             <Input label="New password" secureTextEntry value={next} onChangeText={setNext} placeholder="At least 6 characters" />
//             <Button title="Update password" onPress={submitPw} loading={pwBusy} />
//             <Button title="Cancel" variant="secondary" onPress={() => setPwOpen(false)} style={{ marginTop: 10 }} />
//           </View>
//         </View>
//       </Modal>
//     </Screen>
//   );
// }




import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Button, Card, Chip, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { colors, radius } from '../constants/theme';
import { CURRENCIES } from '../constants/categories';
import { ROLE_COLORS, ROLE_LABELS, isStaff } from '../constants/roles';
import { authMessage } from '../utils/authErrors';
import CustomAlert from '../components/CustomAlert'; // Custom Alert Component

export default function ProfileScreen({ navigation }) {
  const { profile, role, updateMyProfile, changePassword, signOut } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  // Custom Alert State with Cancel and Callback Support
  const [alertData, setAlertData] = useState({ 
    visible: false, 
    title: '', 
    message: '', 
    type: 'error',
    showCancel: false,
    onConfirm: null,
    confirmText: 'Okay, Got it'
  });

  const showAlert = (title, message, type = 'warning', showCancel = false, onConfirm = null, confirmText = 'Okay, Got it') => {
    setAlertData({ visible: true, title, message, type, showCancel, onConfirm, confirmText });
  };

  const saveName = async () => {
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
      true, // Enables Cancel button
      signOut, // Runs when user confirms logout
      'Log out' // Custom confirmation button text
    );
  };

  const Item = ({ icon, label, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.itemRow}>
      <Icon name={icon} size={22} color={colors.primaryLight || '#818CF8'} />
      <Text style={styles.itemText}>{label}</Text>
      <Icon name="chevron-right" size={22} color={colors.dim || '#64748B'} />
    </TouchableOpacity>
  );

  return (
    <Screen contentStyle={styles.screenContainer}>
      {/* Profile Header */}
      <View style={styles.headerContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{(profile?.name || '?')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{profile?.name}</Text>
        <Text style={styles.userEmail}>{profile?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: (ROLE_COLORS[role] || colors.primary) + '26' }]}>
          <Text style={[styles.roleText, { color: ROLE_COLORS[role] || colors.primary }]}>{ROLE_LABELS[role] || role}</Text>
        </View>
      </View>

      {/* Save Name Card */}
      <Card style={styles.cardSpacing}>
        <Input label="Display name" autoCapitalize="words" value={name} onChangeText={setName} />
        <Button title="Save name" onPress={saveName} loading={saving} variant="secondary" />
      </Card>

      {/* Currency Card */}
      <Card style={styles.cardSpacing}>
        <Text style={styles.sectionTitle}>Currency</Text>
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

      {/* Menu Options */}
      <Card style={[styles.cardSpacing, { paddingVertical: 4 }]}>
        <Item icon="shape-outline" label="Manage categories" onPress={() => navigation.navigate('Categories')} />
        <Item icon="lock-reset" label="Change password" onPress={() => setPwOpen(true)} />
        {isStaff(role) && <Item icon="shield-account" label="Admin panel" onPress={() => navigation.navigate('Admin')} />}
      </Card>

      {/* Logout Button */}
      <Button title="Log Out" variant="danger" icon="logout" onPress={confirmLogout} />

      {/* Password Change Modal */}
      <Modal visible={pwOpen} transparent animationType="fade" onRequestClose={() => setPwOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Change password</Text>
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
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary || '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  userName: {
    color: colors.text || '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
  },
  userEmail: {
    color: colors.muted || '#94A3B8',
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
    color: colors.muted || '#94A3B8',
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
    color: colors.text || '#F8FAFC',
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
    backgroundColor: colors.card || '#1E293B',
    borderRadius: radius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border || '#334155',
  },
  modalTitle: {
    color: colors.text || '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  cancelBtn: {
    marginTop: 12,
  },
});