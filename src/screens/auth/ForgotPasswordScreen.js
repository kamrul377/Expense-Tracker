import React, { useState } from 'react';
import { Text } from 'react-native';
import Screen from '../../components/Screen';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/theme';
import { authMessage } from '../../utils/authErrors';
import CustomAlert from '../../components/CustomAlert';

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  // Custom Alert State
  const [alertData, setAlertData] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: null,
  });

  const showAlert = (title, message, type = 'warning', onConfirm = null) => {
    setAlertData({ visible: true, title, message, type, onConfirm });
  };

  const handleCloseAlert = () => {
    const callback = alertData.onConfirm;
    setAlertData({ ...alertData, visible: false, onConfirm: null });
    if (callback) callback();
  };

  const submit = async () => {
    if (!email.trim()) return showAlert('Missing info', 'Enter your email.', 'warning');
    setBusy(true);
    try {
      await resetPassword(email);
      showAlert(
        'Email sent',
        'Check your inbox for the password reset link.',
        'success',
        () => navigation.goBack()
      );
    } catch (e) {
      showAlert('Error', authMessage(e), 'error');
    }
    setBusy(false);
  };

  return (
    <Screen>
      <Text style={{ color: colors.muted, marginBottom: 16 }}>
        Enter your account email and we will send you a link to reset your password.
      </Text>
      <Input
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
      />
      <Button title="Send Reset Link" onPress={submit} loading={busy} />

      {/* Custom Animated Alert Modal */}
      <CustomAlert
        visible={alertData.visible}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        onClose={handleCloseAlert}
      />
    </Screen>
  );
}