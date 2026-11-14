
// import React, { useEffect, useRef } from 'react';
// import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import { colors } from '../constants/theme';

// export default function CustomAlert({ 
//   visible, 
//   title, 
//   message, 
//   type = 'error', 
//   onClose, 
//   showCancel = false, 
//   onCancel, 
//   confirmText = 'Okay, Got it',
//   cancelText = 'Cancel'
// }) {
//   const scaleAnim = useRef(new Animated.Value(0.8)).current;
//   const opacityAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     if (visible) {
//       Animated.parallel([
//         Animated.spring(scaleAnim, {
//           toValue: 1,
//           friction: 6,
//           tension: 80,
//           useNativeDriver: true,
//         }),
//         Animated.timing(opacityAnim, {
//           toValue: 1,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     } else {
//       scaleAnim.setValue(0.8);
//       opacityAnim.setValue(0);
//     }
//   }, [visible]);

//   if (!visible) return null;

//   const getConfig = () => {
//     switch (type) {
//       case 'warning':
//         return { icon: 'alert-circle-outline', color: colors.warn || '#FBBF24', bg: 'rgba(251, 191, 36, 0.15)' };
//       case 'success':
//         return { icon: 'check-circle-outline', color: colors.income || '#34D399', bg: 'rgba(52, 211, 153, 0.15)' };
//       default:
//         return { icon: 'close-circle-outline', color: colors.expense || '#F87171', bg: 'rgba(248, 113, 113, 0.15)' };
//     }
//   };

//   const config = getConfig();

//   return (
//     <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
//       <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
//         <Animated.View style={[styles.dialogBox, { transform: [{ scale: scaleAnim }] }]}>
          
//           <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
//             <Icon name={config.icon} size={36} color={config.color} />
//           </View>

//           <Text style={styles.title}>{title}</Text>
//           <Text style={styles.message}>{message}</Text>

//           {/* Buttons Section */}
//           {showCancel ? (
//             <View style={styles.buttonRow}>
//               <TouchableOpacity 
//                 activeOpacity={0.8} 
//                 style={[styles.button, styles.cancelButton]} 
//                 onPress={onCancel}
//               >
//                 <Text style={styles.cancelButtonText}>{cancelText}</Text>
//               </TouchableOpacity>

//               <TouchableOpacity 
//                 activeOpacity={0.8} 
//                 style={[styles.button, styles.confirmButton]} 
//                 onPress={onClose}
//               >
//                 <Text style={styles.confirmButtonText}>{confirmText}</Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <TouchableOpacity 
//               activeOpacity={0.8} 
//               style={[styles.button, styles.singleButton]} 
//               onPress={onClose}
//             >
//               <Text style={styles.confirmButtonText}>{confirmText}</Text>
//             </TouchableOpacity>
//           )}

