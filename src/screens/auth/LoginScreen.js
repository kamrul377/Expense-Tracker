


// import React, { useEffect, useMemo, useState } from 'react';
// import { StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform , ActivityIndicator} from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import Screen from '../../components/Screen';
// import { Button, Input } from '../../components/ui';
// import { useAuth } from '../../context/AuthContext';
// import { authMessage } from '../../utils/authErrors';
// import CustomAlert from '../../components/CustomAlert';
// import { authenticate, clearCredentials, getCredentials, isBiometricAvailable } from '../../utils/biometric';

// export default function LoginScreen({ navigation }) {
//   const { signIn, signInAsGuest, colors, theme, toggleTheme } = useAuth();
//   const styles = useMemo(() => createStyles(colors), [colors]);

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [busy, setBusy] = useState(false);
//   const [guestBusy, setGuestBusy] = useState(false);
//   const [bioReady, setBioReady] = useState(false);

//   // Custom Alert State
//   const [alertData, setAlertData] = useState({
//     visible: false,
//     title: '',
//     message: '',
//     type: 'error',
//     showCancel: false,
//     onConfirm: null,
//     confirmText: 'Okay, Got it',
//   });

//   const showAlert = (title, message, type = 'warning', showCancel = false, onConfirm = null, confirmText = 'Okay, Got it') => {
//     setAlertData({ visible: true, title, message, type, showCancel, onConfirm, confirmText });
//   };

//   // Show the fingerprint icon only if phone supports it AND it was enabled from Profile
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

//   const handleGuestLogin = async () => {
//     setGuestBusy(true);
//     try {
//       await signInAsGuest();
//     } catch (e) {
//       showAlert('Guest login failed', authMessage(e), 'error');
//       setGuestBusy(false);
//     }
//   };

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

//   const anyBusy = busy || guestBusy;

//   return (
//     <Screen contentStyle={styles.container}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardView}
//       >
//         {/* Top Row: Logo + Quick Light/Dark Toggle */}
//         <View style={styles.topRow}>
//           <View style={styles.iconWrapper}>
//             <Icon name="wallet" size={42} color={colors.primary || '#635BEB'} />
//           </View>

//           <TouchableOpacity
//             onPress={toggleTheme}
//             activeOpacity={0.75}
//             style={styles.themeBtn}
//           >
//             <Icon
//               name={theme === 'dark' ? 'weather-sunny' : 'weather-night'}
//               size={20}
//               color={theme === 'dark' ? '#FBBF24' : colors.text}
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Header Section */}
//         <View style={styles.headerContainer}>
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

//           {/* Login button (left) + fingerprint icon (right) */}
//           <View style={styles.loginRow}>
//             <View style={{ flex: 1 }}>
              
//               <TouchableOpacity
//   onPress={submit}
//   disabled={anyBusy}
//   activeOpacity={0.85}
//   style={{
//     height: 52,
//     borderRadius: 14,
//     backgroundColor: theme === 'dark' ? '#10B981' : '#059669',
//     justifyContent: 'center',
//     alignItems: 'center',
//     opacity: anyBusy ? 0.6 : 1,
//   }}
// >
//   {busy ? (
//     <ActivityIndicator color="#FFFFFF" />
//   ) : (
//     <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
//       Log In
//     </Text>
//   )}
// </TouchableOpacity>

//             </View>

//             {bioReady && (
//               <TouchableOpacity
//                 onPress={bioLogin}
//                 disabled={anyBusy}
//                 activeOpacity={0.8}
//                 style={[styles.bioIconBtn, anyBusy && { opacity: 0.6 }]}
//               >
//                 <Icon name="fingerprint" size={30} color={colors.primary || '#635BEB'} />
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* Divider */}
//           <View style={styles.dividerRow}>
//             <View style={styles.dividerLine} />
//             <Text style={styles.dividerText}>OR</Text>
//             <View style={styles.dividerLine} />
//           </View>

