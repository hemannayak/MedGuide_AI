import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Brand, Button, palette } from './brand-ui';
import { CareCarousel } from './care-carousel';
import { Language, t } from '../lib/i18n';
import { speakGuidance, stopGuidance } from '../lib/audio-guide';

import { DoctorConsultSvg } from './illustrations';

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

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
        {/* Top Header with Back to Intro & Language Switcher */}
        <View style={styles.topRow}>
          {onBackToIntro ? (
            <Pressable onPress={onBackToIntro} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back to intro">
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
              >
                <Text style={[styles.langText, lang === code && styles.langTextActive]}>
                  {code === 'en' ? 'EN' : code === 'hi' ? 'हि' : 'తె'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Audio Guide Bar for Low Literacy / Accessibility */}
        <Pressable
          onPress={handleAudioGuide}
          style={[styles.audioBar, speaking && styles.audioBarActive]}
          accessibilityRole="button"
          accessibilityLabel="Read sign in instructions aloud"
        >
          <Text style={styles.audioIcon}>{speaking ? '⏹' : '🔊'}</Text>
          <Text style={[styles.audioText, speaking && styles.audioTextActive]}>
            {speaking ? t('audioGuideStop', lang) : `${t('audioGuideBtn', lang)} · Listen to instructions`}
          </Text>
        </Pressable>

        {/* Compact Banner */}
        <View style={styles.banner}>
          <CareCarousel compact />
          <View style={styles.bannerTextContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <DoctorConsultSvg size={34} />
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>{t('welcomeBack', lang)}</Text>
                <Text style={styles.bannerSubtitle}>{t('signInPrompt', lang)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
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

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText} accessibilityRole="alert">
                ⚠️ {error}
              </Text>
            </View>
          ) : null}

          <View style={styles.buttonStack}>
            <Button
              title={busy ? 'Signing in…' : t('signInBtn', lang)}
              disabled={busy || !identifier.trim() || !password}
              onPress={onSubmit}
            />
            <Button
              variant="secondary"
              title={t('registerBtn', lang)}
              disabled={busy}
              onPress={onRegister}
            />
          </View>
        </View>

        {/* Safety Banner */}
        <Text style={styles.safety}>{t('emergencyDisclaimer', lang)}</Text>
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
    paddingHorizontal: 10,
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
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  langBtnActive: {
    backgroundColor: palette.ink,
  },
  langText: {
    fontSize: 11,
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
    paddingHorizontal: 10,
    gap: 6,
  },
  audioBarActive: {
    backgroundColor: '#feeceb',
    borderColor: '#f5b5b0',
  },
  audioIcon: {
    fontSize: 13,
  },
  audioText: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.teal,
  },
  audioTextActive: {
    color: '#9b2631',
  },
  banner: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#dfe7db',
    position: 'relative',
  },
  bannerTextContainer: {
    position: 'relative',
    margin: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.ink,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: palette.muted,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: palette.line,
  },
  label: {
    fontSize: 12,
    color: palette.ink,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 52,
    color: palette.ink,
    backgroundColor: '#fafbf9',
    fontSize: 15,
  },
  errorBox: {
    backgroundColor: '#feeceb',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f5b5b0',
  },
  errorText: {
    fontSize: 12,
    color: '#9b2631',
  },
  buttonStack: {
    gap: 8,
    marginTop: 4,
  },
  safety: {
    fontSize: 10,
    lineHeight: 14,
    color: palette.muted,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
});
