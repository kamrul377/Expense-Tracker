// import React, { useMemo } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
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
//     <View style={{ flex: 1 }}>
//       <Screen>
//         <Text style={styles.hello}>Hello, {profile?.name?.split(' ')[0] || 'there'} 👋</Text>

//         <Card style={{ backgroundColor: '#0C4A6E', borderColor: '#075985' }}>
//           <Text style={styles.balanceLabel}>Total Balance</Text>
//           <Text style={[styles.balance, balance < 0 && { color: colors.expense }]}>{formatMoney(balance, symbol)}</Text>
//         </Card>

//         <Text style={styles.monthLabel}>{monthLabel(new Date())}</Text>
//         <View style={styles.row}>
//           <Card style={styles.half}>
//             <Icon name="arrow-down-circle" size={22} color={colors.income} />
//             <Text style={styles.smallLabel}>Income</Text>
//             <Text style={[styles.smallValue, { color: colors.income }]}>{formatMoney(month.income, symbol)}</Text>
//           </Card>
//           <Card style={styles.half}>
//             <Icon name="arrow-up-circle" size={22} color={colors.expense} />
//             <Text style={styles.smallLabel}>Expense</Text>
//             <Text style={[styles.smallValue, { color: colors.expense }]}>{formatMoney(month.expense, symbol)}</Text>
//           </Card>
//         </View>

//         {overall ? (
//           <Card>
//             <View style={styles.between}>
//               <Text style={styles.cardTitle}>Monthly Budget</Text>
//               <Text style={{ color: ratio > 1 ? colors.expense : colors.muted, fontSize: 13 }}>
//                 {formatMoney(month.expense, symbol)} / {formatMoney(overall, symbol)}
//               </Text>
//             </View>
//             <View style={{ marginVertical: 8 }}>
//               <ProgressBar value={ratio} color={ratio > 1 ? colors.expense : ratio > 0.8 ? colors.warn : colors.income} />
//             </View>
//             {ratio > 1 ? (
//               <Text style={{ color: colors.expense, fontSize: 12 }}>⚠ You are over budget this month!</Text>
//             ) : ratio > 0.8 ? (
//               <Text style={{ color: colors.warn, fontSize: 12 }}>⚠ You have used {(ratio * 100).toFixed(0)}% of your budget.</Text>
//             ) : (
//               <Text style={{ color: colors.dim, fontSize: 12 }}>{formatMoney(overall - month.expense, symbol)} left this month</Text>
//             )}
//           </Card>
//         ) : null}

//         {top.length > 0 && (
//           <>
//             <SectionHeader title="Top spending" />
//             <Card>
//               {top.map((c, i) => {
//                 const cat = getCategory(c.id, c.name);
//                 return (
//                   <View key={c.id} style={{ marginBottom: i === top.length - 1 ? 0 : 14 }}>
//                     <View style={styles.between}>
//                       <Text style={{ color: colors.text, fontSize: 14 }}>{cat.name}</Text>
//                       <Text style={{ color: colors.muted, fontSize: 13 }}>{formatMoney(c.total, symbol)}</Text>
//                     </View>
//                     <View style={{ marginTop: 6 }}>
//                       <ProgressBar value={c.total / month.expense} color={cat.color} />
//                     </View>
//                   </View>
//                 );
//               })}
//             </Card>
//           </>
//         )}

//         <SectionHeader title="Recent transactions" right="See all" onRightPress={() => navigation.navigate('Transactions')} />
//         {transactions.length === 0 ? (
//           <EmptyState icon="wallet-outline" title="No transactions yet" subtitle="Tap + to add your first income or expense." />
//         ) : (
//           transactions.slice(0, 5).map((t) => (
//             <TransactionItem
//               key={t.id}
//               item={t}
//               symbol={symbol}
//               category={getCategory(t.categoryId, t.categoryName)}
//               onPress={() => navigation.navigate('AddTransaction', { transaction: t })}
//             />
//           ))
//         )}
//       </Screen>
//       <Fab onPress={() => navigation.navigate('AddTransaction')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   hello: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 14 },
//   balanceLabel: { color: '#BAE6FD', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
//   balance: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 4 },
//   monthLabel: { color: colors.muted, fontSize: 13, marginBottom: 8, fontWeight: '600' },
//   row: { flexDirection: 'row', gap: 12 },
//   half: { flex: 1 },
//   smallLabel: { color: colors.muted, fontSize: 12, marginTop: 6 },
//   smallValue: { fontSize: 17, fontWeight: '800', marginTop: 2 },
//   between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   cardTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
// });



