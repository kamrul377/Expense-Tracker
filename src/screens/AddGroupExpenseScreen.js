



// // screens/AddGroupExpenseScreen.js
// import React, { useState } from 'react';
// import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useAuth } from '../context/AuthContext';
// import { useData } from '../context/DataContext';
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

//     const quickTitles = ['Hotel', 'Food', 'Transport', 'Tickets', 'Shopping'];

//     const submit = async () => {
//         const amt = parseFloat(amount);
//         if (!title.trim()) return Alert.alert('Add a title', 'Write what the expense was for.');
//         if (!amt || amt <= 0) return Alert.alert('Enter an amount', 'The amount must be greater than 0.');
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
//             Alert.alert('Could not save', e?.message || 'Check your connection and try again.');
//         } finally {
//             setBusy(false);
//         }
//     };

//     const card = {
//         backgroundColor: colors.card,
//         borderWidth: 1,
//         borderColor: colors.border,
//         borderRadius: 22,
//         padding: 16,
//         marginBottom: 16,
//     };
//     const label = { color: colors.muted, fontWeight: '700', fontSize: 13, marginBottom: 10 };
//     const input = {
//         backgroundColor: colors.bg,
//         borderWidth: 1,
//         borderColor: colors.border,
//         borderRadius: 16,
//         paddingHorizontal: 16,
//         paddingVertical: 13,
//         fontSize: 15,
//         color: colors.text,
//     };

//     return (
//         <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//             <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
//                 {/* Amount hero */}
//                 <View
//                     style={{
//                         alignItems: 'center',
//                         backgroundColor: primary + '14',
//                         borderWidth: 1,
//                         borderColor: primary + '33',
//                         borderRadius: 26,
//                         paddingVertical: 28,
//                         marginBottom: 16,
//                     }}
//                 >
//                     <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
//                         {expense ? 'Edit expense' : `New expense in ${groupName}`}
//                     </Text>
//                     <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
//                         <Text style={{ color: primary, fontSize: 32, fontWeight: '800', marginRight: 6 }}>{symbol}</Text>
//                         <TextInput
//                             value={amount}
//                             onChangeText={setAmount}
//                             placeholder="0"
//                             placeholderTextColor={colors.dim}
//                             keyboardType="decimal-pad"
//                             autoFocus={!expense}
//                             style={{ color: colors.text, fontSize: 44, fontWeight: '800', minWidth: 60, textAlign: 'center', padding: 0 }}
//                         />
//                     </View>
//                 </View>

//                 {/* What for */}
//                 <View style={card}>
//                     <Text style={label}>What was it for?</Text>
//                     <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Hotel, Bus, Lunch" placeholderTextColor={colors.dim} style={input} />
//                     <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
//                         {quickTitles.map((t) => (
//                             <TouchableOpacity
//                                 key={t}
//                                 onPress={() => setTitle(t)}
//                                 style={{
//                                     paddingHorizontal: 14,
//                                     paddingVertical: 7,
//                                     borderRadius: 18,
//                                     backgroundColor: title === t ? primary : colors.bg,
//                                     borderWidth: 1,
//                                     borderColor: title === t ? primary : colors.border,
//                                     marginRight: 8,
//                                 }}
//                             >
//                                 <Text style={{ color: title === t ? '#fff' : colors.muted, fontWeight: '600', fontSize: 13 }}>{t}</Text>
//                             </TouchableOpacity>
//                         ))}
//                     </ScrollView>
//                 </View>

