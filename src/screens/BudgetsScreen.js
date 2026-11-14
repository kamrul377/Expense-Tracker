import React, { useMemo, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Button, Card, Input, ProgressBar } from '../components/ui';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { radius } from '../constants/theme';
import { formatMoney, monthLabel, sameMonth } from '../utils/format';
import CustomAlert from '../components/CustomAlert';

export default function BudgetsScreen() {
  const { transactions, budgets, categoriesOfType, symbol, setBudget, removeBudget } = useData();
  const { colors } = useAuth(); // Dynamic colors hook theke niya holo

  const [editing, setEditing] = useState(null); // { id, name }
  const [value, setValue] = useState('');

  // Custom Alert State
  const [alertData, setAlertData] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
  });

  const showAlert = (title, message, type = 'warning') => {
    setAlertData({ visible: true, title, message, type });
  };

  const spent = useMemo(() => {
    const now = new Date();
    const map = { overall: 0 };
    transactions.forEach((t) => {
      if (t.type !== 'expense' || !sameMonth(t.date, now)) return;
      map.overall += t.amount;
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    });
    return map;
  }, [transactions]);

  const open = (id, name) => {
    setEditing({ id, name });
    setValue(budgets[id] ? String(budgets[id]) : '');
  };

  const save = () => {
    const n = parseFloat(value);
    if (isNaN(n) || n <= 0) {
      return showAlert('Invalid amount', 'Enter a valid budget amount.', 'warning');
    }
    setBudget(editing.id, n);
    setEditing(null);
  };

  const remove = () => {
    removeBudget(editing.id);
    setEditing(null);
  };

  const row = (id, name, icon, color) => {
    const limit = budgets[id];
    const s = spent[id] || 0;
    const ratio = limit ? s / limit : 0;
    const barColor = ratio > 1 ? colors.expense : ratio > 0.8 ? colors.warn : colors.income;
    return (
      <TouchableOpacity key={id} activeOpacity={0.8} onPress={() => open(id, name)}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: limit ? 10 : 0 }}>
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: color + '26', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={icon} size={20} color={color} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>{name}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                {limit ? `${formatMoney(s, symbol)} of ${formatMoney(limit, symbol)}` : `Spent ${formatMoney(s, symbol)} · tap to set budget`}
              </Text>
            </View>
            <Icon name="pencil-outline" size={18} color={colors.dim} />
          </View>
          {limit ? (
            <>
              <ProgressBar value={ratio} color={barColor} />
              <Text style={{ color: barColor, fontSize: 12, marginTop: 6 }}>
                {ratio > 1
                  ? `Over by ${formatMoney(s - limit, symbol)}`
                  : `${formatMoney(limit - s, symbol)} left (${(ratio * 100).toFixed(0)}% used)`}
              </Text>
            </>
          ) : null}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <Text style={{ color: colors.muted, marginBottom: 12, fontWeight: '600' }}>{monthLabel(new Date())} · tap a card to set a monthly limit</Text>
      {row('overall', 'Overall Budget', 'wallet', colors.primaryLight)}
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginVertical: 8 }}>By category</Text>
      {categoriesOfType('expense').map((c) => row(c.id, c.name, c.icon, c.color))}

      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 14 }}>
              Monthly budget · {editing?.name}
            </Text>
            <Input label={`Limit (${symbol})`} keyboardType="decimal-pad" value={value} onChangeText={setValue} placeholder="e.g. 5000" />
            <Button title="Save" onPress={save} />
            {editing && budgets[editing.id] ? <Button title="Remove budget" variant="danger" onPress={remove} style={{ marginTop: 10 }} /> : null}
            <Button title="Cancel" variant="secondary" onPress={() => setEditing(null)} style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>

      {/* Custom Animated Alert Modal */}
      <CustomAlert
        visible={alertData.visible}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        onClose={() => setAlertData({ ...alertData, visible: false })}
      />
    </Screen>
  );
}