//         </Animated.View>
//       </Animated.View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(15, 23, 42, 0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 28,
//   },
//   dialogBox: {
//     width: '100%',
//     backgroundColor: colors.card || '#1E293B',
//     borderRadius: 24,
//     padding: 24,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: colors.border || '#334155',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.35,
//     shadowRadius: 20,
//     elevation: 10,
//   },
//   iconCircle: {
//     width: 68,
//     height: 68,
//     borderRadius: 34,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   title: {
//     color: colors.text || '#F8FAFC',
//     fontSize: 20,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   message: {
//     color: colors.muted || '#94A3B8',
//     fontSize: 15,
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 24,
//   },
//   button: {
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   singleButton: {
//     width: '100%',
//     backgroundColor: colors.primary || '#6366F1',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     gap: 12,
//     width: '100%',
//   },
//   cancelButton: {
//     flex: 1,
//     backgroundColor: 'transparent',
//     borderWidth: 1,
//     borderColor: colors.border || '#334155',
//   },
//   cancelButtonText: {
//     color: colors.muted || '#94A3B8',
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   confirmButton: {
//     flex: 1,
//     backgroundColor: colors.expense || '#F87171',
//   },
//   confirmButtonText: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontWeight: '700',
//   },
// });



// import React, { useEffect, useRef } from 'react';
// import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import { colors } from '../constants/theme';

// export default function CustomAlert({
//   visible,
//   title,
//   message,
//   type = 'error',
//   onClose,
//   showCancel = false,
//   onCancel,
//   onConfirm,
//   confirmText = 'Okay, Got it',
//   cancelText = 'Cancel',
// }) {
//   const scaleAnim = useRef(new Animated.Value(0.85)).current;
//   const opacityAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     if (visible) {
//       Animated.parallel([
//         Animated.spring(scaleAnim, {
//           toValue: 1,
//           friction: 6,
//           tension: 80,
//           useNativeDriver: true,
//         }),
//         Animated.timing(opacityAnim, {
//           toValue: 1,
//           duration: 180,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     } else {
//       scaleAnim.setValue(0.85);
//       opacityAnim.setValue(0);
//     }
//   }, [visible]);

//   const getConfig = () => {
//     switch (type) {
//       case 'warning':
//         return { icon: 'alert-circle-outline', color: colors.warn || '#FBBF24', bg: 'rgba(251, 191, 36, 0.15)' };
//       case 'success':
//         return { icon: 'check-circle-outline', color: colors.income || '#34D399', bg: 'rgba(52, 211, 153, 0.15)' };
//       default:
//         return { icon: 'close-circle-outline', color: colors.expense || '#F87171', bg: 'rgba(248, 113, 113, 0.15)' };
//     }
//   };

//   const config = getConfig();
//   const handleConfirm = onConfirm || onClose;
//   const handleCancel = onCancel || onClose;

//   return (
//     <Modal
//       transparent
//       visible={!!visible}
//       animationType="none"
//       statusBarTranslucent
//       onRequestClose={showCancel ? handleCancel : onClose}
//     >
//       <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
//         <Animated.View style={[styles.dialogBox, { transform: [{ scale: scaleAnim }] }]}>
//           <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
//             <Icon name={config.icon} size={36} color={config.color} />
//           </View>

//           <Text style={styles.title}>{title}</Text>
//           <Text style={styles.message}>{message}</Text>

//           {showCancel ? (
//             <View style={styles.buttonRow}>
//               <TouchableOpacity
//                 activeOpacity={0.8}
//                 style={[styles.button, styles.cancelButton]}
//                 onPress={handleCancel}
//               >
//                 <Text style={styles.cancelButtonText}>{cancelText}</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 activeOpacity={0.8}
//                 style={[styles.button, styles.confirmButton]}
//                 onPress={handleConfirm}
//               >
//                 <Text style={styles.confirmButtonText}>{confirmText}</Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <TouchableOpacity
//               activeOpacity={0.8}
//               style={[styles.button, styles.singleButton]}
//               onPress={onClose}
//             >
//               <Text style={styles.confirmButtonText}>{confirmText}</Text>
//             </TouchableOpacity>
//           )}
//         </Animated.View>
//       </Animated.View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(15, 23, 42, 0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 28,
//   },
//   dialogBox: {
//     width: '100%',
//     backgroundColor: colors.card || '#1E293B',
//     borderRadius: 24,
//     padding: 24,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: colors.border || '#334155',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.35,
//     shadowRadius: 20,
//     elevation: 10,
//   },
//   iconCircle: {
//     width: 68,
//     height: 68,
//     borderRadius: 34,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   title: {
//     color: colors.text || '#F8FAFC',
//     fontSize: 20,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   message: {
//     color: colors.muted || '#94A3B8',
//     fontSize: 15,
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 24,
//   },
//   button: {
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   singleButton: {
//     width: '100%',
//     backgroundColor: colors.primary || '#6366F1',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     gap: 12,
//     width: '100%',
//   },
//   cancelButton: {
//     flex: 1,
//     backgroundColor: 'transparent',
//     borderWidth: 1,
//     borderColor: colors.border || '#334155',
//   },
//   cancelButtonText: {
//     color: colors.muted || '#94A3B8',
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   confirmButton: {
//     flex: 1,
//     backgroundColor: colors.expense || '#F87171',
//   },
//   confirmButtonText: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontWeight: '700',
//   },
// });






import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { lightColors } from '../constants/theme';

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'error',
  onClose,
  showCancel = false,
  onCancel,
  onConfirm,
  confirmText = 'Okay, Got it',
  cancelText = 'Cancel',
}) {
  const auth = useAuth();
  const colors = auth?.colors || lightColors;
  const isDark = auth?.theme === 'dark';
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const getConfig = () => {
    switch (type) {
      case 'warning':
        return {
          icon: 'alert-circle-outline',
          color: isDark ? colors.warn || '#FBBF24' : '#D97706',
          bg: isDark ? 'rgba(251, 191, 36, 0.15)' : '#FEF3C7',
        };
      case 'success':
        return {
          icon: 'check-circle-outline',
          color: isDark ? colors.income || '#34D399' : '#059669',
          bg: isDark ? 'rgba(52, 211, 153, 0.15)' : '#D1FAE5',
        };
      default:
        return {
          icon: 'close-circle-outline',
          color: isDark ? colors.expense || '#F87171' : '#DC2626',
          bg: isDark ? 'rgba(248, 113, 113, 0.15)' : '#FEE2E2',
        };
    }
  };

  const config = getConfig();
  const handleConfirm = onConfirm || onClose;
  const handleCancel = onCancel || onClose;

  return (
    <Modal
      transparent
      visible={!!visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={showCancel ? handleCancel : onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.dialogBox, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
            <Icon name={config.icon} size={36} color={config.color} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {showCancel ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.button, styles.singleButton]}
              onPress={onClose}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 28,
    },
    dialogBox: {
      width: '100%',
      backgroundColor: colors.card || (isDark ? '#1E293B' : '#FFFFFF'),
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border || (isDark ? '#334155' : '#E2E8F0'),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.35 : 0.14,
      shadowRadius: 20,
      elevation: 10,
    },
    iconCircle: {
      width: 68,
      height: 68,
      borderRadius: 34,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      color: colors.text || (isDark ? '#F8FAFC' : '#0F172A'),
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 8,
    },
    message: {
      color: colors.muted || (isDark ? '#94A3B8' : '#475569'),
      fontSize: 15,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
    },
    button: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    singleButton: {
      width: '100%',
      backgroundColor: isDark ? '#10B981' : '#059669',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    cancelButton: {
      flex: 1,
      backgroundColor: isDark ? 'transparent' : '#F8FAFC',
      borderWidth: 1,
      borderColor: colors.border || (isDark ? '#334155' : '#CBD5E1'),
    },
    cancelButtonText: {
      color: colors.muted || (isDark ? '#94A3B8' : '#475569'),
      fontSize: 15,
      fontWeight: '600',
    },
    confirmButton: {
      flex: 1,
      backgroundColor: isDark ? '#10B981' : '#059669',
    },
    confirmButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    registerText: {
  color: isDark ? '#10B981' : '#059669',
  fontWeight: '700',
  fontSize: 15,
},
  });