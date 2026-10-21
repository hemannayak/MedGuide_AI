import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Brand, Button, palette } from '../components/brand-ui';
import { registerPatient } from '../lib/api';
import { Language, t } from '../lib/i18n';
import { speakGuidance, stopGuidance } from '../lib/audio-guide';
import { RuralScene } from '../components/rural-scene';
import { MedicalShieldSvg, DoctorConsultSvg } from '../components/illustrations';

export default function Register() {
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const locked = useRef(false);
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      stopGuidance();
    };
  }, []);

  function handleLanguage(newLang: Language) {
    setLanguage(newLang);
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
      const text = `${t('registerBtn', language)}. ${t('audioRegister', language)}`;
      speakGuidance(text, language, () => setSpeaking(true), () => setSpeaking(false));
    }
  }

  async function submit() {
    if (locked.current || !accepted) return;
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      await registerPatient(identifier, password, name, language);
      if (active.current) {
        setPassword('');
        setConfirmation('');
        setCreated(true);
      }
    } catch (failure) {
      if (active.current) {
        setError(
          (failure instanceof Error ? failure.message : 'Account creation failed.') +
            ' If the connection was interrupted, try signing in.'
        );
      }
    } finally {
      locked.current = false;
      if (active.current) setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
        {/* Header Row with Brand & Language Pills */}
        <View style={styles.headerRow}>
          <Brand />
          <View style={styles.langPills}>
            {(['en', 'hi', 'te'] as const).map(code => (
              <Pressable
                key={code}
                onPress={() => handleLanguage(code)}
                style={[styles.langBtn, language === code && styles.langBtnActive]}
              >
                <Text style={[styles.langText, language === code && styles.langTextActive]}>
                  {code === 'en' ? 'EN' : code === 'hi' ? 'हि' : 'తె'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Audio Guide Bar */}
        <Pressable
          onPress={handleAudioGuide}
          style={[styles.audioBar, speaking && styles.audioBarActive]}
          accessibilityRole="button"
          accessibilityLabel="Read registration instructions aloud"
        >
          <Text style={styles.audioIcon}>{speaking ? '⏹' : '🔊'}</Text>
          <Text style={[styles.audioText, speaking && styles.audioTextActive]}>
            {speaking ? t('audioGuideStop', language) : `${t('audioGuideBtn', language)} · Audio Assistance`}
          </Text>
        </Pressable>

        <RuralScene height={150} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <MedicalShieldSvg size={28} />
          <Text style={styles.title}>{created ? 'Account created successfully' : t('registerBtn', language)}</Text>
        </View>

        {created ? (
          <View style={styles.successCard}>
            <DoctorConsultSvg size={54} />
            <Text style={styles.successTitle}>Welcome, {name}!</Text>
            <Text style={styles.body}>
              Your MedGuide AI account is ready. Next, review permissions to start using voice questions and prescription scanning.
            </Text>
            <Button title="Go to sign in" onPress={() => router.replace('/')} />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>{t('displayNameLabel', language)}</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel={t('displayNameLabel', language)}
              placeholder={t('displayNamePlaceholder', language)}
              placeholderTextColor={palette.muted}
              maxLength={80}
              value={name}
              onChangeText={setName}
              editable={!busy}
            />

            <Text style={styles.label}>{t('identifierLabel', language)}</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel={t('identifierLabel', language)}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={t('identifierPlaceholder', language)}
              placeholderTextColor={palette.muted}
              maxLength={254}
              value={identifier}
              onChangeText={setIdentifier}
              editable={!busy}
            />

            <View style={styles.twoColumn}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t('passwordLabel', language)}</Text>
                <TextInput
                  style={styles.input}
                  accessibilityLabel="Password"
                  placeholder="Min 8 chars"
                  placeholderTextColor={palette.muted}
                  secureTextEntry
                  maxLength={128}
                  value={password}
                  onChangeText={setPassword}
                  editable={!busy}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t('confirmPasswordLabel', language)}</Text>
                <TextInput
                  style={styles.input}
                  accessibilityLabel="Confirm password"
                  placeholder="Re-enter"
                  placeholderTextColor={palette.muted}
                  secureTextEntry
                  maxLength={128}
                  value={confirmation}
                  onChangeText={setConfirmation}
                  editable={!busy}
                />
              </View>
            </View>

            {/* Terms and consent checkbox */}
            <View style={styles.acceptRow}>
              <Switch
                accessibilityLabel="I agree to account data processing for this demonstration"
                value={accepted}
                onValueChange={setAccepted}
                disabled={busy}
              />
              <Text style={styles.termsText}>{t('agreeTerms', language)}</Text>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText} accessibilityRole="alert">
                  ⚠️ {error}
                </Text>
              </View>
            ) : null}

            <Button
              title={busy ? 'Creating account…' : t('registerBtn', language)}
              disabled={busy || !accepted || !name.trim() || !identifier.trim() || !password || !confirmation}
              onPress={() => void submit()}
            />

            <Button
              variant="quiet"
              title={t('alreadyHaveAccount', language)}
              disabled={busy}
              onPress={() => router.replace('/')}
            />
          </View>
        )}

        <Text style={styles.disclaimer}>{t('emergencyDisclaimer', language)}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    backgroundColor: palette.cream,
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.ink,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: palette.line,
  },
  twoColumn: {
    gap: 14,
  },
  label: {
    fontSize: 12,
    color: palette.ink,
    fontWeight: '600',
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#fafbf9',
    color: palette.ink,
    fontSize: 14,
  },
  acceptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: palette.muted,
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
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: palette.line,
  },
  successIcon: {
    fontSize: 36,
    color: palette.teal,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.ink,
  },
  body: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 10,
    lineHeight: 14,
    color: palette.muted,
    textAlign: 'center',
  },
});