import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Screen from '../components/Screen';
import TransactionItem from '../components/TransactionItem';
import { Card, EmptyState, Fab, ProgressBar, SectionHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { colors } from '../constants/theme';
import { formatMoney, monthLabel, sameMonth } from '../utils/format';
import { expenseByCategory, totals } from '../utils/stats';

export default function DashboardScreen({ navigation }) {
  const { profile } = useAuth();
  const { transactions, budgets, symbol, getCategory } = useData();

  // Time-based greeting ebong formatted date calculate korar jonno
  const { greeting, currentDate } = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    
    let greet = 'Hello';
    if (hours >= 5 && hours < 12) {
      greet = 'Good morning';
    } else if (hours >= 12 && hours < 15) {
      greet = 'Good noon';
    } else if (hours >= 15 && hours < 18) {
      greet = 'Good afternoon';
    } else if (hours >= 18 && hours < 22) {
      greet = 'Good evening';
    } else {
      greet = 'Good night';
    }

    // Date formatting (jaemon: Thursday, 12 Nov 2026)
    const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);

    return { greeting: greet, currentDate: dateStr };
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
    <View style={{ flex: 1 }}>
      <Screen>
        {/* Header with Greeting & Date */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>{profile?.name?.split(' ')[0] || 'there'} 👋</Text>
          </View>
          <View style={styles.dateBadge}>
            <Icon name="calendar-outline" size={14} color={colors.primaryLight || '#818CF8'} />
            <Text style={styles.dateText}>{currentDate}</Text>
          </View>
        </View>

        <Card style={{ backgroundColor: '#0C4A6E', borderColor: '#075985' }}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={[styles.balance, balance < 0 && { color: colors.expense }]}>{formatMoney(balance, symbol)}</Text>
        </Card>

        <Text style={styles.monthLabel}>{monthLabel(new Date())}</Text>
        <View style={styles.row}>
          <Card style={styles.half}>
            <Icon name="arrow-down-circle" size={22} color={colors.income} />
            <Text style={styles.smallLabel}>Income</Text>
            <Text style={[styles.smallValue, { color: colors.income }]}>{formatMoney(month.income, symbol)}</Text>
          </Card>
          <Card style={styles.half}>
            <Icon name="arrow-up-circle" size={22} color={colors.expense} />
            <Text style={styles.smallLabel}>Expense</Text>
            <Text style={[styles.smallValue, { color: colors.expense }]}>{formatMoney(month.expense, symbol)}</Text>
          </Card>
        </View>

        {overall ? (
          <Card>
            <View style={styles.between}>
              <Text style={styles.cardTitle}>Monthly Budget</Text>
              <Text style={{ color: ratio > 1 ? colors.expense : colors.muted, fontSize: 13 }}>
                {formatMoney(month.expense, symbol)} / {formatMoney(overall, symbol)}
              </Text>
            </View>
            <View style={{ marginVertical: 8 }}>
              <ProgressBar value={ratio} color={ratio > 1 ? colors.expense : ratio > 0.8 ? colors.warn : colors.income} />
            </View>
            {ratio > 1 ? (
              <Text style={{ color: colors.expense, fontSize: 12 }}>⚠ You are over budget this month!</Text>
            ) : ratio > 0.8 ? (
              <Text style={{ color: colors.warn, fontSize: 12 }}>⚠ You have used {(ratio * 100).toFixed(0)}% of your budget.</Text>
            ) : (
              <Text style={{ color: colors.dim, fontSize: 12 }}>{formatMoney(overall - month.expense, symbol)} left this month</Text>
            )}
          </Card>
        ) : null}

        {top.length > 0 && (
          <>
            <SectionHeader title="Top spending" />
            <Card>
              {top.map((c, i) => {
                const cat = getCategory(c.id, c.name);
                return (
                  <View key={c.id} style={{ marginBottom: i === top.length - 1 ? 0 : 14 }}>
                    <View style={styles.between}>
                      <Text style={{ color: colors.text, fontSize: 14 }}>{cat.name}</Text>
                      <Text style={{ color: colors.muted, fontSize: 13 }}>{formatMoney(c.total, symbol)}</Text>
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
      </Screen>
      <Fab onPress={() => navigation.navigate('AddTransaction')} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    color: colors.muted || '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  name: {
    color: colors.text || '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    gap: 6,
  },
  dateText: {
    color: colors.primaryLight || '#818CF8',
    fontSize: 12,
    fontWeight: '700',
  },
  balanceLabel: { color: '#BAE6FD', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  balance: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 4 },
  monthLabel: { color: colors.muted, fontSize: 13, marginBottom: 8, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  smallLabel: { color: colors.muted, fontSize: 12, marginTop: 6 },
  smallValue: { fontSize: 17, fontWeight: '800', marginTop: 2 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
});