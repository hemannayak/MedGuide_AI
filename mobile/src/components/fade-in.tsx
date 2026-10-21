import { ReactNode, useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleProp, ViewStyle } from 'react-native';

/** Finite entry motion, with reduced-motion support and unmount cleanup. */
export function FadeIn({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const [progress] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    void AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (!active) return;
      if (reduced) progress.setValue(1);
      else {
        animation = Animated.timing(progress, { toValue: 1, duration: 320, useNativeDriver: Platform.OS !== 'web' });
        animation.start();
      }
    }).catch(() => { if (active) progress.setValue(1); });
    return () => { active = false; animation?.stop(); };
  }, [progress]);
  return <Animated.View style={[style, { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }]}>{children}</Animated.View>;
}
