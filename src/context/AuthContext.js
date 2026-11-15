




import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { getCredentials, saveCredentials } from '../utils/biometric';
import { unregisterPush } from '../services/pushService';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { darkColors, lightColors } from '../constants/theme';
import * as Device from 'expo-device';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const newProfile = (name, email, isGuest = false) => ({
  name: name || (isGuest ? 'Guest User' : 'User'),
  email: email || (isGuest ? 'Guest Account' : ''),
  avatar: '',
  role: 'user',
  isGuest,
  disabled: false,
  currency: 'BDT',
  createdAt: serverTimestamp(),
  loginHistory: [],
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [theme, setTheme] = useState('light');

  const activeColors = theme === 'dark' ? darkColors : lightColors;

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (!u) {
          setProfile(null);
          setProfileError(null);
        }
        setInitializing(false);
      }),
    []
  );

  // Live profile listener with safe auto-creation
  useEffect(() => {
    if (!user) return undefined;
    const ref = doc(db, 'users', user.uid);
    return onSnapshot(
      ref,
      async (snap) => {
        if (snap.exists()) {
          setProfile({ uid: user.uid, ...snap.data() });
          setProfileError(null);
        } else {
          try {
            await setDoc(
              ref,
              newProfile(user.displayName, user.email, user.isAnonymous),
              { merge: true }
            );
          } catch (e) {
            setProfileError(e.message);
          }
        }
      },
      (err) => setProfileError(err.message)
    );
  }, [user]);

  const recordLoginActivity = async (uid) => {
    try {
      const brand = Device.brand ? Device.brand.toUpperCase() : '';
      const model = Device.modelName || Device.deviceName || 'Mobile Device';
      const deviceName = `${brand} ${model}`.trim();

      const sessionData = {
        id: Date.now().toString(),
        device: deviceName || (Platform.OS === 'ios' ? 'iPhone' : 'Android Phone'),
        timestamp: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      const userRef = doc(db, 'users', uid);
      await setDoc(
        userRef,
        {
          loginHistory: arrayUnion(sessionData),
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.log('Failed to record login activity:', error);
    }
  };

  const signIn = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    await recordLoginActivity(cred.user.uid);
    return cred;
  };

  const signInAsGuest = async () => {
    const cred = await signInAnonymously(auth);
    await setDoc(
      doc(db, 'users', cred.user.uid),
      newProfile('Guest User', 'Guest Account', true),
      { merge: true }
    );
    await recordLoginActivity(cred.user.uid);
    return cred;
  };

  const signUp = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: name.trim() });
    await setDoc(
      doc(db, 'users', cred.user.uid),
      newProfile(name.trim(), cred.user.email, false),
      { merge: true }
    );
    await recordLoginActivity(cred.user.uid);
  };

  // const signOut = () => fbSignOut(auth);
  const signOut = async () => {
    try { await unregisterPush(user?.email); } catch (e) { }
    return fbSignOut(auth);
  };


  const resetPassword = (email) => sendPasswordResetEmail(auth, email.trim());

  const updateMyProfile = async (patch) => {
    await updateDoc(doc(db, 'users', user.uid), patch);
    if (patch.name) await updateProfile(auth.currentUser, { displayName: patch.name });
    if (patch.avatar !== undefined) await updateProfile(auth.currentUser, { photoURL: patch.avatar });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const changePassword = async (currentPassword, newPassword) => {
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, cred);
    await updatePassword(auth.currentUser, newPassword);
    const stored = await getCredentials();
    if (stored && stored.email === user.email) await saveCredentials(user.email, newPassword);
  };

  const value = {
    user,
    profile,
    role: profile?.role,
    isGuest: !!user?.isAnonymous || !!profile?.isGuest,
    profileError,
    theme,
    colors: activeColors,
    toggleTheme,
    loading: initializing || (!!user && !profile && !profileError),
    signIn,
    signInAsGuest,
    signUp,
    signOut,
    resetPassword,
    updateMyProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}