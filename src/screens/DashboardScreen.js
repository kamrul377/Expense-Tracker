

// import React, { useMemo, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, ImageBackground, Animated } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import Screen from '../components/Screen';
// import TransactionItem from '../components/TransactionItem';
// import { Card, EmptyState, Fab, ProgressBar, SectionHeader } from '../components/ui';
// import { useAuth } from '../context/AuthContext';
// import { useData } from '../context/DataContext';
// import { colors } from '../constants/theme';
// import { formatMoney, monthLabel, sameMonth } from '../utils/format';
// import { expenseByCategory, totals } from '../utils/stats';

// export default function DashboardScreen({ navigation }) {
//   const { profile } = useAuth();
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
//       greet = 'Good morning';
//       weather = { condition: 'Morning Fresh', icon: 'weather-sunny', bgImage: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd' };
//     } else if (hours >= 12 && hours < 15) {
//       greet = 'Good noon';
//       weather = { condition: 'Sunny Day', icon: 'white-balance-sunny', bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' };
//     } else if (hours >= 15 && hours < 18) {
//       greet = 'Good afternoon';
//       weather = { condition: 'Pleasant Sky', icon: 'weather-partly-cloudy', bgImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401' };
//     } else if (hours >= 18 && hours < 22) {
//       greet = 'Good evening';
//       weather = { condition: 'Sunset Glow', icon: 'weather-sunset', bgImage: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869' };
//     } else {
//       greet = 'Good night';
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
//           <Card style={styles.balanceCard}>
//             <View style={styles.balanceHeader}>
//               <Text style={styles.balanceLabel}>Total Balance</Text>
//               <View style={styles.walletIconBg}>
//                 <Icon name="wallet-outline" size={16} color={colors.primaryLight} />
//               </View>
//             </View>
//             <Text style={[styles.balance, balance < 0 && { color: colors.expense }]}>
//               {formatMoney(balance, symbol)}
//             </Text>
//           </Card>

//           {/* Monthly Income / Expense Split */}
//           <Text style={styles.monthLabel}>{monthLabel(new Date())}</Text>
//           <View style={styles.row}>
//             <Card style={styles.half}>
//               <View style={styles.statIconRow}>
//                 <View style={[styles.miniIconBg, { backgroundColor: 'rgba(52, 211, 153, 0.12)' }]}>
//                   <Icon name="arrow-down" size={16} color={colors.income} />
//                 </View>
//                 <Text style={styles.smallLabel}>Income</Text>
//               </View>
//               <Text style={[styles.smallValue, { color: colors.income }]}>{formatMoney(month.income, symbol)}</Text>
//             </Card>

//             <Card style={styles.half}>
//               <View style={styles.statIconRow}>
//                 <View style={[styles.miniIconBg, { backgroundColor: 'rgba(248, 113, 113, 0.12)' }]}>
//                   <Icon name="arrow-up" size={16} color={colors.expense} />
//                 </View>
//                 <Text style={styles.smallLabel}>Expense</Text>
//               </View>
//               <Text style={[styles.smallValue, { color: colors.expense }]}>{formatMoney(month.expense, symbol)}</Text>
//             </Card>
//           </View>

//           {/* Budget Overview Card */}
//           {overall ? (
//             <Card style={styles.sectionCard}>
//               <View style={styles.between}>
//                 <Text style={styles.cardTitle}>Monthly Budget</Text>
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
//     backgroundColor: 'rgba(15, 23, 42, 0.55)', // Elegant dark glass tint
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
//     backgroundColor: colors.card || '#1E293B',
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: colors.border || '#334155',
//     paddingVertical: 18,
//     paddingHorizontal: 20,
//   },
//   balanceHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   balanceLabel: { 
//     color: colors.muted, 
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
//     color: colors.text, 
//     fontSize: 30, 
//     fontWeight: '800', 
//     marginTop: 6,
//     letterSpacing: -0.5,
//   },
//   monthLabel: { 
//     color: colors.muted, 
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
//   smallLabel: { color: colors.muted, fontSize: 13, fontWeight: '600' },
//   smallValue: { fontSize: 18, fontWeight: '800', marginTop: 8 },
//   between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   cardTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
//   sectionCard: {
//     borderRadius: 18,
//   },
// });




