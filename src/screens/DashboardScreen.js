

// import React, { useMemo, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, ImageBackground, Animated } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import Screen from '../components/Screen';
// import TransactionItem from '../components/TransactionItem';
// import { Card, EmptyState, Fab, ProgressBar, SectionHeader } from '../components/ui';
// import { useAuth } from '../context/AuthContext';
// import { useData } from '../context/DataContext';
// import { formatMoney, monthLabel, sameMonth } from '../utils/format';
// import { expenseByCategory, totals } from '../utils/stats';

// export default function DashboardScreen({ navigation }) {
//   const { profile, colors } = useAuth(); // Dynamic colors hook theke niya holo
//   const { transactions, budgets, symbol, getCategory } = useData();

//   // Simple entrance animation values
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(20)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 400,
//         useNativeDriver: true,
//       }),
//       Animated.spring(slideAnim, {
//         toValue: 0,
//         friction: 8,
//         tension: 50,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   // Time-based greeting, weather condition & background image URLs
//   const { greeting, currentDate, weatherConfig } = useMemo(() => {
//     const now = new Date();
//     const hours = now.getHours();

//     let greet = 'Hello';
//     let weather = {
//       condition: 'Clear Sky',
//       icon: 'weather-sunny',
//       bgImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
//     };

//     if (hours >= 5 && hours < 12) {
//       greet = 'Good Morning';
//       weather = { condition: 'Morning Fresh', icon: 'weather-sunny', bgImage: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd' };
//     } else if (hours >= 12 && hours < 15) {
//       greet = 'Good Noon';
//       weather = { condition: 'Sunny Day', icon: 'white-balance-sunny', bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' };
//     } else if (hours >= 15 && hours < 18) {
//       greet = 'Good Afternoon';
//       weather = { condition: 'Pleasant Sky', icon: 'weather-partly-cloudy', bgImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401' };
//     } else if (hours >= 18 && hours < 22) {
//       greet = 'Good Evening';
//       weather = { condition: 'Sunset Glow', icon: 'weather-sunset', bgImage: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869' };
//     } else {
//       greet = 'Good Night';
//       weather = { condition: 'Night Starry', icon: 'weather-night', bgImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba' };
//     }

//     const options = { weekday: 'short', day: 'numeric', month: 'short' };
//     const dateStr = now.toLocaleDateString('en-US', options);

//     return { greeting: greet, currentDate: dateStr, weatherConfig: weather };
//   }, []);

//   const { all, month, top } = useMemo(() => {
//     const now = new Date();
//     const thisMonth = transactions.filter((t) => sameMonth(t.date, now));
//     return {
//       all: totals(transactions),
//       month: totals(thisMonth),
//       top: expenseByCategory(thisMonth).slice(0, 3),
//     };
//   }, [transactions]);

//   const balance = all.income - all.expense;
//   const overall = budgets.overall;
//   const ratio = overall ? month.expense / overall : 0;

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.bg }}>
//       <Screen>
//         <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

//           {/* Minimalist Weather & Greeting Banner */}
//           <ImageBackground
//             source={{ uri: weatherConfig.bgImage }}
//             style={styles.weatherBanner}
//             imageStyle={styles.bannerImageStyle}
//           >
//             <View style={styles.overlay}>
//               <View style={styles.bannerLeft}>
//                 <Text style={styles.greeting}>{greeting}</Text>
//                 <Text style={styles.name}>{profile?.name?.split(' ')[0] || 'there'}</Text>
//               </View>

//               <View style={styles.weatherRight}>
//                 <View style={styles.dateBadge}>
//                   <Icon name={weatherConfig.icon} size={13} color="#FBBF24" />
//                   <Text style={styles.dateText}>{currentDate}</Text>
//                 </View>
//               </View>
//             </View>
//           </ImageBackground>

//           {/* Minimal Total Balance Card */}
//           <Card style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
//             <View style={styles.balanceHeader}>
//               <Text style={[styles.balanceLabel, { color: colors.muted }]}>Total Balance</Text>
//               <View style={styles.walletIconBg}>
//                 <Icon name="wallet-outline" size={16} color={colors.primaryLight} />
//               </View>
//             </View>
//             <Text style={[styles.balance, { color: colors.text }, balance < 0 && { color: colors.expense }]}>
//               {formatMoney(balance, symbol)}
//             </Text>
//           </Card>

