// components/GroupDepositCard.js
// Member der initial deposit dekhay ar edit korte dey.
// Member shudhu nijer deposit edit korte pare, group owner shobar.
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { setDeposit } from '../services/groupService';

export default function GroupDepositCard({ group, user, colors, currency = '৳' }) {
    const primary = colors.primary || '#059669';
    const isOwner = group?.createdBy === user?.uid;
    const members = Object.entries(group?.members || {}).filter(([uid]) => (group.memberUids || []).includes(uid));
    const deposits = group?.deposits || {};
    const total = members.reduce((sum, [uid]) => sum + (Number(deposits[uid]) || 0), 0);

    const [editUid, setEditUid] = useState(null);
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);

    const open = (uid) => {
        setEditUid(uid);
        setText(deposits[uid] ? String(deposits[uid]) : '');
    };

    const save = async () => {
        if (busy) return;
        try {
            setBusy(true);
            await setDeposit(group.id, editUid, text);
            setEditUid(null);
        } catch (e) {
            Alert.alert('Could not save deposit', e?.message || 'Try again.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <View
            style={{
                backgroundColor: colors.card,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
                marginBottom: 16,
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 17 }}>Initial deposit</Text>
                <Text style={{ color: primary, fontWeight: '800', fontSize: 15 }}>
                    {currency}
                    {total.toLocaleString()}
                </Text>
            </View>

            {members.map(([uid, m], i) => {
                const canEdit = isOwner || uid === user.uid;
                return (
                    <Pressable
                        key={uid}
                        onPress={() => canEdit && open(uid)}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 10,
                            borderTopWidth: i === 0 ? 0 : 1,
                            borderTopColor: colors.border,
                        }}
                    >
                        <View
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: 17,
                                backgroundColor: primary + '22',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ color: primary, fontWeight: '800' }}>{(m?.name || '?').charAt(0).toUpperCase()}</Text>
                        </View>
                        <Text style={{ flex: 1, marginLeft: 12, color: colors.text, fontWeight: '600' }} numberOfLines={1}>
                            {m?.name || 'Member'}
                            {uid === user.uid ? ' (You)' : ''}
                        </Text>
                        <Text style={{ color: deposits[uid] ? colors.text : colors.dim, fontWeight: '700' }}>
                            {deposits[uid] ? `${currency}${Number(deposits[uid]).toLocaleString()}` : 'Not set'}
                        </Text>
                        {canEdit && <Icon name="pencil-outline" size={16} color={colors.dim} style={{ marginLeft: 8 }} />}
                    </Pressable>
                );
            })}

            <Modal visible={!!editUid} transparent animationType="fade" onRequestClose={() => setEditUid(null)}>
                <Pressable
                    onPress={() => setEditUid(null)}
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 24 }}
                >
                    <Pressable
                        onPress={() => { }}
                        style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border }}
                    >
                        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 4 }}>Initial deposit</Text>
                        <Text style={{ color: colors.dim, fontSize: 13, marginBottom: 14 }}>
                            {group?.members?.[editUid]?.name || 'Member'}
                        </Text>
                        <TextInput
                            value={text}
                            onChangeText={setText}
                            keyboardType="decimal-pad"
                            placeholder="0"
                            placeholderTextColor={colors.dim}
                            autoFocus
                            style={{
                                backgroundColor: colors.bg,
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: 16,
                                paddingHorizontal: 16,
                                paddingVertical: 14,
                                fontSize: 18,
                                fontWeight: '700',
                                color: colors.text,
                                marginBottom: 16,
                            }}
                        />
                        <Pressable
                            onPress={save}
                            disabled={busy}
                            style={{ backgroundColor: primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center', opacity: busy ? 0.6 : 1 }}
                        >
                            {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800' }}>Save deposit</Text>}
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}