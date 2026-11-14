


// import React, { useLayoutEffect, useState } from 'react';
// import { Alert, Platform, Text, TouchableOpacity, View } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import Screen from '../components/Screen';
// import { Button, Chip, Input, Segmented } from '../components/ui';
// import { useData } from '../context/DataContext';
// import { useAuth } from '../context/AuthContext';
// import { radius } from '../constants/theme';
// import { PAYMENT_METHODS } from '../constants/categories';
// import { formatDate } from '../utils/format';
// import CustomAlert from '../components/CustomAlert';

// export default function AddTransactionScreen({ navigation, route }) {
//   const editing = route.params?.transaction;
//   const { categoriesOfType, getCategory, addTransaction, updateTransaction, removeTransaction, symbol } = useData();
//   const { colors, theme, isDark } = useAuth();

//   const [type, setType] = useState(editing?.type || 'expense');
//   const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
//   const [title, setTitle] = useState(editing?.title || '');
//   const [categoryId, setCategoryId] = useState(editing?.categoryId || 'food');
//   const [method, setMethod] = useState(editing?.paymentMethod || 'Cash');
//   const [date, setDate] = useState(editing?.date ? new Date(editing.date) : new Date());
//   const [showPicker, setShowPicker] = useState(false);

//   // Custom Alert State
//   const [alertData, setAlertData] = useState({
//     visible: false,
//     title: '',
//     message: '',
//     type: 'warning',
//   });

//   const showAlert = (title, message, type = 'warning') => {
//     setAlertData({ visible: true, title, message, type });
//   };

//   // theme string অথবা isDark boolean যেকোনো একটা থাকলেই সঠিকভাবে 'dark' / 'light' পাবে
//   const activeTheme = theme === 'dark' || theme === 'light' ? theme : isDark ? 'dark' : 'light';

//   useLayoutEffect(() => {
//     navigation.setOptions({ title: editing ? 'Edit Transaction' : 'New Transaction' });
//   }, [navigation, editing]);

//   const cats = categoriesOfType(type);

//   const changeType = (t) => {
//     setType(t);
//     setCategoryId(t === 'income' ? 'salary' : 'food');
//   };

//   const save = () => {
//     const value = parseFloat(amount);
//     if (isNaN(value) || value <= 0) {
//       return showAlert('Invalid amount', 'Please enter a valid positive amount.', 'warning');
//     }
//     const cat = getCategory(categoryId);
//     const payload = {
//       type,
//       amount: value,
//       title: title.trim(),
//       categoryId,
//       categoryName: cat.name,
//       paymentMethod: method,
//       date,
//     };
//     if (editing) updateTransaction(editing.id, payload);
//     else addTransaction(payload);
//     navigation.goBack();
//   };

//   const remove = () =>
//     Alert.alert('Delete transaction', 'Are you sure you want to remove this entry?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: () => {
//           removeTransaction(editing.id);
//           navigation.goBack();
//         },
//       },
//     ]);

//   const incomeColor = colors.income || '#059669';
//   const expenseColor = colors.expense || '#DC2626';
//   const accent = type === 'income' ? incomeColor : expenseColor;

//   return (
//     <Screen>
//       <Segmented
//         value={type}
//         onChange={changeType}
//         options={[
//           { value: 'expense', label: 'Expense', color: expenseColor },
//           { value: 'income', label: 'Income', color: incomeColor },
//         ]}
//       />
//       <View style={{ height: 16 }} />
//       <Input
//         label={`Amount (${symbol})`}
//         keyboardType="decimal-pad"
//         value={amount}
//         onChangeText={setAmount}
//         placeholder="0.00"
//         style={{ fontSize: 24, fontWeight: '700' }}
//       />
//       <Input
//         label="Title / Note"
//         autoCapitalize="sentences"
//         value={title}
//         onChangeText={setTitle}
//         placeholder="e.g. Lunch, Internet bill"
//       />

//       <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 }}>
//         Category
//       </Text>
//       <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
//         {cats.map((c) => (
//           <Chip
//             key={c.id}
//             label={c.name}
//             icon={c.icon}
//             color={c.color}
//             active={categoryId === c.id}
//             onPress={() => setCategoryId(c.id)}
//           />
//         ))}
//       </View>

//       <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 }}>
//         Payment method
//       </Text>
//       <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
//         {PAYMENT_METHODS.map((m) => (
//           <Chip key={m} label={m} active={method === m} onPress={() => setMethod(m)} />
//         ))}
//       </View>

//       <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 }}>
//         Date
//       </Text>
//       <TouchableOpacity
//         onPress={() => setShowPicker(true)}
//         style={{
//           flexDirection: 'row',
//           alignItems: 'center',
//           backgroundColor: colors.card,
//           borderRadius: radius.md,
//           borderWidth: 1,
//           borderColor: colors.border,
//           padding: 14,
//           marginBottom: 8,
//         }}
//       >
//         <Icon name="calendar" size={20} color={colors.primaryLight || colors.primary} />
//         <Text style={{ color: colors.text, marginLeft: 10, fontSize: 15 }}>{formatDate(date)}</Text>
//       </TouchableOpacity>

//       {showPicker && (
//         <View
//           style={
//             Platform.OS === 'ios'
//               ? {
//                   backgroundColor: colors.card,
//                   borderRadius: radius.md,
//                   borderWidth: 1,
//                   borderColor: colors.border,
//                   padding: 8,
//                   marginBottom: 8,
//                 }
//               : undefined
//           }
//         >
//           <DateTimePicker
//             value={date}
//             mode="date"
//             display={Platform.OS === 'ios' ? 'inline' : 'default'}
//             themeVariant={activeTheme}
//             accentColor={colors.primaryLight || colors.primary}
//             onChange={(e, d) => {
//               setShowPicker(Platform.OS === 'ios');
//               if (d) setDate(d);
//             }}
//           />
//         </View>
//       )}

