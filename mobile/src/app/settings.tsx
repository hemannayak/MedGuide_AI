import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Brand, Button, palette } from '../components/brand-ui';
import { signOut } from '../lib/api';
import { MobileNav } from '../components/mobile-nav';
import { Language, t } from '../lib/i18n';
import { speakGuidance, stopGuidance } from '../lib/audio-guide';
import { SmartwatchVitalsSvg, MedicalShieldSvg, RuralClinicSvg } from '../components/illustrations';

export default function Settings() {
  const [lang, setLang] = useState<Language>('en');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [speaking, setSpeaking] = useState(false);

  function handleLanguage(newLang: Language) {
    setLang(newLang);
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
      const text = `${t('appName', lang)}. Settings. You can view your patient profile, change language, check AI permissions, and review the medical device research roadmap.`;
      speakGuidance(text, lang, () => setSpeaking(true), () => setSpeaking(false));
    }
  }

  async function logout() {
    if (busy) return;
    setBusy(true);
    setError('');
    stopGuidance();
    try {
      await signOut();
      router.replace('/');
    } catch {
      setError('Sign out could not finish. Please try again.');
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.page}>
        {/* Header with Language Pills */}
        <View style={styles.headerRow}>
          <Brand />
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

        {/* Audio Guide Bar */}
        <Pressable
          onPress={handleAudioGuide}
          style={[styles.audioBar, speaking && styles.audioBarActive]}
          accessibilityRole="button"
          accessibilityLabel="Read settings options aloud"
        >
          <Text style={styles.audioIcon}>{speaking ? '⏹' : '🔊'}</Text>
          <Text style={[styles.audioText, speaking && styles.audioTextActive]}>
            {speaking ? t('audioGuideStop', lang) : `${t('audioGuideBtn', lang)} · Screen Reader`}
          </Text>
        </Pressable>

        <Text style={styles.heading}>Settings & Preferences</Text>
        <Button variant="secondary" title="Replay setup and walkthrough" onPress={() => router.push({pathname:'/home',params:{setup:'replay'}})} />

        {/* Profile Card Action */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 {t('profileTitle', lang)}</Text>
          <Text style={styles.cardDesc}>{t('profileSubtitle', lang)}</Text>
          <Button title="View & Edit Profile" onPress={() => router.push('/profile')} />
        </View>

        {/* Permissions & Consent Action */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛡️ Privacy & Device Access</Text>
          <Text style={styles.cardDesc}>Manage camera, microphone, and AI data processing choices.</Text>
          <Button variant="secondary" title="Review Permissions & Consent" onPress={() => router.push('/consent')} />
        </View>

        {/* Future Scope: Vitals & Smartwatch Integration (Explicitly Annotated per AGENTS.md) */}
        <View style={styles.roadmapCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <SmartwatchVitalsSvg size={40} />
            <View style={{ flex: 1 }}>
              <Text style={styles.roadmapBadge}>FUTURE SCOPE · RESEARCH ROADMAP</Text>
              <Text style={styles.roadmapTitle}>Smartwatch & Health Vitals Sync</Text>
            </View>
          </View>
          <Text style={styles.roadmapBody}>
            Integration with smartwatches (blood pressure, pulse, SpO2) and wearable sensors is designated as Future Scope under active student research. Optional manual measurements and foreground activity sessions are available in Profile and Home. Background health-platform synchronization remains future work.
          </Text>
          <View style={styles.pillRow}>
            <Text style={styles.scopePill}>BP Tracking: In Research</Text>
            <Text style={styles.scopePill}>Foreground steps: Home</Text>
            <Text style={styles.scopePill}>Non-Commercial: No Payments</Text>
          </View>
        </View>

        {/* Free Public Healthcare Policy Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <RuralClinicSvg size={32} />
            <Text style={styles.cardTitle}>About MedGuide AI</Text>
          </View>
          <Text style={styles.cardDesc}>
            A student-led rural healthcare intelligence platform designed to support patients and community health workers with language-first guidance.
          </Text>
        </View>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        <Button title={busy ? 'Signing out…' : t('signOut', lang)} disabled={busy} onPress={() => void logout()} />
        <Button variant="quiet" title="Back to home" disabled={busy} onPress={() => router.replace('/home')} />

        <Text style={styles.disclaimer}>{t('emergencyDisclaimer', lang)}</Text>
      </ScrollView>
      <MobileNav current="/settings" disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  page: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
    paddingBottom: 90,
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
  heading: {
    fontSize: 22,
    color: palette.ink,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.ink,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: palette.muted,
  },
  roadmapCard: {
    backgroundColor: '#f2f5f1',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#cce0ca',
    gap: 8,
  },
  roadmapHeader: {
    gap: 2,
  },
  roadmapBadge: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: palette.teal,
  },
  roadmapTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.ink,
  },
  roadmapBody: {
    fontSize: 11,
    lineHeight: 16,
    color: palette.muted,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  scopePill: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0dfce',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontSize: 10,
    fontWeight: '600',
    color: palette.ink,
  },
  error: {
    color: '#9b2631',
    fontSize: 12,
  },
  disclaimer: {
    fontSize: 10,
    lineHeight: 14,
    color: palette.muted,
    textAlign: 'center',
    paddingTop: 4,
  },
});