//           {/* Monthly Income / Expense Split */}
//           <Text style={[styles.monthLabel, { color: colors.muted }]}>{monthLabel(new Date())}</Text>
//           <View style={styles.row}>
//             <Card style={styles.half}>
//               <View style={styles.statIconRow}>
//                 <View style={[styles.miniIconBg, { backgroundColor: colors.incomeBg }]}>
//                   <Icon name="arrow-down" size={16} color={colors.income} />
//                 </View>
//                 <Text style={[styles.smallLabel, { color: colors.muted }]}>Income</Text>
//               </View>
//               <Text style={[styles.smallValue, { color: colors.income }]}>{formatMoney(month.income, symbol)}</Text>
//             </Card>

//             <Card style={styles.half}>
//               <View style={styles.statIconRow}>
//                 <View style={[styles.miniIconBg, { backgroundColor: colors.expenseBg }]}>
//                   <Icon name="arrow-up" size={16} color={colors.expense} />
//                 </View>
//                 <Text style={[styles.smallLabel, { color: colors.muted }]}>Expense</Text>
//               </View>
//               <Text style={[styles.smallValue, { color: colors.expense }]}>{formatMoney(month.expense, symbol)}</Text>
//             </Card>
//           </View>

//           {/* Budget Overview Card */}
//           {overall ? (
//             <Card style={styles.sectionCard}>
//               <View style={styles.between}>
//                 <Text style={[styles.cardTitle, { color: colors.text }]}>Monthly Budget</Text>
//                 <Text style={{ color: ratio > 1 ? colors.expense : colors.muted, fontSize: 13, fontWeight: '600' }}>
//                   {formatMoney(month.expense, symbol)} / {formatMoney(overall, symbol)}
//                 </Text>
//               </View>
//               <View style={{ marginVertical: 10 }}>
//                 <ProgressBar value={ratio} color={ratio > 1 ? colors.expense : ratio > 0.8 ? colors.warn : colors.income} />
//               </View>
//               {ratio > 1 ? (
//                 <Text style={{ color: colors.expense, fontSize: 12, fontWeight: '500' }}>⚠ You are over budget this month!</Text>
//               ) : ratio > 0.8 ? (
//                 <Text style={{ color: colors.warn, fontSize: 12, fontWeight: '500' }}>⚠ You have used {(ratio * 100).toFixed(0)}% of your budget.</Text>
//               ) : (
//                 <Text style={{ color: colors.dim, fontSize: 12 }}>{formatMoney(overall - month.expense, symbol)} left this month</Text>
//               )}
//             </Card>
//           ) : null}

//           {/* Top Spending Categories */}
//           {top.length > 0 && (
//             <>
//               <SectionHeader title="Top spending" />
//               <Card style={styles.sectionCard}>
//                 {top.map((c, i) => {
//                   const cat = getCategory(c.id, c.name);
//                   return (
//                     <View key={c.id} style={{ marginBottom: i === top.length - 1 ? 0 : 14 }}>
//                       <View style={styles.between}>
//                         <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>{cat.name}</Text>
//                         <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600' }}>{formatMoney(c.total, symbol)}</Text>
//                       </View>
//                       <View style={{ marginTop: 6 }}>
//                         <ProgressBar value={c.total / month.expense} color={cat.color} />
//                       </View>
//                     </View>
//                   );
//                 })}
//               </Card>
//             </>
//           )}

//           {/* Recent Transactions List */}
//           <SectionHeader title="Recent transactions" right="See all" onRightPress={() => navigation.navigate('Transactions')} />
//           {transactions.length === 0 ? (
//             <EmptyState icon="wallet-outline" title="No transactions yet" subtitle="Tap + to add your first income or expense." />
//           ) : (
//             transactions.slice(0, 5).map((t) => (
//               <TransactionItem
//                 key={t.id}
//                 item={t}
//                 symbol={symbol}
//                 category={getCategory(t.categoryId, t.categoryName)}
//                 onPress={() => navigation.navigate('AddTransaction', { transaction: t })}
//               />
//             ))
//           )}

