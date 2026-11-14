import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { dateKey } from '../utils/tracking';

export const LOCATION_TASK = 'expense-tracker-location-task';

const KEY_UID = 'track_uid';
const KEY_ENABLED = 'track_enabled';
const bufKey = (uid) => `track_buf_${uid}`;

const MAX_ACCURACY_M = 100; // ignore very inaccurate GPS fixes
const FLUSH_COUNT = 15; // upload when this many points are waiting...
const FLUSH_AGE_MS = 10 * 60 * 1000; // ...or when the oldest one is this old

const round = (x) => Math.round(x * 1e6) / 1e6;

// ---------- local buffer (points wait here until uploaded to Firestore) ----------
export const readBuffer = async (uid) => {
  try {
    const raw = await AsyncStorage.getItem(bufKey(uid));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const writeBuffer = (uid, arr) => AsyncStorage.setItem(bufKey(uid), JSON.stringify(arr));

const appendToBuffer = async (uid, pts) => {
  const buf = await readBuffer(uid);
  const seen = new Set(buf.map((p) => p.t));
  pts.forEach((p) => {
    if (!seen.has(p.t)) buf.push(p);
  });
  await writeBuffer(uid, buf);
};

export const removeFromBuffer = async (uid, predicate) => {
  const buf = await readBuffer(uid);
  await writeBuffer(uid, buf.filter((p) => !predicate(p)));
};

const withTimeout = (promise, ms) =>
  Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

// ---------- upload buffered points to Firestore ----------
let flushing = false;
export const flushBuffer = async (uid, { force = false } = {}) => {
  if (flushing) return;
  flushing = true;
  try {
    const buf = await readBuffer(uid);
    if (!buf.length) return;
    if (!force && buf.length < FLUSH_COUNT && Date.now() - buf[0].t < FLUSH_AGE_MS) return;

    try {
      await auth.authStateReady();
    } catch (e) {
      /* ignore */
    }
    if (auth.currentUser?.uid !== uid) return; // not signed in as this user

    // one document per day
    const groups = {};
    buf.forEach((p) => {
      const k = dateKey(p.t);
      if (!groups[k]) groups[k] = [];
      groups[k].push(p);
    });

    for (const date of Object.keys(groups)) {
      await withTimeout(
        addDoc(collection(db, 'users', uid, 'locations'), {
          date,
          points: groups[date],
          createdAt: serverTimestamp(),
        }),
        20000
      );
    }

    const sent = new Set(buf.map((p) => p.t));
    await removeFromBuffer(uid, (p) => sent.has(p.t));
  } catch (e) {
    // keep the buffer, try again next time (duplicates are removed when reading)
  } finally {
    flushing = false;
  }
};

// ---------- background task (must be defined at app start) ----------
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) return;
  const uid = await AsyncStorage.getItem(KEY_UID);
  if (!uid) return;

  const locations = data?.locations || [];
  const pts = locations
    .filter((l) => l?.coords && (l.coords.accuracy == null || l.coords.accuracy <= MAX_ACCURACY_M))
    .map((l) => ({
      la: round(l.coords.latitude),
      lo: round(l.coords.longitude),
      t: l.timestamp,
      a: Math.round(l.coords.accuracy || 0),
    }));

  if (pts.length) await appendToBuffer(uid, pts);
  await flushBuffer(uid);
});

// ---------- public API used by the screen ----------
export const isTrackingActive = async () => {
  try {
    return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
  } catch (e) {
    return false;
  }
};

const startUpdates = () =>
  Location.startLocationUpdatesAsync(LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 30, // metres
    timeInterval: 60000, // ms (Android)
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Location tracker is on',
      notificationBody: 'Recording the places you visit.',
      notificationColor: '#10B981',
    },
  });

export const startTracking = async (uid) => {
  if (!(await Location.hasServicesEnabledAsync())) {
    return { ok: false, message: 'Please turn ON Location (GPS) in your phone quick settings first.' };
  }

  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') {
    return { ok: false, message: 'Location permission is required to track your places.' };
  }

  // needed so tracking keeps working when the app is closed ("Allow all the time")
  const bg = await Location.requestBackgroundPermissionsAsync();
  const limited = bg.status !== 'granted';

  await AsyncStorage.multiSet([
    [KEY_UID, uid],
    [KEY_ENABLED, '1'],
  ]);

  await startUpdates();

  // record where you are right now, so the map shows something immediately
  try {
    const cur = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    await appendToBuffer(uid, [
      {
        la: round(cur.coords.latitude),
        lo: round(cur.coords.longitude),
        t: cur.timestamp,
        a: Math.round(cur.coords.accuracy || 0),
      },
    ]);
  } catch (e) {
    /* ignore */
  }

  return { ok: true, limited };
};

export const stopTracking = async (uid) => {
  if (await isTrackingActive()) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  }
  await AsyncStorage.setItem(KEY_ENABLED, '0');

  // "stop marker": tells the stay detector that tracking ended here (not that you stayed forever)
  try {
    const last = await Location.getLastKnownPositionAsync();
    if (last) {
      await appendToBuffer(uid, [
        { la: round(last.coords.latitude), lo: round(last.coords.longitude), t: Date.now(), stop: 1 },
      ]);
    }
  } catch (e) {
    /* ignore */
  }
  await flushBuffer(uid, { force: true });
};

// call when the app opens: if tracking was ON before (e.g. phone restarted), turn it back on
export const resumeTrackingIfEnabled = async (uid) => {
  try {
    const [[, enabled], [, savedUid]] = await AsyncStorage.multiGet([KEY_ENABLED, KEY_UID]);
    if (enabled !== '1' || savedUid !== uid) return false;
    if (await isTrackingActive()) return true;
    const perm = await Location.getForegroundPermissionsAsync();
    if (perm.status !== 'granted') return false;
    await startUpdates();
    return true;
  } catch (e) {
    return false;
  }
};