//           {/* Continue as Guest Button */}
//           <Button
//             title="Continue as Guest"
//             icon="account-outline"
//             variant="secondary"
//             onPress={handleGuestLogin}
//             loading={guestBusy}
//             disabled={anyBusy}
//           />
//         </View>

//         {/* Footer Section */}
//         <TouchableOpacity
//           onPress={() => navigation.navigate('Register')}
//           disabled={anyBusy}
//           style={styles.footerContainer}
//         >
//           <Text style={styles.footerText}>
//             Don't have an account? Register...
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
//         onCancel={() => setAlertData((prev) => ({ ...prev, visible: false }))}
//         onConfirm={() => {
//           const action = alertData.onConfirm;
//           setAlertData((prev) => ({ ...prev, visible: false }));
//           if (action) action();
//         }}
//         onClose={() => {
//           const action = alertData.onConfirm;
//           setAlertData((prev) => ({ ...prev, visible: false }));
//           if (action) action();
//         }}
//       />
//     </Screen>
//   );
// }

// const createStyles = (colors) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       paddingHorizontal: 24,
//       justifyContent: 'center',
//       backgroundColor: colors.bg,
//     },
//     keyboardView: {
//       width: '100%',
//     },
//     topRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'flex-start',
//       marginBottom: 20,
//     },
//     iconWrapper: {
//       width: 76,
//       height: 76,
//       borderRadius: 22,
//       backgroundColor: (colors.primary || '#635BEB') + '18',
//       justifyContent: 'center',
//       alignItems: 'center',
//       borderWidth: 1,
//       borderColor: (colors.primary || '#635BEB') + '33',
//     },
//     themeBtn: {
//       width: 42,
//       height: 42,
//       borderRadius: 14,
//       backgroundColor: colors.card,
//       borderWidth: 1,
//       borderColor: colors.border,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     headerContainer: {
//       alignItems: 'flex-start',
//       marginBottom: 28,
//     },
//     title: {
//       color: colors.text,
//       fontSize: 30,
//       fontWeight: '800',
//       letterSpacing: -0.5,
//     },
//     subtitle: {
//       color: colors.muted,
//       fontSize: 15,
//       marginTop: 6,
//     },
//     formContainer: {
//       width: '100%',
//     },
//     forgotContainer: {
//       alignSelf: 'flex-end',
//       marginBottom: 22,
//       marginTop: 4,
//     },
//     forgotText: {
//       color: colors.primary || '#635BEB',
//       fontSize: 14,
//       fontWeight: '600',
//     },
//     loginRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 12,
//     },
//     bioIconBtn: {
//       width: 52,
//       height: 52,
//       borderRadius: 14,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: (colors.primary || '#635BEB') + '18',
//       borderWidth: 1,
//       borderColor: (colors.primary || '#635BEB') + '33',
//     },
//     dividerRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginVertical: 18,
//       gap: 12,
//     },
//     dividerLine: {
//       flex: 1,
//       height: 1,
//       backgroundColor: colors.border,
//     },
//     dividerText: {
//       color: colors.muted,
//       fontSize: 12,
//       fontWeight: '700',
//       letterSpacing: 0.8,
//     },
//     footerContainer: {
//       marginTop: 26,
//       alignItems: 'center',
//       paddingVertical: 8,
//     },
//     footerText: {
//       color: colors.muted,
//       fontSize: 15,
//     },
//     registerText: {
//       color: colors.primary || '#635BEB',
//       fontWeight: '700',
//       fontSize: 15,
//     },
//   });










import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { authMessage } from '../../utils/authErrors';
import CustomAlert from '../../components/CustomAlert';
import BubbleBackground from '../../components/BubbleBackground'; // NEW
import { authenticate, clearCredentials, getCredentials, isBiometricAvailable } from '../../utils/biometric';

