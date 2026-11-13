


// import React, { useState } from 'react';
// import { StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import Screen from '../../components/Screen';
// import { Button, Input } from '../../components/ui';
// import { useAuth } from '../../context/AuthContext';
// import { colors } from '../../constants/theme';
// import { authMessage } from '../../utils/authErrors';
// import CustomAlert from '../../components/CustomAlert'; // Custom Alert Component

// export default function LoginScreen({ navigation }) {
//   const { signIn } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [busy, setBusy] = useState(false);



//   // React.useEffect(() => {
//   //   Alert.alert('Key check', `key: ${String(app.options.apiKey)}\nproject: ${String(app.options.projectId)}`);
//   // }, []);


//   // Custom Alert State matching updated CustomAlert component structure
//   const [alertData, setAlertData] = useState({
//     visible: false,
//     title: '',
//     message: '',
//     type: 'error',
//     showCancel: false,
//     onConfirm: null,
//     confirmText: 'Okay, Got it'
//   });

//   const showAlert = (title, message, type = 'warning', showCancel = false, onConfirm = null, confirmText = 'Okay, Got it') => {
//     setAlertData({ visible: true, title, message, type, showCancel, onConfirm, confirmText });
//   };

//   const submit = async () => {
//     if (!email.trim() || !password) return showAlert('Missing info', 'Enter your email and password.', 'warning');
//     setBusy(true);
//     try {
//       await signIn(email, password);
//     } catch (e) {
//       showAlert('Login failed', authMessage(e), 'error');
//       setBusy(false);
//     }
//   };

//   return (
//     <Screen contentStyle={styles.container}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardView}
//       >
//         {/* Header Section with Larger Logo */}
//         <View style={styles.headerContainer}>
//           <View style={styles.iconWrapper}>
//             <Icon name="wallet" size={44} color={colors.primaryLight || '#818CF8'} />
//           </View>
//           <Text style={styles.title}>Welcome Back</Text>
//           <Text style={styles.subtitle}>Log in to manage your money with ease</Text>
//         </View>

//         {/* Form Section */}
//         <View style={styles.formContainer}>
//           <Input
//             label="Email"
//             keyboardType="email-address"
//             value={email}
//             onChangeText={setEmail}
//             placeholder="you@example.com"
//             autoCapitalize="none"
//           />
//           <Input
//             label="Password"
//             secureTextEntry
//             value={password}
//             onChangeText={setPassword}
//             placeholder="••••••••"
//           />

//           <TouchableOpacity
//             onPress={() => navigation.navigate('ForgotPassword')}
//             style={styles.forgotContainer}
//           >
//             <Text style={styles.forgotText}>Forgot password?</Text>
//           </TouchableOpacity>

//           <Button title="Log In" onPress={submit} loading={busy} />
//         </View>

//         {/* Footer Section */}
//         <TouchableOpacity
//           onPress={() => navigation.navigate('Register')}
//           style={styles.footerContainer}
//         >
//           <Text style={styles.footerText}>
//             Don't have an account? <Text style={styles.registerText}>Register</Text>
//           </Text>
//         </TouchableOpacity>
//       </KeyboardAvoidingView>

