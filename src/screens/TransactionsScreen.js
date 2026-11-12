// import React, { useMemo, useState } from 'react';
// import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import MonthSwitcher from '../components/MonthSwitcher';
// import TransactionItem from '../components/TransactionItem';
// import { EmptyState, Fab, Segmented } from '../components/ui';
// import { useData } from '../context/DataContext';
// import { colors, radius } from '../constants/theme';
// import { formatMoney, sameMonth } from '../utils/format';
// import { totals } from '../utils/stats';

// export default function TransactionsScreen({ navigation }) {
//   const { transactions, getCategory, symbol, removeTransaction } = useData();
//   const [search, setSearch] = useState('');
//   const [type, setType] = useState('all');
//   const [month, setMonth] = useState(new Date());
//   const [allTime, setAllTime] = useState(false);

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return transactions.filter((t) => {
//       if (type !== 'all' && t.type !== type) return false;
//       if (!allTime && !sameMonth(t.date, month)) return false;
//       if (q) {
//         const cat = getCategory(t.categoryId, t.categoryName).name.toLowerCase();
//         const hay = `${t.title || ''} ${cat} ${t.paymentMethod || ''}`.toLowerCase();
//         if (!hay.includes(q)) return false;
//       }
//       return true;
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [transactions, search, type, month, allTime]);

//   const sum = totals(filtered);

//   const confirmDelete = (t) =>
//     Alert.alert('Delete transaction', 'Are you sure you want to remove this entry?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Delete', style: 'destructive', onPress: () => removeTransaction(t.id) },
//     ]);

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.bg }}>
//       <FlatList
//         data={filtered}
//         keyExtractor={(t) => t.id}
//         contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//         ListHeaderComponent={
//           <View>
//             <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}>
//               <Icon name="magnify" size={20} color={colors.dim} />
//               <TextInput
//                 value={search}
//                 onChangeText={setSearch}
//                 placeholder="Search title, category, payment..."
//                 placeholderTextColor={colors.dim}
//                 style={{ flex: 1, color: colors.text, paddingVertical: 11, paddingHorizontal: 8 }}
//               />
//             </View>
//             <Segmented
//               value={type}
//               onChange={setType}
//               options={[
//                 { value: 'all', label: 'All' },
//                 { value: 'expense', label: 'Expense', color: '#DC2626' },
//                 { value: 'income', label: 'Income', color: '#059669' },
//               ]}
//             />
//             <View style={{ height: 12 }} />
//             <MonthSwitcher date={month} onChange={setMonth} disabled={allTime} />
//             <TouchableOpacity onPress={() => setAllTime(!allTime)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
//               <Icon name={allTime ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={colors.primaryLight} />
//               <Text style={{ color: colors.muted, marginLeft: 6, fontSize: 13 }}>Show all time</Text>
//             </TouchableOpacity>
//             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
//               <Text style={{ color: colors.income, fontWeight: '700' }}>+{formatMoney(sum.income, symbol)}</Text>
//               <Text style={{ color: colors.muted }}>{filtered.length} items</Text>
//               <Text style={{ color: colors.expense, fontWeight: '700' }}>-{formatMoney(sum.expense, symbol)}</Text>
//             </View>
//           </View>
//         }
//         ListEmptyComponent={<EmptyState icon="text-search" title="No transactions found" subtitle="Try another month or filter." />}
//         renderItem={({ item }) => (
//           <TransactionItem
//             item={item}
//             symbol={symbol}
//             category={getCategory(item.categoryId, item.categoryName)}
//             onPress={() => navigation.navigate('AddTransaction', { transaction: item })}
//             onLongPress={() => confirmDelete(item)}
//           />
//         )}
//       />
//       <Fab onPress={() => navigation.navigate('AddTransaction')} />
//     </View>
//   );
// }





import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import MonthSwitcher from '../components/MonthSwitcher';
import TransactionItem from '../components/TransactionItem';
import { EmptyState, Fab, Segmented } from '../components/ui';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { radius } from '../constants/theme';
import { formatMoney, sameMonth } from '../utils/format';
import { totals } from '../utils/stats';

export default function TransactionsScreen({ navigation }) {
  const { transactions, getCategory, symbol, removeTransaction } = useData();
  const { colors } = useAuth(); // Dynamic colors useAuth থেকে নেওয়া হলো

  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [month, setMonth] = useState(new Date());
  const [allTime, setAllTime] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (type !== 'all' && t.type !== type) return false;
      if (!allTime && !sameMonth(t.date, month)) return false;
      if (q) {
        const cat = getCategory(t.categoryId, t.categoryName).name.toLowerCase();
        const hay = `${t.title || ''} ${cat} ${t.paymentMethod || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, search, type, month, allTime]);

  const sum = totals(filtered);

  const confirmDelete = (t) =>
    Alert.alert('Delete transaction', 'Are you sure you want to remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeTransaction(t.id) },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderRadius: radius.md,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 12,
              }}
            >
              <Icon name="magnify" size={20} color={colors.dim} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search title, category, payment..."
                placeholderTextColor={colors.dim}
                style={{ flex: 1, color: colors.text, paddingVertical: 11, paddingHorizontal: 8 }}
              />
            </View>
            <Segmented
              value={type}
              onChange={setType}
              options={[
                { value: 'all', label: 'All' },
                { value: 'expense', label: 'Expense', color: colors.expense || '#DC2626' },
                { value: 'income', label: 'Income', color: colors.income || '#059669' },
              ]}
            />
            <View style={{ height: 12 }} />
            <MonthSwitcher date={month} onChange={setMonth} disabled={allTime} />
            <TouchableOpacity
              onPress={() => setAllTime(!allTime)}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
            >
              <Icon name={allTime ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={colors.primaryLight} />
              <Text style={{ color: colors.muted, marginLeft: 6, fontSize: 13 }}>Show all time</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: colors.income, fontWeight: '700' }}>+{formatMoney(sum.income, symbol)}</Text>
              <Text style={{ color: colors.muted }}>{filtered.length} items</Text>
              <Text style={{ color: colors.expense, fontWeight: '700' }}>-{formatMoney(sum.expense, symbol)}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="text-search" title="No transactions found" subtitle="Try another month or filter." />}
        renderItem={({ item }) => (
          <TransactionItem
            item={item}
            symbol={symbol}
            category={getCategory(item.categoryId, item.categoryName)}
            onPress={() => navigation.navigate('AddTransaction', { transaction: item })}
            onLongPress={() => confirmDelete(item)}
          />
        )}
      />
      <Fab onPress={() => navigation.navigate('AddTransaction')} />
    </View>
  );
}