//         </Animated.View>
//       </Screen>
//       <Fab onPress={() => navigation.navigate('AddTransaction')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   weatherBanner: {
//     height: 110,
//     borderRadius: 18,
//     marginBottom: 16,
//     overflow: 'hidden',
//     justifyContent: 'center',
//   },
//   bannerImageStyle: {
//     borderRadius: 18,
//   },
//   overlay: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     backgroundColor: 'rgba(15, 23, 42, 0.55)',
//   },
//   bannerLeft: {
//     flex: 1,
//   },
//   weatherRight: {
//     alignItems: 'flex-end',
//   },
//   greeting: {
//     color: '#94A3B8',
//     fontSize: 13,
//     fontWeight: '600',
//     letterSpacing: 0.3,
//   },
//   name: {
//     color: '#FFFFFF',
//     fontSize: 22,
//     fontWeight: '800',
//     marginTop: 2,
//     letterSpacing: -0.3,
//   },
//   dateBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.15)',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//     gap: 6,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   dateText: {
//     color: '#F8FAFC',
//     fontSize: 11,
//     fontWeight: '700',
//   },
//   balanceCard: {
//     borderRadius: 18,
//     borderWidth: 1,
//     paddingVertical: 18,
//     paddingHorizontal: 20,
//   },
//   balanceHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   balanceLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//     textTransform: 'uppercase',
//     letterSpacing: 0.8
//   },
//   walletIconBg: {
//     width: 30,
//     height: 30,
//     borderRadius: 10,
//     backgroundColor: 'rgba(99, 102, 241, 0.12)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   balance: {
//     fontSize: 30,
//     fontWeight: '800',
//     marginTop: 6,
//     letterSpacing: -0.5,
//   },
//   monthLabel: {
//     fontSize: 13,
//     marginBottom: 8,
//     fontWeight: '600',
//     marginTop: 6,
//   },
//   row: { flexDirection: 'row', gap: 12 },
//   half: { flex: 1 },
//   statIconRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   miniIconBg: {
//     width: 28,
//     height: 28,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   smallLabel: { fontSize: 13, fontWeight: '600' },
//   smallValue: { fontSize: 18, fontWeight: '800', marginTop: 8 },
//   between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   cardTitle: { fontWeight: '700', fontSize: 15 },
//   sectionCard: {
//     borderRadius: 18,
//   },
// });



// ===========2nd=========





import React, { useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ImageBackground,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import Screen from '../components/Screen';
import TransactionItem from '../components/TransactionItem';
import {
  Card,
  EmptyState,
  Fab,
  ProgressBar,
  SectionHeader,
} from '../components/ui';


import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  formatMoney,
  monthLabel,
  sameMonth,
} from '../utils/format';
import {
  expenseByCategory,
  totals,
} from '../utils/stats';