//       {/* Custom Animated Alert Modal */}
//       <CustomAlert
//         visible={alertData.visible}
//         title={alertData.title}
//         message={alertData.message}
//         type={alertData.type}
//         showCancel={alertData.showCancel}
//         confirmText={alertData.confirmText}
//         cancelText="Cancel"
//         onCancel={() => setAlertData({ ...alertData, visible: false })}
//         onClose={() => {
//           setAlertData({ ...alertData, visible: false });
//           if (alertData.onConfirm) {
//             alertData.onConfirm();
//           }
//         }}
//       />
//     </Screen>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 24,
//     justifyContent: 'center',
//     backgroundColor: colors.bg,
//   },
//   keyboardView: {
//     width: '100%',
//   },
//   headerContainer: {
//     alignItems: 'flex-start',
//     marginBottom: 32,
//   },
//   iconWrapper: {
//     width: 80,
//     height: 80,
//     borderRadius: 22,
//     backgroundColor: 'rgba(99, 102, 241, 0.15)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(99, 102, 241, 0.3)',
//   },
//   title: {
//     color: colors.text || '#F8FAFC',
//     fontSize: 30,
//     fontWeight: '800',
//     letterSpacing: -0.5,
//   },
//   subtitle: {
//     color: colors.muted || '#94A3B8',
//     fontSize: 15,
//     marginTop: 6,
//   },
//   formContainer: {
//     width: '100%',
//   },
//   forgotContainer: {
//     alignSelf: 'flex-end',
//     marginBottom: 24,
//     marginTop: 4,
//   },
//   forgotText: {
//     color: colors.primaryLight || '#818CF8',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   footerContainer: {
//     marginTop: 32,
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   footerText: {
//     color: colors.muted || '#94A3B8',
//     fontSize: 15,
//   },
//   registerText: {
//     color: colors.accent || '#38BDF8',
//     fontWeight: '700',
//     fontSize: 15,
//   },
// });


// =======with finger login==========

// import React, { useEffect, useState } from 'react'; // NEW: useEffect
// import { StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import Screen from '../../components/Screen';
// import { Button, Input } from '../../components/ui';
// import { useAuth } from '../../context/AuthContext';
// import { colors } from '../../constants/theme';
// import { authMessage } from '../../utils/authErrors';
// import CustomAlert from '../../components/CustomAlert'; // Custom Alert Component
// import { authenticate, clearCredentials, getCredentials, isBiometricAvailable } from '../../utils/biometric'; // NEW

// export default function LoginScreen({ navigation }) {
//   const { signIn } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [busy, setBusy] = useState(false);
//   const [bioReady, setBioReady] = useState(false); // NEW

//   // Custom Alert State matching updated CustomAlert component structure
//   const [alertData, setAlertData] = useState({
//     visible: false,
//     title: '',
//     message: '',
//     type: 'error',
//     showCancel: false,
//     onConfirm: null,
//     confirmText: 'Okay, Got it'
//   });

//   const showAlert = (title, message, type = 'warning', showCancel = false, onConfirm = null, confirmText = 'Okay, Got it') => {
//     setAlertData({ visible: true, title, message, type, showCancel, onConfirm, confirmText });
//   };

//   // NEW: show the fingerprint button only if phone supports it AND it was enabled from Profile
//   useEffect(() => {
//     (async () => {
//       const available = await isBiometricAvailable();
//       const creds = await getCredentials();
//       setBioReady(available && !!creds);
//     })();
//   }, []);

//   const submit = async () => {
//     if (!email.trim() || !password) return showAlert('Missing info', 'Enter your email and password.', 'warning');
//     setBusy(true);
//     try {
//       await signIn(email, password);
//     } catch (e) {
//       showAlert('Login failed', authMessage(e), 'error');
//       setBusy(false);
//     }
//   };

//   // NEW: fingerprint login
//   const bioLogin = async () => {
//     const ok = await authenticate('Log in to Expense Tracker');
//     if (!ok) return;
//     const creds = await getCredentials();
//     if (!creds) return setBioReady(false);
//     setBusy(true);
//     try {
//       await signIn(creds.email, creds.password);
//     } catch (e) {
//       setBusy(false);
//       const wrongPassword = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(e?.code);
//       if (wrongPassword) {
//         // password was changed elsewhere -> stored one is no longer valid
//         await clearCredentials();
//         setBioReady(false);
//         showAlert(
//           'Fingerprint login expired',
//           'Your password may have changed. Log in with your password, then enable fingerprint again from Profile.',
//           'warning'
//         );
//       } else {
//         showAlert('Login failed', authMessage(e), 'error');
//       }
//     }
//   };

//   return (
//     <Screen contentStyle={styles.container}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardView}
//       >
//         {/* Header Section with Larger Logo */}
//         <View style={styles.headerContainer}>
//           <View style={styles.iconWrapper}>
//             <Icon name="wallet" size={44} color={colors.primaryLight || '#818CF8'} />
//           </View>
//           <Text style={styles.title}>Welcome Back</Text>
//           <Text style={styles.subtitle}>Log in to manage your money with ease</Text>
//         </View>

//         {/* Form Section */}
//         <View style={styles.formContainer}>
//           <Input
//             label="Email"
//             keyboardType="email-address"
//             value={email}
//             onChangeText={setEmail}
//             placeholder="you@example.com"
//             autoCapitalize="none"
//           />
//           <Input
//             label="Password"
//             secureTextEntry
//             value={password}
//             onChangeText={setPassword}
//             placeholder="••••••••"
//           />

//           <TouchableOpacity
//             onPress={() => navigation.navigate('ForgotPassword')}
//             style={styles.forgotContainer}
//           >
//             <Text style={styles.forgotText}>Forgot password?</Text>
//           </TouchableOpacity>

//           <Button title="Log In" onPress={submit} loading={busy} />

//           {/* NEW: Fingerprint button */}
//           {bioReady && (
//             <Button
//               title="Login with Fingerprint"
//               icon="fingerprint"
//               variant="secondary"
//               onPress={bioLogin}
//               disabled={busy}
//               style={styles.bioBtn}
//             />
//           )}
//         </View>

//         {/* Footer Section */}
//         <TouchableOpacity
//           onPress={() => navigation.navigate('Register')}
//           style={styles.footerContainer}
//         >
//           <Text style={styles.footerText}>
//             Don't have an account? <Text style={styles.registerText}>Register</Text>
//           </Text>
//         </TouchableOpacity>
//       </KeyboardAvoidingView>

//       {/* Custom Animated Alert Modal */}
//       <CustomAlert
//         visible={alertData.visible}
//         title={alertData.title}
//         message={alertData.message}
//         type={alertData.type}
//         showCancel={alertData.showCancel}
//         confirmText={alertData.confirmText}
//         cancelText="Cancel"
//         onCancel={() => setAlertData({ ...alertData, visible: false })}
//         onClose={() => {
//           setAlertData({ ...alertData, visible: false });
//           if (alertData.onConfirm) {
//             alertData.onConfirm();
//           }
//         }}
//       />
//     </Screen>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 24,
//     justifyContent: 'center',
//     backgroundColor: colors.bg,
//   },
//   keyboardView: {
//     width: '100%',
//   },
//   headerContainer: {
//     alignItems: 'flex-start',
//     marginBottom: 32,
//   },
//   iconWrapper: {
//     width: 80,
//     height: 80,
//     borderRadius: 22,
//     backgroundColor: 'rgba(99, 102, 241, 0.15)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(99, 102, 241, 0.3)',
//   },
//   title: {
//     color: colors.text || '#F8FAFC',
//     fontSize: 30,
//     fontWeight: '800',
//     letterSpacing: -0.5,
//   },
//   subtitle: {
//     color: colors.muted || '#94A3B8',
//     fontSize: 15,
//     marginTop: 6,
//   },
//   formContainer: {
//     width: '100%',
//   },
//   forgotContainer: {
//     alignSelf: 'flex-end',
//     marginBottom: 24,
//     marginTop: 4,
//   },
//   forgotText: {
//     color: colors.primaryLight || '#818CF8',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   bioBtn: {
//     marginTop: 12, // NEW
//   },
//   footerContainer: {
//     marginTop: 32,
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   footerText: {
//     color: colors.muted || '#94A3B8',
//     fontSize: 15,
//   },
//   registerText: {
//     color: colors.accent || '#38BDF8',
//     fontWeight: '700',
//     fontSize: 15,
//   },
// });








// =========same row =======





import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/theme';
import { authMessage } from '../../utils/authErrors';
import CustomAlert from '../../components/CustomAlert';
import { authenticate, clearCredentials, getCredentials, isBiometricAvailable } from '../../utils/biometric';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [bioReady, setBioReady] = useState(false);

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

  // show the fingerprint icon only if phone supports it AND it was enabled from Profile
  useEffect(() => {
    (async () => {
      const available = await isBiometricAvailable();
      const creds = await getCredentials();
      setBioReady(available && !!creds);
    })();
  }, []);

  const submit = async () => {
    if (!email.trim() || !password) return showAlert('Missing info', 'Enter your email and password.', 'warning');
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (e) {
      showAlert('Login failed', authMessage(e), 'error');
      setBusy(false);
    }
  };

  const bioLogin = async () => {
    const ok = await authenticate('Log in to Expense Tracker');
    if (!ok) return;
    const creds = await getCredentials();
    if (!creds) return setBioReady(false);
    setBusy(true);
    try {
      await signIn(creds.email, creds.password);
    } catch (e) {
      setBusy(false);
      const wrongPassword = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(e?.code);
      if (wrongPassword) {
        // password was changed elsewhere -> stored one is no longer valid
        await clearCredentials();
        setBioReady(false);
        showAlert(
          'Fingerprint login expired',
          'Your password may have changed. Log in with your password, then enable fingerprint again from Profile.',
          'warning'
        );
      } else {
        showAlert('Login failed', authMessage(e), 'error');
      }
    }
  };

  return (
    <Screen contentStyle={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header Section with Larger Logo */}
        <View style={styles.headerContainer}>
          <View style={styles.iconWrapper}>
            <Icon name="wallet" size={44} color={colors.primaryLight || '#818CF8'} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to manage your money with ease</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
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
            placeholder="••••••••"
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotContainer}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login button (left) + fingerprint icon (right) */}
          <View style={styles.loginRow}>
            <View style={{ flex: 1 }}>
              <Button title="Log In" onPress={submit} loading={busy} />
            </View>

            {bioReady && (
              <TouchableOpacity
                onPress={bioLogin}
                disabled={busy}
                activeOpacity={0.8}
                style={[styles.bioIconBtn, busy && { opacity: 0.6 }]}
              >
                <Icon name="fingerprint" size={30} color={colors.primaryLight || '#818CF8'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Footer Section */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.footerContainer}
        >
          <Text style={styles.footerText}>
            Don't have an account? <Text style={styles.loginText}>Register</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Custom Animated Alert Modal */}
      <CustomAlert
        visible={alertData.visible}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        showCancel={alertData.showCancel}
        confirmText={alertData.confirmText}
        cancelText="Cancel"
        onCancel={() => setAlertData({ ...alertData, visible: false })}
        onClose={() => {
          setAlertData({ ...alertData, visible: false });
          if (alertData.onConfirm) {
            alertData.onConfirm();
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  keyboardView: {
    width: '100%',
  },
  headerContainer: {
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  title: {
    color: colors.text || '#F8FAFC',
    fontSize: 30,
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
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: 4,
  },
  forgotText: {
    color: colors.primaryLight || '#818CF8',
    fontSize: 14,
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bioIconBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  footerContainer: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    color: colors.muted || '#94A3B8',
    fontSize: 15,
  },
  registerText: {
    color: colors.accent || '#38BDF8',
    fontWeight: '700',
    fontSize: 15,
  },
});