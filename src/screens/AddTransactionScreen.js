

// import React, { useLayoutEffect, useState } from 'react';
// import { Platform, Text, TouchableOpacity, View } from 'react-native';
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

//   // Custom Alert State (Single & Confirmation দুটোর জন্য)
//   const [alertData, setAlertData] = useState({
//     visible: false,
//     title: '',
//     message: '',
//     type: 'warning',
//     showCancel: false,
//     confirmText: 'Okay, Got it',
//     onConfirm: null,
//   });

//   const closeAlert = () => {
//     setAlertData((prev) => ({ ...prev, visible: false, onConfirm: null }));
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
//       return setAlertData({
//         visible: true,
//         title: 'Invalid amount',
//         message: 'Please enter a valid positive amount.',
//         type: 'warning',
//         showCancel: false,
//         confirmText: 'Okay, Got it',
//         onConfirm: null,
//       });
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

//   const remove = () => {
//     setAlertData({
//       visible: true,
//       title: 'Delete transaction',
//       message: 'Are you sure you want to remove this entry?',
//       type: 'error',
//       showCancel: true,
//       confirmText: 'Delete',
//       onConfirm: () => {
//         removeTransaction(editing.id);
//         closeAlert();
//         navigation.goBack();
//       },
//     });
//   };

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
//                 backgroundColor: colors.card,
//                 borderRadius: radius.md,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//                 padding: 8,
//                 marginBottom: 8,
//               }
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
//         showCancel={alertData.showCancel}
//         confirmText={alertData.confirmText}
//         cancelText="Cancel"
//         onCancel={closeAlert}
//         onConfirm={alertData.onConfirm}
//         onClose={alertData.onConfirm || closeAlert}
//       />
//     </Screen>
//   );
// }







import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PAYMENT_METHODS } from '../constants/categories';
import { formatDate, formatMoney } from '../utils/format';
import CustomAlert from '../components/CustomAlert';

const PAYMENT_ICONS = {
  Cash: 'cash',
  Card: 'credit-card-outline',
  bKash: 'cellphone',
  Nagad: 'cellphone',
  Bank: 'bank-outline',
  Other: 'dots-horizontal-circle-outline',
};