//                 {/* Paid by */}
//                 <View style={card}>
//                     <Text style={label}>Who paid?</Text>
//                     <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//                         {Object.entries(members).map(([uid, m]) => {
//                             const on = uid === paidBy;
//                             return (
//                                 <TouchableOpacity
//                                     key={uid}
//                                     onPress={() => setPaidBy(uid)}
//                                     activeOpacity={0.8}
//                                     style={{
//                                         flexDirection: 'row',
//                                         alignItems: 'center',
//                                         paddingLeft: 6,
//                                         paddingRight: 14,
//                                         paddingVertical: 6,
//                                         borderRadius: 24,
//                                         backgroundColor: on ? primary : colors.bg,
//                                         borderWidth: 1,
//                                         borderColor: on ? primary : colors.border,
//                                     }}
//                                 >
//                                     <View
//                                         style={{
//                                             width: 26,
//                                             height: 26,
//                                             borderRadius: 13,
//                                             backgroundColor: on ? 'rgba(255,255,255,0.25)' : primary + '22',
//                                             alignItems: 'center',
//                                             justifyContent: 'center',
//                                             marginRight: 8,
//                                         }}
//                                     >
//                                         {on ? (
//                                             <Icon name="check" size={15} color="#fff" />
//                                         ) : (
//                                             <Text style={{ color: primary, fontWeight: '800', fontSize: 12 }}>
//                                                 {(m.name || '?').charAt(0).toUpperCase()}
//                                             </Text>
//                                         )}
//                                     </View>
//                                     <Text style={{ color: on ? '#fff' : colors.text, fontWeight: '700', fontSize: 13 }}>
//                                         {m.name}
//                                         {uid === user.uid ? ' (You)' : ''}
//                                     </Text>
//                                 </TouchableOpacity>
//                             );
//                         })}
//                     </View>
//                 </View>

//                 {/* Date + note */}
//                 <View style={card}>
//                     <Text style={label}>Date</Text>
//                     <TouchableOpacity onPress={() => setShowPicker(true)} style={[input, { flexDirection: 'row', alignItems: 'center', marginBottom: 18 }]}>
//                         <Icon name="calendar-month-outline" size={20} color={primary} />
//                         <Text style={{ color: colors.text, marginLeft: 10, flex: 1 }}>
//                             {date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
//                         </Text>
//                         <Icon name="chevron-down" size={20} color={colors.dim} />
//                     </TouchableOpacity>
//                     {showPicker && (
//                         <DateTimePicker
//                             value={date}
//                             mode="date"
//                             display="default"
//                             onChange={(e, d) => {
//                                 setShowPicker(Platform.OS === 'ios');
//                                 if (d) setDate(d);
//                             }}
//                         />
//                     )}

//                     <Text style={label}>Note (optional)</Text>
//                     <TextInput
//                         value={note}
//                         onChangeText={setNote}
//                         placeholder="Add a note"
//                         placeholderTextColor={colors.dim}
//                         multiline
//                         style={[input, { minHeight: 72, textAlignVertical: 'top' }]}
//                     />
//                 </View>

//                 <PrimaryBtn label={expense ? 'Save changes' : 'Add expense'} onPress={submit} busy={busy} color={primary} />
//             </ScrollView>
//         </KeyboardAvoidingView>
//     );
// }





// screens/AddGroupExpenseScreen.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { displayName, saveExpense } from '../services/groupService';
import { sendPush } from '../services/pushService';
import { formatMoney } from '../utils/format';
import { PrimaryBtn } from './GroupsScreen';

/* ---------- Photo / name helpers (same logic as GroupDetailScreen) ---------- */

const PHOTO_KEYS = ['photoURL', 'photoUrl', 'avatar', 'avatarUrl', 'photo', 'profilePic', 'profileImage', 'image', 'picture'];

const normalizeUri = (v) => {
    if (typeof v !== 'string') return null;
    const s = v.trim();
    if (!s) return null;
    if (/^(https?:|file:|content:|data:|asset:|ph:)/i.test(s)) return s;
    if (s.length > 200 && /^[A-Za-z0-9+/=\s]+$/.test(s)) return `data:image/jpeg;base64,${s.replace(/\s/g, '')}`;
    return s;
};

const pickPhoto = (...sources) => {
    for (const src of sources) {
        if (!src) continue;
        if (typeof src === 'string') {
            const u = normalizeUri(src);
            if (u) return u;
            continue;
        }
        for (const k of PHOTO_KEYS) {
            const u = normalizeUri(src[k]);
            if (u) return u;
        }
    }
    return null;
};

const pickName = (...sources) => {
    for (const s of sources) {
        const n = s?.name || s?.displayName || s?.fullName;
        if (typeof n === 'string' && n.trim()) return n.trim();
    }
    return null;
};

