import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const KEY = 'bio_credentials';

export const isBiometricAvailable = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && enrolled;
};

export const authenticate = async (reason = 'Verify your identity') => {
    const res = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancel',
    });
    return res.success;
};

export const saveCredentials = (email, password) =>
    SecureStore.setItemAsync(KEY, JSON.stringify({ email, password }));

export const getCredentials = async () => {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? JSON.parse(raw) : null;
};

export const clearCredentials = () => SecureStore.deleteItemAsync(KEY);