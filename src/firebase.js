import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// NOTE: Firebase Analytics (getAnalytics) only works on web, not in React Native / Expo Go,
// so it is intentionally not used here.


// const firebaseConfig = {
//   apiKey: 'AIzaSyAyvGuCo_ZaClR1sEW2HajaP_uRzQHgYR4',
//   authDomain: 'expenses-management-58ec6.firebaseapp.com',
//   projectId: 'expenses-management-58ec6',
//   storageBucket: 'expenses-management-58ec6.firebasestorage.app',
//   messagingSenderId: '401450146895',
//   appId: '1:401450146895:web:3131dc0db18f6ce66ade3a',
//   measurementId: 'G-2177NTXCG6',
// };

const firebaseConfig = {
  apiKey: 'process.env.EXPO_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'process.env.EXPO_PUBLIC_FIREBASE_APP_ID',
  measurementId: 'process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID',
};





const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch (e) {
  // already initialised (fast refresh)
  auth = getAuth(app);
}

const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });

export { app, auth, db };
