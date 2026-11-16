


// // screens/AddGroupExpenseScreen.js
// import React, { useState } from 'react';
// import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useAuth } from '../context/AuthContext';
// import { useData } from '../context/DataContext';
// import { radius } from '../constants/theme';
// import { displayName, saveExpense } from '../services/groupService';
// import { sendPush } from '../services/pushService';
// import { formatMoney } from '../utils/format';
// import { PrimaryBtn } from './GroupsScreen';

// export default function AddGroupExpenseScreen({ route, navigation }) {
//     const { groupId, groupName = 'Group', members = {}, expense } = route.params;
//     const { user, profile, colors } = useAuth();
//     const { symbol } = useData();
//     const primary = colors.primary || '#059669';

//     const [title, setTitle] = useState(expense?.title || '');
//     const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
//     const [note, setNote] = useState(expense?.note || '');
//     const [paidBy, setPaidBy] = useState(expense?.paidBy || user.uid);
//     const [date, setDate] = useState(expense?.date ? new Date(expense.date) : new Date());
//     const [showPicker, setShowPicker] = useState(false);
//     const [busy, setBusy] = useState(false);

//     const submit = async () => {
//         const amt = parseFloat(amount);
//         if (!title.trim()) return Alert.alert('Title', 'Kisher kharoch seta likhun.');
//         if (!amt || amt <= 0) return Alert.alert('Amount', 'Sothik amount din.');
//         try {
//             setBusy(true);
//             await saveExpense(
//                 groupId,
//                 {
//                     title: title.trim(),
//                     amount: amt,
//                     note: note.trim(),
//                     date: date.toISOString(),
//                     paidBy,
//                     paidByName: members[paidBy]?.name || '',
//                     createdBy: expense?.createdBy || user.uid,
//                 },
//                 expense?.id
//             );
//             // Notun entry hole group er onno member der notification
//             if (!expense) {
//                 const others = Object.entries(members)
//                     .filter(([uid]) => uid !== user.uid)
//                     .map(([, m]) => m.email)
//                     .filter(Boolean);
//                 if (others.length) {
//                     sendPush(others, {
//                         title: groupName,
//                         body: `${displayName(user, profile)} added "${title.trim()}" - ${formatMoney(amt, symbol)}`,
//                         data: { type: 'expense', groupId },
//                     });
//                 }
//             }
//             navigation.goBack();
//         } catch (e) {
//             Alert.alert('Error', 'Save kora jayni. Abar try korun.');
//         } finally {
//             setBusy(false);
//         }
//     };

//     const field = {
//         backgroundColor: colors.card,
//         borderWidth: 1,
//         borderColor: colors.border,
//         borderRadius: radius.md,
//         paddingHorizontal: 14,
//         paddingVertical: 12,
//         color: colors.text,
//         marginBottom: 14,
//     };
//     const label = { color: colors.muted, fontWeight: '700', fontSize: 12, marginBottom: 6 };

//     return (
//         <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//             <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
//                 <Text style={label}>Amount ({symbol})</Text>
//                 <TextInput
//                     value={amount}
//                     onChangeText={setAmount}
//                     placeholder="0"
//                     placeholderTextColor={colors.dim}
//                     keyboardType="decimal-pad"
//                     style={{ ...field, fontSize: 26, fontWeight: '800' }}
//                 />

//                 <Text style={label}>What for?</Text>
//                 <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Hotel, Bus, Lunch" placeholderTextColor={colors.dim} style={field} />

//                 <Text style={label}>Paid by</Text>
//                 <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
//                     {Object.entries(members).map(([uid, m]) => {
//                         const on = uid === paidBy;
//                         return (
//                             <TouchableOpacity
//                                 key={uid}
//                                 onPress={() => setPaidBy(uid)}
//                                 style={{
//                                     paddingHorizontal: 14,
//                                     paddingVertical: 8,
//                                     borderRadius: 20,
//                                     backgroundColor: on ? primary : colors.card,
//                                     borderWidth: 1,
//                                     borderColor: on ? 'transparent' : colors.border,
//                                 }}
//                             >
//                                 <Text style={{ color: on ? '#fff' : colors.text, fontWeight: '700', fontSize: 13 }}>
//                                     {m.name}
//                                     {uid === user.uid ? ' (You)' : ''}
//                                 </Text>
//                             </TouchableOpacity>
//                         );
//                     })}
//                 </View>

//                 <Text style={label}>Date</Text>
//                 <TouchableOpacity onPress={() => setShowPicker(true)} style={{ ...field, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
//                     <Icon name="calendar-month-outline" size={20} color={colors.dim} />
//                     <Text style={{ color: colors.text }}>{date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
//                 </TouchableOpacity>
//                 {showPicker && (
//                     <DateTimePicker
//                         value={date}
//                         mode="date"
//                         display="default"
//                         onChange={(e, d) => {
//                             setShowPicker(Platform.OS === 'ios');
//                             if (d) setDate(d);
//                         }}
//                     />
//                 )}

