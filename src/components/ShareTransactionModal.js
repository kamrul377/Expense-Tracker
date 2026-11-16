

import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { formatMoney } from '../utils/format';
import CustomAlert from '../components/CustomAlert'; // Import your custom alert component

const APP_NAME = 'My Expense Tracker'; // Set your app name here

// Card colors are fixed (no red) to ensure the image always looks clean and appealing
const THEME = {
  expense: { bg: '#4F46E5', soft: '#EEF2FF', text: '#4338CA', label: 'EXPENSE', sign: '-' }, // indigo
  income: { bg: '#0D9488', soft: '#CCFBF1', text: '#0F766E', label: 'INCOME', sign: '+' }, // teal
};

export default function ShareTransactionModal({ visible, onClose, item, category, symbol, colors }) {
  const cardRef = useRef(null);
  const [friend, setFriend] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

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

  if (!item) return null;

  const isExpense = item.type === 'expense';
  const t = isExpense ? THEME.expense : THEME.income;
  const dateStr = item.date
    ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const doShare = async () => {
    try {
      setBusy(true);
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share transaction' });
      } else {
        await Share.share({ url: uri, message: `${item.title}\n${formatMoney(item.amount, symbol)}` });
      }
    } catch (e) {
      showAlert('Share Failed', 'Could not share the transaction card. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '92%',
            paddingTop: 10,
          }}
        >
          <View style={{ alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 10 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>Share with friends</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={24} color={colors.dim} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
            {/* ===== The shareable card ===== */}
            <View
              ref={cardRef}
              collapsable={false}
              style={{ borderRadius: 30, overflow: 'hidden', backgroundColor: t.bg, padding: 18 }}
            >
              {/* decorative shapes */}
              <View style={{ position: 'absolute', top: -70, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.12)' }} />
              <View style={{ position: 'absolute', bottom: -80, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(0,0,0,0.14)' }} />
              <View style={{ position: 'absolute', top: 150, right: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.08)' }} />

              {/* header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="wallet" size={17} color={t.bg} />
                  </View>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>{APP_NAME}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20 }}>
                  <Icon name={isExpense ? 'arrow-top-right' : 'arrow-bottom-left'} size={13} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>{t.label}</Text>
                </View>
              </View>

              {/* white receipt */}
              <View style={{ backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', paddingTop: 22, paddingHorizontal: 20, paddingBottom: 20 }}>
                {/* category + title */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={{ width: 54, height: 54, borderRadius: 18, backgroundColor: t.soft, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={category?.icon || 'tag'} size={28} color={t.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600' }}>{category?.name || 'Other'}</Text>
                    <Text style={{ color: '#0F172A', fontSize: 18, fontWeight: '800', marginTop: 2 }} numberOfLines={2}>
                      {item.title || 'Untitled'}
                    </Text>
                  </View>
                </View>

                {/* amount */}
                <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600', marginTop: 22 }}>
                  {isExpense ? 'Amount spent' : 'Amount received'}
                </Text>
                <Text style={{ color: '#0F172A', fontSize: 40, fontWeight: '900', letterSpacing: -1, marginTop: 2 }}>
                  {t.sign}
                  {formatMoney(item.amount, symbol)}
                </Text>

                {/* ticket divider with notches */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 18, marginHorizontal: -20 }}>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: t.bg, marginLeft: -9 }} />
                  <View style={{ flex: 1, borderTopWidth: 2, borderStyle: 'dashed', borderColor: '#CBD5E1', marginHorizontal: 6 }} />
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: t.bg, marginRight: -9 }} />
                </View>

                {/* details */}
                <Row icon="calendar-month-outline" label="Date" value={dateStr} tint={t} />
                {!!item.paymentMethod && <Row icon="credit-card-outline" label="Paid via" value={item.paymentMethod} tint={t} />}
                {!!friend.trim() && <Row icon="account-multiple-outline" label="With" value={friend.trim()} tint={t} />}

                {!!note.trim() && (
                  <View style={{ marginTop: 14, backgroundColor: t.soft, borderRadius: 14, padding: 12, flexDirection: 'row', gap: 8 }}>
                    <Icon name="format-quote-open" size={16} color={t.text} />
                    <Text style={{ color: t.text, fontSize: 13, fontWeight: '600', flex: 1 }}>{note.trim()}</Text>
                  </View>
                )}
              </View>

              {/* footer */}
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, textAlign: 'center', marginTop: 14, letterSpacing: 0.5 }}>
                Tracked with {APP_NAME}
              </Text>
            </View>

            {/* ===== Optional inputs ===== */}
            <View style={{ marginTop: 18, gap: 10 }}>
              <Field colors={colors} icon="account-multiple-outline" value={friend} onChangeText={setFriend} placeholder="Friend's name (optional)" />
              <Field colors={colors} icon="message-text-outline" value={note} onChangeText={setNote} placeholder="Add a short message (optional)" />
            </View>

            <TouchableOpacity
              onPress={doShare}
              disabled={busy}
              activeOpacity={0.85}
              style={{
                marginTop: 18,
                backgroundColor: t.bg,
                borderRadius: 18,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Icon name="share-variant" size={20} color="#fff" />}
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Share Card</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.dim, fontSize: 12, textAlign: 'center', marginTop: 10 }}>
              You can share via WhatsApp, Facebook, Messenger, Telegram, or any app
            </Text>
          </ScrollView>
        </View>
      </View>

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
    </Modal>
  );
}

function Row({ icon, label, value, tint }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
      <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: tint.soft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} color={tint.text} />
      </View>
      <Text style={{ color: '#64748B', marginLeft: 10, fontSize: 13, width: 70 }}>{label}</Text>
      <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right' }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Field({ colors, icon, ...props }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        paddingHorizontal: 14,
      }}
    >
      <Icon name={icon} size={20} color={colors.dim} />
      <TextInput
        {...props}
        placeholderTextColor={colors.dim}
        style={{ flex: 1, color: colors.text, paddingVertical: 13, paddingHorizontal: 10 }}
      />
    </View>
  );
}

