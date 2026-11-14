

// import React, { useMemo, useState, useEffect } from 'react';
// import { Alert, Text, View, ScrollView, TouchableOpacity } from 'react-native';
// import { File, Paths } from 'expo-file-system';
// import * as Sharing from 'expo-sharing';
// import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';
// import Screen from '../components/Screen';
// import MonthSwitcher from '../components/MonthSwitcher';
// import { Button, Card, EmptyState, ProgressBar, SectionHeader } from '../components/ui';
// import { useData } from '../context/DataContext';
// import { colors } from '../constants/theme';
// import { formatMoney, sameMonth } from '../utils/format';
// import { expenseByCategory, lastMonths, totals } from '../utils/stats';
// import { buildCsv } from '../utils/csv';

// const CHART_H = 120;
// const LINE_CHART_H = 150;

// export default function ReportsScreen() {
//   const { transactions, symbol, getCategory } = useData();
//   const [month, setMonth] = useState(new Date());
//   const [busy, setBusy] = useState(false);
//   const [selectedPoint, setSelectedPoint] = useState(null);

//   // Filter transactions for the selected month
//   const monthTransactions = useMemo(() => {
//     return transactions.filter((t) => sameMonth(t.date, month));
//   }, [transactions, month]);

//   const { sum, cats, series } = useMemo(() => {
//     return {
//       sum: totals(monthTransactions),
//       cats: expenseByCategory(monthTransactions),
//       series: lastMonths(transactions, month, 6)
//     };
//   }, [transactions, month, monthTransactions]);

//   const savings = sum.income - sum.expense;
//   const maxBar = Math.max(1, ...series.flatMap((s) => [s.income, s.expense]));

//   // Calculate Daily Expenses for Line Chart with Dates
//   const dailyData = useMemo(() => {
//     const year = month.getFullYear();
//     const monthIndex = month.getMonth();
//     const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
//     const dailyMap = {};

//     for (let i = 1; i <= daysInMonth; i++) {
//       dailyMap[i] = 0;
//     }

//     monthTransactions.forEach(t => {
//       const isExpense = t.type === 'expense' || Number(t.amount) < 0;
//       if (isExpense && t.date) {
//         const day = new Date(t.date).getDate();
//         if (day >= 1 && day <= daysInMonth) {
//           dailyMap[day] = (dailyMap[day] || 0) + Math.abs(Number(t.amount) || 0);
//         }
//       }
//     });

//     return Object.keys(dailyMap).map(day => {
//       const dNum = Number(day);
//       const dateObj = new Date(year, monthIndex, dNum);
//       return {
//         day: dNum,
//         amount: dailyMap[day],
//         dateStr: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
//       };
//     });
//   }, [monthTransactions, month]);

//   // Reset or set default selected point when month changes
//   useEffect(() => {
//     const activeDays = dailyData.filter(d => d.amount > 0);
//     if (activeDays.length > 0) {
//       // Default select the latest day with expense or max expense day
//       const highestDay = activeDays.reduce((max, curr) => curr.amount > max.amount ? curr : max, activeDays[0]);
//       setSelectedPoint(highestDay);
//     } else {
//       setSelectedPoint(null);
//     }
//   }, [month, dailyData]);

//   const maxDailyExpense = Math.max(1, ...dailyData.map(d => d.amount));
//   const hasDailyExpense = dailyData.some(d => d.amount > 0);

//   // Calculate Daily Average & Peak
//   const totalDaysWithExpense = dailyData.filter(d => d.amount > 0).length;
//   const dailyAvg = totalDaysWithExpense > 0 ? sum.expense / totalDaysWithExpense : 0;

//   // Generate SVG Coordinates & Paths
//   const { linePath, areaPath, points } = useMemo(() => {
//     const width = 320;
//     const height = LINE_CHART_H - 30;
//     const stepX = width / (dailyData.length - 1 || 1);

//     let path = '';
//     const pts = dailyData.map((d, index) => {
//       const x = index * stepX;
//       const y = height - (d.amount / maxDailyExpense) * (height - 20) - 5;
//       if (index === 0) {
//         path += `M ${x} ${y}`;
//       } else {
//         path += ` L ${x} ${y}`;
//       }
//       return { x, y, ...d };
//     });

