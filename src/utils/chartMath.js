// ---- small helpers for the charts ----

// round a max value UP to a "nice" number whose half is also nice (1k, 2k, 4k, 6k, 8k, 10k ...)
export const niceMax = (v) => {
    if (!v || v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const steps = [1, 2, 4, 6, 8, 10];
    for (let i = 0; i < steps.length; i++) {
        if (v <= steps[i] * p) return steps[i] * p;
    }
    return 10 * p;
};

// 1200 -> "1.2k", 3000000 -> "3M"
export const shortNum = (n) => {
    if (n >= 1e6) return `${(n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(n % 1e3 === 0 ? 0 : 1)}k`;
    return String(Math.round(n));
};

// Smooth curve through points without overshooting (monotone cubic interpolation)
export const monotonePath = (pts) => {
    const n = pts.length;
    if (n === 0) return '';
    if (n === 1) return `M ${pts[0].x} ${pts[0].y}`;

    const dx = [];
    const m = [];
    for (let i = 0; i < n - 1; i++) {
        dx[i] = pts[i + 1].x - pts[i].x;
        m[i] = (pts[i + 1].y - pts[i].y) / dx[i];
    }

    const t = new Array(n);
    t[0] = m[0];
    t[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) {
        t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
    }
    for (let i = 0; i < n - 1; i++) {
        if (m[i] === 0) {
            t[i] = 0;
            t[i + 1] = 0;
        } else {
            const a = t[i] / m[i];
            const b = t[i + 1] / m[i];
            const s = a * a + b * b;
            if (s > 9) {
                const tau = 3 / Math.sqrt(s);
                t[i] = tau * a * m[i];
                t[i + 1] = tau * b * m[i];
            }
        }
    }

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < n - 1; i++) {
        const c1x = pts[i].x + dx[i] / 3;
        const c1y = pts[i].y + (t[i] * dx[i]) / 3;
        const c2x = pts[i + 1].x - dx[i] / 3;
        const c2y = pts[i + 1].y - (t[i + 1] * dx[i]) / 3;
        d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${pts[i + 1].x} ${pts[i + 1].y}`;
    }
    return d;
};