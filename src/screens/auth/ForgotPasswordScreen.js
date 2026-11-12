import React, { useState } from 'react';
import { Alert, Text } from 'react-native';
import Screen from '../../components/Screen';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/theme';
import { authMessage } from '../../utils/authErrors';

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim()) return Alert.alert('Missing info', 'Enter your email.');
    setBusy(true);
    try {
      await resetPassword(email);
      Alert.alert('Email sent', 'Check your inbox for the password reset link.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', authMessage(e));
    }
    setBusy(false);
  };

  return (
    <Screen>
      <Text style={{ color: colors.muted, marginBottom: 16 }}>
        Enter your account email and we will send you a link to reset your password.
      </Text>
      <Input label="Email" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@example.com" />
      <Button title="Send Reset Link" onPress={submit} loading={busy} />
    </Screen>
  );
}
