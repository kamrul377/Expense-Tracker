import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';

// x / y are fractions of the screen (0 - 1). dx / dy = how far the bubble floats (px).
const BUBBLES = [
  { size: 220, x: 0.05, y: 0.08, dx: 18, dy: 26, duration: 10000, delay: 0, tone: 'primary', opacity: 0.06 },
  { size: 110, x: 0.88, y: 0.3, dx: -14, dy: 22, duration: 8500, delay: 600, tone: 'accent', opacity: 0.08 },
  { size: 170, x: 0.0, y: 0.62, dx: 20, dy: -24, duration: 11000, delay: 900, tone: 'accent', opacity: 0.05 },
  { size: 90, x: 0.75, y: 0.78, dx: -16, dy: 20, duration: 9000, delay: 300, tone: 'income', opacity: 0.07 },
  { size: 200, x: 0.5, y: 0.97, dx: -14, dy: -18, duration: 12000, delay: 700, tone: 'primary', opacity: 0.05 },
];

function Bubble({ size, left, top, color, opacity, dx, dy, duration, delay }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const timer = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [anim, duration, delay]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        borderWidth: 1.5,
        borderColor: color,
        opacity,
        transform: [{ translateX }, { translateY }, { scale }],
      }}
    >
      {/* small shine on the bubble */}
      <View
        style={{
          position: 'absolute',
          top: size * 0.14,
          left: size * 0.2,
          width: size * 0.22,
          height: size * 0.22,
          borderRadius: size * 0.11,
          backgroundColor: 'rgba(255,255,255,0.18)',
        }}
      />
    </Animated.View>
  );
}

export default function BubbleBackground({ colors }) {
  const { width, height } = useWindowDimensions();

  const tones = {
    primary: colors?.primary || '#635BEB',
    accent: colors?.accent || colors?.primaryLight || '#38BDF8',
    income: colors?.income || '#34D399',
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {BUBBLES.map((b, i) => (
        <Bubble
          key={i}
          size={b.size}
          left={width * b.x - b.size / 2}
          top={height * b.y - b.size / 2}
          color={tones[b.tone]}
          opacity={b.opacity}
          dx={b.dx}
          dy={b.dy}
          duration={b.duration}
          delay={b.delay}
        />
      ))}
    </View>
  );
}