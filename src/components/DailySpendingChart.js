import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { formatMoney } from '../utils/format';
import { monotonePath, niceMax, shortNum } from '../utils/chartMath';

const CHART_H = 200;
const PAD = { l: 40, r: 10, t: 16, b: 26 };
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Interactive daily spending chart.
 *  - touch / drag anywhere on the chart to inspect a day
 *  - switch between smooth "Line" and "Bars" view
 * props: data = [{ day, amount }], month = Date, symbol, colors
 */
export default function DailySpendingChart({ data, month, symbol, colors }) {
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [mode, setMode] = useState('line');
    const [sel, setSel] = useState(null);
    const [width, setWidth] = useState(0);

    const monthKey = `${month.getFullYear()}-${month.getMonth()}`;
    const n = data.length;

    const items = useMemo(
        () =>
            data.map((d) => {
                const date = new Date(month.getFullYear(), month.getMonth(), d.day);
                return { ...d, label: `${WEEKDAYS[date.getDay()]}, ${d.day} ${MONTHS[date.getMonth()]}`, short: `${d.day} ${MONTHS[date.getMonth()]}` };
            }),
        [data, month]
    );

    const { total, peakIdx, avg, maxAmount } = useMemo(() => {
        let t = 0;
        let pk = -1;
        let mx = 0;
        items.forEach((d, i) => {
            t += d.amount;
            if (d.amount > mx) {
                mx = d.amount;
                pk = i;
            }
        });
        const now = new Date();
        const isCurrent = now.getFullYear() === month.getFullYear() && now.getMonth() === month.getMonth();
        const elapsed = isCurrent ? Math.min(now.getDate(), items.length) : items.length;
        return { total: t, peakIdx: pk, avg: elapsed > 0 ? t / elapsed : 0, maxAmount: mx };
    }, [items, month]);

    // select the peak day whenever the month / data changes
    useEffect(() => {
        setSel(peakIdx >= 0 ? peakIdx : null);
    }, [monthKey, peakIdx]);

    // fade-in when month or chart type changes
    const fade = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        fade.setValue(0);
        Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }, [mode, monthKey, fade]);

    // ---- touch handling (refs so the responder never goes stale) ----
    const geo = useRef({ width: 0, n: 0, mode: 'line' });
    geo.current = { width, n, mode };

    const responder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderTerminationRequest: () => false, // do not let the tab swiper steal the drag
            onPanResponderGrant: (e) => setSel(idxFromX(e.nativeEvent.locationX, geo.current)),
            onPanResponderMove: (e) => setSel(idxFromX(e.nativeEvent.locationX, geo.current)),
        })
    ).current;

    // ---- geometry ----
    const plotW = Math.max(1, width - PAD.l - PAD.r);
    const plotH = CHART_H - PAD.t - PAD.b;
    const baseY = PAD.t + plotH;
    const yMax = niceMax(maxAmount);
    const yOf = (v) => baseY - (v / yMax) * plotH;
    const xLine = (i) => PAD.l + (n <= 1 ? plotW / 2 : (i * plotW) / (n - 1));
    const step = plotW / Math.max(1, n);
    const xBar = (i) => PAD.l + step * (i + 0.5);
    const xOf = (i) => (mode === 'bars' ? xBar(i) : xLine(i));

    const linePts = items.map((d, i) => ({ x: xLine(i), y: yOf(d.amount) }));
    const linePath = monotonePath(linePts);
    const areaPath = n > 1 ? `${linePath} L ${xLine(n - 1)} ${baseY} L ${xLine(0)} ${baseY} Z` : '';

    const xTicks = [1, 8, 15, 22].filter((d) => n - d >= 3).concat(n);
    const yTicks = [0, yMax / 2, yMax];

    const accent = colors.expense;
    const avgColor = colors.warn || '#FBBF24';
    const selected = sel != null ? items[sel] : null;

    const fmt = (v) => formatMoney(v, symbol).replace(/\.00$/, '');

    // comparison chip
    let chip = null;
    if (selected) {
        if (selected.amount <= 0) {
            chip = { text: 'No spending', color: colors.muted, icon: 'check-circle-outline' };
        } else if (avg > 0) {
            const ratio = selected.amount / avg;
            chip =
                ratio >= 1
                    ? { text: `${Math.round((ratio - 1) * 100)}% above avg`, color: colors.expense, icon: 'trending-up' }
                    : { text: `${Math.round((1 - ratio) * 100)}% below avg`, color: colors.income, icon: 'trending-down' };
        }
    }

    if (total <= 0) {
        return (
            <View style={styles.empty}>
                <Icon name="chart-line-variant" size={36} color={colors.dim} />
                <Text style={styles.emptyText}>No expense data for this month</Text>
            </View>
        );
    }

    return (
        <View>
            {/* Readout + chart type switch */}
            <View style={styles.headRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.caption}>{selected ? selected.label : 'Touch the chart'}</Text>
                    <Text style={styles.big}>{fmt(selected ? selected.amount : 0)}</Text>
                    <View style={styles.chipRow}>
                        {chip && (
                            <View style={[styles.chip, { backgroundColor: chip.color + '22' }]}>
                                <Icon name={chip.icon} size={13} color={chip.color} />
                                <Text style={[styles.chipText, { color: chip.color }]}>{chip.text}</Text>
                            </View>
                        )}
                        {selected && sel === peakIdx && selected.amount > 0 && (
                            <View style={[styles.chip, { backgroundColor: '#F59E0B22' }]}>
                                <Icon name="fire" size={13} color="#F59E0B" />
                                <Text style={[styles.chipText, { color: '#F59E0B' }]}>Peak day</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.toggle}>
                    {[
                        { key: 'line', icon: 'chart-line-variant' },
                        { key: 'bars', icon: 'chart-bar' },
                    ].map((o) => (
                        <TouchableOpacity
                            key={o.key}
                            onPress={() => setMode(o.key)}
                            activeOpacity={0.8}
                            style={[styles.toggleBtn, mode === o.key && { backgroundColor: accent + '2A' }]}
                        >
                            <Icon name={o.icon} size={18} color={mode === o.key ? accent : colors.muted} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Chart */}
            <View style={{ height: CHART_H }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
                {width > 0 && (
                    <Animated.View style={{ opacity: fade }}>
                        <Svg width={width} height={CHART_H} pointerEvents="none">
                            <Defs>
                                <LinearGradient id="dsGrad" x1="0" y1="0" x2="0" y2="1">
                                    <Stop offset="0" stopColor={accent} stopOpacity="0.38" />
                                    <Stop offset="1" stopColor={accent} stopOpacity="0" />
                                </LinearGradient>
                            </Defs>

                            {/* grid + y labels */}
                            {yTicks.map((v, i) => (
                                <React.Fragment key={i}>
                                    <Line
                                        x1={PAD.l}
                                        x2={width - PAD.r}
                                        y1={yOf(v)}
                                        y2={yOf(v)}
                                        stroke={colors.border}
                                        strokeWidth={1}
                                        strokeDasharray={i === 0 ? undefined : '3 5'}
                                    />
                                    <SvgText x={PAD.l - 8} y={yOf(v) + 3.5} fontSize={10} fill={colors.muted} textAnchor="end">
                                        {shortNum(v)}
                                    </SvgText>
                                </React.Fragment>
                            ))}

                            {/* average line */}
                            {avg > 0 && avg <= yMax && (
                                <>
                                    <Line x1={PAD.l} x2={width - PAD.r} y1={yOf(avg)} y2={yOf(avg)} stroke={avgColor} strokeWidth={1.2} strokeDasharray="6 4" opacity={0.9} />
                                    <SvgText x={width - PAD.r} y={yOf(avg) - 5} fontSize={9} fontWeight="700" fill={avgColor} textAnchor="end">
                                        AVG
                                    </SvgText>
                                </>
                            )}

                            {mode === 'line' ? (
                                <>
                                    <Path d={areaPath} fill="url(#dsGrad)" />
                                    <Path d={linePath} fill="none" stroke={accent} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                                    {items.map((d, i) =>
                                        d.amount > 0 && i !== sel ? <Circle key={i} cx={xLine(i)} cy={yOf(d.amount)} r={2.6} fill={accent} /> : null
                                    )}
                                </>
                            ) : (
                                items.map((d, i) => {
                                    const bw = Math.max(3, step * 0.62);
                                    const h = d.amount > 0 ? Math.max(4, (d.amount / yMax) * plotH) : 2;
                                    return (
                                        <Rect
                                            key={i}
                                            x={xBar(i) - bw / 2}
                                            y={baseY - h}
                                            width={bw}
                                            height={h}
                                            rx={Math.min(4, bw / 2)}
                                            fill={d.amount <= 0 ? colors.border : i === sel ? accent : accent + '66'}
                                        />
                                    );
                                })
                            )}

                            {/* selected day: guide line + glowing dot */}
                            {sel != null && (
                                <>
                                    <Line x1={xOf(sel)} x2={xOf(sel)} y1={PAD.t} y2={baseY} stroke={colors.text} strokeOpacity={0.35} strokeWidth={1} strokeDasharray="3 4" />
                                    {mode === 'line' && (
                                        <>
                                            <Circle cx={xLine(sel)} cy={yOf(items[sel].amount)} r={12} fill={accent} opacity={0.22} />
                                            <Circle cx={xLine(sel)} cy={yOf(items[sel].amount)} r={6} fill="#FFFFFF" stroke={accent} strokeWidth={3} />
                                        </>
                                    )}
                                </>
                            )}

                            {/* x labels */}
                            {xTicks.map((d) => (
                                <SvgText key={d} x={xOf(d - 1)} y={CHART_H - 6} fontSize={10} fill={sel === d - 1 ? colors.text : colors.muted} fontWeight={sel === d - 1 ? '700' : '400'} textAnchor="middle">
                                    {d}
                                </SvgText>
                            ))}
                        </Svg>
                    </Animated.View>
                )}

                {/* transparent touch layer: tap or drag to inspect */}
                <View style={StyleSheet.absoluteFill} {...responder.panHandlers} />
            </View>

            {/* Summary tiles */}
            <View style={styles.tiles}>
                <Tile styles={styles} icon="wallet-outline" label="Total" value={fmt(total)} color={accent} />
                <Tile styles={styles} icon="calendar-today" label="Avg / day" value={fmt(avg)} color={avgColor} />
                <Tile styles={styles} icon="fire" label={peakIdx >= 0 ? `Peak · ${items[peakIdx].short}` : 'Peak'} value={fmt(maxAmount)} color="#F59E0B" onPress={() => peakIdx >= 0 && setSel(peakIdx)} />
            </View>
        </View>
    );
}

// map a touch x-position to a day index
function idxFromX(x, g) {
    if (!g.n) return null;
    const plotW = Math.max(1, g.width - PAD.l - PAD.r);
    const rel = Math.min(Math.max(x - PAD.l, 0), plotW);
    if (g.mode === 'bars') return Math.min(g.n - 1, Math.floor(rel / (plotW / g.n)));
    return Math.round((rel / plotW) * (g.n - 1));
}

const Tile = ({ styles, icon, label, value, color, onPress }) => (
    <TouchableOpacity activeOpacity={onPress ? 0.8 : 1} onPress={onPress} style={styles.tile}>
        <View style={[styles.tileIcon, { backgroundColor: color + '22' }]}>
            <Icon name={icon} size={15} color={color} />
        </View>
        <Text style={styles.tileLabel} numberOfLines={1}>{label}</Text>
        <Text style={styles.tileValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </TouchableOpacity>
);

const createStyles = (colors) =>
    StyleSheet.create({
        empty: { height: 170, alignItems: 'center', justifyContent: 'center' },
        emptyText: { color: colors.muted, fontSize: 13, marginTop: 8, fontWeight: '500' },
        headRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
        caption: { color: colors.muted, fontSize: 12, fontWeight: '600' },
        big: { color: colors.text, fontSize: 26, fontWeight: '800', marginTop: 2, letterSpacing: -0.5 },
        chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6, minHeight: 24 },
        chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
        chipText: { fontSize: 11, fontWeight: '700' },
        toggle: {
            flexDirection: 'row',
            backgroundColor: colors.bg,
            borderRadius: 12,
            padding: 3,
            borderWidth: 1,
            borderColor: colors.border,
        },
        toggleBtn: { width: 36, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
        tiles: { flexDirection: 'row', gap: 8, marginTop: 10 },
        tile: {
            flex: 1,
            backgroundColor: colors.bg,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 10,
        },
        tileIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
        tileLabel: { color: colors.muted, fontSize: 10, fontWeight: '600', marginTop: 6 },
        tileValue: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: 2 },
    });