

// import React, { useState } from 'react';
// import { Text, TouchableOpacity, View } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import Screen from '../components/Screen';
// import { Button, Card, EmptyState, Input, Segmented } from '../components/ui';
// import { useData } from '../context/DataContext';
// import { useAuth } from '../context/AuthContext';
// import { COLOR_CHOICES, ICON_CHOICES } from '../constants/categories';
// import CustomAlert from '../components/CustomAlert'; // Import your CustomAlert component

// export default function CategoriesScreen() {
//   const { customCategories, addCategory, removeCategory } = useData();
//   const { colors } = useAuth(); // Dynamic colors taken from useAuth

//   const [name, setName] = useState('');
//   const [type, setType] = useState('expense');
//   const [icon, setIcon] = useState(ICON_CHOICES[0]);
//   const [color, setColor] = useState(COLOR_CHOICES[0]);

//   // Custom Alert State
//   const [alertConfig, setAlertConfig] = useState({
//     visible: false,
//     title: '',
//     message: '',
//     type: 'error',
//     showCancel: false,
//     confirmText: 'Okay, Got it',
//     cancelText: 'Cancel',
//     onConfirm: null,
//     onCancel: null,
//   });

//   const showAlert = (title, message, type = 'error', options = {}) => {
//     setAlertConfig({
//       visible: true,
//       title,
//       message,
//       type,
//       showCancel: options.showCancel || false,
//       confirmText: options.confirmText || 'Okay, Got it',
//       cancelText: options.cancelText || 'Cancel',
//       onConfirm: options.onConfirm || null,
//       onCancel: options.onCancel || null,
//     });
//   };

//   const hideAlert = () => {
//     setAlertConfig((prev) => ({ ...prev, visible: false }));
//   };

//   const add = () => {
//     if (!name.trim()) {
//       showAlert('Missing Name', 'Please enter a category name.', 'warning');
//       return;
//     }
//     addCategory({ name: name.trim(), type, icon, color });
//     setName('');
//   };

//   const confirmRemove = (c) => {
//     showAlert(
//       'Delete Category',
//       `Are you sure you want to remove "${c.name}"? Existing transactions will keep their name.`,
//       'warning',
//       {
//         showCancel: true,
//         confirmText: 'Delete',
//         cancelText: 'Cancel',
//         onConfirm: () => {
//           hideAlert();
//           removeCategory(c.id);
//         },
//         onCancel: hideAlert,
//       }
//     );
//   };

//   return (
//     <Screen>
//       <Card>
//         <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 12 }}>New category</Text>
//         <Input label="Name" autoCapitalize="words" value={name} onChangeText={setName} placeholder="e.g. Groceries" />
//         <Segmented
//           value={type}
//           onChange={setType}
//           options={[
//             { value: 'expense', label: 'Expense', color: colors.expense || '#DC2626' },
//             { value: 'income', label: 'Income', color: colors.income || '#059669' },
//           ]}
//         />
//         <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginTop: 14, marginBottom: 8 }}>Icon</Text>
//         <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//           {ICON_CHOICES.map((i) => (
//             <TouchableOpacity
//               key={i}
//               onPress={() => setIcon(i)}
//               style={{
//                 width: 40,
//                 height: 40,
//                 borderRadius: 20,
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 backgroundColor: icon === i ? color + '40' : colors.bg,
//                 borderWidth: 1,
//                 borderColor: icon === i ? color : colors.border,
//               }}
//             >
//               <Icon name={i} size={20} color={icon === i ? color : colors.muted} />
//             </TouchableOpacity>
//           ))}
//         </View>
//         <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginTop: 14, marginBottom: 8 }}>Color</Text>
//         <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
//           {COLOR_CHOICES.map((c) => (
//             <TouchableOpacity
//               key={c}
//               onPress={() => setColor(c)}
//               style={{
//                 width: 30,
//                 height: 30,
//                 borderRadius: 15,
//                 backgroundColor: c,
//                 borderWidth: 3,
//                 borderColor: color === c ? colors.text : 'transparent',
//               }}
//             />
//           ))}
//         </View>
//         <Button title="Add Category" icon="plus" onPress={add} />
//       </Card>