export default function DashboardScreen({ navigation }) {
  const { profile, colors } = useAuth();
  const { transactions, budgets, symbol, getCategory } = useData();

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Greeting and date
  const { greeting, currentDate, greetingIcon } = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();

    let greet = 'Hello';
    let icon = 'weather-sunny';

    if (hours >= 5 && hours < 12) {
      greet = 'Good Morning';
      icon = 'weather-sunny';
    } else if (hours >= 12 && hours < 15) {
      greet = 'Good Noon';
      icon = 'white-balance-sunny';
    } else if (hours >= 15 && hours < 18) {
      greet = 'Good Afternoon';
      icon = 'weather-partly-cloudy';
    } else if (hours >= 18 && hours < 22) {
      greet = 'Good Evening';
      icon = 'weather-sunset';
    } else {
      greet = 'Good Night';
      icon = 'weather-night';
    }

    const options = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    };

    return {
      greeting: greet,
      currentDate: now.toLocaleDateString('en-US', options),
      greetingIcon: icon,
    };
  }, []);

  // Existing transaction calculations
  const { all, month, top } = useMemo(() => {
    const now = new Date();

    const thisMonth = transactions.filter((t) =>
      sameMonth(t.date, now)
    );

    return {
      all: totals(transactions),
      month: totals(thisMonth),
      top: expenseByCategory(thisMonth).slice(0, 3),
    };
  }, [transactions]);

  const balance = all.income - all.expense;
  const overall = budgets.overall;
  const ratio = overall ? month.expense / overall : 0;

  const firstName = profile?.name?.split(' ')[0] || 'there';

  const primaryColor = colors.primary || '#635BEB';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bg },
      ]}
    >
      <Screen>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >

          {/* =================================
              1. PREMIUM GREETING HEADER
          ================================= */}
          {/* 
          <View style={styles.header}>
            <View style={styles.headerDecoration} />
            <View style={styles.headerDecorationSmall} />

            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.greeting}>
                  {greeting}
                </Text>

                <Text
                  style={styles.userName}
                  numberOfLines={1}
                >
                  {firstName}
                </Text>

                <View style={styles.dateContainer}>
                  <Icon
                    name="calendar-blank-outline"
                    size={13}
                    color="#CBD5E1"
                  />

                  <Text style={styles.dateText}>
                    {currentDate}
                  </Text>
                </View>
              </View>

              <View style={styles.headerIcon}>
                <Icon
                  name={greetingIcon}
                  size={30}
                  color="#FBBF24"
                />
              </View>
            </View>

            <View style={styles.headerBottomLine} />
          </View> */}
          <ImageBackground
            source={{
              uri:
                greeting === 'Good Morning'
                  ? 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80'
                  : greeting === 'Good Noon'
                    ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80'
                    : greeting === 'Good Afternoon'
                      ? 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?auto=format&fit=crop&w=900&q=80'
                      : greeting === 'Good Evening'
                        ? 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=900&q=80'
                        : 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?auto=format&fit=crop&w=900&q=80',
            }}
            style={styles.header}
            imageStyle={{ borderRadius: 22 }}
          >
            {/* লেখাগুলো স্পষ্ট দেখানোর জন্য হালকা ডার্ক ওভারলে */}
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: 'rgba(15, 23, 42, 0.42)',
                borderRadius: 22,
              }}
            />

            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.greeting}>
                  {greeting}
                </Text>

                <Text
                  style={styles.userName}
                  numberOfLines={1}
                >
                  {firstName}
                </Text>

                <View style={styles.dateContainer}>
                  <Icon
                    name="calendar-blank-outline"
                    size={13}
                    color="#E2E8F0"
                  />

                  <Text style={styles.dateText}>
                    {currentDate}
                  </Text>
                </View>
              </View>

              <View style={styles.headerIcon}>
                <Icon
                  name={greetingIcon}
                  size={30}
                  color="#FBBF24"
                />
              </View>
            </View>
          </ImageBackground>

          {/* =================================
              2. TOTAL BALANCE CARD
          ================================= */}

          <View
            style={[
              styles.balanceCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.balanceTop}>
              <View style={styles.balanceTitleRow}>
                <View
                  style={[
                    styles.balanceIcon,
                    {
                      backgroundColor:
                        colors.primaryLight
                          ? `${colors.primaryLight}18`
                          : '#635BEB18',
                    },
                  ]}
                >
                  <Icon
                    name="wallet-outline"
                    size={20}
                    color={primaryColor}
                  />
                </View>

                <Text
                  style={[
                    styles.balanceLabel,
                    { color: colors.muted },
                  ]}
                >
                  Total Balance
                </Text>
              </View>

              <View style={styles.balanceStatus}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        balance >= 0
                          ? colors.income
                          : colors.expense,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    { color: colors.muted },
                  ]}
                >
                  {balance >= 0 ? 'Positive' : 'Negative'}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.balanceAmount,
                {
                  color:
                    balance < 0
                      ? colors.expense
                      : colors.text,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatMoney(balance, symbol)}
            </Text>

            <View style={styles.balanceDivider} />

            <View style={styles.balanceFooter}>
              <View style={styles.balanceFooterItem}>
                <Icon
                  name="trending-up"
                  size={16}
                  color={colors.income}
                />
                <Text
                  style={[
                    styles.balanceFooterLabel,
                    { color: colors.muted },
                  ]}
                >
                  Total Income
                </Text>
              </View>

              <Text
                style={[
                  styles.balanceFooterValue,
                  { color: colors.income },
                ]}
                numberOfLines={1}
              >
                {formatMoney(all.income, symbol)}
              </Text>
            </View>

            <View style={styles.balanceFooter}>
              <View style={styles.balanceFooterItem}>
                <Icon
                  name="trending-down"
                  size={16}
                  color={colors.expense}
                />
                <Text
                  style={[
                    styles.balanceFooterLabel,
                    { color: colors.muted },
                  ]}
                >
                  Total Expense
                </Text>
              </View>

              <Text
                style={[
                  styles.balanceFooterValue,
                  { color: colors.expense },
                ]}
                numberOfLines={1}
              >
                {formatMoney(all.expense, symbol)}
              </Text>
            </View>
          </View>

          {/* =================================
              3. MONTHLY INCOME / EXPENSE
          ================================= */}

          <View style={styles.sectionHeading}>
            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text },
                ]}
              >
                Monthly Overview
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: colors.muted },
                ]}
              >
                {monthLabel(new Date())}
              </Text>
            </View>

            <View
              style={[
                styles.monthBadge,
                { backgroundColor: colors.card },
              ]}
            >
              <Icon
                name="calendar-month-outline"
                size={15}
                color={primaryColor}
              />

              <Text
                style={[
                  styles.monthBadgeText,
                  { color: colors.muted },
                ]}
              >
                This Month
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>

            {/* Income Card */}
            <Card
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.statTop}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: colors.incomeBg },
                  ]}
                >
                  <Icon
                    name="arrow-down-left"
                    size={19}
                    color={colors.income}
                  />
                </View>

                <Icon
                  name="trending-up"
                  size={17}
                  color={colors.income}
                />
              </View>

              <Text
                style={[
                  styles.statLabel,
                  { color: colors.muted },
                ]}
              >
                Income
              </Text>

              <Text
                style={[
                  styles.statAmount,
                  { color: colors.income },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatMoney(month.income, symbol)}
              </Text>
            </Card>

            {/* Expense Card */}
            <Card
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.statTop}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: colors.expenseBg },
                  ]}
                >
                  <Icon
                    name="arrow-up-right"
                    size={19}
                    color={colors.expense}
                  />
                </View>

                <Icon
                  name="trending-down"
                  size={17}
                  color={colors.expense}
                />
              </View>

              <Text
                style={[
                  styles.statLabel,
                  { color: colors.muted },
                ]}
              >
                Expense
              </Text>

              <Text
                style={[
                  styles.statAmount,
                  { color: colors.expense },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatMoney(month.expense, symbol)}
              </Text>
            </Card>

          </View>

          {/* =================================
              4. MONTHLY BUDGET
          ================================= */}

          {overall ? (
            <>
              <View style={styles.sectionHeading}>
                <View>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: colors.text },
                    ]}
                  >
                    Budget Overview
                  </Text>

                  <Text
                    style={[
                      styles.sectionSubtitle,
                      { color: colors.muted },
                    ]}
                  >
                    Track your monthly spending
                  </Text>
                </View>

                <View
                  style={[
                    styles.budgetIcon,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <Icon
                    name="chart-donut"
                    size={20}
                    color={primaryColor}
                  />
                </View>
              </View>

              <Card
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.budgetTop}>
                  <View>
                    <Text
                      style={[
                        styles.budgetLabel,
                        { color: colors.muted },
                      ]}
                    >
                      Monthly Budget
                    </Text>

                    <Text
                      style={[
                        styles.budgetAmount,
                        { color: colors.text },
                      ]}
                    >
                      {formatMoney(overall, symbol)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.budgetPercentage,
                      {
                        backgroundColor:
                          ratio > 1
                            ? colors.expenseBg
                            : colors.incomeBg,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          ratio > 1
                            ? colors.expense
                            : colors.income,
                        fontSize: 13,
                        fontWeight: '800',
                      }}
                    >
                      {(ratio * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.budgetProgress}>
                  <ProgressBar
                    value={ratio}
                    color={
                      ratio > 1
                        ? colors.expense
                        : ratio > 0.8
                          ? colors.warn
                          : colors.income
                    }
                  />
                </View>

                <View style={styles.budgetDetails}>
                  <View>
                    <Text
                      style={[
                        styles.budgetSmallLabel,
                        { color: colors.muted },
                      ]}
                    >
                      Spent
                    </Text>

                    <Text
                      style={[
                        styles.budgetSmallValue,
                        { color: colors.text },
                      ]}
                    >
                      {formatMoney(month.expense, symbol)}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={[
                        styles.budgetSmallLabel,
                        { color: colors.muted },
                      ]}
                    >
                      {ratio > 1 ? 'Over Budget' : 'Remaining'}
                    </Text>

                    <Text
                      style={[
                        styles.budgetSmallValue,
                        {
                          color:
                            ratio > 1
                              ? colors.expense
                              : colors.income,
                        },
                      ]}
                    >
                      {formatMoney(
                        Math.abs(overall - month.expense),
                        symbol
                      )}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.budgetMessage,
                    {
                      backgroundColor:
                        ratio > 1
                          ? colors.expenseBg
                          : ratio > 0.8
                            ? colors.expenseBg
                            : colors.incomeBg,
                    },
                  ]}
                >
                  <Icon
                    name={
                      ratio > 1
                        ? 'alert-circle-outline'
                        : ratio > 0.8
                          ? 'alert-outline'
                          : 'check-circle-outline'
                    }
                    size={16}
                    color={
                      ratio > 1
                        ? colors.expense
                        : ratio > 0.8
                          ? colors.warn
                          : colors.income
                    }
                  />

                  <Text
                    style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: '600',
                      color:
                        ratio > 1
                          ? colors.expense
                          : ratio > 0.8
                            ? colors.warn
                            : colors.income,
                    }}
                  >
                    {ratio > 1
                      ? 'You are over budget this month!'
                      : ratio > 0.8
                        ? `You have used ${(ratio * 100).toFixed(0)}% of your budget.`
                        : `${formatMoney(overall - month.expense, symbol)} left this month`}
                  </Text>
                </View>
              </Card>
            </>
          ) : null}

          {/* =================================
              5. TOP SPENDING CATEGORIES
          ================================= */}

          {top.length > 0 && (
            <>
              <View style={styles.sectionHeading}>
                <View>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: colors.text },
                    ]}
                  >
                    Top Spending
                  </Text>

                  <Text
                    style={[
                      styles.sectionSubtitle,
                      { color: colors.muted },
                    ]}
                  >
                    Your highest spending categories
                  </Text>
                </View>

                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <Icon
                    name="chart-bar"
                    size={20}
                    color={primaryColor}
                  />
                </View>
              </View>

              <Card
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                {top.map((c, i) => {
                  const cat = getCategory(c.id, c.name);

                  return (
                    <View
                      key={c.id}
                      style={[
                        styles.categoryItem,
                        {
                          marginBottom:
                            i === top.length - 1 ? 0 : 20,
                        },
                      ]}
                    >
                      <View style={styles.categoryTop}>
                        <View style={styles.categoryNameRow}>
                          <View
                            style={[
                              styles.categoryColorDot,
                              {
                                backgroundColor: cat.color,
                              },
                            ]}
                          />

                          <Text
                            style={[
                              styles.categoryName,
                              { color: colors.text },
                            ]}
                            numberOfLines={1}
                          >
                            {cat.name}
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.categoryAmount,
                            { color: colors.text },
                          ]}
                        >
                          {formatMoney(c.total, symbol)}
                        </Text>
                      </View>

                      <View style={styles.categoryProgress}>
                        <ProgressBar
                          value={
                            month.expense > 0
                              ? c.total / month.expense
                              : 0
                          }
                          color={cat.color}
                        />
                      </View>
                    </View>
                  );
                })}
              </Card>
            </>
          )}

          {/* =================================
              6. RECENT TRANSACTIONS
          ================================= */}

          <View style={styles.sectionHeading}>
            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text },
                ]}
              >
                Recent Transactions
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: colors.muted },
                ]}
              >
                Your latest financial activities
              </Text>
            </View>

            <View
              style={[
                styles.transactionIcon,
                { backgroundColor: colors.card },
              ]}
            >
              <Icon
                name="receipt-text-outline"
                size={19}
                color={primaryColor}
              />
            </View>
          </View>

          {transactions.length === 0 ? (
            <EmptyState
              icon="wallet-outline"
              title="No transactions yet"
              subtitle="Tap + to add your first income or expense."
            />
          ) : (
            <View style={styles.transactionsContainer}>
              {transactions.slice(0, 5).map((t) => (
                <TransactionItem
                  key={t.id}
                  item={t}
                  symbol={symbol}
                  category={getCategory(
                    t.categoryId,
                    t.categoryName
                  )}
                  onPress={() =>
                    navigation.navigate('AddTransaction', {
                      transaction: t,
                    })
                  }
                />
              ))}
            </View>
          )}

          {/* See All Transactions */}
          {transactions.length > 0 && (
            <View style={styles.seeAllContainer}>
              <Text
                style={[
                  styles.seeAllText,
                  { color: primaryColor },
                ]}
                onPress={() =>
                  navigation.navigate('Transactions')
                }
              >
                View All Transactions
              </Text>

              <Icon
                name="arrow-right"
                size={17}
                color={primaryColor}
              />
            </View>
          )}

        </Animated.View>
      </Screen>

      {/* Existing Add Transaction Button */}
      <Fab
        onPress={() =>
          navigation.navigate('AddTransaction')
        }
      />
    </View>
  );
}

