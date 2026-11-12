import React, { useLayoutEffect, useState } from 'react';
import { Alert, Platform, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Button, Chip, Input, Segmented } from '../components/ui';
import { useData } from '../context/DataContext';
import { colors, radius } from '../constants/theme';
import { PAYMENT_METHODS } from '../constants/categories';
import { formatDate } from '../utils/format';

export default function AddTransactionScreen({ navigation, route }) {
  const editing = route.params?.transaction;
  const { categoriesOfType, getCategory, addTransaction, updateTransaction, removeTransaction, symbol } = useData();

  const [type, setType] = useState(editing?.type || 'expense');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [title, setTitle] = useState(editing?.title || '');
  const [categoryId, setCategoryId] = useState(editing?.categoryId || 'food');
  const [method, setMethod] = useState(editing?.paymentMethod || 'Cash');
  const [date, setDate] = useState(editing?.date || new Date());
  const [showPicker, setShowPicker] = useState(false);

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
    if (isNaN(value) || value <= 0) return Alert.alert('Invalid amount', 'Please enter a valid positive amount.');
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

  const remove = () =>
    Alert.alert('Delete transaction', 'Are you sure you want to remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeTransaction(editing.id);
          navigation.goBack();
        },
      },
    ]);

  const accent = type === 'income' ? '#059669' : '#DC2626';

  return (
    <Screen>
      <Segmented
        value={type}
        onChange={changeType}
        options={[
          { value: 'expense', label: 'Expense', color: '#DC2626' },
          { value: 'income', label: 'Income', color: '#059669' },
        ]}
      />
      <View style={{ height: 16 }} />
      <Input label={`Amount (${symbol})`} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} placeholder="0.00" style={{ fontSize: 24, fontWeight: '700' }} />
      <Input label="Title / Note" autoCapitalize="sentences" value={title} onChangeText={setTitle} placeholder="e.g. Lunch, Internet bill" />

      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 }}>Category</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {cats.map((c) => (
          <Chip key={c.id} label={c.name} icon={c.icon} color={c.color} active={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
        ))}
      </View>

      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 }}>Payment method</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {PAYMENT_METHODS.map((m) => (
          <Chip key={m} label={m} active={method === m} onPress={() => setMethod(m)} />
        ))}
      </View>

      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 }}>Date</Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 8 }}
      >
        <Icon name="calendar" size={20} color={colors.primaryLight} />
        <Text style={{ color: colors.text, marginLeft: 10, fontSize: 15 }}>{formatDate(date)}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          themeVariant="dark"
          onChange={(e, d) => {
            setShowPicker(Platform.OS === 'ios');
            if (d) setDate(d);
          }}
        />
      )}

      <View style={{ height: 16 }} />
      <Button title={editing ? 'Save Changes' : 'Add Transaction'} onPress={save} style={{ backgroundColor: accent }} />
      {editing && <Button title="Delete" variant="danger" onPress={remove} style={{ marginTop: 12 }} />}
    </Screen>
  );
}
