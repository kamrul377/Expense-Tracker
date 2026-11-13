
// import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
// import { Platform } from 'react-native';
// import {
//   onAuthStateChanged,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut as fbSignOut,
//   sendPasswordResetEmail,
//   updateProfile,
//   updatePassword,
//   EmailAuthProvider,
//   reauthenticateWithCredential,
// } from 'firebase/auth';
// import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
// import { auth, db } from '../firebase';
// import { darkColors, lightColors } from '../constants/theme';
// import * as Device from 'expo-device'; // ১. সবার উপরে এই import টি যোগ করবেন (যদি না থাকে)
// const AuthContext = createContext(null);
// export const useAuth = () => useContext(AuthContext);

// const newProfile = (name, email) => ({
//   name: name || 'User',
//   email,
//   avatar: '',
//   role: 'user',
//   disabled: false,
//   currency: 'BDT',
//   createdAt: serverTimestamp(),
//   loginHistory: [], // নতুন ইউজারদের জন্য খালি অ্যারে
// });

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [profileError, setProfileError] = useState(null);
//   const [initializing, setInitializing] = useState(true);
//   const [theme, setTheme] = useState('dark');
//   const registering = useRef(false);

//   const activeColors = theme === 'dark' ? darkColors : lightColors;

//   useEffect(
//     () =>
//       onAuthStateChanged(auth, (u) => {
//         setUser(u);
//         if (!u) {
//           setProfile(null);
//           setProfileError(null);
//         }
//         setInitializing(false);
//       }),
//     []
//   );

//   // live profile (role / disabled changes apply instantly)
//   useEffect(() => {
//     if (!user) return undefined;
//     const ref = doc(db, 'users', user.uid);
//     return onSnapshot(
//       ref,
//       async (snap) => {
//         if (snap.exists()) {
//           setProfile({ uid: user.uid, ...snap.data() });
//           setProfileError(null);
//         } else if (!registering.current) {
//           try {
//             await setDoc(ref, newProfile(user.displayName, user.email));
//           } catch (e) {
//             setProfileError(e.message);
//           }
//         }
//       },
//       (err) => setProfileError(err.message)
//     );
//   }, [user]);


//   // লগইন হওয়ার সাথে সাথে সঠিক ডিভাইস মডেল ও সময় Firestore-এ রেকর্ড করার ফাংশন
//   const recordLoginActivity = async (uid) => {
//     try {
//       // ব্র্যান্ড এবং মডেল নাম যেমন: "Xiaomi Redmi Note 10" বা "Samsung Galaxy"
//       const brand = Device.brand ? Device.brand.toUpperCase() : '';
//       const model = Device.modelName || Device.deviceName || 'Mobile Device';
//       const deviceName = `${brand} ${model}`.trim();

//       const sessionData = {
//         id: Date.now().toString(),
//         device: deviceName || (Platform.OS === 'ios' ? 'iPhone' : 'Android Phone'),
//         timestamp: new Date().toLocaleString('en-US', {
//           month: 'short',
//           day: 'numeric',
//           year: 'numeric',
//           hour: '2-digit',
//           minute: '2-digit',
//         }),
//       };

//       const userRef = doc(db, 'users', uid);
//       await updateDoc(userRef, {
//         loginHistory: arrayUnion(sessionData),
//         lastLoginAt: serverTimestamp(),
//       });
//     } catch (error) {
//       console.log('Failed to record login activity:', error);
//     }
//   };

//   // আপডেট করা signIn ফাংশন
//   const signIn = async (email, password) => {
//     const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
//     await recordLoginActivity(cred.user.uid); // লগইন সফল হলেই হিস্ট্রি সেভ হবে
//     return cred;
//   };

//   const signUp = async (name, email, password) => {
//     registering.current = true;
//     try {
//       const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
//       await setDoc(doc(db, 'users', cred.user.uid), newProfile(name.trim(), cred.user.email));
//       await updateProfile(cred.user, { displayName: name.trim() });
//       await recordLoginActivity(cred.user.uid); // সাইনআপের পর প্রথম লগইন সেভ হবে
//     } finally {
//       registering.current = false;
//     }
//   };

