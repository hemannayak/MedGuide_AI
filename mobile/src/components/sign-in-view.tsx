import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Brand, Button, palette } from './brand-ui';
import { Language, t } from '../lib/i18n';
import { speakGuidance, stopGuidance } from '../lib/audio-guide';
import {
  DoctorConsultSvg,
  PrescriptionScannerSvg,
  MedicalShieldSvg,
  VoiceMicWaveSvg,
} from './illustrations';

type AuthMethod = 'phone' | 'email';

type Props = {
  identifier: string;
  password: string;
  busy: boolean;
  error: string;
  onIdentifierChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onRegister: () => void;
  onBackToIntro?: () => void;
  currentLanguage?: Language;
  onLanguageChange?: (lang: Language) => void;
};

export function SignInView({
  identifier,
  password,
  busy,
  error,
  onIdentifierChange,
  onPasswordChange,
  onSubmit,
  onRegister,
  onBackToIntro,
  currentLanguage = 'en',
  onLanguageChange,
}: Props) {
  useEffect(() => () => stopGuidance(), []);
  const [lang, setLang] = useState<Language>(currentLanguage);
  const [speaking, setSpeaking] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [currentSlide, setCurrentSlide] = useState(0);
  const phoneCountry = '+91';
  const [phoneNumber, setPhoneNumber] = useState('');
  const [googleNotice, setGoogleNotice] = useState('');

  function handleLanguage(newLang: Language) {
    setLang(newLang);
    onLanguageChange?.(newLang);
    if (speaking) {
      stopGuidance();
      setSpeaking(false);
    }
  }

  function handleAudioGuide() {
    if (speaking) {
      stopGuidance();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      const text = `${t('welcomeBack', lang)}. ${t('signInPrompt', lang)} ${t('audioSignIn', lang)}`;
      speakGuidance(text, lang, () => setSpeaking(true), () => setSpeaking(false));
    }
  }

  const slides = [
    {
      title: t('slide1Title', lang),
      desc: t('slide1Desc', lang),
      tag: '01 · HEALTH UNDERSTANDING',
      icon: <DoctorConsultSvg size={38} />,
      bg: '#eaf4ee',
    },
    {
      title: t('slide2Title', lang),
      desc: t('slide2Desc', lang),
      tag: '02 · PRESCRIPTIONS & DOSAGE',
      icon: <PrescriptionScannerSvg size={38} color="#073d37" />,
      bg: '#faeadc',
    },
    {
      title: t('slide3Title', lang),
      desc: t('slide3Desc', lang),
      tag: '03 · UNIFIED HEALTH RECORDS',
      icon: <MedicalShieldSvg size={38} color="#073d37" />,
      bg: '#e6eee1',
    },
    {
      title: t('slide4Title', lang),
      desc: t('slide4Desc', lang),
      tag: '04 · MULTILINGUAL CARE',
      icon: <VoiceMicWaveSvg size={38} color="#073d37" />,
      bg: '#e8f0fe',
    },
  ];

  const activeSlide = slides[currentSlide];

  function handlePhoneChange(val: string) {
    const cleaned = val.replace(/[^0-9]/g, '');
    setPhoneNumber(cleaned);
    onIdentifierChange(cleaned ? `${phoneCountry}${cleaned}` : '');
  }

  function handleGooglePress() {
    setGoogleNotice(
      'Google Sign-In is configured with OAuth backend federation. For this native device session, continue with your Phone number or Email credentials.'
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
        {/* Top Header: Brand & Language Switcher */}
        <View style={styles.topRow}>
          {onBackToIntro ? (
            <Pressable
              onPress={onBackToIntro}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Back to intro"
            >
              <Text style={styles.backText}>← Intro</Text>
            </Pressable>
          ) : (
            <Brand />
          )}

          <View style={styles.langPills}>
            {(['en', 'hi', 'te'] as const).map(code => (
              <Pressable
                key={code}
                onPress={() => handleLanguage(code)}
                style={[styles.langBtn, lang === code && styles.langBtnActive]}
                accessibilityRole="button"
                accessibilityLabel={`Language ${code}`}
              >
                <Text style={[styles.langText, lang === code && styles.langTextActive]}>
                  {code === 'en' ? 'EN' : code === 'hi' ? 'हि' : 'తె'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Audio Guide Bar for Rural Low-Literacy Accessibility */}
        <Pressable
          onPress={handleAudioGuide}
          style={[styles.audioBar, speaking && styles.audioBarActive]}
          accessibilityRole="button"
          accessibilityLabel="Read sign in instructions aloud"
        >
          <Text style={styles.audioIcon}>{speaking ? '⏹' : '🔊'}</Text>
          <Text style={[styles.audioText, speaking && styles.audioTextActive]}>
            {speaking ? t('audioGuideStop', lang) : `${t('audioGuideBtn', lang)} · Screen Reader`}
          </Text>
        </Pressable>

        {/* Horizontal Feature Carousel */}
        <View style={[styles.carouselCard, { backgroundColor: activeSlide.bg }]}>
          <View style={styles.carouselHeader}>
            <View style={styles.carouselIcon}>{activeSlide.icon}</View>
            <View style={{ flex: 1 }}>
              <Text style={styles.carouselTag}>{activeSlide.tag}</Text>
              <Text style={styles.carouselTitle}>{activeSlide.title}</Text>
            </View>
          </View>
          <Text style={styles.carouselDesc}>{activeSlide.desc}</Text>

          {/* Dots Indicator & Navigation */}
          <View style={styles.carouselFooter}>
            <View style={styles.dotsRow}>
              {slides.map((_, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => setCurrentSlide(idx)}
                  style={[styles.dot, currentSlide === idx && styles.dotActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Slide ${idx + 1}`}
                />
              ))}
            </View>
            <Pressable
              onPress={() => setCurrentSlide((currentSlide + 1) % slides.length)}
              style={styles.carouselNextBtn}
              accessibilityRole="button"
              accessibilityLabel="Next slide"
            >
              <Text style={styles.carouselNextText}>Next ❯</Text>
            </Pressable>
          </View>
        </View>

        {/* Authentication Options in Clear Hierarchy */}
        <View style={styles.authContainer}>
          <Text style={styles.sectionHeader}>Sign In to MedGuide AI</Text>

          {/* Method Selector Tabs: Phone vs Email */}
          <View style={styles.methodSelector}>
            <Pressable
              onPress={() => {
                setAuthMethod('phone');
                onIdentifierChange(phoneNumber ? `${phoneCountry}${phoneNumber}` : '');
              }}
              style={[styles.methodTab, authMethod === 'phone' && styles.methodTabActive]}
              accessibilityRole="button"
              accessibilityLabel="Sign in with phone number"
            >
              <Text style={[styles.methodTabText, authMethod === 'phone' && styles.methodTabTextActive]}>
                📱 Phone Number
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setAuthMethod('email');
                onIdentifierChange('');
              }}
              style={[styles.methodTab, authMethod === 'email' && styles.methodTabActive]}
              accessibilityRole="button"
              accessibilityLabel="Sign in with email"
            >
              <Text style={[styles.methodTabText, authMethod === 'email' && styles.methodTabTextActive]}>
                ✉ Email / Username
              </Text>
            </Pressable>
          </View>

          {/* Inputs for selected method */}
          {authMethod === 'phone' ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Phone Number</Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.countryCodeText}>{phoneCountry}</Text>
                </View>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholderTextColor={palette.muted}
                  accessibilityLabel="Phone Number"
                  placeholder="98765 43210"
                  keyboardType="phone-pad"
                  maxLength={15}
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  editable={!busy}
                />
              </View>
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('identifierLabel', lang)}</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor={palette.muted}
                accessibilityLabel={t('identifierLabel', lang)}
                placeholder={t('identifierPlaceholder', lang)}
                autoCapitalize="none"
                autoCorrect={false}
                value={identifier}
                onChangeText={onIdentifierChange}
                editable={!busy}
              />
            </View>
          )}

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('passwordLabel', lang)}</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={palette.muted}
              accessibilityLabel={t('passwordLabel', lang)}
              placeholder={t('passwordPlaceholder', lang)}
              secureTextEntry
              value={password}
              onChangeText={onPasswordChange}
              editable={!busy}
              onSubmitEditing={() => {
                if (!busy && identifier.trim() && password) onSubmit();
              }}
            />
          </View>

          {/* Error / Alert Display */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText} accessibilityRole="alert">
                ⚠️ {error}
              </Text>
            </View>
          ) : null}

          {/* Submit Action */}
          <Button
            title={busy ? 'Signing in…' : `Sign in with ${authMethod === 'phone' ? 'Phone' : 'Email'}`}
            disabled={busy || !identifier.trim() || !password}
            onPress={onSubmit}
          />

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 3. Continue with Google */}
          <Pressable
            onPress={handleGooglePress}
            style={({ pressed }) => [styles.googleButton, pressed && { opacity: 0.8 }]}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </Pressable>

          {googleNotice ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>ℹ {googleNotice}</Text>
            </View>
          ) : null}
        </View>

        {/* Prompt: New to MedGuide AI? Create an account */}
        <View style={styles.registerPrompt}>
          <Text style={styles.registerPromptText}>New to MedGuide AI?</Text>
          <Pressable
            onPress={onRegister}
            accessibilityRole="button"
            accessibilityLabel="Create an account"
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <Text style={styles.registerLink}>Create an account →</Text>
          </Pressable>
        </View>

        {/* Healthcare Safety Notice */}
        <Text style={styles.disclaimer}>{t('emergencyDisclaimer', lang)}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: palette.cream,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e6ebe2',
    borderRadius: 14,
  },
  backText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.ink,
  },
  langPills: {
    flexDirection: 'row',
    backgroundColor: '#e6ebe2',
    borderRadius: 20,
    padding: 3,
    gap: 4,
  },
  langBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
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
  carouselCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 8,
  },
  carouselHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  carouselIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselTag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: palette.teal,
  },
  carouselTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.ink,
  },
  carouselDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.muted,
  },
  carouselFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dotActive: {
    width: 22,
    backgroundColor: palette.teal,
  },
  carouselNextBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  carouselNextText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.teal,
  },
  authContainer: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.line,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.ink,
  },
  methodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f4ee',
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  methodTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  methodTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.muted,
  },
  methodTabTextActive: {
    color: palette.ink,
    fontWeight: '700',
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: palette.ink,
    fontWeight: '600',
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  countryCodeBadge: {
    backgroundColor: '#f0f4ee',
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.ink,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 50,
    color: palette.ink,
    backgroundColor: '#fafbf9',
    fontSize: 15,
  },
  errorBox: {
    backgroundColor: '#feeceb',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f5b5b0',
  },
  errorText: {
    fontSize: 12,
    color: '#9b2631',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.line,
  },
  dividerText: {
    fontSize: 11,
    color: palette.muted,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.ink,
  },
  infoBox: {
    backgroundColor: '#eaf4ee',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c6dfcf',
  },
  infoText: {
    fontSize: 12,
    color: palette.teal,
    lineHeight: 16,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  registerPromptText: {
    fontSize: 14,
    color: palette.muted,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.teal,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 15,
    color: palette.muted,
    textAlign: 'center',
    paddingTop: 2,
  },
});
