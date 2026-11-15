


// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import { useAuth } from '../context/AuthContext';
// import DashboardScreen from '../screens/DashboardScreen';
// import TransactionsScreen from '../screens/TransactionsScreen';
// import BudgetsScreen from '../screens/BudgetsScreen';
// import ReportsScreen from '../screens/ReportsScreen';
// import ProfileScreen from '../screens/ProfileScreen';

// const Tab = createBottomTabNavigator();

// const icons = {
//   Home: 'view-dashboard',
//   Transactions: 'swap-vertical',
//   Budgets: 'target',
//   Reports: 'chart-bar',
//   Profile: 'account',
// };

// export default function MainTabs() {
//   const { colors } = useAuth(); // Dynamic colors useAuth থেকে নেওয়া হলো

//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         headerStyle: { backgroundColor: colors.bg },
//         headerTintColor: colors.text,
//         headerTitleStyle: { fontWeight: '700' },
//         headerShadowVisible: false,
//         tabBarStyle: {
//           backgroundColor: colors.card,
//           borderTopColor: colors.border,
//         },
//         tabBarActiveTintColor: colors.primaryLight || colors.primary,
//         tabBarInactiveTintColor: colors.dim,
//         tabBarIcon: ({ color, size }) => <Icon name={icons[route.name]} size={size} color={color} />,
//       })}
//     >
//       <Tab.Screen name="Home" component={DashboardScreen} options={{ title: 'Dashboard' }} />
//       <Tab.Screen name="Transactions" component={TransactionsScreen} />
//       <Tab.Screen name="Budgets" component={BudgetsScreen} />
//       <Tab.Screen name="Reports" component={ReportsScreen} />
//       <Tab.Screen name="Profile" component={ProfileScreen} />
//     </Tab.Navigator>
//   );
// }




import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Top-tabs navigator rendered at the BOTTOM: tap a tab OR swipe left/right to change screen
const Tab = createMaterialTopTabNavigator();

const icons = {
  Home: 'view-dashboard',
  Transactions: 'swap-vertical',
  Budgets: 'target',
  Reports: 'chart-bar',
  Profile: 'account',
};

const titles = {
  Home: 'Dashboard',
  Transactions: 'Transactions',
  Budgets: 'Budgets',
  Reports: 'Reports',
  Profile: 'Profile',
};

const screens = [
  { name: 'Home', component: DashboardScreen },
  { name: 'Transactions', component: TransactionsScreen },
  { name: 'Budgets', component: BudgetsScreen },
  { name: 'Reports', component: ReportsScreen },
  { name: 'Profile', component: ProfileScreen },
];

export default function MainTabs() {
  const { colors } = useAuth();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState('Home');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header (top-tabs has no built-in header, so we draw it ourselves) */}
      <View
        style={{
          paddingTop: insets.top,
          height: insets.top + 56,
          justifyContent: 'center',
          paddingHorizontal: 16,
          backgroundColor: colors.bg,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{titles[active]}</Text>
      </View>

      <Tab.Navigator
        initialRouteName="Home"
        tabBarPosition="bottom"
        // update the header title whenever a tab becomes active (tap OR swipe)
        screenListeners={({ route }) => ({
          focus: () => setActive(route.name),
        })}
        screenOptions={{
          swipeEnabled: true, // <-- swipe left / right to switch tabs
          lazy: true,
          lazyPreloadDistance: 0,
          sceneStyle: { backgroundColor: colors.bg },
          tabBarShowIcon: true,
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.primaryLight || colors.primary,
          tabBarInactiveTintColor: colors.dim,
          tabBarPressColor: 'transparent',
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarItemStyle: { paddingHorizontal: 0, paddingVertical: 6 },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', textTransform: 'none', margin: 0, marginTop: 2 },
          // thin indicator line on the top edge of the active tab
          tabBarIndicatorStyle: {
            top: 0,
            bottom: undefined,
            height: 3,
            borderRadius: 2,
            backgroundColor: colors.primaryLight || colors.primary,
          },
        }}
      >
        {screens.map(({ name, component }) => (
          <Tab.Screen
            key={name}
            name={name}
            component={component}
            options={{
              title: titles[name],
              tabBarIcon: ({ color }) => <Icon name={icons[name]} size={22} color={color} />,
            }}
          />
        ))}
      </Tab.Navigator>
    </View>
  );
}