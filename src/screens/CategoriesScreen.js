import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Screen from '../components/Screen';
import { Button, Card, EmptyState, Input, Segmented } from '../components/ui';
import { useData } from '../context/DataContext';
import { colors } from '../constants/theme';
import { COLOR_CHOICES, ICON_CHOICES } from '../constants/categories';

export default function CategoriesScreen() {
  const { customCategories, addCategory, removeCategory } = useData();
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [icon, setIcon] = useState(ICON_CHOICES[0]);
  const [color, setColor] = useState(COLOR_CHOICES[0]);

  const add = () => {
    if (!name.trim()) return Alert.alert('Missing name', 'Enter a category name.');
    addCategory({ name: name.trim(), type, icon, color });
    setName('');
  };

  const confirmRemove = (c) =>
    Alert.alert('Delete category', `Remove "${c.name}"? Existing transactions will keep their name.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeCategory(c.id) },
    ]);

  return (
    <Screen>
      <Card>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 12 }}>New category</Text>
        <Input label="Name" autoCapitalize="words" value={name} onChangeText={setName} placeholder="e.g. Groceries" />
        <Segmented
          value={type}
          onChange={setType}
          options={[
            { value: 'expense', label: 'Expense', color: '#DC2626' },
            { value: 'income', label: 'Income', color: '#059669' },
          ]}
        />
        <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginTop: 14, marginBottom: 8 }}>Icon</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {ICON_CHOICES.map((i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setIcon(i)}
              style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: icon === i ? color + '40' : colors.bg, borderWidth: 1, borderColor: icon === i ? color : colors.border }}
            >
              <Icon name={i} size={20} color={icon === i ? color : colors.muted} />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginTop: 14, marginBottom: 8 }}>Color</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          {COLOR_CHOICES.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setColor(c)}
              style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c, borderWidth: 3, borderColor: color === c ? '#fff' : 'transparent' }}
            />
          ))}
        </View>
        <Button title="Add Category" icon="plus" onPress={add} />
      </Card>

      <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '700', marginBottom: 10 }}>Your categories</Text>
      {customCategories.length === 0 ? (
        <EmptyState icon="shape-outline" title="No custom categories" subtitle="Default categories are always available." />
      ) : (
        customCategories.map((c) => (
          <Card key={c.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c.color + '26', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={c.icon} size={20} color={c.color} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{c.name}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{c.type === 'income' ? 'Income' : 'Expense'}</Text>
            </View>
            <TouchableOpacity onPress={() => confirmRemove(c)} hitSlop={10}>
              <Icon name="trash-can-outline" size={22} color={colors.expense} />
            </TouchableOpacity>
          </Card>
        ))
      )}
    </Screen>
  );
}
