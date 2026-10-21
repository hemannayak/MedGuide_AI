import { useEffect, useState } from 'react';
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Button, palette } from './brand-ui';
import { RuralScene } from './rural-scene';
import { Language, t } from '../lib/i18n';
import { speakGuidance, stopGuidance } from '../lib/audio-guide';

import { MedicalShieldSvg, VoiceMicWaveSvg, PrescriptionScannerSvg, RuralClinicSvg } from './illustrations';

interface WelcomeFlowProps {
  onSignIn: () => void;
  onRegister: () => void;
  initialLanguage?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export function WelcomeFlow({
  onSignIn,
  onRegister,
  initialLanguage = 'en',
  onLanguageChange,
}: WelcomeFlowProps) {
  useEffect(() => () => stopGuidance(), []);
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  function handleLanguage(newLang: Language) {
    setLang(newLang);
    onLanguageChange?.(newLang);
    if (speaking) {
      stopGuidance();
      setSpeaking(false);
    }
  }

  function handleToggleAudio() {
    if (speaking) {
      stopGuidance();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      const textToSpeak = `${t('appName', lang)}. ${t('introSubtitle', lang)} ${t('audioIntro', lang)}`;
      speakGuidance(textToSpeak, lang, () => setSpeaking(true), () => setSpeaking(false));
    }
  }

  const slides = [
    {
      title: t('slide1Title', lang),
      desc: t('slide1Desc', lang),
      badge: '01 / 04 · HEALTH ACCESS',
      icon: <MedicalShieldSvg size={36} color="#073d37" />,
    },
    {
      title: t('slide2Title', lang),
      desc: t('slide2Desc', lang),
      badge: '02 / 04 · MULTILINGUAL VOICE',
      icon: <VoiceMicWaveSvg size={36} color="#073d37" />,
    },
    {
      title: t('slide3Title', lang),
      desc: t('slide3Desc', lang),
      badge: '03 / 04 · PRESCRIPTION SCAN',
      icon: <PrescriptionScannerSvg size={36} color="#073d37" />,
    },
    {
      title: t('slide4Title', lang),
      desc: t('slide4Desc', lang),
      badge: '04 / 04 · COMMUNITY CLINIC',
      icon: <RuralClinicSvg size={36} color="#073d37" />,
    },
  ];

  const activeSlide = slides[currentSlide];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Header with Language Switcher & Audio Guide */}
      <View style={styles.headerRow}>
        <Brand />
        <View style={styles.langPills}>
          {(['en', 'hi', 'te'] as const).map(code => (
            <Pressable
              key={code}
              onPress={() => handleLanguage(code)}
              style={[styles.langBtn, lang === code && styles.langBtnActive]}
              accessibilityRole="button"
              accessibilityLabel={`Select ${code === 'en' ? 'English' : code === 'hi' ? 'Hindi' : 'Telugu'}`}
            >
              <Text style={[styles.langText, lang === code && styles.langTextActive]}>
                {code === 'en' ? 'EN' : code === 'hi' ? 'हि' : 'తె'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Audio Accessibility Bar */}
      <Pressable
        onPress={handleToggleAudio}
        style={[styles.audioBar, speaking && styles.audioBarActive]}
        accessibilityRole="button"
        accessibilityLabel="Read intro aloud"
      >
        <Text style={styles.audioIcon}>{speaking ? '⏹' : '🔊'}</Text>
        <Text style={[styles.audioText, speaking && styles.audioTextActive]}>
          {speaking ? t('audioGuideStop', lang) : `${t('audioGuideBtn', lang)} · Screen Reader`}
        </Text>
      </Pressable>

      {/* Hero Visual Card */}
      <View style={styles.heroCard}>
        <RuralScene height={170} />
        <View style={styles.heroOverlay}>
          <Text style={styles.eyebrow}>{t('eyebrow', lang)}</Text>
          <Text style={styles.tagline}>{t('tagline', lang)}</Text>
        </View>
      </View>

      {/* Slide Content Card */}
      <View style={styles.slideCard}>
        <View style={styles.slideHeader}>
          <View style={styles.slideIcon}>{activeSlide.icon}</View>
          <View style={{ flex: 1 }}>
            <Text style={styles.slideBadge}>{activeSlide.badge}</Text>
            <Text style={styles.slideTitle}>{activeSlide.title}</Text>
          </View>
        </View>
        <Text style={styles.slideDesc}>{activeSlide.desc}</Text>

        {/* Step Indicator Dots & Slide Next Button */}
        <View style={styles.slideFooter}>
          <View style={styles.dotsRow}>
            {slides.map((_, idx) => (
              <Pressable
                key={idx}
                onPress={() => setCurrentSlide(idx)}
                style={[styles.dot, currentSlide === idx && styles.dotActive]}
              />
            ))}
          </View>
          <Pressable
            onPress={() => {
              if (currentSlide < slides.length - 1) {
                setCurrentSlide(c => c + 1);
              } else {
                onRegister();
              }
            }}
            style={styles.nextSlideBtn}
          >
            <Text style={styles.nextSlideText}>
              {currentSlide < slides.length - 1 ? `${t('next', lang)} →` : `${t('getStarted', lang)} →`}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button title={t('getStarted', lang)} onPress={onRegister} />
        <Button variant="secondary" title={t('alreadyHaveAccount', lang)} onPress={onSignIn} />
      </View>

      {/* Footer Disclaimer */}
      <Text style={styles.disclaimer}>{t('emergencyDisclaimer', lang)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 18,
    backgroundColor: palette.cream,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langPills: {
    flexDirection: 'row',
    backgroundColor: '#e6ebe2',
    borderRadius: 20,
    padding: 3,
    gap: 4,
  },
  langBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  langBtnActive: {
    backgroundColor: palette.ink,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.ink,
  },
  langTextActive: {
    color: '#fff',
  },
  audioBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d2dcd0',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
    marginVertical: 4,
  },
  audioBarActive: {
    backgroundColor: '#feeceb',
    borderColor: '#f5b5b0',
  },
  audioIcon: {
    fontSize: 14,
  },
  audioText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.teal,
  },
  audioTextActive: {
    color: '#9b2631',
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#dfe7db',
    position: 'relative',
  },
  heroOverlay: {
    margin: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: palette.teal,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.ink,
  },
  slideCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 8,
  },
  slideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slideIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideBadge: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: palette.teal,
  },
  slideTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.ink,
  },
  slideDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.muted,
  },
  slideFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f0f3ee',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#d0d8cb',
  },
  dotActive: {
    width: 20,
    backgroundColor: palette.teal,
  },
  nextSlideBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  nextSlideText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.teal,
  },
  actions: {
    gap: 8,
  },
  disclaimer: {
    fontSize: 10,
    lineHeight: 14,
    color: palette.muted,
    textAlign: 'center',
    paddingTop: 2,
  },
});
