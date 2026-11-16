// import React, { useEffect, useRef } from 'react';
// import { Animated, StyleSheet, Text, View } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import { useAuth } from '../context/AuthContext';

// export default function SplashScreen() {
//   const { colors } = useAuth();
  
//   const scaleAnim = useRef(new Animated.Value(0.8)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(scaleAnim, {
//             toValue: 1.1,
//             duration: 1000,
//             useNativeDriver: true,
//           }),
//           Animated.timing(scaleAnim, {
//             toValue: 0.8,
//             duration: 1000,
//             useNativeDriver: true,
//           }),
//         ])
//       ),
//     ]).start();
//   }, [fadeAnim, scaleAnim]);

//   return (
//     <View style={[styles.container, { backgroundColor: colors.bg }]}>
//       <Animated.View
//         style={[
//           styles.logoContainer,
//           {
//             backgroundColor: colors.primary + '20',
//             borderColor: colors.primary + '50',
//             opacity: fadeAnim,
//             transform: [{ scale: scaleAnim }],
//           },
//         ]}
//       >
//         <Icon name="wallet" size={48} color={colors.primary} />
//       </Animated.View>

//       <Animated.Text
//         style={[
//           styles.appName,
//           { color: colors.text, opacity: fadeAnim },
//         ]}
//       >
//         My Expense Tracker
//       </Animated.Text>
      
//       <Animated.Text
//         style={[
//           styles.tagline,
//           { color: colors.muted, opacity: fadeAnim },
//         ]}
//       >
//         Loading your finances...
//       </Animated.Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   logoContainer: {
//     width: 96,
//     height: 96,
//     borderRadius: 48,
//     borderWidth: 2,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 20,
//   },
//   appName: {
//     fontSize: 20,
//     fontWeight: '800',
//     letterSpacing: 0.5,
//   },
//   tagline: {
//     fontSize: 13,
//     fontWeight: '500',
//     marginTop: 6,
//   },
// });

import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StatusBar, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Pattern, Rect, Stop } from 'react-native-svg';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const { width: W } = Dimensions.get('window');

const TITLE = 'My Expense Tracker'; // <-- app er naam
const TAGLINE = 'Track  •  Save  •  Share';

const TRACK_W = Math.min(220, W * 0.6);
const BAR_W = 90;

const C = {
  top: '#F5FBF8',
  bottom: '#D9F2E6',
  accent: '#10B981',
  light: '#34D399',
  gold: '#FBBF24',
};

// Logo er dike ure ashbe ei choto icon gulo (logo "build" hocche emon feel)
const COINS = [
  { x: -125, y: -95, icon: 'cash', color: '#10B981' },
  { x: 125, y: -75, icon: 'currency-usd', color: '#F59E0B' },
  { x: -100, y: 115, icon: 'chart-line', color: '#3B82F6' },
  { x: 120, y: 105, icon: 'credit-card-outline', color: '#EC4899' },
];

