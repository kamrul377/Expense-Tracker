// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import { colors, radius } from '../constants/theme';
// import { formatDate, formatMoney } from '../utils/format';

// export default function TransactionItem({ item, category, symbol, onPress, onLongPress }) {
//   const income = item.type === 'income';
//   return (
//     <TouchableOpacity activeOpacity={0.8} onPress={onPress} onLongPress={onLongPress} style={styles.card}>
//       <View style={[styles.icon, { backgroundColor: category.color + '26' }]}>
//         <Icon name={category.icon} size={22} color={category.color} />
//       </View>
//       <View style={{ flex: 1, paddingHorizontal: 12 }}>
//         <Text style={styles.title} numberOfLines={1}>{item.title || category.name}</Text>
//         <Text style={styles.meta} numberOfLines={1}>
//           {category.name} · {item.paymentMethod} · {formatDate(item.date)}
//         </Text>
//       </View>
//       <Text style={[styles.amount, { color: income ? colors.income : colors.expense }]}>
//         {income ? '+' : '-'}{formatMoney(item.amount, symbol)}
//       </Text>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: colors.card, borderRadius: radius.md, padding: 12, marginBottom: 10,
//     flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border,
//   },
//   icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
//   title: { color: colors.text, fontSize: 15, fontWeight: '600' },
//   meta: { color: colors.muted, fontSize: 12, marginTop: 3 },
//   amount: { fontSize: 15, fontWeight: '700' },
// });




import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { radius } from '../constants/theme';
import { formatDate, formatMoney } from '../utils/format';

export default function TransactionItem({ item, category, symbol, onPress, onLongPress }) {
  const { colors } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const income = item.type === 'income';
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} onLongPress={onLongPress} style={styles.card}>
      <View style={[styles.icon, { backgroundColor: category.color + '26' }]}>
        <Icon name={category.icon} size={22} color={category.color} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text style={styles.title} numberOfLines={1}>{item.title || category.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {category.name} · {item.paymentMethod} · {formatDate(item.date)}
        </Text>
      </View>
      <Text style={[styles.amount, { color: income ? colors.income : colors.expense }]}>
        {income ? '+' : '-'}{formatMoney(item.amount, symbol)}
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.md,
      padding: 12,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    icon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    meta: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 3,
    },
    amount: {
      fontSize: 15,
      fontWeight: '700',
    },
  });