const QUICK_AMOUNTS = [20, 30, 50, 100, 200];

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function AddTransactionScreen({ navigation, route }) {
  const editing = route.params?.transaction;
  const { categoriesOfType, getCategory, addTransaction, updateTransaction, removeTransaction, symbol } = useData();
  const { colors, theme, isDark } = useAuth();
  const insets = useSafeAreaInsets();

  const [type, setType] = useState(editing?.type || 'expense');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [title, setTitle] = useState(editing?.title || '');
  const [categoryId, setCategoryId] = useState(editing?.categoryId || 'food');
  const [method, setMethod] = useState(editing?.paymentMethod || 'Cash');
  const [date, setDate] = useState(editing?.date ? new Date(editing.date) : new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Custom Alert State (Single & Confirmation)
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

  // works with either a `theme` string or an `isDark` boolean
  const activeTheme = theme === 'dark' || theme === 'light' ? theme : isDark ? 'dark' : 'light';

  useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit Transaction' : 'New Transaction' });
  }, [navigation, editing]);

  const cats = categoriesOfType(type);

  const changeType = (t) => {
    if (t === type) return;
    setType(t);
    setCategoryId(t === 'income' ? 'salary' : 'food');
  };

  // keep only digits + one dot + max 2 decimals
  const onAmountChange = (txt) => {
    let v = txt.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    const i = v.indexOf('.');
    if (i !== -1) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/\./g, '').slice(0, 2);
    setAmount(v);
  };

  const addQuick = (v) => {
    const cur = parseFloat(amount) || 0;
    setAmount(String(Math.round((cur + v) * 100) / 100));
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
  const styles = createStyles(colors);

  // quick date helpers
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isToday = isSameDay(date, now);
  const isYesterday = isSameDay(date, yesterday);

  const amountValue = parseFloat(amount);
  const preview = amountValue > 0 ? ` · ${formatMoney(amountValue, symbol).replace(/\.00$/, '')}` : '';
  const saveLabel = editing ? 'Save Changes' : type === 'income' ? 'Add Income' : 'Add Expense';

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Expense / Income switch */}
        <TypeSwitch
          value={type}
          onChange={changeType}
          colors={colors}
          incomeColor={incomeColor}
          expenseColor={expenseColor}
        />

        {/* Amount hero */}
        <View style={[styles.hero, { borderColor: accent + '55' }]}>
          <Text style={styles.heroLabel}>{type === 'income' ? 'Income amount' : 'Expense amount'}</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.symbol, { color: accent }]}>{symbol}</Text>
            <TextInput
              value={amount}
              onChangeText={onAmountChange}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.dim}
              selectionColor={accent}
              autoFocus={!editing}
              style={[styles.amountInput, { color: colors.text }]}
            />
          </View>

          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map((q) => (
              <TouchableOpacity
                key={q}
                activeOpacity={0.75}
                onPress={() => addQuick(q)}
                style={[styles.quickChip, { backgroundColor: accent + '18', borderColor: accent + '40' }]}
              >
                <Text style={[styles.quickText, { color: accent }]}>+{q.toLocaleString('en-US')}</Text>
              </TouchableOpacity>
            ))}
            {amount.length > 0 && (
              <TouchableOpacity activeOpacity={0.75} onPress={() => setAmount('')} style={styles.clearChip}>
                <Icon name="close" size={13} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category grid */}
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.grid}>
          {cats.map((c) => {
            const active = categoryId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.8}
                onPress={() => setCategoryId(c.id)}
                style={styles.gridItem}
              >
                <View
                  style={[
                    styles.catCircle,
                    { backgroundColor: active ? c.color : c.color + '22', borderColor: active ? c.color : 'transparent' },
                  ]}
                >
                  <Icon name={c.icon} size={20} color={active ? '#FFFFFF' : c.color} />
                  {active && (
                    <View style={[styles.checkBadge, { backgroundColor: colors.card, borderColor: c.color }]}>
                      <Icon name="check" size={9} color={c.color} />
                    </View>
                  )}
                </View>
                <Text
                  numberOfLines={1}
                  style={[styles.catLabel, { color: active ? colors.text : colors.muted, fontWeight: active ? '700' : '500' }]}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Note */}
        <Text style={styles.sectionLabel}>Note</Text>
        <View style={styles.inputCard}>
          <Icon name="text-box-outline" size={18} color={colors.muted} />
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Lunch, Internet bill"
            placeholderTextColor={colors.dim}
            autoCapitalize="sentences"
            selectionColor={accent}
            style={styles.noteInput}
          />
        </View>

        {/* Payment method */}
        <Text style={styles.sectionLabel}>Payment method</Text>
        <View style={styles.methodRow}>
          {PAYMENT_METHODS.map((m) => {
            const active = method === m;
            return (
              <TouchableOpacity
                key={m}
                activeOpacity={0.8}
                onPress={() => setMethod(m)}
                style={[
                  styles.methodChip,
                  active && { backgroundColor: accent + '1F', borderColor: accent },
                ]}
              >
                <Icon name={PAYMENT_ICONS[m] || 'wallet-outline'} size={14} color={active ? accent : colors.muted} />
                <Text style={[styles.methodText, { color: active ? accent : colors.muted }]}>{m}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Date */}
        <Text style={styles.sectionLabel}>Date</Text>
        <View style={styles.methodRow}>
          <DateChip
            styles={styles}
            colors={colors}
            accent={accent}
            label="Today"
            active={isToday}
            onPress={() => {
              setDate(new Date());
              setShowPicker(false);
            }}
          />
          <DateChip
            styles={styles}
            colors={colors}
            accent={accent}
            label="Yesterday"
            active={isYesterday}
            onPress={() => {
              setDate(yesterday);
              setShowPicker(false);
            }}
          />
          <DateChip
            styles={styles}
            colors={colors}
            accent={accent}
            icon="calendar-month-outline"
            label={!isToday && !isYesterday ? formatDate(date) : 'Pick date'}
            active={!isToday && !isYesterday}
            onPress={() => setShowPicker(true)}
          />
        </View>

        {showPicker && (
          <View style={Platform.OS === 'ios' ? styles.iosPicker : undefined}>
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
      </ScrollView>

      {/* Sticky action bar */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {editing && (
          <TouchableOpacity activeOpacity={0.8} onPress={remove} style={styles.deleteBtn}>
            <Icon name="trash-can-outline" size={20} color={colors.expense} />
          </TouchableOpacity>
        )}
        <TouchableOpacity activeOpacity={0.85} onPress={save} style={[styles.saveBtn, { backgroundColor: accent }]}>
          <Icon name="check-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.saveText}>
            {saveLabel}
            {preview}
          </Text>
        </TouchableOpacity>
      </View>

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
    </KeyboardAvoidingView>
  );
}

/* ---------- small components ---------- */

// Expense / Income switch with a sliding thumb
function TypeSwitch({ value, onChange, colors, incomeColor, expenseColor }) {
  const [w, setW] = useState(0);
  const anim = useRef(new Animated.Value(value === 'income' ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value === 'income' ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 90,
    }).start();
  }, [value, anim]);

  const half = Math.max(0, (w - 8) / 2);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, half] });
  const thumbColor = value === 'income' ? incomeColor : expenseColor;

  const options = [
    { key: 'expense', label: 'Expense', icon: 'arrow-top-right' },
    { key: 'income', label: 'Income', icon: 'arrow-bottom-left' },
  ];

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={{
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 14,
      }}
    >
      {w > 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: half,
            height: 40,
            borderRadius: 11,
            backgroundColor: thumbColor,
            transform: [{ translateX }],
          }}
        />
      )}
      {options.map((o) => {
        const active = value === o.key;
        return (
          <TouchableOpacity
            key={o.key}
            activeOpacity={0.8}
            onPress={() => onChange(o.key)}
            style={{ flex: 1, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Icon name={o.icon} size={16} color={active ? '#FFFFFF' : colors.muted} />
            <Text style={{ color: active ? '#FFFFFF' : colors.muted, fontWeight: '700', fontSize: 13 }}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const DateChip = ({ styles, colors, accent, label, icon, active, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[styles.methodChip, active && { backgroundColor: accent + '1F', borderColor: accent }]}
  >
    {icon ? <Icon name={icon} size={14} color={active ? accent : colors.muted} /> : null}
    <Text style={[styles.methodText, { color: active ? accent : colors.muted }]}>{label}</Text>
  </TouchableOpacity>
);

const createStyles = (colors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 16, paddingBottom: 24 },

    hero: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1.5,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: 'center',
      marginBottom: 6,
    },
    heroLabel: { color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
    amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 6 },
    symbol: { fontSize: 22, fontWeight: '700', marginRight: 4 },
    amountInput: { fontSize: 24, fontWeight: '700', minWidth: 60, padding: 0 },
    quickRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
    quickChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1 },
    quickText: { fontSize: 12, fontWeight: '700' },
    clearChip: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.border,
    },

    sectionLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginTop: 16,
      marginBottom: 8,
    },

    grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
    gridItem: { width: '25%', alignItems: 'center', paddingHorizontal: 4, marginBottom: 12 },
    catCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    checkBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    catLabel: { fontSize: 11, marginTop: 5, textAlign: 'center' },

    inputCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
    },
    noteInput: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12, marginLeft: 8 },

    methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    methodChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    methodText: { fontSize: 12, fontWeight: '600' },

    iosPicker: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 8,
      marginTop: 10,
    },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 10,
      backgroundColor: colors.bg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    deleteBtn: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: (colors.expense || '#DC2626') + '18',
      borderWidth: 1,
      borderColor: (colors.expense || '#DC2626') + '55',
    },
    saveBtn: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    saveText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  });