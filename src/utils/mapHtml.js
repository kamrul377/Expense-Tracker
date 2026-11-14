import { formatDuration, formatTime } from './tracking';

// Builds a small web page (Leaflet + OpenStreetMap) that is shown inside a WebView.
// No Google Maps API key or billing account is needed.
export function buildMapHtml({ points, stays, dark, longStayMs, live }) {
  const segments = [];
  let cur = [];
  points.forEach((p) => {
    cur.push([p.la, p.lo]);
    if (p.stop) {
      segments.push(cur);
      cur = [];
    }
  });
  if (cur.length) segments.push(cur);

  const data = {
    dark: !!dark,
    live: !!live,
    segments,
    start: points.length ? [points[0].la, points[0].lo] : null,
    end: points.length ? [points[points.length - 1].la, points[points.length - 1].lo] : null,
    stays: stays.map((s, i) => ({
      n: i + 1,
      la: s.la,
      lo: s.lo,
      long: s.durationMs >= longStayMs,
      label: formatDuration(s.durationMs),
      range: `${formatTime(s.startT)} - ${s.ongoing ? 'now' : formatTime(s.endT)}`,
    })),
  };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: ${dark ? '#0F172A' : '#E5E7EB'}; }
  .pin { width: 26px; height: 26px; border-radius: 50%; color: #fff; font: 700 12px sans-serif;
         display: flex; align-items: center; justify-content: center; border: 2px solid #fff;
         box-shadow: 0 1px 4px rgba(0,0,0,.5); }
  .pin.start { background: #10B981; }
  .pin.end { background: #EF4444; }
  .pin.now { background: #3B82F6; animation: blink 1.4s infinite; }
  .long { position: relative; width: 0; height: 0; }
  .long .ring { position: absolute; left: -20px; top: -20px; width: 40px; height: 40px; border-radius: 50%;
                background: rgba(239,68,68,.4); animation: pulse 1.8s infinite; }
  .long .dot { position: absolute; left: -8px; top: -8px; width: 16px; height: 16px; border-radius: 50%;
               background: #EF4444; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.5); }
  .long .badge { position: absolute; left: 0; top: -50px; transform: translateX(-50%); background: #EF4444; color: #fff;
                 font: 700 12px sans-serif; padding: 4px 9px; border-radius: 12px; white-space: nowrap;
                 box-shadow: 0 1px 5px rgba(0,0,0,.45); }
  .long .badge:after { content: ''; position: absolute; left: 50%; bottom: -5px; margin-left: -5px;
                       border: 5px solid transparent; border-top-color: #EF4444; border-bottom: 0; }
  @keyframes pulse { 0% { transform: scale(.5); opacity: .9; } 100% { transform: scale(1.5); opacity: 0; } }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: .55; } }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
<script>
(function () {
  var D = ${json};
  var map = L.map('map', { zoomControl: true });
  var tileUrl = D.dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  L.tileLayer(tileUrl, {
    maxZoom: 19,
    subdomains: D.dark ? 'abcd' : 'abc',
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  var bounds = [];

  // the route
  D.segments.forEach(function (seg) {
    seg.forEach(function (p) { bounds.push(p); });
    if (seg.length > 1) {
      L.polyline(seg, { color: '#3B82F6', weight: 5, opacity: 0.9, lineJoin: 'round', lineCap: 'round' }).addTo(map);
    }
  });

  function pin(cls, text) {
    return L.divIcon({ className: '', html: '<div class="pin ' + cls + '">' + text + '</div>', iconSize: [26, 26], iconAnchor: [13, 13] });
  }

  // start + end/now
  if (D.start) L.marker(D.start, { icon: pin('start', 'S'), zIndexOffset: 500 }).addTo(map);
  if (D.end && (D.segments.length && D.segments[D.segments.length - 1].length)) {
    L.marker(D.end, { icon: D.live ? pin('now', '&#9679;') : pin('end', 'E'), zIndexOffset: 600 })
      .addTo(map).bindPopup(D.live ? 'You are here (live)' : 'Last recorded position');
  }

  // stays
  D.stays.forEach(function (s) {
    bounds.push([s.la, s.lo]);
    var text = '<b>Stay #' + s.n + '</b><br>' + s.label + '<br>' + s.range;
    if (s.long) {
      var icon = L.divIcon({
        className: '',
        html: '<div class="long"><div class="ring"></div><div class="dot"></div><div class="badge">&#9201; ' + s.label + '</div></div>',
        iconSize: [0, 0]
      });
      L.marker([s.la, s.lo], { icon: icon, zIndexOffset: 1000 }).addTo(map).bindPopup(text);
    } else {
      L.circleMarker([s.la, s.lo], { radius: 7, color: '#fff', weight: 2, fillColor: '#F59E0B', fillOpacity: 1 })
        .addTo(map).bindPopup(text);
    }
  });

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
  } else {
    map.setView([23.685, 90.3563], 7);
  }
})();
</script>
</body>
</html>`;
}
