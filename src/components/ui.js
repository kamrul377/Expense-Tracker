// import React from 'react';
// import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import { colors, radius } from '../constants/theme';

// export function Button({ title, onPress, loading, variant = 'primary', icon, style, disabled }) {
//   const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? 'rgba(248,113,113,0.15)' : colors.card;
//   const fg = variant === 'danger' ? colors.expense : colors.text;
//   return (
//     <TouchableOpacity
//       activeOpacity={0.8}
//       onPress={onPress}
//       disabled={loading || disabled}
//       style={[
//         styles.btn,
//         { backgroundColor: bg, borderColor: variant === 'secondary' ? colors.border : 'transparent' },
//         (loading || disabled) && { opacity: 0.6 },
//         style,
//       ]}
//     >
//       {loading ? (
//         <ActivityIndicator color={fg} />
//       ) : (
//         <View style={styles.row}>
//           {icon ? <Icon name={icon} size={18} color={fg} style={{ marginRight: 8 }} /> : null}
//           <Text style={[styles.btnText, { color: fg }]}>{title}</Text>
//         </View>
//       )}
//     </TouchableOpacity>
//   );
// }

// export function Input({ label, style, ...props }) {
//   return (
//     <View style={{ marginBottom: 12 }}>
//       {label ? <Text style={styles.label}>{label}</Text> : null}
//       <TextInput placeholderTextColor={colors.dim} autoCapitalize="none" {...props} style={[styles.input, style]} />
//     </View>
//   );
// }

// export const Card = ({ children, style }) => <View style={[styles.card, style]}>{children}</View>;

// export function Chip({ label, active, onPress, color, icon }) {
//   const c = color || colors.primaryLight;
//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       style={[styles.chip, active && { backgroundColor: c + '33', borderColor: c }]}
//     >
//       {icon ? <Icon name={icon} size={14} color={active ? c : colors.muted} style={{ marginRight: 6 }} /> : null}
//       <Text style={[styles.chipText, active && { color: c }]}>{label}</Text>
//     </TouchableOpacity>
//   );
// }

// // options: [{ value, label, color }]
// export function Segmented({ options, value, onChange }) {
//   return (
//     <View style={styles.segment}>
//       {options.map((o) => {
//         const active = o.value === value;
//         return (
//           <TouchableOpacity
//             key={o.value}
//             onPress={() => onChange(o.value)}
//             style={[styles.segmentItem, active && { backgroundColor: o.color || colors.primary }]}
//           >
//             <Text style={[styles.segmentText, active && { color: '#fff' }]}>{o.label}</Text>
//           </TouchableOpacity>
//         );
//       })}
//     </View>
//   );
// }

// export function ProgressBar({ value, color }) {
//   const pct = Math.max(0, Math.min(1, value || 0)) * 100;
//   return (
//     <View style={styles.track}>
//       <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color || colors.primaryLight, borderRadius: 4 }} />
//     </View>
//   );
// }

// export function EmptyState({ icon = 'inbox-outline', title, subtitle }) {
//   return (
//     <View style={{ alignItems: 'center', paddingVertical: 40 }}>
//       <Icon name={icon} size={40} color={colors.dim} />
//       <Text style={{ color: colors.muted, fontWeight: '600', fontSize: 15, marginTop: 8 }}>{title}</Text>
//       {subtitle ? <Text style={{ color: colors.dim, fontSize: 13, marginTop: 4, textAlign: 'center' }}>{subtitle}</Text> : null}
//     </View>
//   );
// }

// export function SectionHeader({ title, right, onRightPress }) {
//   return (
//     <View style={styles.sectionHeader}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//       {right ? (
//         <TouchableOpacity onPress={onRightPress}>
//           <Text style={{ color: colors.primaryLight, fontSize: 13, fontWeight: '600' }}>{right}</Text>
//         </TouchableOpacity>
//       ) : null}
//     </View>
//   );
// }