//   const signOut = () => fbSignOut(auth);
//   const resetPassword = (email) => sendPasswordResetEmail(auth, email.trim());

//   const updateMyProfile = async (patch) => {
//     await updateDoc(doc(db, 'users', user.uid), patch);
//     if (patch.name) await updateProfile(auth.currentUser, { displayName: patch.name });
//     if (patch.avatar !== undefined) await updateProfile(auth.currentUser, { photoURL: patch.avatar });
//   };

//   const toggleTheme = () => {
//     setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
//   };

//   const changePassword = async (currentPassword, newPassword) => {
//     const cred = EmailAuthProvider.credential(user.email, currentPassword);
//     await reauthenticateWithCredential(auth.currentUser, cred);
//     await updatePassword(auth.currentUser, newPassword);
//   };

//   const value = {
//     user,
//     profile,
//     role: profile?.role,
//     profileError,
//     theme,
//     colors: activeColors,
//     toggleTheme,
//     loading: initializing || (!!user && !profile && !profileError),
//     signIn,
//     signUp,
//     signOut,
//     resetPassword,
//     updateMyProfile,
//     changePassword,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }











import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { getCredentials, saveCredentials } from '../utils/biometric';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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
import * as Device from 'expo-device'; // ১. সবার উপরে এই import টি যোগ করবেন (যদি না থাকে)
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const newProfile = (name, email) => ({
  name: name || 'User',
  email,
  avatar: '',
  role: 'user',
  disabled: false,
  currency: 'BDT',
  createdAt: serverTimestamp(),
  loginHistory: [], // নতুন ইউজারদের জন্য খালি অ্যারে
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [theme, setTheme] = useState('dark');
  const registering = useRef(false);

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

  // live profile (role / disabled changes apply instantly)
  useEffect(() => {
    if (!user) return undefined;
    const ref = doc(db, 'users', user.uid);
    return onSnapshot(
      ref,
      async (snap) => {
        if (snap.exists()) {
          setProfile({ uid: user.uid, ...snap.data() });
          setProfileError(null);
        } else if (!registering.current) {
          try {
            await setDoc(ref, newProfile(user.displayName, user.email));
          } catch (e) {
            setProfileError(e.message);
          }
        }
      },
      (err) => setProfileError(err.message)
    );
  }, [user]);


  // লগইন হওয়ার সাথে সাথে সঠিক ডিভাইস মডেল ও সময় Firestore-এ রেকর্ড করার ফাংশন
  const recordLoginActivity = async (uid) => {
    try {
      // ব্র্যান্ড এবং মডেল নাম যেমন: "Xiaomi Redmi Note 10" বা "Samsung Galaxy"
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
      await updateDoc(userRef, {
        loginHistory: arrayUnion(sessionData),
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      console.log('Failed to record login activity:', error);
    }
  };

  // আপডেট করা signIn ফাংশন
  const signIn = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    await recordLoginActivity(cred.user.uid); // লগইন সফল হলেই হিস্ট্রি সেভ হবে
    return cred;
  };

  const signUp = async (name, email, password) => {
    registering.current = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, 'users', cred.user.uid), newProfile(name.trim(), cred.user.email));
      await updateProfile(cred.user, { displayName: name.trim() });
      await recordLoginActivity(cred.user.uid); // সাইনআপের পর প্রথম লগইন সেভ হবে
    } finally {
      registering.current = false;
    }
  };

  const signOut = () => fbSignOut(auth);
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
    // keep fingerprint login working with the new password
    const stored = await getCredentials();
    if (stored && stored.email === user.email) await saveCredentials(user.email, newPassword);
  };
  const verifyPassword = async (password) => {
    const cred = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(auth.currentUser, cred);
  };

  const value = {
    user,
    profile,
    role: profile?.role,
    profileError,
    theme,
    colors: activeColors,
    toggleTheme,
    loading: initializing || (!!user && !profile && !profileError),
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateMyProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}