//     const area = `${path} L 320 ${height + 10} L 0 ${height + 10} Z`;
//     return { linePath: path, areaPath: area, points: pts };
//   }, [dailyData, maxDailyExpense]);

//   const exportCsv = async () => {
//     if (transactions.length === 0) return Alert.alert('Nothing to export', 'Add some transactions first.');
//     setBusy(true);
//     try {
//       const file = new File(Paths.cache, `expenses-${Date.now()}.csv`);
//       file.create({ overwrite: true });
//       file.write(buildCsv(transactions, getCategory));
//       if (await Sharing.isAvailableAsync()) {
//         await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Export transactions' });
//       } else {
//         Alert.alert('Saved', file.uri);
//       }
//     } catch (e) {
//       Alert.alert('Export failed', e.message);
//     }
//     setBusy(false);
//   };

//   return (
//     <Screen>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <MonthSwitcher date={month} onChange={setMonth} />

//         {/* Financial Overview Card */}
//         <Card>
//           <Row label="Income" value={`+${formatMoney(sum.income, symbol)}`} color={colors.income} />
//           <Row label="Expense" value={`-${formatMoney(sum.expense, symbol)}`} color={colors.expense} />
//           <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />
//           <Row label="Net Savings" value={formatMoney(savings, symbol)} color={savings >= 0 ? colors.primaryLight : colors.expense} bold />
//           {sum.income > 0 && (
//             <Text style={{ color: colors.dim, fontSize: 12, marginTop: 6 }}>
//               You saved {Math.max(0, (savings / sum.income) * 100).toFixed(0)}% of your income this month.
//             </Text>
//           )}
//         </Card>

//         {/* Interactive Daily Spending Trend Chart */}
//         <SectionHeader title="Daily spending trend" />
//         <Card>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
//             <Text style={{ color: colors.muted, fontSize: 12 }}>
//               Tap any point on chart to inspect date
//             </Text>
//             <Text style={{ color: colors.muted, fontSize: 11 }}>
//               Avg: {formatMoney(dailyAvg, symbol)}/day
//             </Text>
//           </View>

//           {/* Interactive Inspection Detail Banner */}
//           <View style={{
//             backgroundColor: colors.background || '#151922',
//             padding: 12,
//             borderRadius: 10,
//             marginBottom: 12,
//             borderWidth: 1,
//             borderColor: colors.border,
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//             alignItems: 'center'
//           }}>
//             <View>
//               <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '500' }}>
//                 {selectedPoint ? selectedPoint.dateStr : 'Selected Date'}
//               </Text>
//               <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 2 }}>
//                 {selectedPoint ? formatMoney(selectedPoint.amount, symbol) : formatMoney(0, symbol)}
//               </Text>
//             </View>
//             {selectedPoint && selectedPoint.amount > 0 && (
//               <View style={{ backgroundColor: colors.expense + '25', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 }}>
//                 <Text style={{ color: colors.expense, fontSize: 11, fontWeight: '600' }}>
//                   Day {selectedPoint.day} of Month
//                 </Text>
//               </View>
//             )}
//           </View>

//           {!hasDailyExpense ? (
//             <View style={{ height: LINE_CHART_H, justifyContent: 'center', alignItems: 'center' }}>
//               <Text style={{ color: colors.muted, fontSize: 13 }}>No expense data for this month</Text>
//             </View>
//           ) : (
//             <View style={{ alignItems: 'center' }}>
//               <Svg height={LINE_CHART_H} width="100%" viewBox="0 0 320 150">
//                 <Defs>
//                   <LinearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
//                     <Stop offset="0%" stopColor={colors.expense} stopOpacity="0.4" />
//                     <Stop offset="100%" stopColor={colors.expense} stopOpacity="0.0" />
//                   </LinearGradient>
//                 </Defs>

//                 {/* Background Grid Lines */}
//                 <Line x1="0" y1="30" x2="320" y2="30" stroke={colors.border} strokeDasharray="4 4" strokeWidth="0.8" />
//                 <Line x1="0" y1="70" x2="320" y2="70" stroke={colors.border} strokeDasharray="4 4" strokeWidth="0.8" />
//                 <Line x1="0" y1="110" x2="320" y2="110" stroke={colors.border} strokeDasharray="4 4" strokeWidth="0.8" />