//       <View style={{ height: 16 }} />
//       <Button title={editing ? 'Save Changes' : 'Add Transaction'} onPress={save} style={{ backgroundColor: accent }} />
//       {editing && <Button title="Delete" variant="danger" onPress={remove} style={{ marginTop: 12 }} />}

//       {/* Custom Animated Alert Modal */}
//       <CustomAlert
//         visible={alertData.visible}
//         title={alertData.title}
//         message={alertData.message}
//         type={alertData.type}
//         onClose={() => setAlertData({ ...alertData, visible: false })}
//       />
//     </Screen>
//   );
// }





import React, { useLayoutEffect, useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Button, Chip, Input, Segmented } from '../components/ui';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { radius } from '../constants/theme';
import { PAYMENT_METHODS } from '../constants/categories';
import { formatDate } from '../utils/format';
import CustomAlert from '../components/CustomAlert';

export default function AddTransactionScreen({ navigation, route }) {
  const editing = route.params?.transaction;
  const { categoriesOfType, getCategory, addTransaction, updateTransaction, removeTransaction, symbol } = useData();
  const { colors, theme, isDark } = useAuth();

  const [type, setType] = useState(editing?.type || 'expense');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [title, setTitle] = useState(editing?.title || '');
  const [categoryId, setCategoryId] = useState(editing?.categoryId || 'food');
  const [method, setMethod] = useState(editing?.paymentMethod || 'Cash');
  const [date, setDate] = useState(editing?.date ? new Date(editing.date) : new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Custom Alert State (Single & Confirmation দুটোর জন্য)
  const [alertData, setAlertData] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
    showCancel: false,
    confirmText: 'Okay, Got it',
    onConfirm: null,
  });

  const closeAlert = () => {
    setAlertData((prev) => ({ ...prev, visible: false, onConfirm: null }));
  };

  // theme string অথবা isDark boolean যেকোনো একটা থাকলেই সঠিকভাবে 'dark' / 'light' পাবে
  const activeTheme = theme === 'dark' || theme === 'light' ? theme : isDark ? 'dark' : 'light';

  useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit Transaction' : 'New Transaction' });
  }, [navigation, editing]);

  const cats = categoriesOfType(type);

  const changeType = (t) => {
    setType(t);
    setCategoryId(t === 'income' ? 'salary' : 'food');
  };

  const save = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      return setAlertData({
        visible: true,
        title: 'Invalid amount',
        message: 'Please enter a valid positive amount.',
        type: 'warning',
        showCancel: false,
        confirmText: 'Okay, Got it',
        onConfirm: null,
      });
    }
    const cat = getCategory(categoryId);
    const payload = {
      type,
      amount: value,
      title: title.trim(),
      categoryId,
      categoryName: cat.name,
      paymentMethod: method,
      date,
    };
    if (editing) updateTransaction(editing.id, payload);
    else addTransaction(payload);
    navigation.goBack();
  };

  const remove = () => {
    setAlertData({
      visible: true,
      title: 'Delete transaction',
      message: 'Are you sure you want to remove this entry?',
      type: 'error',
      showCancel: true,
      confirmText: 'Delete',
      onConfirm: () => {
        removeTransaction(editing.id);
        closeAlert();
        navigation.goBack();
      },
    });
  };

  const incomeColor = colors.income || '#059669';
  const expenseColor = colors.expense || '#DC2626';
  const accent = type === 'income' ? incomeColor : expenseColor;

  return (
    <Screen>
      <Segmented
        value={type}
        onChange={changeType}
        options={[
          { value: 'expense', label: 'Expense', color: expenseColor },
          { value: 'income', label: 'Income', color: incomeColor },
        ]}
      />
      <View style={{ height: 16 }} />
      <Input
        label={`Amount (${symbol})`}
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        style={{ fontSize: 24, fontWeight: '700' }}
      />
      <Input
        label="Title / Note"
        autoCapitalize="sentences"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Lunch, Internet bill"
      />

      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 }}>
        Category
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {cats.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            icon={c.icon}
            color={c.color}
            active={categoryId === c.id}
            onPress={() => setCategoryId(c.id)}
          />
        ))}
      </View>

      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 }}>
        Payment method
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {PAYMENT_METHODS.map((m) => (
          <Chip key={m} label={m} active={method === m} onPress={() => setMethod(m)} />
        ))}
      </View>

      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 }}>
        Date
      </Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.card,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 14,
          marginBottom: 8,
        }}
      >
        <Icon name="calendar" size={20} color={colors.primaryLight || colors.primary} />
        <Text style={{ color: colors.text, marginLeft: 10, fontSize: 15 }}>{formatDate(date)}</Text>
      </TouchableOpacity>

      {showPicker && (
        <View
          style={
            Platform.OS === 'ios'
              ? {
                  backgroundColor: colors.card,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 8,
                  marginBottom: 8,
                }
              : undefined
          }
        >
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            themeVariant={activeTheme}
            accentColor={colors.primaryLight || colors.primary}
            onChange={(e, d) => {
              setShowPicker(Platform.OS === 'ios');
              if (d) setDate(d);
            }}
          />
        </View>
      )}

      <View style={{ height: 16 }} />
      <Button title={editing ? 'Save Changes' : 'Add Transaction'} onPress={save} style={{ backgroundColor: accent }} />
      {editing && <Button title="Delete" variant="danger" onPress={remove} style={{ marginTop: 12 }} />}

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
        onConfirm={alertData.onConfirm}
        onClose={alertData.onConfirm || closeAlert}
      />
    </Screen>
  );
}