export default function LoginScreen({ navigation }) {
  const { signIn, signInAsGuest, colors, theme, toggleTheme } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [guestBusy, setGuestBusy] = useState(false);
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

  // Show the fingerprint icon only if phone supports it AND it was enabled from Profile
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

  const handleGuestLogin = async () => {
    setGuestBusy(true);
    try {
      await signInAsGuest();
    } catch (e) {
      showAlert('Guest login failed', authMessage(e), 'error');
      setGuestBusy(false);
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

  const anyBusy = busy || guestBusy;

  return (
    // NEW: root view holds the background colour + animated bubbles behind everything
    <View style={styles.root}>
      <BubbleBackground colors={colors} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            {/* Top Row: Logo + Quick Light/Dark Toggle */}
            <View style={styles.topRow}>
              <View style={styles.iconWrapper}>
                <Icon name="wallet" size={42} color={colors.primary || '#635BEB'} />
              </View>

              <TouchableOpacity
                onPress={toggleTheme}
                activeOpacity={0.75}
                style={styles.themeBtn}
              >
                <Icon
                  name={theme === 'dark' ? 'weather-sunny' : 'weather-night'}
                  size={20}
                  color={theme === 'dark' ? '#FBBF24' : colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Header Section */}
            <View style={styles.headerContainer}>
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
                  <TouchableOpacity
                    onPress={submit}
                    disabled={anyBusy}
                    activeOpacity={0.85}
                    style={{
                      height: 52,
                      borderRadius: 14,
                      backgroundColor: theme === 'dark' ? '#10B981' : '#059669',
                      justifyContent: 'center',
                      alignItems: 'center',
                      opacity: anyBusy ? 0.6 : 1,
                    }}
                  >
                    {busy ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                        Log In
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {bioReady && (
                  <TouchableOpacity
                    onPress={bioLogin}
                    disabled={anyBusy}
                    activeOpacity={0.8}
                    style={[styles.bioIconBtn, anyBusy && { opacity: 0.6 }]}
                  >
                    <Icon name="fingerprint" size={30} color={colors.primary || '#635BEB'} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Continue as Guest Button */}
              <Button
                title="Continue as Guest"
                icon="account-outline"
                variant="secondary"
                onPress={handleGuestLogin}
                loading={guestBusy}
                disabled={anyBusy}
              />
            </View>

            {/* Footer Section */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={anyBusy}
              style={styles.footerContainer}
            >
              <Text style={styles.footerText}>
                Don't have an account? Register...
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </ScrollView>
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
        onCancel={() => setAlertData((prev) => ({ ...prev, visible: false }))}
        onConfirm={() => {
          const action = alertData.onConfirm;
          setAlertData((prev) => ({ ...prev, visible: false }));
          if (action) action();
        }}
        onClose={() => {
          const action = alertData.onConfirm;
          setAlertData((prev) => ({ ...prev, visible: false }));
          if (action) action();
        }}
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bg, // NEW
    },
    container: {
      flexGrow: 1, // NEW: fills the full screen height so content stays centered
      paddingHorizontal: 24,
      paddingVertical: 24,
      justifyContent: 'center',
    },
    keyboardView: {
      width: '100%',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    iconWrapper: {
      width: 76,
      height: 76,
      borderRadius: 22,
      backgroundColor: (colors.primary || '#635BEB') + '18',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: (colors.primary || '#635BEB') + '33',
    },
    themeBtn: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerContainer: {
      alignItems: 'flex-start',
      marginBottom: 28,
    },
    title: {
      color: colors.text,
      fontSize: 30,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    subtitle: {
      color: colors.muted,
      fontSize: 15,
      marginTop: 6,
    },
    formContainer: {
      width: '100%',
    },
    forgotContainer: {
      alignSelf: 'flex-end',
      marginBottom: 22,
      marginTop: 4,
    },
    forgotText: {
      color: colors.primary || '#635BEB',
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
      backgroundColor: (colors.primary || '#635BEB') + '18',
      borderWidth: 1,
      borderColor: (colors.primary || '#635BEB') + '33',
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 18,
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.8,
    },
    footerContainer: {
      marginTop: 26,
      alignItems: 'center',
      paddingVertical: 8,
    },
    footerText: {
      color: colors.muted,
      fontSize: 15,
    },
    registerText: {
      color: colors.primary || '#635BEB',
      fontWeight: '700',
      fontSize: 15,
    },
  });