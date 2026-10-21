import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

/**
 * First-Launch Animated Logo Reveal
 * Visually driven storytelling: Healthcare, Speech, Medical Documents, and AI Understanding
 * converge into the MedGuide AI mark, followed by a minimal tagline and Get Started action.
 */
export function BrandIntroduction({ onContinue }: { onContinue: () => void }) {
  const [anim] = useState(() => new Animated.Value(0));
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    let animation: Animated.CompositeAnimation | undefined;

    const startSequence = (reduced: boolean) => {
      if (unmounted.current) return;
      if (reduced) {
        anim.setValue(1);
      } else {
        animation = Animated.timing(anim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: Platform.OS !== 'web',
        });
        animation.start();
      }
    };

    void AccessibilityInfo.isReduceMotionEnabled()
      .then(startSequence)
      .catch(() => startSequence(true));

    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', startSequence);
    return () => {
      unmounted.current = true;
      animation?.stop();
      sub.remove();
    };
  }, [anim]);

  // Interpolations
  // Phase 1 (0 to 0.4): converging motifs fade in and move inward
  const motifsOpacity = anim.interpolate({
    inputRange: [0, 0.2, 0.5, 0.7],
    outputRange: [0, 0.9, 0.8, 0],
  });
  const motifsSpread = anim.interpolate({
    inputRange: [0, 0.45],
    outputRange: [72, 28],
  });

  // Phase 2 (0.35 to 0.85): Logo reveal
  const logoScale = anim.interpolate({
    inputRange: [0, 0.35, 0.75, 1],
    outputRange: [0.65, 0.75, 1.05, 1],
  });
  const logoOpacity = anim.interpolate({
    inputRange: [0, 0.3, 0.65, 1],
    outputRange: [0, 0.2, 1, 1],
  });
  const haloScale = anim.interpolate({
    inputRange: [0, 0.4, 0.8, 1],
    outputRange: [0.8, 1, 1.25, 1.15],
  });
  const haloOpacity = anim.interpolate({
    inputRange: [0, 0.4, 0.7, 1],
    outputRange: [0, 0.35, 0.5, 0.25],
  });

  // Phase 3 (0.65 to 1): Title, tagline and Get Started button
  const textOpacity = anim.interpolate({
    inputRange: [0, 0.6, 0.85, 1],
    outputRange: [0, 0, 0.8, 1],
  });
  const buttonSlide = anim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [20, 15, 0],
  });
  const buttonOpacity = anim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={s.page}>
      {/* Top Bar with Skip */}
      <View style={s.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip intro"
          onPress={onContinue}
          style={({ pressed }) => [s.skipBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={s.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Central Visual Storytelling Stage */}
      <View style={s.stage}>
        {/* Animated converging motifs */}
        <Animated.View
          style={[
            s.motifsContainer,
            {
              opacity: motifsOpacity,
            },
          ]}
          pointerEvents="none"
        >
          {/* Top: Healthcare Symbol */}
          <Animated.View style={[s.motifPill, { top: 0, transform: [{ translateY: motifsSpread }] }]}>
            <Text style={s.motifIcon}>✚</Text>
          </Animated.View>
          {/* Right: Speech Wave */}
          <Animated.View style={[s.motifPill, { right: 0, transform: [{ translateX: Animated.multiply(motifsSpread, -1) }] }]}>
            <Text style={s.motifIcon}>🎙</Text>
          </Animated.View>
          {/* Bottom: Medical Document */}
          <Animated.View style={[s.motifPill, { bottom: 0, transform: [{ translateY: Animated.multiply(motifsSpread, -1) }] }]}>
            <Text style={s.motifIcon}>📄</Text>
          </Animated.View>
          {/* Left: AI Understanding */}
          <Animated.View style={[s.motifPill, { left: 0, transform: [{ translateX: motifsSpread }] }]}>
            <Text style={s.motifIcon}>✦</Text>
          </Animated.View>
        </Animated.View>

        {/* Halo Glow */}
        <Animated.View
          style={[
            s.halo,
            {
              opacity: haloOpacity,
              transform: [{ scale: haloScale }],
            },
          ]}
        />

        {/* Central Logo Mark Reveal */}
        <Animated.View
          style={[
            s.logoOrb,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../assets/medguide-mark.png')}
            accessibilityLabel="MedGuide AI logo"
            style={s.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand Name & Tagline */}
        <Animated.View style={[s.textGroup, { opacity: textOpacity }]}>
          <Text accessibilityRole="header" style={s.title}>
            MedGuide AI
          </Text>
          <Text style={s.tagline}>Care in your language.</Text>
        </Animated.View>
      </View>

      {/* Action Footer */}
      <Animated.View
        style={[
          s.footer,
          {
            opacity: buttonOpacity,
            transform: [{ translateY: buttonSlide }],
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Get Started"
          onPress={onContinue}
          style={({ pressed }) => [s.primaryButton, pressed && s.primaryButtonPressed]}
        >
          <Text style={s.primaryButtonText}>Get Started →</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#073d37',
    paddingHorizontal: 28,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    minHeight: 44,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipText: {
    color: '#d6ede4',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 320,
  },
  motifsContainer: {
    position: 'absolute',
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motifPill: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  motifIcon: {
    fontSize: 18,
    color: '#f6f1e8',
  },
  halo: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(15, 118, 110, 0.45)',
  },
  logoOrb: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
  },
  logoImage: {
    width: 96,
    height: 96,
  },
  textGroup: {
    marginTop: 28,
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 34,
    color: '#f6f1e8',
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#a8d5c4',
    fontWeight: '500',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
  },
  primaryButton: {
    backgroundColor: '#f6f1e8',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonPressed: {
    backgroundColor: '#e6eee1',
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#073d37',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