// ==========2nd=============








import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, Animated } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Screen from '../components/Screen';
import TransactionItem from '../components/TransactionItem';
import { Card, EmptyState, Fab, ProgressBar, SectionHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { formatMoney, monthLabel, sameMonth } from '../utils/format';
import { expenseByCategory, totals } from '../utils/stats';

export default function DashboardScreen({ navigation }) {
  const { profile, colors } = useAuth(); // Dynamic colors hook theke niya holo
  const { transactions, budgets, symbol, getCategory } = useData();

  // Simple entrance animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Time-based greeting, weather condition & background image URLs
  const { greeting, currentDate, weatherConfig } = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    
    let greet = 'Hello';
    let weather = { 
      condition: 'Clear Sky', 
      icon: 'weather-sunny', 
      bgImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' 
    };

    if (hours >= 5 && hours < 12) {
      greet = 'Good morning';
      weather = { condition: 'Morning Fresh', icon: 'weather-sunny', bgImage: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd' };
    } else if (hours >= 12 && hours < 15) {
      greet = 'Good noon';
      weather = { condition: 'Sunny Day', icon: 'white-balance-sunny', bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' };
    } else if (hours >= 15 && hours < 18) {
      greet = 'Good afternoon';
      weather = { condition: 'Pleasant Sky', icon: 'weather-partly-cloudy', bgImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401' };
    } else if (hours >= 18 && hours < 22) {
      greet = 'Good evening';
      weather = { condition: 'Sunset Glow', icon: 'weather-sunset', bgImage: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869' };
    } else {
      greet = 'Good night';
      weather = { condition: 'Night Starry', icon: 'weather-night', bgImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba' };
    }

    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const dateStr = now.toLocaleDateString('en-US', options);

    return { greeting: greet, currentDate: dateStr, weatherConfig: weather };
  }, []);

  const { all, month, top } = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter((t) => sameMonth(t.date, now));
    return {
      all: totals(transactions),
      month: totals(thisMonth),
      top: expenseByCategory(thisMonth).slice(0, 3),
    };
  }, [transactions]);

  const balance = all.income - all.expense;
  const overall = budgets.overall;
  const ratio = overall ? month.expense / overall : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* Minimalist Weather & Greeting Banner */}
          <ImageBackground 
            source={{ uri: weatherConfig.bgImage }} 
            style={styles.weatherBanner}
            imageStyle={styles.bannerImageStyle}
          >
            <View style={styles.overlay}>
              <View style={styles.bannerLeft}>
                <Text style={styles.greeting}>{greeting}</Text>
                <Text style={styles.name}>{profile?.name?.split(' ')[0] || 'there'}</Text>
              </View>
              
              <View style={styles.weatherRight}>
                <View style={styles.dateBadge}>
                  <Icon name={weatherConfig.icon} size={13} color="#FBBF24" />
                  <Text style={styles.dateText}>{currentDate}</Text>
                </View>
              </View>
            </View>
          </ImageBackground>

          {/* Minimal Total Balance Card */}
          <Card style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.balanceHeader}>
              <Text style={[styles.balanceLabel, { color: colors.muted }]}>Total Balance</Text>
              <View style={styles.walletIconBg}>
                <Icon name="wallet-outline" size={16} color={colors.primaryLight} />
              </View>
            </View>
            <Text style={[styles.balance, { color: colors.text }, balance < 0 && { color: colors.expense }]}>
              {formatMoney(balance, symbol)}
            </Text>
          </Card>

          {/* Monthly Income / Expense Split */}
          <Text style={[styles.monthLabel, { color: colors.muted }]}>{monthLabel(new Date())}</Text>
          <View style={styles.row}>
            <Card style={styles.half}>
              <View style={styles.statIconRow}>
                <View style={[styles.miniIconBg, { backgroundColor: colors.incomeBg }]}>
                  <Icon name="arrow-down" size={16} color={colors.income} />
                </View>
                <Text style={[styles.smallLabel, { color: colors.muted }]}>Income</Text>
              </View>
              <Text style={[styles.smallValue, { color: colors.income }]}>{formatMoney(month.income, symbol)}</Text>
            </Card>

            <Card style={styles.half}>
              <View style={styles.statIconRow}>
                <View style={[styles.miniIconBg, { backgroundColor: colors.expenseBg }]}>
                  <Icon name="arrow-up" size={16} color={colors.expense} />
                </View>
                <Text style={[styles.smallLabel, { color: colors.muted }]}>Expense</Text>
              </View>
              <Text style={[styles.smallValue, { color: colors.expense }]}>{formatMoney(month.expense, symbol)}</Text>
            </Card>
          </View>

          {/* Budget Overview Card */}
          {overall ? (
            <Card style={styles.sectionCard}>
              <View style={styles.between}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Monthly Budget</Text>
                <Text style={{ color: ratio > 1 ? colors.expense : colors.muted, fontSize: 13, fontWeight: '600' }}>
                  {formatMoney(month.expense, symbol)} / {formatMoney(overall, symbol)}
                </Text>
              </View>
              <View style={{ marginVertical: 10 }}>
                <ProgressBar value={ratio} color={ratio > 1 ? colors.expense : ratio > 0.8 ? colors.warn : colors.income} />
              </View>
              {ratio > 1 ? (
                <Text style={{ color: colors.expense, fontSize: 12, fontWeight: '500' }}>⚠ You are over budget this month!</Text>
              ) : ratio > 0.8 ? (
                <Text style={{ color: colors.warn, fontSize: 12, fontWeight: '500' }}>⚠ You have used {(ratio * 100).toFixed(0)}% of your budget.</Text>
              ) : (
                <Text style={{ color: colors.dim, fontSize: 12 }}>{formatMoney(overall - month.expense, symbol)} left this month</Text>
              )}
            </Card>
          ) : null}

          {/* Top Spending Categories */}
          {top.length > 0 && (
            <>
              <SectionHeader title="Top spending" />
              <Card style={styles.sectionCard}>
                {top.map((c, i) => {
                  const cat = getCategory(c.id, c.name);
                  return (
                    <View key={c.id} style={{ marginBottom: i === top.length - 1 ? 0 : 14 }}>
                      <View style={styles.between}>
                        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>{cat.name}</Text>
                        <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600' }}>{formatMoney(c.total, symbol)}</Text>
                      </View>
                      <View style={{ marginTop: 6 }}>
                        <ProgressBar value={c.total / month.expense} color={cat.color} />
                      </View>
                    </View>
                  );
                })}
              </Card>
            </>
          )}

          {/* Recent Transactions List */}
          <SectionHeader title="Recent transactions" right="See all" onRightPress={() => navigation.navigate('Transactions')} />
          {transactions.length === 0 ? (
            <EmptyState icon="wallet-outline" title="No transactions yet" subtitle="Tap + to add your first income or expense." />
          ) : (
            transactions.slice(0, 5).map((t) => (
              <TransactionItem
                key={t.id}
                item={t}
                symbol={symbol}
                category={getCategory(t.categoryId, t.categoryName)}
                onPress={() => navigation.navigate('AddTransaction', { transaction: t })}
              />
            ))
          )}

        </Animated.View>
      </Screen>
      <Fab onPress={() => navigation.navigate('AddTransaction')} />
    </View>
  );
}

const styles = StyleSheet.create({
  weatherBanner: {
    height: 110,
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  bannerImageStyle: {
    borderRadius: 18,
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  bannerLeft: {
    flex: 1,
  },
  weatherRight: {
    alignItems: 'flex-end',
  },
  greeting: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  balanceCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: { 
    fontSize: 12, 
    fontWeight: '600', 
    textTransform: 'uppercase', 
    letterSpacing: 0.8 
  },
  walletIconBg: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balance: { 
    fontSize: 30, 
    fontWeight: '800', 
    marginTop: 6,
    letterSpacing: -0.5,
  },
  monthLabel: { 
    fontSize: 13, 
    marginBottom: 8, 
    fontWeight: '600',
    marginTop: 6,
  },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallLabel: { fontSize: 13, fontWeight: '600' },
  smallValue: { fontSize: 18, fontWeight: '800', marginTop: 8 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontWeight: '700', fontSize: 15 },
  sectionCard: {
    borderRadius: 18,
  },
});