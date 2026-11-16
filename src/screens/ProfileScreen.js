

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';
import usePullRefresh from '../hooks/usePullRefresh';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../firebase';
import { Button, Chip, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CURRENCIES } from '../constants/categories';
import { ROLE_COLORS, ROLE_LABELS, isStaff } from '../constants/roles';
import { authMessage } from '../utils/authErrors';
import { authenticate, clearCredentials, getCredentials, isBiometricAvailable, saveCredentials } from '../utils/biometric';
import { sameMonth } from '../utils/format';
import { totals } from '../utils/stats';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import CustomAlert from '../components/CustomAlert';

const CLOUD_NAME = 'y84gtvow';
const UPLOAD_PRESET = 'expense_tracker';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 1200 -> 1.2k, 2500000 -> 2.5M
const compact = (n) => {
  const v = Math.abs(n);
  if (v >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (v >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, '')}k`;
  return String(Math.round(n));
};

export default function ProfileScreen({ navigation }) {
  const { profile, role, updateMyProfile, changePassword, signOut, theme, toggleTheme, colors } = useAuth();
  const { transactions, symbol } = useData();
  const isDarkMode = theme === 'dark';
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { refreshControl } = usePullRefresh();

  // keep the screen above the keyboard (needed on edge-to-edge Android builds)
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const formY = useRef(0);
  const { inset: keyboardInset, onLayout: onRootLayout } = useKeyboardInset(rootRef);

  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password Modal state
  const [pwOpen, setPwOpen] = useState(false);
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  // Login History Modal state
  const [activityModalOpen, setActivityModalOpen] = useState(false);

  // Fingerprint state
  const [bioSupported, setBioSupported] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioOpen, setBioOpen] = useState(false);
  const [bioPw, setBioPw] = useState('');
  const [bioBusy, setBioBusy] = useState(false);

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

  // Check fingerprint support + whether it is already enabled for this account
  useEffect(() => {
    (async () => {
      setBioSupported(await isBiometricAvailable());
      const c = await getCredentials();
      setBioEnabled(!!c && c.email === profile?.email);
    })();
  }, [profile?.email]);

  // quick numbers for the header
  const stats = useMemo(() => {
    const now = new Date();
    const t = totals(transactions.filter((x) => sameMonth(x.date, now)));
    return { entries: transactions.length, income: t.income, expense: t.expense };
  }, [transactions]);

  const created = profile?.createdAt?.toDate ? profile.createdAt.toDate() : null;
  const memberSince = created ? `${MONTHS[created.getMonth()]} ${created.getFullYear()}` : null;
  const roleColor = ROLE_COLORS[role] || colors.primary;

  // Switch on/off (asks for confirmation before turning off)
  const toggleBio = (on) => {
    if (on) {
      setBioOpen(true);
    } else {
      showAlert(
        'Disable fingerprint login?',
        'Are you sure you want to turn off fingerprint login? You will need your password to sign in next time.',
        'warning',
        true,
        async () => {
          await clearCredentials();
          setBioEnabled(false);
          showAlert('Disabled', 'Fingerprint login has been turned off.', 'success');
        },
        'Turn Off'
      );
    }
  };

  // Verify password, confirm fingerprint, then store credentials securely
  const enableBio = async () => {
    if (!bioPw) return showAlert('Enter password', 'Enter your current password to enable fingerprint login.', 'warning');
    setBioBusy(true);
    try {
      const cred = EmailAuthProvider.credential(profile.email, bioPw);
      await reauthenticateWithCredential(auth.currentUser, cred);
      const ok = await authenticate('Confirm your fingerprint');
      if (ok) {
        await saveCredentials(profile.email, bioPw);
        setBioEnabled(true);
        setBioOpen(false);
        setBioPw('');
        showAlert('Enabled', 'You can now log in with your fingerprint.', 'success');
      }
    } catch (e) {
      showAlert('Error', authMessage(e), 'error');
    }
    setBioBusy(false);
  };

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
        base64: true,
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
      if (bioEnabled) await saveCredentials(profile.email, next);
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
    showAlert('Log out', 'Do you want to log out from your account?', 'warning', true, signOut, 'Log out');
  };

  const primary = colors.primaryLight || colors.primary;

  return (
    <View
      ref={rootRef}
      collapsable={false}
      onLayout={onRootLayout}
      style={[styles.root, { paddingBottom: keyboardInset }]}
    >
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        contentContainerStyle={styles.content}
      >



        {/* ---------- Header with pattern background ---------- */}
        <View style={styles.hero}>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="pfGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={primary} stopOpacity="0.22" />
                  <Stop offset="1" stopColor={primary} stopOpacity="0" />
                </LinearGradient>
                <Pattern id="pfPattern" patternUnits="userSpaceOnUse" width="40" height="40">
                  <Circle cx="10" cy="10" r="1.8" fill={primary} />
                  <Circle cx="30" cy="30" r="1.8" fill={primary} />
                  <Path d="M30 7 V13 M27 10 H33" stroke={primary} strokeWidth="1.4" strokeLinecap="round" />
                  <Path d="M10 27 V33 M7 30 H13" stroke={primary} strokeWidth="1.4" strokeLinecap="round" />
                </Pattern>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#pfGrad)" />
              {/* very light pattern */}
              <Rect width="100%" height="100%" fill="url(#pfPattern)" opacity={0.1} />
            </Svg>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={uploadingAvatar}
            onPress={pickAndUploadAvatar}
            style={[styles.avatarRing, { borderColor: primary + '55' }]}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              {uploadingAvatar ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : profile?.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{(profile?.name || '?')[0].toUpperCase()}</Text>
              )}
            </View>
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary, borderColor: colors.card }]}>
              <Icon name="camera" size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName} numberOfLines={1}>{profile?.name}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{profile?.email}</Text>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: roleColor + '24' }]}>
              <Icon name="shield-check-outline" size={13} color={roleColor} />
              <Text style={[styles.badgeText, { color: roleColor }]}>{ROLE_LABELS[role] || role}</Text>
            </View>
            {memberSince && (
              <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                <Icon name="calendar-check-outline" size={13} color={colors.muted} />
                <Text style={[styles.badgeText, { color: colors.muted }]}>Since {memberSince}</Text>
              </View>
            )}
          </View>

          {/* quick stats */}
          <View style={styles.statsRow}>
            <Stat styles={styles} label="Entries" value={String(stats.entries)} color={primary} />
            <View style={styles.statDivider} />
            <Stat styles={styles} label="Income (month)" value={`${symbol}${compact(stats.income)}`} color={colors.income} />
            <View style={styles.statDivider} />
            <Stat styles={styles} label="Spent (month)" value={`${symbol}${compact(stats.expense)}`} color={colors.expense} />
          </View>
        </View>




        <View style={styles.body}>
          {/* ---------- Profile ---------- */}
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={[styles.group, styles.formBox]} onLayout={(e) => (formY.current = e.nativeEvent.layout.y)}>
            <Input
              label="Display name"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              onFocus={() =>
                setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, formY.current + 150), animated: true }), 300)
              }
            />
            <Button title="Save changes" onPress={saveProfileInfo} loading={saving} variant="secondary" />
          </View>

          {/* ---------- Preferences ---------- */}
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.group}>
            <Row styles={styles} colors={colors} icon="cash-multiple" tint="#F59E0B" label="Currency" subtitle={profile?.currency || 'BDT'} />
            <View style={styles.chipsWrap}>
              {CURRENCIES.map((c) => (
                <Chip
                  key={c.code}
                  label={`${c.symbol} ${c.code}`}
                  active={(profile?.currency || 'BDT') === c.code}
                  onPress={() => updateMyProfile({ currency: c.code }).catch((e) => showAlert('Error', e.message, 'error'))}
                />
              ))}
            </View>

            <Row
              styles={styles}
              colors={colors}
              divider
              icon="theme-light-dark"
              tint="#8B5CF6"
              label="Dark mode"
              subtitle={isDarkMode ? 'On' : 'Off'}
              right={
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              }
            />

            {bioSupported && (
              <Row
                styles={styles}
                colors={colors}
                divider
                icon="fingerprint"
                tint="#10B981"
                label="Fingerprint login"
                subtitle={bioEnabled ? 'Enabled' : 'Log in with your fingerprint'}
                right={
                  <Switch
                    value={bioEnabled}
                    onValueChange={toggleBio}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                }
              />
            )}
          </View>
          {!bioSupported && (
            <Text style={styles.hint}>Fingerprint login is not available. Add a fingerprint in your phone Settings first.</Text>
          )}

          {/* ---------- Security ---------- */}
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.group}>
            <Row styles={styles} colors={colors} icon="lock-reset" tint="#F97316" label="Change password" subtitle="Update your account password" onPress={() => setPwOpen(true)} />
            <Row styles={styles} colors={colors} divider icon="history" tint="#06B6D4" label="Account activity" subtitle="Recent login sessions" onPress={() => setActivityModalOpen(true)} />
          </View>



          {/* ---------- Manage ---------- */}
          <Text style={styles.sectionTitle}>Manage</Text>
          <View style={styles.group}>
            <Row styles={styles} colors={colors} icon="shape-outline" tint="#3B82F6" label="Categories" subtitle="Add or remove your categories" onPress={() => navigation.navigate('Categories')} />
            <Row styles={styles} colors={colors} divider icon="map-marker-path" tint="#10B981" label="Location tracker" subtitle="Places you visited" onPress={() => navigation.navigate('LocationTracker')} />
            <Row styles={styles} colors={colors} divider icon="account-group" tint="#6366F1" label="Group expenses" subtitle="Shared Expenses for Tours or Trips" onPress={() => navigation.navigate('Groups')} />
            {isStaff(role) && (
              <Row styles={styles} colors={colors} divider icon="shield-account" tint="#EF4444" label="Admin panel" subtitle="Manage users and roles" onPress={() => navigation.navigate('Admin')} />
            )}
          </View>

          {/* ---------- About / Developer ---------- */}
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.group}>
            <Row 
              styles={styles} 
              colors={colors} 
              icon="code-braces" 
              tint="#8B5CF6" 
              label="Developer Info" 
              subtitle="App version, creator & details" 
              onPress={() => navigation.navigate('Developer')} 
            />
          </View>




          <Button title="Log Out" variant="danger" icon="logout" onPress={confirmLogout} style={{ marginTop: 22 }} />
          <Text style={styles.footer}>Expense Tracker</Text>
        </View>
      </ScrollView>

      {/* ---------- Password Change Modal ---------- */}
      <SheetModal styles={styles} visible={pwOpen} onClose={() => setPwOpen(false)}>
        <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.modalHead}>
            <View style={[styles.modalIcon, { backgroundColor: '#F9731622' }]}>
              <Icon name="lock-reset" size={20} color="#F97316" />
            </View>
            <Text style={styles.modalTitle}>Change password</Text>
          </View>
          <Input label="Current password" secureTextEntry value={cur} onChangeText={setCur} />
          <Input label="New password" secureTextEntry value={next} onChangeText={setNext} placeholder="At least 6 characters" />
          <Button title="Update password" onPress={submitPw} loading={pwBusy} />
          <Button title="Cancel" variant="secondary" onPress={() => setPwOpen(false)} style={styles.cancelBtn} />
        </View>
      </SheetModal>

      {/* ---------- Enable Fingerprint Modal ---------- */}
      <SheetModal styles={styles} visible={bioOpen} onClose={() => setBioOpen(false)}>
        <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.modalHead}>
            <View style={[styles.modalIcon, { backgroundColor: '#10B98122' }]}>
              <Icon name="fingerprint" size={20} color="#10B981" />
            </View>
            <Text style={styles.modalTitle}>Enable fingerprint login</Text>
          </View>
          <Text style={styles.modalText}>Enter your password once. It will be stored securely on this phone only.</Text>
          <Input label="Current password" secureTextEntry value={bioPw} onChangeText={setBioPw} />
          <Button title="Continue" icon="fingerprint" onPress={enableBio} loading={bioBusy} />
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => {
              setBioOpen(false);
              setBioPw('');
            }}
            style={styles.cancelBtn}
          />
        </View>
      </SheetModal>

      {/* ---------- Account Activity / Login History Modal ---------- */}
    

         <SheetModal styles={styles} visible={activityModalOpen} onClose={() => setActivityModalOpen(false)} animationType="slide">
  <View
    style={[
      styles.modalBox,
      {
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 24,
      },
    ]}
  >
    {/* Top Drag Handle */}
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

    {/* Header */}
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: '#06B6D41A',
            borderWidth: 1,
            borderColor: '#06B6D435',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="shield-lock-outline" size={22} color="#06B6D4" />
        </View>
        <View>
          <Text style={[styles.modalTitle, { fontSize: 18, fontWeight: '800', color: colors.text }]}>
            Login & Sessions
          </Text>
          <Text style={{ color: colors.dim, fontSize: 12, marginTop: 2 }}>
            Devices where your account is active
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setActivityModalOpen(false)}
        hitSlop={10}
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
        <Icon name="close" size={18} color={colors.muted} />
      </TouchableOpacity>
    </View>

    {/* Security Banner */}
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 9,
        marginBottom: 14,
      }}
    >
      <Icon name="information-outline" size={16} color="#06B6D4" />
      <Text style={{ color: colors.muted, fontSize: 11.5, flex: 1 }}>
        Showing your last 10 synced sign-in activities.
      </Text>
    </View>

    {/* Sessions List */}
    <ScrollView style={{ maxHeight: 310, marginBottom: 16 }} showsVerticalScrollIndicator={false}>
      {profile?.loginHistory && profile.loginHistory.length > 0 ? (
        [...profile.loginHistory]
          .reverse()
          .slice(0, 10)
          .map((session, index) => {
            const isLatest = index === 0;
            const dev = session.device || 'Mobile Device';
            const iconName = dev.includes('iOS') || dev.includes('iPhone')
              ? 'apple'
              : dev.includes('Android')
              ? 'android'
              : dev.includes('Windows')
              ? 'microsoft-windows'
              : 'laptop';

            return (
              <View
                key={session.id || index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isLatest ? colors.primary + '0D' : colors.bg,
                  borderWidth: 1,
                  borderColor: isLatest ? colors.primary + '45' : colors.border,
                  borderRadius: 16,
                  padding: 12,
                  marginBottom: 10,
                }}
              >
                {/* Device Icon */}
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 13,
                    backgroundColor: isLatest ? colors.primary + '20' : colors.card,
                    borderWidth: 1,
                    borderColor: isLatest ? colors.primary + '35' : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={iconName} size={21} color={isLatest ? colors.primary : colors.muted} />
                </View>

                {/* Device Info */}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <Text
                      style={[styles.deviceName, { color: colors.text, fontWeight: '700', fontSize: 14, flex: 1 }]}
                      numberOfLines={1}
                    >
                      {dev}
                    </Text>

                    {isLatest && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          backgroundColor: '#10B98120',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 20,
                        }}
                      >
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                        <Text style={{ color: '#059669', fontSize: 10, fontWeight: '800' }}>Current</Text>
                      </View>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
                    <Icon name="clock-outline" size={12} color={colors.dim} />
                    <Text style={[styles.deviceDetails, { color: colors.dim, fontSize: 12 }]}>
                      {session.timestamp}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
      ) : (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 30,
            backgroundColor: colors.bg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.card,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            <Icon name="history" size={24} color={colors.dim} />
          </View>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>No Login History</Text>
          <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 }}>
            Sign out and log back in to start syncing your device login activity.
          </Text>
        </View>
      )}
    </ScrollView>

    <Button title="Done" variant="secondary" onPress={() => setActivityModalOpen(false)} />
  </View>
</SheetModal>   




      {/* Custom Animated Alert Modal */}
      <CustomAlert
        visible={alertData.visible}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        showCancel={alertData.showCancel}
        confirmText={alertData.confirmText}
        cancelText="Cancel"
        onCancel={() => setAlertData((prev) => ({ ...prev, visible: false }))}
        onConfirm={() => {
          const action = alertData.onConfirm;
          setAlertData((prev) => ({ ...prev, visible: false }));
          if (action) action();
        }}
        onClose={() => {
          const action = alertData.onConfirm;
          setAlertData((prev) => ({ ...prev, visible: false }));
          if (action) action();
        }}
      />
    </View>
  );
}

/* ---------- small components ---------- */

// A modal that moves above the keyboard (so inputs inside are never hidden)
function SheetModal({ styles, visible, onClose, animationType = 'fade', children }) {
  const ref = useRef(null);
  const { inset, onLayout } = useKeyboardInset(ref);
  return (
    <Modal visible={visible} transparent animationType={animationType} onRequestClose={onClose} statusBarTranslucent>
      <View ref={ref} collapsable={false} onLayout={onLayout} style={[styles.modalOverlay, { paddingBottom: 24 + inset }]}>
        {children}
      </View>
    </Modal>
  );
}

const Stat = ({ styles, label, value, color }) => (
  <View style={styles.stat}>
    <Text style={[styles.statValue, { color }]} numberOfLines={1}>{value}</Text>
    <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
  </View>
);

const Row = ({ styles, colors, icon, tint, label, subtitle, onPress, right, divider }) => {
  const content = (
    <>
      <View style={[styles.rowIcon, { backgroundColor: tint + '22' }]}>
        <Icon name={icon} size={20} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSub} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right !== undefined ? right : onPress ? <Icon name="chevron-right" size={20} color={colors.dim} /> : null}
    </>
  );
  const style = [styles.row, divider && styles.rowDivider];
  return onPress ? (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={style}>
      {content}
    </TouchableOpacity>
  ) : (
    <View style={style}>{content}</View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    content: { paddingBottom: 32 },


    // header
    hero: {
      alignItems: 'center',
      paddingTop: 24,
      paddingBottom: 18,
      paddingHorizontal: 20,
      backgroundColor: colors.card,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      borderBottomWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      width: '100%',
      alignSelf: 'stretch',
    },


    avatarRing: {
      width: 104,
      height: 104,
      borderRadius: 52,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatar: {
      width: 92,
      height: 92,
      borderRadius: 46,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarText: { color: '#FFFFFF', fontSize: 34, fontWeight: '800' },
    cameraBadge: {
      position: 'absolute',
      right: 0,
      bottom: 2,
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    userName: { color: colors.text, fontSize: 19, fontWeight: '800', marginTop: 12, maxWidth: '90%' },
    userEmail: { color: colors.muted, fontSize: 13, marginTop: 2, maxWidth: '90%' },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 10 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    badgeText: { fontSize: 11, fontWeight: '700' },

    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
      backgroundColor: colors.bg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      marginTop: 16,
    },
    stat: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
    statValue: { fontSize: 15, fontWeight: '800' },
    statLabel: { color: colors.muted, fontSize: 10, fontWeight: '600', marginTop: 2 },
    statDivider: { width: 1, height: 26, backgroundColor: colors.border },

    // body
    body: { paddingHorizontal: 16, paddingTop: 6 },
    sectionTitle: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginTop: 20,
      marginBottom: 8,
      marginLeft: 4,
    },
    group: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    formBox: { padding: 14 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
    rowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
    rowIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    rowLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
    rowSub: { color: colors.muted, fontSize: 12, marginTop: 1 },
    chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 14, paddingBottom: 14, paddingTop: 2 },
    hint: { color: colors.dim, fontSize: 12, marginTop: 8, marginLeft: 4 },
    footer: { color: colors.dim, fontSize: 11, textAlign: 'center', marginTop: 14 },

    // modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', paddingHorizontal: 24, paddingTop: 24 },
    modalBox: { borderRadius: 20, padding: 20, borderWidth: 1 },
    modalHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    modalIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    modalTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
    modalText: { color: colors.muted, fontSize: 13, marginBottom: 14 },
    cancelBtn: { marginTop: 10 },
    activityHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
    deviceIconBox: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
    deviceName: { color: colors.text, fontSize: 14, fontWeight: '600' },
    deviceDetails: { color: colors.muted, fontSize: 12, marginTop: 2 },
    latestText: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  });