function Avatar({ uri, name, size = 48, color, bg, selected }) {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [uri]);
    const showImage = !!uri && !failed;
    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: bg,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                borderWidth: 2.5,
                borderColor: selected ? color : 'transparent',
            }}
        >
            {showImage ? (
                <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" onError={() => setFailed(true)} />
            ) : (
                <Text style={{ color, fontWeight: '800', fontSize: size * 0.4 }}>{(name || '?').trim().charAt(0).toUpperCase()}</Text>
            )}
        </View>
    );
}

const QUICK = [
    { t: 'Hotel', icon: 'bed-outline' },
    { t: 'Food', icon: 'silverware-fork-knife' },
    { t: 'Transport', icon: 'bus' },
    { t: 'Tickets', icon: 'ticket-outline' },
    { t: 'Shopping', icon: 'shopping-outline' },
];

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

    // Live member profiles so photos always show
    const [profiles, setProfiles] = useState({});
    const subs = useRef({});

    useEffect(() => {
        Object.keys(members).forEach((uid) => {
            if (subs.current[uid]) return;
            subs.current[uid] = onSnapshot(
                doc(db, 'users', uid),
                (snap) => {
                    if (snap.exists()) setProfiles((p) => ({ ...p, [uid]: snap.data() }));
                },
                () => { }
            );
        });
    }, [members]);

    useEffect(
        () => () => {
            Object.values(subs.current).forEach((u) => u());
            subs.current = {};
        },
        []
    );

    const photoFor = (uid, m) =>
        pickPhoto(profiles[uid], uid === user.uid ? profile : null, uid === user.uid ? user : null, m);

    const nameFor = (uid, m) =>
        pickName(profiles[uid], uid === user.uid ? profile : null, m) || (uid === user.uid ? user?.displayName : null) || 'Member';

    const memberList = useMemo(() => Object.entries(members), [members]);
    const amt = parseFloat(amount) || 0;
    const perPerson = memberList.length ? amt / memberList.length : 0;

    const submit = async () => {
        const value = parseFloat(amount);
        if (!title.trim()) return Alert.alert('Add a title', 'Write what the expense was for.');
        if (!value || value <= 0) return Alert.alert('Enter an amount', 'The amount must be greater than 0.');
        try {
            setBusy(true);
            await saveExpense(
                groupId,
                {
                    title: title.trim(),
                    amount: value,
                    note: note.trim(),
                    date: date.toISOString(),
                    paidBy,
                    paidByName: nameFor(paidBy, members[paidBy]),
                    createdBy: expense?.createdBy || user.uid,
                },
                expense?.id
            );
            if (!expense) {
                const others = Object.entries(members)
                    .filter(([uid]) => uid !== user.uid)
                    .map(([, m]) => m.email)
                    .filter(Boolean);
                if (others.length) {
                    sendPush(others, {
                        title: groupName,
                        body: `${displayName(user, profile)} added "${title.trim()}" - ${formatMoney(value, symbol)}`,
                        data: { type: 'expense', groupId },
                    });
                }
            }
            navigation.goBack();
        } catch (e) {
            Alert.alert('Could not save', e?.message || 'Check your connection and try again.');
        } finally {
            setBusy(false);
        }
    };

    const card = {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 24,
        padding: 18,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    };
    const label = { color: colors.text, fontWeight: '800', fontSize: 14, marginBottom: 12 };
    const input = {
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 13,
        fontSize: 15,
        color: colors.text,
    };

    const SectionLabel = ({ icon, text }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: primary + '1A', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={icon} size={16} color={primary} />
            </View>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 14 }}>{text}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {/* Amount hero */}
                <View
                    style={{
                        alignItems: 'center',
                        backgroundColor: primary,
                        borderRadius: 30,
                        paddingVertical: 30,
                        paddingHorizontal: 20,
                        marginBottom: 18,
                        overflow: 'hidden',
                        shadowColor: primary,
                        shadowOpacity: 0.3,
                        shadowRadius: 18,
                        shadowOffset: { width: 0, height: 10 },
                        elevation: 8,
                    }}
                >
                    <View style={{ position: 'absolute', top: -60, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.13)' }} />
                    <View style={{ position: 'absolute', bottom: -70, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(0,0,0,0.13)' }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, marginBottom: 14 }}>
                        <Icon name={expense ? 'pencil-outline' : 'plus-circle-outline'} size={14} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }} numberOfLines={1}>
                            {expense ? 'Edit expense' : `New expense · ${groupName}`}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 32, fontWeight: '800', marginRight: 6 }}>{symbol}</Text>
                        <TextInput
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0"
                            placeholderTextColor="rgba(255,255,255,0.45)"
                            keyboardType="decimal-pad"
                            autoFocus={!expense}
                            selectionColor="#fff"
                            style={{ color: '#fff', fontSize: 50, fontWeight: '900', minWidth: 70, textAlign: 'center', padding: 0 }}
                        />
                    </View>

                    {amt > 0 && memberList.length > 1 && (
                        <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.17)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                            <Icon name="account-group-outline" size={14} color="rgba(255,255,255,0.9)" />
                            <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 12, fontWeight: '700' }}>
                                {formatMoney(perPerson, symbol)} per person · {memberList.length} members
                            </Text>
                        </View>
                    )}
                </View>

                {/* What for */}
                <View style={card}>
                    <SectionLabel icon="tag-outline" text="What was it for?" />
                    <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Hotel, Bus, Lunch" placeholderTextColor={colors.dim} style={input} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                        {QUICK.map(({ t, icon }) => {
                            const on = title === t;
                            return (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setTitle(t)}
                                    activeOpacity={0.8}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 6,
                                        paddingHorizontal: 14,
                                        paddingVertical: 8,
                                        borderRadius: 20,
                                        backgroundColor: on ? primary : colors.bg,
                                        borderWidth: 1,
                                        borderColor: on ? primary : colors.border,
                                        marginRight: 8,
                                    }}
                                >
                                    <Icon name={icon} size={15} color={on ? '#fff' : colors.muted} />
                                    <Text style={{ color: on ? '#fff' : colors.muted, fontWeight: '700', fontSize: 13 }}>{t}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Paid by */}
                <View style={card}>
                    <SectionLabel icon="wallet-outline" text="Who paid?" />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 2 }}>
                        {memberList.map(([uid, m]) => {
                            const on = uid === paidBy;
                            const n = nameFor(uid, m);
                            return (
                                <TouchableOpacity
                                    key={uid}
                                    onPress={() => setPaidBy(uid)}
                                    activeOpacity={0.8}
                                    style={{
                                        width: 84,
                                        alignItems: 'center',
                                        paddingVertical: 12,
                                        marginRight: 10,
                                        borderRadius: 20,
                                        backgroundColor: on ? primary + '14' : colors.bg,
                                        borderWidth: 1.5,
                                        borderColor: on ? primary : colors.border,
                                    }}
                                >
                                    <View>
                                        <Avatar uri={photoFor(uid, m)} name={n} size={52} color={primary} bg={primary + '1F'} selected={on} />
                                        {on && (
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    right: -2,
                                                    bottom: -2,
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: 10,
                                                    backgroundColor: primary,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderWidth: 2,
                                                    borderColor: colors.card,
                                                }}
                                            >
                                                <Icon name="check" size={12} color="#fff" />
                                            </View>
                                        )}
                                    </View>
                                    <Text
                                        style={{ color: on ? primary : colors.text, fontWeight: '800', fontSize: 12, marginTop: 8, paddingHorizontal: 4 }}
                                        numberOfLines={1}
                                    >
                                        {uid === user.uid ? 'You' : n}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Date + note */}
                <View style={card}>
                    <SectionLabel icon="calendar-month-outline" text="Date" />
                    <TouchableOpacity onPress={() => setShowPicker(true)} activeOpacity={0.8} style={[input, { flexDirection: 'row', alignItems: 'center', marginBottom: 18 }]}>
                        <Icon name="calendar-month-outline" size={20} color={primary} />
                        <Text style={{ color: colors.text, marginLeft: 10, flex: 1, fontWeight: '600' }}>
                            {date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                        <Icon name="chevron-down" size={20} color={colors.dim} />
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

                    <SectionLabel icon="note-text-outline" text="Note (optional)" />
                    <TextInput
                        value={note}
                        onChangeText={setNote}
                        placeholder="Add a note"
                        placeholderTextColor={colors.dim}
                        multiline
                        style={[input, { minHeight: 80, textAlignVertical: 'top' }]}
                    />
                </View>

                <PrimaryBtn label={expense ? 'Save changes' : 'Add expense'} onPress={submit} busy={busy} color={primary} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}