export default function SplashScreen() {
  const glow = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const rings = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const coins = useRef(COINS.map(() => new Animated.Value(0))).current;
  const badge = useRef(new Animated.Value(0)).current;
  const iconPop = useRef(new Animated.Value(0)).current;
  const letters = useRef(TITLE.split('').map(() => new Animated.Value(0))).current;
  const tagline = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const build = Animated.sequence([
      // 1. glow + ring ashe
      Animated.parallel([
        Animated.timing(glow, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(rings, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // 2. icon gulo uire logo er jaygay ashe
      Animated.stagger(
        110,
        coins.map((c) =>
          Animated.timing(c, { toValue: 1, duration: 700, easing: Easing.in(Easing.cubic), useNativeDriver: true })
        )
      ),
      // 3. logo badge toiri hoy
      Animated.spring(badge, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
      Animated.spring(iconPop, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true }),
      // 4. naam akkhor kore ashe
      Animated.stagger(
        45,
        letters.map((l) => Animated.timing(l, { toValue: 1, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true }))
      ),
      Animated.timing(tagline, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]);

    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true })
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    const barLoop = Animated.loop(
      Animated.timing(bar, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    );

    build.start();
    spinLoop.start();
    pulseLoop.start();
    barLoop.start();

    return () => {
      build.stop();
      spinLoop.stop();
      pulseLoop.stop();
      barLoop.stop();
    };
  }, [badge, bar, coins, glow, iconPop, letters, pulse, rings, spin, tagline]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const badgeRotate = badge.interpolate({ inputRange: [0, 1], outputRange: ['-30deg', '0deg'] });
  const glowScale = Animated.add(glow, pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.12] }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.top} />

      {/* Background: gradient + halka dot pattern */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={C.top} />
              <Stop offset="1" stopColor={C.bottom} />
            </LinearGradient>
            <Pattern id="dots" patternUnits="userSpaceOnUse" width="34" height="34">
              <Circle cx="4" cy="4" r="1.3" fill={C.accent} />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bg)" />
          <Rect width="100%" height="100%" fill="url(#dots)" opacity={0.14} />
        </Svg>
      </View>

      {/* decorative floating bubbles */}
      <View style={[styles.bubble, { top: -70, right: -60, width: 220, height: 220, opacity: 0.1 }]} />
      <View style={[styles.bubble, { bottom: -90, left: -70, width: 260, height: 260, opacity: 0.08 }]} />

      {/* ===== Logo area ===== */}
      <View style={styles.logoArea}>
        {/* glow */}
        <Animated.View style={[styles.glow, { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.2] }), transform: [{ scale: glowScale }] }]} />

        {/* rings */}
        <Animated.View
          style={[
            styles.ring,
            { width: 236, height: 236, borderRadius: 118, opacity: rings.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] }), transform: [{ scale: rings.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            { width: 184, height: 184, borderRadius: 92, opacity: rings.interpolate({ inputRange: [0, 1], outputRange: [0, 0.3] }), transform: [{ scale: rings.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] },
          ]}
        />
        {/* ghurte thaka dashed ring */}
        <Animated.View
          style={[
            styles.ring,
            {
              width: 208,
              height: 208,
              borderRadius: 104,
              borderStyle: 'dashed',
              borderColor: C.accent,
              opacity: rings.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }),
              transform: [{ rotate }],
            },
          ]}
        />

        {/* icon gulo logo er dike ure ashe */}
        {COINS.map((c, i) => {
          const p = coins[i];
          return (
            <Animated.View
              key={c.icon}
              style={[
                styles.coin,
                {
                  borderColor: c.color + '66',
                  opacity: p.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, 1, 1, 0] }),
                  transform: [
                    { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [c.x, 0] }) },
                    { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [c.y, 0] }) },
                    { scale: p.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.9, 0.3] }) },
                  ],
                },
              ]}
            >
              <Icon name={c.icon} size={20} color={c.color} />
            </Animated.View>
          );
        })}

        {/* main logo badge */}
        <Animated.View
          style={[
            styles.badge,
            { opacity: badge, transform: [{ scale: badge }, { rotate: badgeRotate }] },
          ]}
        >
          <View style={styles.badgeShine} />
          <Animated.View style={{ transform: [{ scale: iconPop }] }}>
            <Icon name="wallet" size={52} color="#FFFFFF" />
          </Animated.View>
          <View style={styles.badgeDot}>
            <Icon name="check" size={13} color="#0A1424" />
          </View>
        </Animated.View>
      </View>

      {/* ===== App name (akkhor kore) ===== */}
      <View style={styles.titleRow}>
        {TITLE.split('').map((ch, i) => (
          <Animated.Text
            key={`${ch}-${i}`}
            style={[
              styles.title,
              {
                opacity: letters[i],
                transform: [{ translateY: letters[i].interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
              },
            ]}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </Animated.Text>
        ))}
      </View>

      <Animated.Text style={[styles.tagline, { opacity: tagline }]}>{TAGLINE}</Animated.Text>

      {/* ===== Loading bar ===== */}
      <Animated.View style={[styles.footer, { opacity: tagline }]}>
        <View style={[styles.track, { width: TRACK_W }]}>
          <Animated.View
            style={[
              styles.bar,
              { transform: [{ translateX: bar.interpolate({ inputRange: [0, 1], outputRange: [-BAR_W, TRACK_W] }) }] },
            ]}
          />
        </View>
        <Animated.Text style={styles.loadingText}>Loading your finances...</Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.top,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: C.accent,
  },
  logoArea: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: C.accent,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: C.accent,
  },
  coin: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F1C18',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 112,
    height: 112,
    borderRadius: 34,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    shadowColor: C.accent,
    shadowOpacity: 0.7,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  badgeShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 54,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  badgeDot: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: C.top,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 18,
  },
  title: {
    color: '#0F1C18',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 64,
    alignItems: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(16,185,129,0.18)',
  },
  bar: {
    width: BAR_W,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.accent,
  },
  loadingText: {
    color: '#526660',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 12,
  },
});