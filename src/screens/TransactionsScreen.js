
// import React, { useMemo, useState } from 'react';
// import { FlatList, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import MonthSwitcher from '../components/MonthSwitcher';
// import TransactionItem from '../components/TransactionItem';
// import { EmptyState, Fab, Segmented } from '../components/ui';
// import { useData } from '../context/DataContext';
// import { useAuth } from '../context/AuthContext';
// import { radius } from '../constants/theme';
// import { formatMoney, sameMonth } from '../utils/format';
// import { totals } from '../utils/stats';
// import CustomAlert from '../components/CustomAlert';

// export default function TransactionsScreen({ navigation }) {
//   const { transactions, getCategory, symbol, removeTransaction } = useData();
//   const { colors } = useAuth();

//   const [search, setSearch] = useState('');
//   const [type, setType] = useState('all');
//   const [month, setMonth] = useState(new Date());
//   const [allTime, setAllTime] = useState(false);

//   // Manual Date Filter States
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   // Custom Alert State
//   const [alertData, setAlertData] = useState({
//     visible: false,
//     title: '',
//     message: '',
//     type: 'error',
//     showCancel: false,
//     confirmText: 'Okay, Got it',
//     onConfirm: null,
//   });

//   const closeAlert = () => {
//     setAlertData((prev) => ({ ...prev, visible: false, onConfirm: null }));
//   };

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return transactions.filter((t) => {
//       if (type !== 'all' && t.type !== type) return false;

//       if (selectedDate) {
//         if (!t.date) return false;
//         const tDate = new Date(t.date);
//         const sDate = new Date(selectedDate);
//         if (
//           tDate.getDate() !== sDate.getDate() ||
//           tDate.getMonth() !== sDate.getMonth() ||
//           tDate.getFullYear() !== sDate.getFullYear()
//         ) {
//           return false;
//         }
//       } else {
//         if (!allTime && !sameMonth(t.date, month)) return false;
//       }

//       if (q) {
//         const cat = getCategory(t.categoryId, t.categoryName).name.toLowerCase();
//         const hay = `${t.title || ''} ${cat} ${t.paymentMethod || ''}`.toLowerCase();
//         if (!hay.includes(q)) return false;
//       }

//       return true;
//     });
//   }, [transactions, search, type, month, allTime, selectedDate, getCategory]);

//   const sum = totals(filtered);

//   const handleDateChange = (event, date) => {
//     setShowDatePicker(Platform.OS === 'ios');
//     if (date) {
//       setSelectedDate(date);
//     }
//   };

//   const confirmDelete = (t) => {
//     setAlertData({
//       visible: true,
//       title: 'Delete transaction',
//       message: 'Are you sure you want to remove this entry?',
//       type: 'error',
//       showCancel: true,
//       confirmText: 'Delete',
//       onConfirm: () => {
//         removeTransaction(t.id);
//         closeAlert();
//       },
//     });
//   };

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
//             {/* Search Bar */}
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 backgroundColor: colors.card,
//                 borderRadius: radius.md,
//                 paddingHorizontal: 12,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//                 marginBottom: 12,
//               }}
//             >
//               <Icon name="magnify" size={20} color={colors.dim} />
//               <TextInput
//                 value={search}
//                 onChangeText={setSearch}
//                 placeholder="Search title, category, payment..."
//                 placeholderTextColor={colors.dim}
//                 style={{ flex: 1, color: colors.text, paddingVertical: 11, paddingHorizontal: 8 }}
//               />
//               {search.length > 0 && (
//                 <TouchableOpacity onPress={() => setSearch('')}>
//                   <Icon name="close-circle" size={18} color={colors.dim} />
//                 </TouchableOpacity>
//               )}
//             </View>

//             {/* Manual Date Filter Button & Month Switcher Row */}
//             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
//               <View style={{ flex: 1 }}>
//                 <MonthSwitcher date={month} onChange={setMonth} disabled={allTime || selectedDate !== null} />
//               </View>

//               <TouchableOpacity
//                 onPress={() => setShowDatePicker(true)}
//                 style={{
//                   backgroundColor: selectedDate ? colors.primary || '#059669' : colors.card,
//                   borderWidth: 1,
//                   borderColor: selectedDate ? 'transparent' : colors.border,
//                   paddingHorizontal: 12,
//                   paddingVertical: 11,
//                   borderRadius: radius.md,
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   gap: 6,
//                   height: 48,
//                   marginBottom: 12,
//                 }}
//               >
//                 <Icon name="calendar-search" size={18} color={selectedDate ? '#fff' : colors.text} />
//                 <Text style={{ color: selectedDate ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>
//                   {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Filter Date'}
//                 </Text>
//                 {selectedDate && (
//                   <TouchableOpacity onPress={(e) => { e.stopPropagation(); setSelectedDate(null); }}>
//                     <Icon name="close" size={16} color="#fff" />
//                   </TouchableOpacity>
//                 )}
//               </TouchableOpacity>
//             </View>

//             {showDatePicker && (
//               <DateTimePicker
//                 value={selectedDate || new Date()}
//                 mode="date"
//                 display="default"
//                 onChange={handleDateChange}
//               />
//             )}

//             <Segmented
//               value={type}
//               onChange={setType}
//               options={[
//                 { value: 'all', label: 'All' },
//                 { value: 'expense', label: 'Expense', color: colors.expense || '#DC2626' },
//                 { value: 'income', label: 'Income', color: colors.income || '#059669' },
//               ]}
//             />

//             <View style={{ height: 12 }} />

//             <TouchableOpacity
//               onPress={() => { setAllTime(!allTime); setSelectedDate(null); }}
//               style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
//             >
//               <Icon name={allTime ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={colors.primaryLight} />
//               <Text style={{ color: colors.muted, marginLeft: 6, fontSize: 13 }}>Show all time</Text>
//             </TouchableOpacity>

//             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
//               <Text style={{ color: colors.income, fontWeight: '700' }}>+{formatMoney(sum.income, symbol)}</Text>
//               <Text style={{ color: colors.muted }}>{filtered.length} items {selectedDate ? `(Filtered by date)` : ''}</Text>
//               <Text style={{ color: colors.expense, fontWeight: '700' }}>-{formatMoney(sum.expense, symbol)}</Text>
//             </View>
//           </View>
//         }
//         ListEmptyComponent={<EmptyState icon="text-search" title="No transactions found" subtitle="Try changing date filter or search." />}
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

//       {/* Custom Animated Alert Modal */}
//       <CustomAlert
//         visible={alertData.visible}
//         title={alertData.title}
//         message={alertData.message}
//         type={alertData.type}
//         showCancel={alertData.showCancel}
//         confirmText={alertData.confirmText}
//         cancelText="Cancel"
//         onCancel={closeAlert}
//         onClose={alertData.onConfirm || closeAlert}
//       />
//     </View>
//   );
// }


// ==============================2nd end=====================



// import React, { useMemo, useState } from 'react';
// import { FlatList, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import MonthSwitcher from '../components/MonthSwitcher';
// import TransactionItem from '../components/TransactionItem';
// import { EmptyState, Fab, Segmented } from '../components/ui';
// import { useData } from '../context/DataContext';
// import { useAuth } from '../context/AuthContext';
// import { radius } from '../constants/theme';
// import { formatMoney, sameMonth } from '../utils/format';
// import { totals } from '../utils/stats';
// import CustomAlert from '../components/CustomAlert';
// import ShareTransactionModal from '../components/ShareTransactionModal';

// export default function TransactionsScreen({ navigation }) {
//   const { transactions, getCategory, symbol, removeTransaction } = useData();
//   const { colors } = useAuth();

//   const [search, setSearch] = useState('');
//   const [type, setType] = useState('all');
//   const [month, setMonth] = useState(new Date());
//   const [allTime, setAllTime] = useState(false);

//   // Manual Date Filter States
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   // Share card state
//   const [shareItem, setShareItem] = useState(null);

//   // Custom Alert State
//   const [alertData, setAlertData] = useState({
//     visible: false,
//     title: '',
//     message: '',
//     type: 'error',
//     showCancel: false,
//     confirmText: 'Okay, Got it',
//     onConfirm: null,
//   });

//   const closeAlert = () => {
//     setAlertData((prev) => ({ ...prev, visible: false, onConfirm: null }));
//   };

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return transactions.filter((t) => {
//       if (type !== 'all' && t.type !== type) return false;

//       if (selectedDate) {
//         if (!t.date) return false;
//         const tDate = new Date(t.date);
//         const sDate = new Date(selectedDate);
//         if (
//           tDate.getDate() !== sDate.getDate() ||
//           tDate.getMonth() !== sDate.getMonth() ||
//           tDate.getFullYear() !== sDate.getFullYear()
//         ) {
//           return false;
//         }
//       } else {
//         if (!allTime && !sameMonth(t.date, month)) return false;
//       }

//       if (q) {
//         const cat = getCategory(t.categoryId, t.categoryName).name.toLowerCase();
//         const hay = `${t.title || ''} ${cat} ${t.paymentMethod || ''}`.toLowerCase();
//         if (!hay.includes(q)) return false;
//       }

//       return true;
//     });
//   }, [transactions, search, type, month, allTime, selectedDate, getCategory]);

//   const sum = totals(filtered);
//   const balance = sum.income - sum.expense;

//   const handleDateChange = (event, date) => {
//     setShowDatePicker(Platform.OS === 'ios');
//     if (date) {
//       setSelectedDate(date);
//     }
//   };

//   const confirmDelete = (t) => {
//     setAlertData({
//       visible: true,
//       title: 'Delete transaction',
//       message: 'Are you sure you want to remove this entry?',
//       type: 'error',
//       showCancel: true,
//       confirmText: 'Delete',
//       onConfirm: () => {
//         removeTransaction(t.id);
//         closeAlert();
//       },
//     });
//   };

//   const incomeColor = colors.income || '#059669';
//   const expenseColor = colors.expense || '#DC2626';
//   const primary = colors.primary || '#059669';

//   const periodLabel = selectedDate
//     ? selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
//     : allTime
//     ? 'All time'
//     : month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.bg }}>
//       <FlatList
//         data={filtered}
//         keyExtractor={(t) => t.id}
//         contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//         ListHeaderComponent={
//           <View>
//             {/* ===== Summary hero card ===== */}
//             <View
//               style={{
//                 backgroundColor: primary,
//                 borderRadius: 28,
//                 padding: 20,
//                 marginBottom: 16,
//                 overflow: 'hidden',
//                 shadowColor: primary,
//                 shadowOpacity: 0.35,
//                 shadowRadius: 16,
//                 shadowOffset: { width: 0, height: 8 },
//                 elevation: 8,
//               }}
//             >
//               <View style={{ position: 'absolute', top: -50, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.14)' }} />
//               <View style={{ position: 'absolute', bottom: -60, left: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(0,0,0,0.1)' }} />

//               <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' }}>{periodLabel}</Text>
//                 <View style={{ backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
//                   <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
//                     {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
//                   </Text>
//                 </View>
//               </View>

//               <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 14 }}>Net balance</Text>
//               <Text style={{ color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: -0.5 }}>
//                 {balance < 0 ? '-' : ''}
//                 {formatMoney(Math.abs(balance), symbol)}
//               </Text>

//               <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
//                 <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
//                   <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
//                     <Icon name="arrow-down" size={18} color="#fff" />
//                   </View>
//                   <View style={{ flex: 1 }}>
//                     <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>Income</Text>
//                     <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }} numberOfLines={1}>
//                       {formatMoney(sum.income, symbol)}
//                     </Text>
//                   </View>
//                 </View>
//                 <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
//                   <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
//                     <Icon name="arrow-up" size={18} color="#fff" />
//                   </View>
//                   <View style={{ flex: 1 }}>
//                     <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>Expense</Text>
//                     <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }} numberOfLines={1}>
//                       {formatMoney(sum.expense, symbol)}
//                     </Text>
//                   </View>
//                 </View>
//               </View>
//             </View>

//             {/* ===== Search Bar ===== */}
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 backgroundColor: colors.card,
//                 borderRadius: 18,
//                 paddingHorizontal: 14,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//                 marginBottom: 12,
//                 shadowColor: '#000',
//                 shadowOpacity: 0.05,
//                 shadowRadius: 8,
//                 shadowOffset: { width: 0, height: 3 },
//                 elevation: 2,
//               }}
//             >
//               <Icon name="magnify" size={22} color={colors.dim} />
//               <TextInput
//                 value={search}
//                 onChangeText={setSearch}
//                 placeholder="Search title, category, payment..."
//                 placeholderTextColor={colors.dim}
//                 style={{ flex: 1, color: colors.text, paddingVertical: 13, paddingHorizontal: 10 }}
//               />
//               {search.length > 0 && (
//                 <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
//                   <Icon name="close-circle" size={18} color={colors.dim} />
//                 </TouchableOpacity>
//               )}
//             </View>

//             {/* ===== Month Switcher + Date filter ===== */}
//             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
//               <View style={{ flex: 1 }}>
//                 <MonthSwitcher date={month} onChange={setMonth} disabled={allTime || selectedDate !== null} />
//               </View>

//               <TouchableOpacity
//                 onPress={() => setShowDatePicker(true)}
//                 activeOpacity={0.8}
//                 style={{
//                   backgroundColor: selectedDate ? primary : colors.card,
//                   borderWidth: 1,
//                   borderColor: selectedDate ? 'transparent' : colors.border,
//                   paddingHorizontal: 12,
//                   borderRadius: 18,
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   gap: 6,
//                   height: 48,
//                 }}
//               >
//                 <Icon name="calendar-search" size={18} color={selectedDate ? '#fff' : colors.text} />
//                 <Text style={{ color: selectedDate ? '#fff' : colors.text, fontSize: 13, fontWeight: '700' }}>
//                   {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Date'}
//                 </Text>
//                 {selectedDate && (
//                   <TouchableOpacity
//                     onPress={(e) => {
//                       e.stopPropagation();
//                       setSelectedDate(null);
//                     }}
//                     hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//                   >
//                     <Icon name="close-circle" size={16} color="#fff" />
//                   </TouchableOpacity>
//                 )}
//               </TouchableOpacity>
//             </View>

//             {showDatePicker && (
//               <DateTimePicker
//                 value={selectedDate || new Date()}
//                 mode="date"
//                 display="default"
//                 onChange={handleDateChange}
//               />
//             )}

//             <Segmented
//               value={type}
//               onChange={setType}
//               options={[
//                 { value: 'all', label: 'All' },
//                 { value: 'expense', label: 'Expense', color: expenseColor },
//                 { value: 'income', label: 'Income', color: incomeColor },
//               ]}
//             />

//             <View style={{ height: 12 }} />

//             {/* ===== Show all time chip ===== */}
//             <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
//               <TouchableOpacity
//                 onPress={() => {
//                   setAllTime(!allTime);
//                   setSelectedDate(null);
//                 }}
//                 activeOpacity={0.8}
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   gap: 6,
//                   paddingHorizontal: 12,
//                   paddingVertical: 8,
//                   borderRadius: 20,
//                   backgroundColor: allTime ? primary : colors.card,
//                   borderWidth: 1,
//                   borderColor: allTime ? 'transparent' : colors.border,
//                 }}
//               >
//                 <Icon name={allTime ? 'check-circle' : 'infinity'} size={16} color={allTime ? '#fff' : colors.muted} />
//                 <Text style={{ color: allTime ? '#fff' : colors.muted, fontSize: 12, fontWeight: '700' }}>Show all time</Text>
//               </TouchableOpacity>

//               <Text style={{ color: colors.dim, fontSize: 11 }}>Long press to delete</Text>
//             </View>
//           </View>
//         }
//         ListEmptyComponent={<EmptyState icon="text-search" title="No transactions found" subtitle="Try changing date filter or search." />}
//         renderItem={({ item }) => {
//           const category = getCategory(item.categoryId, item.categoryName);
//           return (
//             <View
//               style={{
//                 backgroundColor: colors.card,
//                 borderRadius: 22,
//                 marginBottom: 12,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//                 overflow: 'hidden',
//                 shadowColor: '#000',
//                 shadowOpacity: 0.05,
//                 shadowRadius: 8,
//                 shadowOffset: { width: 0, height: 3 },
//                 elevation: 2,
//               }}
//             >
//               <TransactionItem
//                 item={item}
//                 symbol={symbol}
//                 category={category}
//                 onPress={() => navigation.navigate('AddTransaction', { transaction: item })}
//                 onLongPress={() => confirmDelete(item)}
//               />

//               {/* Share footer */}
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   justifyContent: 'space-between',
//                   paddingHorizontal: 14,
//                   paddingBottom: 10,
//                 }}
//               >
//                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
//                   <View
//                     style={{
//                       width: 8,
//                       height: 8,
//                       borderRadius: 4,
//                       backgroundColor: item.type === 'expense' ? expenseColor : incomeColor,
//                     }}
//                   />
//                   <Text style={{ color: colors.dim, fontSize: 11, fontWeight: '600' }}>
//                     {item.type === 'expense' ? 'Expense' : 'Income'}
//                   </Text>
//                 </View>

//                 <TouchableOpacity
//                   onPress={() => setShareItem(item)}
//                   activeOpacity={0.8}
//                   style={{
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     gap: 6,
//                     backgroundColor: colors.bg,
//                     borderWidth: 1,
//                     borderColor: colors.border,
//                     paddingHorizontal: 12,
//                     paddingVertical: 6,
//                     borderRadius: 16,
//                   }}
//                 >
//                   <Icon name="share-variant" size={14} color={primary} />
//                   <Text style={{ color: primary, fontSize: 12, fontWeight: '800' }}>Share card</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           );
//         }}
//       />
//       <Fab onPress={() => navigation.navigate('AddTransaction')} />

//       {/* Share card modal */}
//       <ShareTransactionModal
//         visible={!!shareItem}
//         item={shareItem}
//         category={shareItem ? getCategory(shareItem.categoryId, shareItem.categoryName) : null}
//         symbol={symbol}
//         colors={colors}
//         onClose={() => setShareItem(null)}
//       />

//       {/* Custom Animated Alert Modal */}
//       <CustomAlert
//         visible={alertData.visible}
//         title={alertData.title}
//         message={alertData.message}
//         type={alertData.type}
//         showCancel={alertData.showCancel}
//         confirmText={alertData.confirmText}
//         cancelText="Cancel"
//         onCancel={closeAlert}
//         onClose={alertData.onConfirm || closeAlert}
//       />
//     </View>
//   );
// }



// ======================================change design=================





import React, { useMemo, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import MonthSwitcher from '../components/MonthSwitcher';
import TransactionItem from '../components/TransactionItem';
import { EmptyState, Fab, Segmented } from '../components/ui';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { radius } from '../constants/theme';
import { formatMoney, sameMonth } from '../utils/format';
import { totals } from '../utils/stats';
import CustomAlert from '../components/CustomAlert';
import ShareTransactionModal from '../components/ShareTransactionModal';

export default function TransactionsScreen({ navigation }) {
  const { transactions, getCategory, symbol, removeTransaction } = useData();
  const { colors } = useAuth();

  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [month, setMonth] = useState(new Date());
  const [allTime, setAllTime] = useState(false);

  // Manual Date Filter States
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Share card state
  const [shareItem, setShareItem] = useState(null);

  // Custom Alert State
  const [alertData, setAlertData] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error',
    showCancel: false,
    confirmText: 'Okay, Got it',
    onConfirm: null,
  });

  const closeAlert = () => {
    setAlertData((prev) => ({ ...prev, visible: false, onConfirm: null }));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (type !== 'all' && t.type !== type) return false;

      if (selectedDate) {
        if (!t.date) return false;
        const tDate = new Date(t.date);
        const sDate = new Date(selectedDate);
        if (
          tDate.getDate() !== sDate.getDate() ||
          tDate.getMonth() !== sDate.getMonth() ||
          tDate.getFullYear() !== sDate.getFullYear()
        ) {
          return false;
        }
      } else {
        if (!allTime && !sameMonth(t.date, month)) return false;
      }

      if (q) {
        const cat = getCategory(t.categoryId, t.categoryName).name.toLowerCase();
        const hay = `${t.title || ''} ${cat} ${t.paymentMethod || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [transactions, search, type, month, allTime, selectedDate, getCategory]);

  const sum = totals(filtered);

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const confirmDelete = (t) => {
    setAlertData({
      visible: true,
      title: 'Delete transaction',
      message: 'Are you sure you want to remove this entry?',
      type: 'error',
      showCancel: true,
      confirmText: 'Delete',
      onConfirm: () => {
        removeTransaction(t.id);
        closeAlert();
      },
    });
  };

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
            {/* Search Bar */}
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
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Icon name="close-circle" size={18} color={colors.dim} />
                </TouchableOpacity>
              )}
            </View>

            {/* Manual Date Filter Button & Month Switcher Row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <MonthSwitcher date={month} onChange={setMonth} disabled={allTime || selectedDate !== null} />
              </View>

              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  backgroundColor: selectedDate ? colors.primary || '#059669' : colors.card,
                  borderWidth: 1,
                  borderColor: selectedDate ? 'transparent' : colors.border,
                  paddingHorizontal: 12,
                  paddingVertical: 11,
                  borderRadius: radius.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  height: 48,
                  marginBottom: 12,
                }}
              >
                <Icon name="calendar-search" size={18} color={selectedDate ? '#fff' : colors.text} />
                <Text style={{ color: selectedDate ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Filter Date'}
                </Text>
                {selectedDate && (
                  <TouchableOpacity onPress={(e) => { e.stopPropagation(); setSelectedDate(null); }}>
                    <Icon name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

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

            <TouchableOpacity
              onPress={() => { setAllTime(!allTime); setSelectedDate(null); }}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
            >
              <Icon name={allTime ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={colors.primaryLight} />
              <Text style={{ color: colors.muted, marginLeft: 6, fontSize: 13 }}>Show all time</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: colors.income, fontWeight: '700' }}>+{formatMoney(sum.income, symbol)}</Text>
              <Text style={{ color: colors.muted }}>{filtered.length} items {selectedDate ? `(Filtered by date)` : ''}</Text>
              <Text style={{ color: colors.expense, fontWeight: '700' }}>-{formatMoney(sum.expense, symbol)}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="text-search" title="No transactions found" subtitle="Try changing date filter or search." />}
        renderItem={({ item }) => (
          <View>
            <TransactionItem
              item={item}
              symbol={symbol}
              category={getCategory(item.categoryId, item.categoryName)}
              onPress={() => navigation.navigate('AddTransaction', { transaction: item })}
              onLongPress={() => confirmDelete(item)}
            />
            {/* Share button: card er bhitore, bottom-right corner e */}
            <TouchableOpacity
              onPress={() => setShareItem(item)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{
                position: 'absolute',
                right: 10,
                top: -6,
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: colors.bg,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="share-variant" size={14} color={colors.primaryLight || colors.dim} />
            </TouchableOpacity>
          </View>
        )}
      />
      <Fab onPress={() => navigation.navigate('AddTransaction')} />

      {/* Share card modal */}
      <ShareTransactionModal
        visible={!!shareItem}
        item={shareItem}
        category={shareItem ? getCategory(shareItem.categoryId, shareItem.categoryName) : null}
        symbol={symbol}
        colors={colors}
        onClose={() => setShareItem(null)}
      />

      {/* Custom Animated Alert Modal */}
      <CustomAlert
        visible={alertData.visible}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        showCancel={alertData.showCancel}
        confirmText={alertData.confirmText}
        cancelText="Cancel"
        onCancel={closeAlert}
        onClose={alertData.onConfirm || closeAlert}
      />
    </View>
  );
}