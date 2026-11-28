

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { collection, deleteDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';
import {
  flushBuffer,
  isTrackingActive,
  readBuffer,
  removeFromBuffer,
  resumeTrackingIfEnabled,
  startTracking,
  stopTracking,
} from '../services/locationTracking';
import {
  LONG_STAY_MS,
  MIN_STAY_MS,
  addDays,
  dateKey,
  detectStays,
  formatDay,
  formatDistance,
  formatDuration,
  formatTime,
  normalizePoints,
  startOfDay,
  totalDistance,
} from '../utils/tracking';
import { buildMapHtml } from '../utils/mapHtml';

export default function LocationTrackerScreen() {
  const { user, colors, theme } = useAuth();
  const uid = user?.uid;
  const { height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [day, setDay] = useState(startOfDay(new Date()));
  const [tracking, setTracking] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [remote, setRemote] = useState([]);
  const [buffer, setBuffer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

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

  const dateStr = dateKey(day);
  const isToday = dateStr === dateKey(Date.now());

  // ---- tracking on/off state ----
  useEffect(() => {
    (async () => {
      await resumeTrackingIfEnabled(uid);
      setTracking(await isTrackingActive());
      flushBuffer(uid, { force: true });
    })();
  }, [uid]);

  // clock tick (keeps "ongoing stay" duration fresh)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // ---- points already uploaded to Firestore (live) ----
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'users', uid, 'locations'), where('date', '==', dateStr));
    return onSnapshot(
      q,
      (snap) => {
        setRemote(snap.docs.flatMap((d) => d.data().points || []));
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        showAlert('Error', err.message, 'error');
      }
    );
  }, [uid, dateStr]);

  // ---- points still waiting on the phone (not uploaded yet) ----
  const loadBuffer = useCallback(async () => {
    const b = await readBuffer(uid);
    setBuffer(b.filter((p) => dateKey(p.t) === dateStr));
  }, [uid, dateStr]);

  useEffect(() => {
    loadBuffer();
    const id = setInterval(loadBuffer, 20000);
    return () => clearInterval(id);
  }, [loadBuffer]);

  const points = useMemo(() => normalizePoints([...remote, ...buffer]), [remote, buffer]);
  const live = tracking && isToday;

  const stays = useMemo(
    () => detectStays(points, { live, now }),
    [points, live, now]
  );
  const distance = useMemo(() => totalDistance(points), [points]);
  const longCount = stays.filter((s) => s.durationMs >= LONG_STAY_MS).length;

  const html = useMemo(
    () => buildMapHtml({ points, stays, dark: theme === 'dark', longStayMs: LONG_STAY_MS, live }),
    [points, stays, theme, live]
  );

  // ---- actions ----
  const onToggle = async (on) => {
    setToggling(true);
    try {
      if (on) {
        const res = await startTracking(uid);
        if (!res.ok) {
          setTracking(false);
          showAlert('Cannot start tracking', res.message, 'error');
        } else {
          setTracking(true);
          if (res.limited) {
            showAlert(
              'Allow location "all the time"',
              'For tracking to keep working when the app is closed, open Settings → App permissions → Location and choose "Allow all the time".',
              'warning',
              {
                showCancel: true,
                confirmText: 'Open settings',
                cancelText: 'Later',
                onConfirm: () => {
                  hideAlert();
                  Linking.openSettings();
                },
                onCancel: hideAlert,
              }
            );
          }
          loadBuffer();
        }
      } else {
        await stopTracking(uid);
        setTracking(false);
        loadBuffer();
      }
    } catch (e) {
      showAlert('Error', e.message || 'Could not change tracking.', 'error');
      setTracking(await isTrackingActive());
    }
    setToggling(false);
  };

  const refresh = async () => {
    await flushBuffer(uid, { force: true });
    await loadBuffer();
  };

  const clearDay = () => {
    showAlert('Delete this day?', `All recorded locations for ${formatDay(day)} will be deleted.`, 'warning', {
      showCancel: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        hideAlert();
        try {
          const snap = await getDocs(
            query(collection(db, 'users', uid, 'locations'), where('date', '==', dateStr))
          );
          await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
          await removeFromBuffer(uid, (p) => dateKey(p.t) === dateStr);
          loadBuffer();
        } catch (e) {
          showAlert('Error', e.message, 'error');
        }
      },
      onCancel: hideAlert,
    });
  };

  const openInMaps = (s) => Linking.openURL(`https://www.google.com/maps?q=${s.la},${s.lo}`);

  const first = points[0];
  const last = points[points.length - 1];
  const mapHeight = Math.round(height * 0.38);

  return (
    <View style={styles.root}>
      {/* Tracking switch */}
      <View style={styles.topArea}>
        <View style={styles.card}>
          <View style={[styles.statusDot, { backgroundColor: tracking ? '#10B981' : colors.dim }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{tracking ? 'Tracking is ON' : 'Tracking is OFF'}</Text>
            <Text style={styles.cardSub}>
              {tracking ? 'Keep phone location (GPS) turned on.' : 'Turn on to record the places you visit.'}
            </Text>
          </View>
          {toggling ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Switch
              value={tracking}
              onValueChange={onToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          )}
        </View>

        {/* Day switcher */}
        <View style={styles.dayRow}>
          <TouchableOpacity onPress={() => setDay(addDays(day, -1))} hitSlop={10}>
            <Icon name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDay(startOfDay(new Date()))} activeOpacity={0.7}>
            <Text style={styles.dayText}>{isToday ? `Today · ${formatDay(day)}` : formatDay(day)}</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={isToday} onPress={() => setDay(addDays(day, 1))} hitSlop={10}>
            <Icon name="chevron-right" size={28} color={isToday ? colors.border : colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map */}
      <View style={[styles.mapBox, { height: mapHeight }]}>
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          style={{ flex: 1, backgroundColor: colors.bg }}
        />
        {loading && (
          <View style={styles.overlay} pointerEvents="none">
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
        {!loading && points.length === 0 && (
          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.emptyBadge}>
              <Icon name="map-marker-off-outline" size={18} color={colors.muted} />
              <Text style={{ color: colors.muted, marginLeft: 8, fontSize: 13 }}>No location recorded this day</Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <Stat styles={styles} icon="map-marker-distance" label="Distance" value={formatDistance(distance)} />
          <Stat
            styles={styles}
            icon="clock-outline"
            label="Tracked"
            value={first && last ? `${formatTime(first.t)} - ${formatTime(last.t)}` : '--'}
            small
          />
        </View>
        <View style={styles.statsRow}>
          <Stat styles={styles} icon="map-marker-check-outline" label="Stays" value={String(stays.length)} />
          <Stat styles={styles} icon="timer-sand" label="1h+ stays" value={String(longCount)} />
        </View>

        {/* Stays */}
        <Text style={styles.sectionTitle}>Places you stayed</Text>
        {stays.length === 0 ? (
          <Text style={styles.muted}>
            No stay of {formatDuration(MIN_STAY_MS)} or more found for this day.
          </Text>
        ) : (
          stays.map((s, i) => {
            const long = s.durationMs >= LONG_STAY_MS;
            const accent = long ? '#EF4444' : '#F59E0B';
            return (
              <TouchableOpacity key={`${s.startT}-${i}`} activeOpacity={0.8} onPress={() => openInMaps(s)} style={styles.stayCard}>
                <View style={[styles.stayNum, { backgroundColor: accent + '26' }]}>
                  <Text style={{ color: accent, fontWeight: '800' }}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.stayTitle}>{formatDuration(s.durationMs)}</Text>
                    {long && (
                      <View style={styles.longBadge}>
                        <Text style={styles.longBadgeText}>1h+</Text>
                      </View>
                    )}
                    {s.ongoing && (
                      <View style={[styles.longBadge, { backgroundColor: '#3B82F6' }]}>
                        <Text style={styles.longBadgeText}>NOW</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardSub}>
                    {formatTime(s.startT)} - {s.ongoing ? 'now' : formatTime(s.endT)}
                  </Text>
                </View>
                <Icon name="map-search-outline" size={22} color={colors.dim} />
              </TouchableOpacity>
            );
          })
        )}

        {/* Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={refresh} style={styles.actionBtn} activeOpacity={0.8}>
            <Icon name="cloud-upload-outline" size={18} color={colors.text} />
            <Text style={styles.actionText}>Sync now</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearDay} style={[styles.actionBtn, { borderColor: colors.expense + '66' }]} activeOpacity={0.8}>
            <Icon name="trash-can-outline" size={18} color={colors.expense} />
            <Text style={[styles.actionText, { color: colors.expense }]}>Delete this day</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.muted, { marginTop: 16 }]}>
          Only you can see this data. A stay = you stayed within {100} m for {formatDuration(MIN_STAY_MS)}+.
          If the phone is switched off or location is disabled, tracking pauses and the stay time may be inaccurate.
        </Text>
      </ScrollView>

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
    </View>
  );
}

const Stat = ({ styles, icon, label, value, small }) => (
  <View style={styles.stat}>
    <Icon name={icon} size={20} color={styles.iconColor.color} />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, small && { fontSize: 13 }]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const createStyles = (colors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    topArea: { padding: 16, paddingBottom: 8 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
    cardTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
    cardSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
    dayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
    dayText: { color: colors.text, fontSize: 15, fontWeight: '700' },
    mapBox: {
      marginHorizontal: 16,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
    emptyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    stat: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    iconColor: { color: colors.primary },
    statLabel: { color: colors.muted, fontSize: 11, marginTop: 6, fontWeight: '600' },
    statValue: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 2 },
    sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 10 },
    muted: { color: colors.muted, fontSize: 12, lineHeight: 18 },
    stayCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 10,
    },
    stayNum: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    stayTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
    longBadge: { backgroundColor: '#EF4444', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginLeft: 8 },
    longBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    actionText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  });