//       <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 10 }}>Your categories</Text>
//       {customCategories.length === 0 ? (
//         <EmptyState icon="shape-outline" title="No custom categories" subtitle="Default categories are always available." />
//       ) : (
//         customCategories.map((c) => (
//           <Card key={c.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
//             <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c.color + '26', alignItems: 'center', justifyContent: 'center' }}>
//               <Icon name={c.icon} size={20} color={c.color} />
//             </View>
//             <View style={{ flex: 1, marginLeft: 12 }}>
//               <Text style={{ color: colors.text, fontWeight: '600' }}>{c.name}</Text>
//               <Text style={{ color: colors.muted, fontSize: 12 }}>{c.type === 'income' ? 'Income' : 'Expense'}</Text>
//             </View>
//             <TouchableOpacity onPress={() => confirmRemove(c)} hitSlop={10}>
//               <Icon name="trash-can-outline" size={22} color={colors.expense} />
//             </TouchableOpacity>
//           </Card>
//         ))
//       )}

//       {/* Custom Alert Component */}
//       <CustomAlert
//         visible={alertConfig.visible}
//         title={alertConfig.title}
//         message={alertConfig.message}
//         type={alertConfig.type}
//         showCancel={alertConfig.showCancel}
//         confirmText={alertConfig.confirmText}
//         cancelText={alertConfig.cancelText}
//         onClose={hideAlert}
//         onConfirm={alertConfig.onConfirm || hideAlert}
//         onCancel={alertConfig.onCancel || hideAlert}
//       />
//     </Screen>
//   );
// }





import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { EmptyState, Input, Segmented } from '../components/ui';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { COLOR_CHOICES, ICON_CHOICES } from '../constants/categories';
import CustomAlert from '../components/CustomAlert'; // Import your CustomAlert component