// ==========================================
// PREMIUM DASHBOARD STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    height: 155,
    backgroundColor: '#202B55',
    borderRadius: 22,
    marginBottom: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
  },

  headerDecoration: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(99, 91, 235, 0.24)',
    right: -65,
    top: -90,
  },

  headerDecorationSmall: {
    position: 'absolute',
    width: 115,
    height: 115,
    borderRadius: 58,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    right: 35,
    bottom: -75,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 2,
  },

  headerLeft: {
    flex: 1,
  },

  greeting: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B9C5E5',
    letterSpacing: 0.4,
  },

  userName: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: -0.6,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
  },

  dateText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },

  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  headerBottomLine: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  // Balance Card
  balanceCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 22,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  balanceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  balanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  balanceIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  balanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 15,
    marginBottom: 18,
  },

  balanceDivider: {
    height: 1,
    backgroundColor: '#8791A315',
    marginBottom: 15,
  },

  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  balanceFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  balanceFooterLabel: {
    fontSize: 12,
    fontWeight: '500',
  },

  balanceFooterValue: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Section Headings
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },

  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },

  monthBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Income / Expense
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },

  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  statIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  statAmount: {
    fontSize: 19,
    fontWeight: '800',
    marginTop: 7,
  },

  // Budget
  budgetIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionCard: {
    borderRadius: 19,
    borderWidth: 1,
    padding: 17,
    marginBottom: 23,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 7,
  },

  budgetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  budgetLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  budgetAmount: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 5,
  },

  budgetPercentage: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 11,
  },

  budgetProgress: {
    marginTop: 19,
    marginBottom: 17,
  },

  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  budgetSmallLabel: {
    fontSize: 11,
    fontWeight: '500',
  },

  budgetSmallValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 5,
  },

  budgetMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 11,
    paddingVertical: 11,
    borderRadius: 11,
    marginTop: 17,
  },

  // Categories
  categoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  categoryItem: {
    width: '100%',
  },

  categoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  categoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 9,
  },

  categoryColorDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },

  categoryAmount: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },

  categoryProgress: {
    marginTop: 10,
  },

  // Recent Transactions
  transactionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  transactionsContainer: {
    marginTop: 2,
  },

  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 15,
    marginBottom: 15,
  },

  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
});




// ================3rd==========



