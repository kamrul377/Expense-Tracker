
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/theme';
import { authMessage } from '../../utils/authErrors';
import CustomAlert from '../../components/CustomAlert'; // Custom Alert Component

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  // Custom Alert State
  const [alertData, setAlertData] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error'
  });

  const showAlert = (title, message, type = 'warning') => {
    setAlertData({ visible: true, title, message, type });
  };

  const submit = async () => {
    if (!name.trim()) return showAlert('Missing info', 'Enter your name.', 'warning');
    if (!email.trim()) return showAlert('Missing info', 'Enter your email.', 'warning');
    if (password.length < 6) return showAlert('Weak password', 'Password must be at least 6 characters.', 'warning');
    if (password !== confirm) return showAlert('Mismatch', 'Passwords do not match.', 'error');

    setBusy(true);
    try {
      await signUp(name, email, password);
    } catch (e) {
      showAlert('Registration failed', authMessage(e), 'error');
      setBusy(false);
    }
  };

  return (
    <Screen contentStyle={styles.screenContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.iconWrapper}>
              <Icon name="account-plus-outline" size={38} color={colors.primaryLight || '#818CF8'} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to start tracking your expenses</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Input
              label="Full name"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
            />
            <Input
              label="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
            />
            <Input
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
            />
            <Input
              label="Confirm password"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repeat password"
            />

            <View style={styles.buttonSpacing}>
              <Button title="Create Account" onPress={submit} loading={busy} />
            </View>
          </View>

          {/* Footer Navigation */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.footerContainer}
          >
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.loginText}>Log in</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Animated Alert Modal */}
      <CustomAlert
        visible={alertData.visible}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        onClose={() => setAlertData({ ...alertData, visible: false })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.bg || '#0F172A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  title: {
    color: colors.text || '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.muted || '#94A3B8',
    fontSize: 15,
    marginTop: 6,
  },
  formContainer: {
    width: '100%',
  },
  buttonSpacing: {
    marginTop: 12,
  },
  footerContainer: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    color: colors.muted || '#94A3B8',
    fontSize: 15,
  },
  loginText: {
    color: colors.accent || '#38BDF8',
    fontWeight: '700',
    fontSize: 15,
  },
});