export default function CategoriesScreen() {
  const { customCategories, addCategory, removeCategory } = useData();
  const { colors } = useAuth(); // Dynamic colors taken from useAuth
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [icon, setIcon] = useState(ICON_CHOICES[0]);
  const [color, setColor] = useState(COLOR_CHOICES[0]);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error',
    showCancel: false,
    confirmText: 'Okay, Got it',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = (title, message, type = 'error', options = {}) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      showCancel: options.showCancel || false,
      confirmText: options.confirmText || 'Okay, Got it',
      cancelText: options.cancelText || 'Cancel',
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const add = () => {
    if (!name.trim()) {
      showAlert('Missing Name', 'Please enter a category name.', 'warning');
      return;
    }
    addCategory({ name: name.trim(), type, icon, color });
    setName('');
  };

  const confirmRemove = (c) => {
    showAlert(
      'Delete Category',
      `Are you sure you want to remove "${c.name}"? Existing transactions will keep their name.`,
      'warning',
      {
        showCancel: true,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        onConfirm: () => {
          hideAlert();
          removeCategory(c.id);
        },
        onCancel: hideAlert,
      }
    );
  };

  const isIncome = type === 'income';
  const typeColor = isIncome ? colors.income || '#059669' : colors.expense || '#DC2626';

  const expenseList = customCategories.filter((c) => c.type !== 'income');
  const incomeList = customCategories.filter((c) => c.type === 'income');

  const renderGroup = (title, list, tint, tintBg) => {
    if (list.length === 0) return null;
    return (
      <View style={{ marginBottom: 14 }}>
        <View style={styles.groupHead}>
          <View style={[styles.groupDot, { backgroundColor: tint }]} />
          <Text style={styles.groupTitle}>{title}</Text>
          <Text style={styles.groupCount}>{list.length}</Text>
        </View>
        {list.map((c) => (
          <View key={c.id} style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: c.color + '22' }]}>
              <Icon name={c.icon} size={22} color={c.color} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.rowName} numberOfLines={1}>{c.name}</Text>
              <View style={[styles.pill, { backgroundColor: tintBg }]}>
                <Text style={[styles.pillText, { color: tint }]}>{c.type === 'income' ? 'Income' : 'Expense'}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => confirmRemove(c)}
              hitSlop={10}
              activeOpacity={0.7}
              style={[styles.trashBtn, { backgroundColor: (colors.expense || '#DC2626') + '18' }]}
            >
              <Icon name="trash-can-outline" size={19} color={colors.expense} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Screen>
      {/* ---------- New category ---------- */}
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <View style={[styles.headIcon, { backgroundColor: colors.primary + '1F' }]}>
            <Icon name="shape-plus-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>New category</Text>
            <Text style={styles.cardSub}>Pick a name, icon and color</Text>
          </View>
        </View>

        {/* live preview */}
        <View style={[styles.preview, { borderColor: color + '55', backgroundColor: color + '12' }]}>
          <View style={[styles.previewIcon, { backgroundColor: color }]}>
            <Icon name={icon} size={30} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.previewName, !name.trim() && { color: colors.dim }]} numberOfLines={1}>
              {name.trim() || 'Category name'}
            </Text>
            <View style={[styles.pill, { backgroundColor: typeColor + '22' }]}>
              <Text style={[styles.pillText, { color: typeColor }]}>{isIncome ? 'Income' : 'Expense'}</Text>
            </View>
          </View>
        </View>

        <Input label="Name" autoCapitalize="words" value={name} onChangeText={setName} placeholder="e.g. Groceries" />

        <Segmented
          value={type}
          onChange={setType}
          options={[
            { value: 'expense', label: 'Expense', color: colors.expense || '#DC2626' },
            { value: 'income', label: 'Income', color: colors.income || '#059669' },
          ]}
        />

        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconGrid}>
          {ICON_CHOICES.map((i) => {
            const on = icon === i;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setIcon(i)}
                activeOpacity={0.8}
                style={[
                  styles.iconCell,
                  on && { backgroundColor: color + '26', borderColor: color, borderWidth: 1.5 },
                ]}
              >
                <Icon name={i} size={21} color={on ? color : colors.muted} />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Color</Text>
        <View style={styles.colorRow}>
          {COLOR_CHOICES.map((c) => {
            const on = color === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                activeOpacity={0.8}
                style={[styles.swatchRing, { borderColor: on ? c : 'transparent' }]}
              >
                <View style={[styles.swatch, { backgroundColor: c }]}>
                  {on && <Icon name="check" size={15} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={add}
          activeOpacity={0.85}
          style={[styles.addBtn, { backgroundColor: color, shadowColor: color }]}
        >
          <Icon name="plus-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      {/* ---------- Your categories ---------- */}
      <View style={styles.listHead}>
        <Text style={styles.listTitle}>Your categories</Text>
        {customCategories.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.primary + '22' }]}>
            <Text style={[styles.countText, { color: colors.primary }]}>{customCategories.length}</Text>
          </View>
        )}
      </View>

      {customCategories.length === 0 ? (
        <EmptyState icon="shape-outline" title="No custom categories" subtitle="Default categories are always available." />
      ) : (
        <>
          {renderGroup('Expense', expenseList, colors.expense || '#DC2626', colors.expenseBg || '#DC262618')}
          {renderGroup('Income', incomeList, colors.income || '#059669', colors.incomeBg || '#05966918')}
        </>
      )}

      {/* Custom Alert Component */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm || hideAlert}
        onCancel={alertConfig.onCancel || hideAlert}
      />
    </Screen>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 22,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
    headIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    cardTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
    cardSub: { color: colors.muted, fontSize: 12, marginTop: 1 },

    preview: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderRadius: 18,
      padding: 14,
      marginBottom: 16,
    },
    previewIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    previewName: { color: colors.text, fontSize: 17, fontWeight: '800' },

    pill: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10, marginTop: 5 },
    pillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },

    label: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginTop: 18,
      marginBottom: 10,
    },
    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    iconCell: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    swatchRing: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swatch: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

    addBtn: {
      marginTop: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 16,
      paddingVertical: 15,
      shadowOpacity: 0.35,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 5,
    },
    addText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

    listHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    listTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
    countBadge: { minWidth: 24, paddingHorizontal: 8, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    countText: { fontSize: 12, fontWeight: '800' },

    groupHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, marginLeft: 2 },
    groupDot: { width: 8, height: 8, borderRadius: 4 },
    groupTitle: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
    groupCount: { color: colors.dim, fontSize: 12, fontWeight: '700' },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 10,
    },
    rowIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    rowName: { color: colors.text, fontSize: 15, fontWeight: '700' },
    trashBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  });