import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/theme';

// shown when the account is disabled by admin/manager OR the profile can't be loaded
export default function BlockedScreen() {
  const { profile, profileError, signOut } = useAuth();
  const disabled = profile?.disabled;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24 }}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Icon name={disabled ? 'account-lock' : 'alert-circle-outline'} size={64} color={colors.expense} />
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 12 }}>
          {disabled ? 'Account disabled' : 'Could not load your account'}
        </Text>
        <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 8 }}>
          {disabled
            ? 'Your account has been disabled. Please contact the administrator.'
            : profileError || 'Check your internet connection and Firestore rules.'}
        </Text>
      </View>
      <Button title="Log Out" variant="secondary" onPress={signOut} />
    </View>
  );
}
