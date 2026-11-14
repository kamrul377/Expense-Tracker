// ---- settings you can tweak ----
export const STAY_RADIUS_M = 100;            // moving less than this = "staying"
export const MIN_STAY_MS = 10 * 60 * 1000;   // stays shorter than this are ignored
export const LONG_STAY_MS = 60 * 60 * 1000;  // stays >= this get the big indicator on the map

const pad = (n) => String(n).padStart(2, '0');

// local date key, e.g. "2026-11-14"
export const dateKey = (t) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const formatDay = (d) => `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export const formatTime = (t) => {
  const d = new Date(t);
  const h = d.getHours();
  return `${h % 12 || 12}:${pad(d.getMinutes())} ${h < 12 ? 'AM' : 'PM'}`;
};

export const formatDuration = (ms) => {
  const m = Math.max(1, Math.round(ms / 60000));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
};

export const formatDistance = (meters) =>
  meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;

export const haversine = (la1, lo1, la2, lo2) => {
  const R = 6371000;
  const rad = (x) => (x * Math.PI) / 180;
  const dLa = rad(la2 - la1);
  const dLo = rad(lo2 - lo1);
  const a =
    Math.sin(dLa / 2) ** 2 + Math.cos(rad(la1)) * Math.cos(rad(la2)) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

// sort by time + remove duplicates (same timestamp)
export const normalizePoints = (list) => {
  const seen = new Set();
  return list
    .filter((p) => p && typeof p.la === 'number' && typeof p.lo === 'number' && p.t)
    .sort((a, b) => a.t - b.t)
    .filter((p) => (seen.has(p.t) ? false : (seen.add(p.t), true)));
};

export const totalDistance = (points) => {
  let sum = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (a.stop) continue; // tracking was stopped here, unknown travel
    const d = haversine(a.la, a.lo, b.la, b.lo);
    const secs = Math.max(1, (b.t - a.t) / 1000);
    if (d < 5) continue; // GPS jitter
    if (d / secs > 70) continue; // > 250 km/h = bad fix
    sum += d;
  }
  return sum;
};

/**
 * Finds places where the user stayed.
 * While you stand still the phone sends no new points, so the stay lasts from the first point
 * of the group until the first point that is outside the radius (= the moment you left).
 */
export const detectStays = (points, opts = {}) => {
  const { radius = STAY_RADIUS_M, minMs = MIN_STAY_MS, live = false, now = Date.now() } = opts;
  const stays = [];
  const n = points.length;
  let i = 0;

  while (i < n) {
    let sumLa = points[i].la;
    let sumLo = points[i].lo;
    let count = 1;
    let cLa = sumLa;
    let cLo = sumLo;
    let j = i + 1;

    while (
      j < n &&
      !points[j - 1].stop &&
      haversine(cLa, cLo, points[j].la, points[j].lo) <= radius
    ) {
      sumLa += points[j].la;
      sumLo += points[j].lo;
      count += 1;
      cLa = sumLa / count;
      cLo = sumLo / count;
      j += 1;
    }

    const startT = points[i].t;
    let endT;
    let ongoing = false;
    if (points[j - 1].stop) {
      endT = points[j - 1].t; // tracking stopped here
    } else if (j < n) {
      endT = points[j].t; // first point after leaving
    } else if (live) {
      endT = Math.max(now, points[j - 1].t); // still here
      ongoing = true;
    } else {
      endT = points[j - 1].t;
    }

    const durationMs = endT - startT;

    // GPS signal lost while travelling (tunnel, metro...) looks like a stay, but the distance to the
    // next fix is far too large for that time -> it was movement, not a stay
    let travelling = false;
    if (j < n && !points[j - 1].stop && durationMs > 0) {
      const dep = haversine(cLa, cLo, points[j].la, points[j].lo);
      travelling = dep / (durationMs / 1000) > 2; // faster than 2 m/s (7 km/h)
    }

    if (durationMs >= minMs && !travelling) {
      stays.push({ la: cLa, lo: cLo, startT, endT, durationMs, count, ongoing });
    }
    i = j;
  }
  return stays;
};
