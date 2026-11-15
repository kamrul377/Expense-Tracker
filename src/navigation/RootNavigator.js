// import React from 'react';
// import { ActivityIndicator, View } from 'react-native';
// import { NavigationContainer, DarkTheme } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { colors } from '../constants/theme';
// import { isStaff } from '../constants/roles';
// import { useAuth } from '../context/AuthContext';
// import { DataProvider } from '../context/DataContext';
// import MainTabs from './MainTabs';
// import LoginScreen from '../screens/auth/LoginScreen';
// import RegisterScreen from '../screens/auth/RegisterScreen';
// import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
// import BlockedScreen from '../screens/auth/BlockedScreen';
// import AddTransactionScreen from '../screens/AddTransactionScreen';
// import CategoriesScreen from '../screens/CategoriesScreen';
// import AdminScreen from '../screens/admin/AdminScreen';
// import LocationTrackerScreen from '../screens/LocationTrackerScreen';

// const Stack = createNativeStackNavigator();

// const theme = {
//   ...DarkTheme,
//   colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, text: colors.text, border: colors.border, primary: colors.primaryLight },
// };

// const headerOptions = {
//   headerStyle: { backgroundColor: colors.bg },
//   headerTintColor: colors.text,
//   headerShadowVisible: false,
//   contentStyle: { backgroundColor: colors.bg },
// };

// export default function RootNavigator() {
//   const { user, profile, profileError, role, loading } = useAuth();

//   if (loading) {
//     return (
//       <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
//         <ActivityIndicator size="large" color={colors.primaryLight} />
//       </View>
//     );
//   }

//   let content;
//   if (!user) {
//     content = (
//       <Stack.Navigator screenOptions={headerOptions}>
//         <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
//         <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
//         <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
//       </Stack.Navigator>
//     );
//   } else if (profileError || !profile || profile.disabled) {
//     content = <BlockedScreen />;
//   } else {
//     content = (
//       <DataProvider uid={user.uid} currency={profile.currency}>
//         <Stack.Navigator screenOptions={headerOptions}>
//           <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
//           <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Transaction', presentation: 'modal' }} />
//           <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Manage Categories' }} />
//           <Stack.Screen name="LocationTracker" component={LocationTrackerScreen} options={{ title: 'Location Tracker' }} />
//           {isStaff(role) && <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin Panel' }} />}
//         </Stack.Navigator>
//       </DataProvider>
//     );
//   }

//   return <NavigationContainer theme={theme}>{content}</NavigationContainer>;
// }





// import React from 'react';
// import { ActivityIndicator, View } from 'react-native';
// import { NavigationContainer, DarkTheme } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import * as Linking from 'expo-linking';
// import { colors } from '../constants/theme';
// import { isStaff } from '../constants/roles';
// import { useAuth } from '../context/AuthContext';
// import { DataProvider } from '../context/DataContext';
// import MainTabs from './MainTabs';
// import LoginScreen from '../screens/auth/LoginScreen';
// import RegisterScreen from '../screens/auth/RegisterScreen';
// import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
// import BlockedScreen from '../screens/auth/BlockedScreen';
// import AddTransactionScreen from '../screens/AddTransactionScreen';
// import CategoriesScreen from '../screens/CategoriesScreen';
// import AdminScreen from '../screens/admin/AdminScreen';
// import LocationTrackerScreen from '../screens/LocationTrackerScreen';
// import GroupsScreen from '../screens/GroupsScreen';
// import GroupDetailScreen from '../screens/GroupDetailScreen';
// import AddGroupExpenseScreen from '../screens/AddGroupExpenseScreen';

// const Stack = createNativeStackNavigator();

// const theme = {
//   ...DarkTheme,
//   colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, text: colors.text, border: colors.border, primary: colors.primaryLight },
// };

// const headerOptions = {
//   headerStyle: { backgroundColor: colors.bg },
//   headerTintColor: colors.text,
//   headerShadowVisible: false,
//   contentStyle: { backgroundColor: colors.bg },
// };