//                 {/* Gradient Area under curve */}
//                 <Path d={areaPath} fill="url(#expenseGrad)" />

//                 {/* Main Curve Line */}
//                 <Path
//                   d={linePath}
//                   fill="none"
//                   stroke={colors.expense}
//                   strokeWidth="2.5"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />

//                 {/* Interactive Touch/Click Circles */}
//                 {points.map((p) => {
//                   const isSelected = selectedPoint && selectedPoint.day === p.day;
//                   return (
//                     <Circle
//                       key={p.day}
//                       cx={p.x}
//                       cy={p.y}
//                       r={isSelected ? 6 : p.amount > 0 ? 3.5 : 2}
//                       fill={isSelected ? colors.primaryLight : p.amount > 0 ? colors.expense : colors.border}
//                       stroke="#ffffff"
//                       strokeWidth={isSelected ? 2 : 1}
//                       onPress={() => setSelectedPoint(p)}
//                     />
//                   );
//                 })}
//               </Svg>

//               {/* Axis Labels */}
//               <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 6, paddingHorizontal: 4 }}>
//                 <Text style={{ color: colors.muted, fontSize: 10 }}>1st</Text>
//                 <Text style={{ color: colors.muted, fontSize: 10 }}>Mid (15th)</Text>
//                 <Text style={{ color: colors.muted, fontSize: 10 }}>End ({dailyData.length}th)</Text>
//               </View>
//             </View>
//           )}
//         </Card>

//         {/* Last 6 Months Comparison */}
//         <SectionHeader title="Last 6 months" />
//         <Card>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: CHART_H + 24 }}>
//             {series.map((s, i) => (
//               <View key={i} style={{ flex: 1, alignItems: 'center' }}>
//                 <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: CHART_H, gap: 3 }}>
//                   <View style={{ width: 12, height: Math.max(2, (s.income / maxBar) * CHART_H), backgroundColor: colors.income, borderRadius: 3 }} />
//                   <View style={{ width: 12, height: Math.max(2, (s.expense / maxBar) * CHART_H), backgroundColor: colors.expense, borderRadius: 3 }} />
//                 </View>
//                 <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6 }}>{s.label}</Text>
//               </View>
//             ))}
//           </View>
//           <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 }}>
//             <Legend color={colors.income} label="Income" />
//             <Legend color={colors.expense} label="Expense" />
//           </View>
//         </Card>

//         {/* Spending by Category */}
//         <SectionHeader title="Spending by category" />
//         {cats.length === 0 ? (
//           <EmptyState icon="chart-pie" title="No expenses this month" />
//         ) : (
//           <Card>
//             {cats.map((c, i) => {
//               const cat = getCategory(c.id, c.name);
//               const pct = sum.expense ? (c.total / sum.expense) * 100 : 0;
//               return (
//                 <View key={c.id} style={{ marginBottom: i === cats.length - 1 ? 0 : 14 }}>
//                   <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//                     <Text style={{ color: colors.text, fontSize: 14 }}>{cat.name}</Text>
//                     <Text style={{ color: colors.muted, fontSize: 13 }}>
//                       {formatMoney(c.total, symbol)} · {pct.toFixed(0)}%
//                     </Text>
//                   </View>
//                   <View style={{ marginTop: 6 }}>
//                     <ProgressBar value={pct / 100} color={cat.color} />
//                   </View>
//                 </View>
//               );
//             })}
//           </Card>
//         )}

//         <View style={{ marginTop: 10, marginBottom: 25 }}>
//           <Button title="Export all as CSV" icon="file-export-outline" variant="secondary" onPress={exportCsv} loading={busy} />
//         </View>
//       </ScrollView>
//     </Screen>
//   );
// }

// const Row = ({ label, value, color, bold }) => (
//   <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 }}>
//     <Text style={{ color: colors.muted, fontSize: bold ? 15 : 14 }}>{label}</Text>
//     <Text style={{ color, fontSize: bold ? 18 : 15, fontWeight: '700' }}>{value}</Text>
//   </View>
// );

// const Legend = ({ color, label }) => (
//   <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//     <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 6 }} />
//     <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
//   </View>
// );




