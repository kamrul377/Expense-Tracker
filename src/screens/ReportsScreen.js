import React, { useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Screen from '../components/Screen';
import MonthSwitcher from '../components/MonthSwitcher';
import { Button, Card, EmptyState, ProgressBar, SectionHeader } from '../components/ui';
import { useData } from '../context/DataContext';
import { colors } from '../constants/theme';
import { formatMoney, sameMonth } from '../utils/format';
import { expenseByCategory, lastMonths, totals } from '../utils/stats';
import { buildCsv } from '../utils/csv';

const CHART_H = 120;

export default function ReportsScreen() {
  const { transactions, symbol, getCategory } = useData();
  const [month, setMonth] = useState(new Date());
  const [busy, setBusy] = useState(false);

  const { sum, cats, series } = useMemo(() => {
    const list = transactions.filter((t) => sameMonth(t.date, month));
    return { sum: totals(list), cats: expenseByCategory(list), series: lastMonths(transactions, month, 6) };
  }, [transactions, month]);

  const savings = sum.income - sum.expense;
  const maxBar = Math.max(1, ...series.flatMap((s) => [s.income, s.expense]));

  const exportCsv = async () => {
    if (transactions.length === 0) return Alert.alert('Nothing to export', 'Add some transactions first.');
    setBusy(true);
    try {
      const file = new File(Paths.cache, `expenses-${Date.now()}.csv`);
      file.create({ overwrite: true });
      file.write(buildCsv(transactions, getCategory));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Export transactions' });
      } else {
        Alert.alert('Saved', file.uri);
      }
    } catch (e) {
      Alert.alert('Export failed', e.message);
    }
    setBusy(false);
  };

  return (
    <Screen>
      <MonthSwitcher date={month} onChange={setMonth} />

      <Card>
        <Row label="Income" value={`+${formatMoney(sum.income, symbol)}`} color={colors.income} />
        <Row label="Expense" value={`-${formatMoney(sum.expense, symbol)}`} color={colors.expense} />
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />
        <Row label="Savings" value={formatMoney(savings, symbol)} color={savings >= 0 ? colors.primaryLight : colors.expense} bold />
        {sum.income > 0 && (
          <Text style={{ color: colors.dim, fontSize: 12, marginTop: 6 }}>
            You saved {Math.max(0, (savings / sum.income) * 100).toFixed(0)}% of your income this month.
          </Text>
        )}
      </Card>

      <SectionHeader title="Last 6 months" />
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: CHART_H + 24 }}>
          {series.map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: CHART_H, gap: 3 }}>
                <View style={{ width: 12, height: Math.max(2, (s.income / maxBar) * CHART_H), backgroundColor: colors.income, borderRadius: 3 }} />
                <View style={{ width: 12, height: Math.max(2, (s.expense / maxBar) * CHART_H), backgroundColor: colors.expense, borderRadius: 3 }} />
              </View>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6 }}>{s.label}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 }}>
          <Legend color={colors.income} label="Income" />
          <Legend color={colors.expense} label="Expense" />
        </View>
      </Card>

      <SectionHeader title="Spending by category" />
      {cats.length === 0 ? (
        <EmptyState icon="chart-pie" title="No expenses this month" />
      ) : (
        <Card>
          {cats.map((c, i) => {
            const cat = getCategory(c.id, c.name);
            const pct = sum.expense ? (c.total / sum.expense) * 100 : 0;
            return (
              <View key={c.id} style={{ marginBottom: i === cats.length - 1 ? 0 : 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text, fontSize: 14 }}>{cat.name}</Text>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>
                    {formatMoney(c.total, symbol)} · {pct.toFixed(0)}%
                  </Text>
                </View>
                <View style={{ marginTop: 6 }}>
                  <ProgressBar value={pct / 100} color={cat.color} />
                </View>
              </View>
            );
          })}
        </Card>
      )}

      <Button title="Export all as CSV" icon="file-export-outline" variant="secondary" onPress={exportCsv} loading={busy} />
    </Screen>
  );
}

const Row = ({ label, value, color, bold }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 }}>
    <Text style={{ color: colors.muted, fontSize: bold ? 15 : 14 }}>{label}</Text>
    <Text style={{ color, fontSize: bold ? 18 : 15, fontWeight: '700' }}>{value}</Text>
  </View>
);

const Legend = ({ color, label }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 6 }} />
    <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
  </View>
);
