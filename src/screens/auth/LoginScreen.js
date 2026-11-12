// import React, { useState } from 'react';
// import { Alert, Text, TouchableOpacity, View } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import Screen from '../../components/Screen';
// import { Button, Input } from '../../components/ui';
// import { useAuth } from '../../context/AuthContext';
// import { colors } from '../../constants/theme';
// import { authMessage } from '../../utils/authErrors';

// export default function LoginScreen({ navigation }) {
//   const { signIn } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [busy, setBusy] = useState(false);

//   const submit = async () => {
//     if (!email.trim() || !password) return Alert.alert('Missing info', 'Enter your email and password.');
//     setBusy(true);
//     try {
//       await signIn(email, password);
//     } catch (e) {
//       Alert.alert('Login failed', authMessage(e));
//       setBusy(false);
//     }
//   };

//   return (
//     <Screen contentStyle={{ paddingTop: 80 }}>
//       <View style={{ alignItems: 'center', marginBottom: 32 }}>
//         <Icon name="wallet" size={56} color={colors.primaryLight} />
//         <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginTop: 8 }}>Expense Tracker</Text>
//         <Text style={{ color: colors.muted, marginTop: 4 }}>Log in to manage your money</Text>
//       </View>
//       <Input label="Email" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@example.com" />
//       <Input label="Password" secureTextEntry value={password} onChangeText={setPassword} placeholder="••••••••" />
//       <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
//         <Text style={{ color: colors.primaryLight, fontSize: 13 }}>Forgot password?</Text>
//       </TouchableOpacity>
//       <Button title="Log In" onPress={submit} loading={busy} />
//       <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 20, alignItems: 'center' }}>
//         <Text style={{ color: colors.muted }}>
//           No account? <Text style={{ color: colors.primaryLight, fontWeight: '700' }}>Register</Text>
//         </Text>
//       </TouchableOpacity>
//     </Screen>
//   );
// }



// import React, { useState } from 'react';
// import { Alert, StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import Screen from '../../components/Screen';
// import { Button, Input } from '../../components/ui';
// import { useAuth } from '../../context/AuthContext';
// import { colors } from '../../constants/theme';
// import { authMessage } from '../../utils/authErrors';

// export default function LoginScreen({ navigation }) {
//   const { signIn } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [busy, setBusy] = useState(false);

//   const submit = async () => {
//     if (!email.trim() || !password) return Alert.alert('Missing info', 'Enter your email and password.');
//     setBusy(true);
//     try {
//       await signIn(email, password);
//     } catch (e) {
//       Alert.alert('Login failed', authMessage(e));
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

//         {/* Footer Section - Fixed Visibility */}
//         <TouchableOpacity 
//           onPress={() => navigation.navigate('Register')} 
//           style={styles.footerContainer}
//         >
//           <Text style={styles.footerText}>
//             Don't have an account? <Text style={styles.registerText}>Register</Text>
//           </Text>
//         </TouchableOpacity>
//       </KeyboardAvoidingView>
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
//     backgroundColor: 'rgba(99, 102, 241, 0.15)', // Using primary tint
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
//     color: colors.accent || '#38BDF8', // Bright accent color so it pops out clearly on dark bg
//     fontWeight: '700',
//     fontSize: 15,
//   },
// });



import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/theme';
import { authMessage } from '../../utils/authErrors';
import CustomAlert from '../../components/CustomAlert'; // Custom Alert Component

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  // Custom Alert State matching updated CustomAlert component structure
  const [alertData, setAlertData] = useState({ 
    visible: false, 
    title: '', 
    message: '', 
    type: 'error',
    showCancel: false,
    onConfirm: null,
    confirmText: 'Okay, Got it'
  });

  const showAlert = (title, message, type = 'warning', showCancel = false, onConfirm = null, confirmText = 'Okay, Got it') => {
    setAlertData({ visible: true, title, message, type, showCancel, onConfirm, confirmText });
  };

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

          <Button title="Log In" onPress={submit} loading={busy} />
        </View>

        {/* Footer Section */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Register')} 
          style={styles.footerContainer}
        >
          <Text style={styles.footerText}>
            Don't have an account? <Text style={styles.registerText}>Register</Text>
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