// // Invite link: <scheme>://join/CODE  (app.json e "scheme" thaka lagbe)
// const linking = {
//   prefixes: [Linking.createURL('/')],
//   config: { screens: { Groups: 'join/:joinCode' } },
// };

// export default function RootNavigator() {
//   const { user, profile, profileError, role, loading } = useAuth();

//   if (loading) {
//     return (
//       <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
//         <ActivityIndicator size="large" color={colors.primaryLight} />
//       </View>
//     );
//   }

//   let content;
//   if (!user) {
//     content = (
//       <Stack.Navigator screenOptions={headerOptions}>
//         <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
//         <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
//         <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
//       </Stack.Navigator>
//     );
//   } else if (profileError || !profile || profile.disabled) {
//     content = <BlockedScreen />;
//   } else {
//     content = (
//       <DataProvider uid={user.uid} currency={profile.currency}>
//         <Stack.Navigator screenOptions={headerOptions}>
//           <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
//           <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Transaction', presentation: 'modal' }} />
//           <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Manage Categories' }} />
//           <Stack.Screen name="LocationTracker" component={LocationTrackerScreen} options={{ title: 'Location Tracker' }} />
//           <Stack.Screen name="Groups" component={GroupsScreen} options={{ title: 'Group Expenses' }} />
//           <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: 'Group' }} />
//           <Stack.Screen name="AddGroupExpense" component={AddGroupExpenseScreen} options={{ title: 'Group Expense', presentation: 'modal' }} />
//           {isStaff(role) && <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin Panel' }} />}
//         </Stack.Navigator>
//       </DataProvider>
//     );
//   }

//   return <NavigationContainer theme={theme} linking={linking}>{content}</NavigationContainer>;
// }



// =======notifi=====



import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DarkTheme, createNavigationContainerRef } from '@react-navigation/native';
import useNotifications from '../hooks/useNotifications';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { colors } from '../constants/theme';
import { isStaff } from '../constants/roles';
import { useAuth } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import MainTabs from './MainTabs';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import BlockedScreen from '../screens/auth/BlockedScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import AdminScreen from '../screens/admin/AdminScreen';
import LocationTrackerScreen from '../screens/LocationTrackerScreen';
import GroupsScreen from '../screens/GroupsScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import AddGroupExpenseScreen from '../screens/AddGroupExpenseScreen';

const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef();

// Login kora thakle push token register + notification click handle kore
function NotificationBridge() {
  useNotifications(navigationRef);
  return null;
}

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, text: colors.text, border: colors.border, primary: colors.primaryLight },
};

const headerOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
};

// Invite link: <scheme>://join/CODE  (app.json e "scheme" thaka lagbe)
const linking = {
  prefixes: [Linking.createURL('/')],
  config: { screens: { Groups: 'join/:joinCode' } },
};

export default function RootNavigator() {
  const { user, profile, profileError, role, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primaryLight} />
      </View>
    );
  }

  let content;
  if (!user) {
    content = (
      <Stack.Navigator screenOptions={headerOptions}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
      </Stack.Navigator>
    );
  } else if (profileError || !profile || profile.disabled) {
    content = <BlockedScreen />;
  } else {
    content = (
      <DataProvider uid={user.uid} currency={profile.currency}>
        <NotificationBridge />
        <Stack.Navigator screenOptions={headerOptions}>
          <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Transaction', presentation: 'modal' }} />
          <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Manage Categories' }} />
          <Stack.Screen name="LocationTracker" component={LocationTrackerScreen} options={{ title: 'Location Tracker' }} />
          <Stack.Screen name="Groups" component={GroupsScreen} options={{ title: 'Group Expenses' }} />
          <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: 'Group' }} />
          <Stack.Screen name="AddGroupExpense" component={AddGroupExpenseScreen} options={{ title: 'Group Expense', presentation: 'modal' }} />
          {isStaff(role) && <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin Panel' }} />}
        </Stack.Navigator>
      </DataProvider>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} theme={theme} linking={linking}>
      {content}
    </NavigationContainer>
  );
}