import React, { useMemo, useState, useEffect } from 'react';
import { Alert, Text, View, ScrollView } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';
import Screen from '../components/Screen';
import MonthSwitcher from '../components/MonthSwitcher';
import { Button, Card, EmptyState, ProgressBar, SectionHeader } from '../components/ui';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatMoney, sameMonth } from '../utils/format';
import { expenseByCategory, lastMonths, totals } from '../utils/stats';
import { buildCsv } from '../utils/csv';

const CHART_H = 120;
const LINE_CHART_H = 150;

export default function ReportsScreen() {
  const { transactions, symbol, getCategory } = useData();
  const { colors } = useAuth();
  const [month, setMonth] = useState(new Date());
  const [busy, setBusy] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Filter transactions for the selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => sameMonth(t.date, month));
  }, [transactions, month]);

  const { sum, cats, series } = useMemo(() => {
    return {
      sum: totals(monthTransactions),
      cats: expenseByCategory(monthTransactions),
      series: lastMonths(transactions, month, 6),
    };
  }, [transactions, month, monthTransactions]);

  const savings = sum.income - sum.expense;
  const maxBar = Math.max(1, ...series.flatMap((s) => [s.income, s.expense]));

  // Calculate Daily Expenses for Line Chart with Dates
  const dailyData = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const dailyMap = {};

    for (let i = 1; i <= daysInMonth; i++) {
      dailyMap[i] = 0;
    }

    monthTransactions.forEach((t) => {
      const isExpense = t.type === 'expense' || Number(t.amount) < 0;
      if (isExpense && t.date) {
        const day = new Date(t.date).getDate();
        if (day >= 1 && day <= daysInMonth) {
          dailyMap[day] = (dailyMap[day] || 0) + Math.abs(Number(t.amount) || 0);
        }
      }
    });

    return Object.keys(dailyMap).map((day) => {
      const dNum = Number(day);
      const dateObj = new Date(year, monthIndex, dNum);
      return {
        day: dNum,
        amount: dailyMap[day],
        dateStr: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
    });
  }, [monthTransactions, month]);

  // Reset or set default selected point when month changes
  useEffect(() => {
    const activeDays = dailyData.filter((d) => d.amount > 0);
    if (activeDays.length > 0) {
      const highestDay = activeDays.reduce((max, curr) => (curr.amount > max.amount ? curr : max), activeDays[0]);
      setSelectedPoint(highestDay);
    } else {
      setSelectedPoint(null);
    }
  }, [month, dailyData]);

  const maxDailyExpense = Math.max(1, ...dailyData.map((d) => d.amount));
  const hasDailyExpense = dailyData.some((d) => d.amount > 0);

  // Calculate Daily Average
  const totalDaysWithExpense = dailyData.filter((d) => d.amount > 0).length;
  const dailyAvg = totalDaysWithExpense > 0 ? sum.expense / totalDaysWithExpense : 0;

  // Generate SVG Coordinates & Paths
  const { linePath, areaPath, points } = useMemo(() => {
    const width = 320;
    const height = LINE_CHART_H - 30;
    const stepX = width / (dailyData.length - 1 || 1);

    let path = '';
    const pts = dailyData.map((d, index) => {
      const x = index * stepX;
      const y = height - (d.amount / maxDailyExpense) * (height - 20) - 5;
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
      return { x, y, ...d };
    });

    const area = `${path} L 320 ${height + 10} L 0 ${height + 10} Z`;
    return { linePath: path, areaPath: area, points: pts };
  }, [dailyData, maxDailyExpense]);

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

  const exportPdf = async () => {
    if (transactions.length === 0) return Alert.alert('Nothing to export', 'Add some transactions first.');
    setExportingPdf(true);
    try {
      const monthName = month.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #1E293B; background: #F8FAFC; }
              .header { text-align: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 15px; margin-bottom: 20px; }
              .header h1 { margin: 0; color: #0F172A; font-size: 22px; }
              .header p { margin: 5px 0 0; color: #64748B; font-size: 13px; }
              .section { background: #FFFFFF; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #E2E8F0; }
              .section h3 { margin-top: 0; color: #334155; border-bottom: 1px solid #F1F5F9; padding-bottom: 6px; font-size: 14px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
              .label { font-weight: bold; color: #475569; }
              .value { color: #0F172A; }
              table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
              th, td { border: 1px solid #CBD5E1; padding: 8px; text-align: left; }
              th { background-color: #F1F5F9; color: #334155; }
              .footer { text-align: center; font-size: 10px; color: #94A3B8; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Financial Report</h1>
              <p>${monthName}</p>
            </div>

            <div class="section">
              <h3>Monthly Summary</h3>
              <div class="row"><span class="label">Total Income:</span> <span class="value">${formatMoney(sum.income, symbol)}</span></div>
              <div class="row"><span class="label">Total Expense:</span> <span class="value">${formatMoney(sum.expense, symbol)}</span></div>
              <div class="row"><span class="label">Net Savings:</span> <span class="value">${formatMoney(savings, symbol)}</span></div>
            </div>

            <div class="section">
              <h3>Transactions (${monthTransactions.length})</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    monthTransactions.length > 0
                      ? monthTransactions
                          .map(
                            (t) => `
                        <tr>
                          <td>${t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</td>
                          <td style="text-transform: uppercase;">${t.type}</td>
                          <td>${formatMoney(t.amount, symbol)}</td>
                        </tr>
                      `
                          )
                          .join('')
                      : '<tr><td colspan="3" style="text-align: center;">No transactions for this month.</td></tr>'
                  }
                </tbody>
              </table>
            </div>

            <div class="footer">
              <p>Expense Tracker App &bull; Report generated on ${new Date().toLocaleDateString()}</p>
            </div>
          </body>
        </html>
      `;

      // 1) Generate the PDF and ask for its data as base64 (we never read the printed file)
      const printed = await Print.printToFileAsync({ html: htmlContent, base64: true });
      if (!printed?.base64) throw new Error('Failed to generate PDF data.');

      // 2) Write the PDF into our own cache folder (same place the CSV uses)
      const pdfFile = new File(Paths.cache, `report-${Date.now()}.pdf`);
      pdfFile.create({ overwrite: true });
      pdfFile.write(printed.base64, { encoding: 'base64' });

      // 3) Share / save
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfFile.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Financial Report PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF Saved', `File saved to: ${pdfFile.uri}`);
      }
    } catch (e) {
      console.error('PDF Export Error:', e);
      Alert.alert('Export Failed', e.message || 'Could not generate PDF report.');
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <MonthSwitcher date={month} onChange={setMonth} />

        {/* Financial Overview Card */}
        <Card>
          <Row label="Income" value={`+${formatMoney(sum.income, symbol)}`} color={colors.income} textColor={colors.text} />
          <Row label="Expense" value={`-${formatMoney(sum.expense, symbol)}`} color={colors.expense} textColor={colors.text} />
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />
          <Row
            label="Net Savings"
            value={formatMoney(savings, symbol)}
            color={savings >= 0 ? colors.primaryLight : colors.expense}
            textColor={colors.text}
            bold
          />
          {sum.income > 0 && (
            <Text style={{ color: colors.text, opacity: 0.8, fontSize: 12, marginTop: 6, fontWeight: '500' }}>
              You saved {Math.max(0, (savings / sum.income) * 100).toFixed(0)}% of your income this month.
            </Text>
          )}
        </Card>

        {/* Interactive Daily Spending Trend Chart */}
        <SectionHeader title="Daily spending trend" />
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ color: colors.text, opacity: 0.8, fontSize: 12, fontWeight: '500' }}>
              Tap any point on chart to inspect date
            </Text>
            <Text style={{ color: colors.text, opacity: 0.8, fontSize: 11, fontWeight: '600' }}>
              Avg: {formatMoney(dailyAvg, symbol)}/day
            </Text>
          </View>

          {/* Interactive Inspection Detail Banner */}
          <View
            style={{
              backgroundColor: colors.card,
              padding: 12,
              borderRadius: 10,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <Text style={{ color: colors.text, opacity: 0.7, fontSize: 11, fontWeight: '600' }}>
                {selectedPoint ? selectedPoint.dateStr : 'Selected Date'}
              </Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 2 }}>
                {selectedPoint ? formatMoney(selectedPoint.amount, symbol) : formatMoney(0, symbol)}
              </Text>
            </View>
            {selectedPoint && selectedPoint.amount > 0 && (
              <View style={{ backgroundColor: colors.expense + '25', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 }}>
                <Text style={{ color: colors.expense, fontSize: 11, fontWeight: '700' }}>
                  Day {selectedPoint.day} of Month
                </Text>
              </View>
            )}
          </View>

          {!hasDailyExpense ? (
            <View style={{ height: LINE_CHART_H, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: colors.text, opacity: 0.7, fontSize: 13, fontWeight: '500' }}>
                No expense data for this month
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Svg height={LINE_CHART_H} width="100%" viewBox="0 0 320 150">
                <Defs>
                  <LinearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={colors.expense} stopOpacity="0.4" />
                    <Stop offset="100%" stopColor={colors.expense} stopOpacity="0.0" />
                  </LinearGradient>
                </Defs>

                {/* Background Grid Lines */}
                <Line x1="0" y1="30" x2="320" y2="30" stroke={colors.border} strokeDasharray="4 4" strokeWidth="0.8" />
                <Line x1="0" y1="70" x2="320" y2="70" stroke={colors.border} strokeDasharray="4 4" strokeWidth="0.8" />
                <Line x1="0" y1="110" x2="320" y2="110" stroke={colors.border} strokeDasharray="4 4" strokeWidth="0.8" />

                {/* Gradient Area under curve */}
                <Path d={areaPath} fill="url(#expenseGrad)" />

                {/* Main Curve Line */}
                <Path
                  d={linePath}
                  fill="none"
                  stroke={colors.expense}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Touch/Click Circles */}
                {points.map((p) => {
                  const isSelected = selectedPoint && selectedPoint.day === p.day;
                  return (
                    <Circle
                      key={p.day}
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 6 : p.amount > 0 ? 3.5 : 2}
                      fill={isSelected ? colors.primaryLight : p.amount > 0 ? colors.expense : colors.border}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 2 : 1}
                      onPress={() => setSelectedPoint(p)}
                    />
                  );
                })}
              </Svg>

              {/* Axis Labels */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 6, paddingHorizontal: 4 }}>
                <Text style={{ color: colors.text, opacity: 0.7, fontSize: 10, fontWeight: '600' }}>1st</Text>
                <Text style={{ color: colors.text, opacity: 0.7, fontSize: 10, fontWeight: '600' }}>Mid (15th)</Text>
                <Text style={{ color: colors.text, opacity: 0.7, fontSize: 10, fontWeight: '600' }}>
                  End ({dailyData.length}th)
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Last 6 Months Comparison */}
        <SectionHeader title="Last 6 months" />
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: CHART_H + 24 }}>
            {series.map((s, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: CHART_H, gap: 3 }}>
                  <View
                    style={{
                      width: 12,
                      height: Math.max(2, (s.income / maxBar) * CHART_H),
                      backgroundColor: colors.income,
                      borderRadius: 3,
                    }}
                  />
                  <View
                    style={{
                      width: 12,
                      height: Math.max(2, (s.expense / maxBar) * CHART_H),
                      backgroundColor: colors.expense,
                      borderRadius: 3,
                    }}
                  />
                </View>
                <Text style={{ color: colors.text, opacity: 0.8, fontSize: 11, marginTop: 6, fontWeight: '600' }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 }}>
            <Legend color={colors.income} label="Income" textColor={colors.text} />
            <Legend color={colors.expense} label="Expense" textColor={colors.text} />
          </View>
        </Card>

        {/* Spending by Category */}
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
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>{cat.name}</Text>
                    <Text style={{ color: colors.text, opacity: 0.8, fontSize: 13, fontWeight: '600' }}>
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

        {/* Export Buttons */}
        <View style={{ marginTop: 10, marginBottom: 25, gap: 10 }}>
          <Button title="Export Report as PDF" icon="file-pdf-box" variant="secondary" onPress={exportPdf} loading={exportingPdf} />
          <Button title="Export all as CSV" icon="file-export-outline" variant="secondary" onPress={exportCsv} loading={busy} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const Row = ({ label, value, color, bold, textColor }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 }}>
    <Text style={{ color: textColor, opacity: 0.8, fontSize: bold ? 15 : 14, fontWeight: bold ? '600' : '500' }}>{label}</Text>
    <Text style={{ color, fontSize: bold ? 18 : 15, fontWeight: '700' }}>{value}</Text>
  </View>
);

const Legend = ({ color, label, textColor }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 6 }} />
    <Text style={{ color: textColor, opacity: 0.8, fontSize: 12, fontWeight: '500' }}>{label}</Text>
  </View>
);