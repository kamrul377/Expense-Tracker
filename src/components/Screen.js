// import React from 'react';
// import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
// import { colors } from '../constants/theme';

// export default function Screen({ children, contentStyle, scroll = true }) {
//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: colors.bg }}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//     >
//       {scroll ? (
//         <ScrollView
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={[{ padding: 20, paddingBottom: 100 }, contentStyle]}
//         >
//           {children}
//         </ScrollView>
//       ) : (
//         children
//       )}
//     </KeyboardAvoidingView>
//   );
// }


import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext'; // useAuth import kora holo

export default function Screen({ children, contentStyle, scroll = true }) {
  const { colors } = useAuth(); // Dynamic colors context theke niya holo

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ padding: 20, paddingBottom: 100 }, contentStyle]}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </KeyboardAvoidingView>
  );
}