// export function Fab({ onPress }) {
//   return (
//     <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.fab}>
//       <Icon name="plus" size={28} color="#fff" />
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   row: { flexDirection: 'row', alignItems: 'center' },
//   btn: { borderRadius: radius.md, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center', borderWidth: 1 },
//   btnText: { fontSize: 15, fontWeight: '700' },
//   label: { color: colors.muted, fontSize: 12, marginBottom: 6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
//   input: {
//     backgroundColor: colors.bg, color: colors.text, borderRadius: radius.md, paddingHorizontal: 14,
//     paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: colors.border,
//   },
//   card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
//   chip: {
//     flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill,
//     backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
//   },
//   chipText: { fontSize: 12, color: colors.muted, fontWeight: '600' },
//   segment: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: radius.md, padding: 4, borderWidth: 1, borderColor: colors.border },
//   segmentItem: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: radius.sm },
//   segmentText: { color: colors.muted, fontWeight: '700', fontSize: 13 },
//   track: { height: 8, backgroundColor: colors.bg, borderRadius: 4, overflow: 'hidden' },
//   sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 4 },
//   sectionTitle: { color: '#E2E8F0', fontSize: 16, fontWeight: '700' },
//   fab: {
//     position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28,
//     backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6,
//     shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
//   },
// });



// ===============2nd=================








import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { radius } from '../constants/theme';
import { useAuth } from '../context/AuthContext'; // useAuth hook import kora holo

export function Button({ title, onPress, loading, variant = 'primary', icon, style, disabled }) {
  const { colors } = useAuth(); // Dynamic colors

  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.expenseBg : colors.card;
  const fg = variant === 'danger' ? colors.expense : colors.text;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={loading || disabled}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor: variant === 'secondary' ? colors.border : 'transparent' },
        (loading || disabled) && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={18} color={fg} style={{ marginRight: 8 }} /> : null}
          <Text style={[styles.btnText, { color: fg }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function Input({ label, style, ...props }) {
  const { colors } = useAuth(); // Dynamic colors

  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={[styles.label, { color: colors.muted }]}>{label}</Text> : null}
      <TextInput 
        placeholderTextColor={colors.dim} 
        autoCapitalize="none" 
        {...props} 
        style={[
          styles.input, 
          { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }, 
          style
        ]} 
      />
    </View>
  );
}

export function Card({ children, style }) {
  const { colors } = useAuth(); // Dynamic colors

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

export function Chip({ label, active, onPress, color, icon }) {
  const { colors } = useAuth();
  const c = color || colors.primaryLight;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip, 
        { backgroundColor: colors.bg, borderColor: colors.border },
        active && { backgroundColor: c + '33', borderColor: c }
      ]}
    >
      {icon ? <Icon name={icon} size={14} color={active ? c : colors.muted} style={{ marginRight: 6 }} /> : null}
      <Text style={[styles.chipText, { color: colors.muted }, active && { color: c }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Segmented({ options, value, onChange }) {
  const { colors } = useAuth();

  return (
    <View style={[styles.segment, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <TouchableOpacity
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.segmentItem, active && { backgroundColor: o.color || colors.primary }]}
          >
            <Text style={[styles.segmentText, { color: colors.muted }, active && { color: '#fff' }]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function ProgressBar({ value, color }) {
  const { colors } = useAuth();
  const pct = Math.max(0, Math.min(1, value || 0)) * 100;

  return (
    <View style={[styles.track, { backgroundColor: colors.bg }]}>
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color || colors.primaryLight, borderRadius: 4 }} />
    </View>
  );
}

export function EmptyState({ icon = 'inbox-outline', title, subtitle }) {
  const { colors } = useAuth();

  return (
    <View style={{ alignItems: 'center', paddingVertical: 40 }}>
      <Icon name={icon} size={40} color={colors.dim} />
      <Text style={{ color: colors.muted, fontWeight: '600', fontSize: 15, marginTop: 8 }}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.dim, fontSize: 13, marginTop: 4, textAlign: 'center' }}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionHeader({ title, right, onRightPress }) {
  const { colors } = useAuth();

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {right ? (
        <TouchableOpacity onPress={onRightPress}>
          <Text style={{ color: colors.primaryLight, fontSize: 13, fontWeight: '600' }}>{right}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function Fab({ onPress }) {
  const { colors } = useAuth();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.fab, { backgroundColor: colors.primary }]}>
      <Icon name="plus" size={28} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: { borderRadius: radius.md, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center', borderWidth: 1 },
  btnText: { fontSize: 15, fontWeight: '700' },
  label: { fontSize: 12, marginBottom: 6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  input: {
    borderRadius: radius.md, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 15, borderWidth: 1,
  },
  card: { borderRadius: radius.lg, padding: 16, borderWidth: 1, marginBottom: 14 },
  chip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  segment: { flexDirection: 'row', borderRadius: radius.md, padding: 4, borderWidth: 1 },
  segmentItem: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: radius.sm },
  segmentText: { fontWeight: '700', fontSize: 13 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  fab: {
    position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
});