//                 <Text style={label}>Note (optional)</Text>
//                 <TextInput value={note} onChangeText={setNote} placeholder="Add Note..." placeholderTextColor={colors.dim} style={field} />

//                 <PrimaryBtn label={expense ? 'Update' : 'Add expense'} onPress={submit} busy={busy} color={primary} />
//             </ScrollView>
//         </KeyboardAvoidingView>
//     );
// }







// screens/AddGroupExpenseScreen.js
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { radius } from '../constants/theme';
import { displayName, saveExpense } from '../services/groupService';
import { sendPush } from '../services/pushService';
import { formatMoney } from '../utils/format';
import { PrimaryBtn } from './GroupsScreen';

export default function AddGroupExpenseScreen({ route, navigation }) {
    const { groupId, groupName = 'Group', members = {}, expense } = route.params;
    const { user, profile, colors } = useAuth();
    const { symbol } = useData();
    const primary = colors.primary || '#059669';

    const [title, setTitle] = useState(expense?.title || '');
    const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
    const [note, setNote] = useState(expense?.note || '');
    const [paidBy, setPaidBy] = useState(expense?.paidBy || user.uid);
    const [date, setDate] = useState(expense?.date ? new Date(expense.date) : new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        const amt = parseFloat(amount);
        if (!title.trim()) return Alert.alert('Title', 'Kisher kharoch seta likhun.');
        if (!amt || amt <= 0) return Alert.alert('Amount', 'Sothik amount din.');
        try {
            setBusy(true);
            await saveExpense(
                groupId,
                {
                    title: title.trim(),
                    amount: amt,
                    note: note.trim(),
                    date: date.toISOString(),
                    paidBy,
                    paidByName: members[paidBy]?.name || '',
                    createdBy: expense?.createdBy || user.uid,
                },
                expense?.id
            );
            // Notun entry hole group er onno member der notification
            if (!expense) {
                const others = Object.entries(members)
                    .filter(([uid]) => uid !== user.uid)
                    .map(([, m]) => m.email)
                    .filter(Boolean);
                if (others.length) {
                    sendPush(others, {
                        title: groupName,
                        body: `${displayName(user, profile)} added "${title.trim()}" - ${formatMoney(amt, symbol)}`,
                        data: { type: 'expense', groupId },
                    });
                }
            }
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', 'Save kora jayni. Abar try korun.');
        } finally {
            setBusy(false);
        }
    };

    const field = {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: colors.text,
        marginBottom: 14,
    };
    const label = { color: colors.muted, fontWeight: '700', fontSize: 12, marginBottom: 6 };

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
                <Text style={label}>Amount ({symbol})</Text>
                <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0"
                    placeholderTextColor={colors.dim}
                    keyboardType="decimal-pad"
                    style={{ ...field, fontSize: 26, fontWeight: '800' }}
                />

                <Text style={label}>What for?</Text>
                <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Hotel, Bus, Lunch" placeholderTextColor={colors.dim} style={field} />

                <Text style={label}>Paid by</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    {Object.entries(members).map(([uid, m]) => {
                        const on = uid === paidBy;
                        return (
                            <TouchableOpacity
                                key={uid}
                                onPress={() => setPaidBy(uid)}
                                style={{
                                    paddingHorizontal: 14,
                                    paddingVertical: 8,
                                    borderRadius: 20,
                                    backgroundColor: on ? primary : colors.card,
                                    borderWidth: 1,
                                    borderColor: on ? 'transparent' : colors.border,
                                }}
                            >
                                <Text style={{ color: on ? '#fff' : colors.text, fontWeight: '700', fontSize: 13 }}>
                                    {m.name}
                                    {uid === user.uid ? ' (You)' : ''}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={label}>Date</Text>
                <TouchableOpacity onPress={() => setShowPicker(true)} style={{ ...field, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Icon name="calendar-month-outline" size={20} color={colors.dim} />
                    <Text style={{ color: colors.text }}>{date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                </TouchableOpacity>
                {showPicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={(e, d) => {
                            setShowPicker(Platform.OS === 'ios');
                            if (d) setDate(d);
                        }}
                    />
                )}

                <Text style={label}>Note (optional)</Text>
                <TextInput value={note} onChangeText={setNote} placeholder="Add Note..." placeholderTextColor={colors.dim} style={field} />

                <PrimaryBtn label={expense ? 'Update' : 'Add expense'} onPress={submit} busy={busy} color={primary} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}


