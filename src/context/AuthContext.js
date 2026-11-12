// import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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
// import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
// import { auth, db } from '../firebase';

// const AuthContext = createContext(null);
// export const useAuth = () => useContext(AuthContext);

// const newProfile = (name, email) => ({
//   name: name || 'User',
//   email,
//   role: 'user', // everyone starts as "user"; admin promotes from the Admin panel
//   disabled: false,
//   currency: 'BDT',
//   createdAt: serverTimestamp(),
// });

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [profileError, setProfileError] = useState(null);
//   const [initializing, setInitializing] = useState(true);
//   const registering = useRef(false);

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
//           // account exists in Auth but has no profile yet -> create it
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

//   const signIn = (email, password) => signInWithEmailAndPassword(auth, email.trim(), password);

//   const signUp = async (name, email, password) => {
//     registering.current = true;
//     try {
//       const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
//       await setDoc(doc(db, 'users', cred.user.uid), newProfile(name.trim(), cred.user.email));
//       await updateProfile(cred.user, { displayName: name.trim() });
//     } finally {
//       registering.current = false;
//     }
//   };

//   const signOut = () => fbSignOut(auth);
//   const resetPassword = (email) => sendPasswordResetEmail(auth, email.trim());

//   // name / currency only (security rules block role + disabled changes)
//   const updateMyProfile = async (patch) => {
//     await updateDoc(doc(db, 'users', user.uid), patch);
//     if (patch.name) await updateProfile(auth.currentUser, { displayName: patch.name });
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








// import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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
// import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
// import { auth, db } from '../firebase';

// const AuthContext = createContext(null);
// export const useAuth = () => useContext(AuthContext);

// const newProfile = (name, email) => ({
//   name: name || 'User',
//   email,
//   avatar: '', // Initial empty avatar field
//   role: 'user', // everyone starts as "user"; admin promotes from the Admin panel
//   disabled: false,
//   currency: 'BDT',
//   createdAt: serverTimestamp(),
// });

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [profileError, setProfileError] = useState(null);
//   const [initializing, setInitializing] = useState(true);
//   const [theme, setTheme] = useState('dark'); // 'dark' or 'light' mode state
//   const registering = useRef(false);

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
//           // account exists in Auth but has no profile yet -> create it
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

//   const signIn = (email, password) => signInWithEmailAndPassword(auth, email.trim(), password);

//   const signUp = async (name, email, password) => {
//     registering.current = true;
//     try {
//       const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
//       await setDoc(doc(db, 'users', cred.user.uid), newProfile(name.trim(), cred.user.email));
//       await updateProfile(cred.user, { displayName: name.trim() });
//     } finally {
//       registering.current = false;
//     }
//   };

//   const signOut = () => fbSignOut(auth);
//   const resetPassword = (email) => sendPasswordResetEmail(auth, email.trim());

//   // name / currency / avatar patch support
//   const updateMyProfile = async (patch) => {
//     await updateDoc(doc(db, 'users', user.uid), patch);
//     if (patch.name) await updateProfile(auth.currentUser, { displayName: patch.name });
//     if (patch.avatar !== undefined) await updateProfile(auth.currentUser, { photoURL: patch.avatar });
//   };

//   // Toggle Dark/Light Mode
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
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { darkColors, lightColors } from '../constants/theme'; // Theme colors import kora holo

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const newProfile = (name, email) => ({
  name: name || 'User',
  email,
  avatar: '',
  role: 'user', // everyone starts as "user"; admin promotes from the Admin panel
  disabled: false,
  currency: 'BDT',
  createdAt: serverTimestamp(),
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light' mode state
  const registering = useRef(false);

  // Active theme colors select korar jonno
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

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email.trim(), password);

  const signUp = async (name, email, password) => {
    registering.current = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, 'users', cred.user.uid), newProfile(name.trim(), cred.user.email));
      await updateProfile(cred.user, { displayName: name.trim() });
    } finally {
      registering.current = false;
    }
  };

  const signOut = () => fbSignOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email.trim());

  // name / currency / avatar patch support
  const updateMyProfile = async (patch) => {
    await updateDoc(doc(db, 'users', user.uid), patch);
    if (patch.name) await updateProfile(auth.currentUser, { displayName: patch.name });
    if (patch.avatar !== undefined) await updateProfile(auth.currentUser, { photoURL: patch.avatar });
  };

  // Toggle Dark/Light Mode
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const changePassword = async (currentPassword, newPassword) => {
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, cred);
    await updatePassword(auth.currentUser, newPassword);
  };

  const value = {
    user,
    profile,
    role: profile?.role,
    profileError,
    theme,
    colors: activeColors, // Context theke dynamic colors pass kora holo
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
