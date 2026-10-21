import { useEffect, useState } from 'react';
import { ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Brand, Button, palette } from '../components/brand-ui';
import { request } from '../lib/api';
import { MedicalShieldSvg, VoiceMicWaveSvg } from '../components/illustrations';
import { playAudioGuide, stopAudioGuide } from '../lib/audio-guide';
import { Language, t } from '../lib/i18n';

type Consent = { id: string; consent_type: string; status: string; created_at: string };

export default function ConsentScreen() {
  const [records, setRecords] = useState<Consent[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<Language>('en');
  const [playingAudio, setPlayingAudio] = useState(false);

  async function load() {
    try {
      setRecords(await request<Consent[]>('/consent'));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to load permissions.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let active = true;
    request<Consent[]>('/consent').then(result => {
      if (active) setRecords(result);
    }).catch(failure => {
      if (active) setError(failure instanceof Error ? failure.message : 'Unable to load permissions.');
    }).finally(() => {
      if (active) setBusy(false);
    });
    return () => {
      active = false;
      stopAudioGuide();
    };
  }, []);

  const handleAudioGuide = () => {
    if (playingAudio) {
      stopAudioGuide();
      setPlayingAudio(false);
    } else {
      setPlayingAudio(true);
      playAudioGuide(t('audioConsent', lang), lang, () => setPlayingAudio(false));
    }
  };

  async function update(scope: string, id?: string) {
    setBusy(true);
    setError('');
    try {
      await request(
        id ? `/consent/${id}` : '/consent',
        id ? { status: 'WITHDRAWN' } : { consent_type: scope, version: '1.0' },
        id ? 'PATCH' : 'POST'
      );
      await load();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to change permission.');
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Brand />

      {/* Language Switcher and Audio Guide */}
      <View style={styles.topRow}>
        <View style={styles.langPills}>
          {(['en', 'hi', 'te'] as const).map(code => (
            <Pressable
              key={code}
              onPress={() => setLang(code)}
              style={[styles.langChip, lang === code && styles.langChipActive]}
            >
              <Text style={[styles.langText, lang === code && styles.langTextActive]}>
                {code === 'en' ? 'EN' : code === 'hi' ? 'हि' : 'తె'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={handleAudioGuide}
          style={[styles.audioBtn, playingAudio && styles.audioBtnPlaying]}
        >
          <Text style={[styles.audioBtnText, playingAudio && styles.audioBtnTextPlaying]}>
            {playingAudio ? t('audioGuideStop', lang) : t('audioGuideBtn', lang)}
          </Text>
        </Pressable>
      </View>

      {/* Header Banner */}
      <View style={styles.banner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>DATA GOVERNANCE & PRIVACY</Text>
          <Text style={styles.title}>Processing choices</Text>
          <Text style={styles.body}>
            MedGuide AI prioritizes patient privacy and data sovereignty. Choose which intelligent features are permitted to process your health inquiries.
          </Text>
        </View>
        <MedicalShieldSvg width={52} height={52} />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Processing Consent Cards */}
      {['AI_PROCESSING', 'SPEECH_PROCESSING'].map(scope => {
        const latest = records
          .filter(item => item.consent_type === scope)
          .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
        const granted = latest?.status === 'GRANTED';

        return (
          <View key={scope} style={styles.card}>
            <View style={styles.cardHeader}>
              {scope === 'AI_PROCESSING' ? (
                <MedicalShieldSvg width={36} height={36} />
              ) : (
                <VoiceMicWaveSvg width={36} height={36} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  {scope === 'AI_PROCESSING' ? 'AI Health Inquiries' : 'Speech Recognition & Voice Audio'}
                </Text>
                <View style={[styles.badge, granted ? styles.badgeActive : styles.badgeInactive]}>
                  <Text style={[styles.badgeText, granted ? styles.badgeTextActive : styles.badgeTextInactive]}>
                    {granted ? 'Status: Allowed' : 'Status: Withdrawn / Disabled'}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.cardDescription}>
              {scope === 'AI_PROCESSING'
                ? 'Allow queries to be analyzed by validated medical knowledge sources for preliminary health guidance.'
                : 'Allow voice recordings to be transcribed into text. Speech input is optional; text keyboard remains available.'}
            </Text>

            <Button
              disabled={busy}
              variant={granted ? 'secondary' : 'primary'}
              title={granted ? 'Withdraw permission' : 'Allow this processing'}
              onPress={() => void update(scope, granted ? latest.id : undefined)}
            />
          </View>
        );
      })}

      <View style={styles.noticeBox}>
        <Text style={styles.noticeText}>
          Emergency escalation and nearest PHC information remain accessible at all times without cloud-processing consent.
        </Text>
      </View>

      <Button variant="secondary" title="Back to previous screen" disabled={busy} onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 18, gap: 14, backgroundColor: palette.cream, flexGrow: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  langPills: { flexDirection: 'row', gap: 6 },
  langChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line },
  langChipActive: { backgroundColor: palette.ink, borderColor: palette.ink },
  langText: { fontSize: 11, fontWeight: '700', color: palette.muted },
  langTextActive: { color: palette.cream },
  audioBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: '#E2F0D9', borderWidth: 1, borderColor: '#A2C594' },
  audioBtnPlaying: { backgroundColor: '#FADBD8', borderColor: '#E74C3C' },
  audioBtnText: { fontSize: 11, fontWeight: '700', color: '#1E4620' },
  audioBtnTextPlaying: { color: '#900C3F' },
  banner: { backgroundColor: palette.sage, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  eyebrow: { fontSize: 10, fontWeight: '800', color: palette.muted, letterSpacing: 0.8 },
  title: { color: palette.ink, fontSize: 20, fontWeight: '800', marginTop: 2 },
  body: { color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  card: { padding: 16, backgroundColor: palette.white, borderRadius: 20, gap: 12, borderWidth: 1, borderColor: palette.line },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: palette.ink },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  badgeActive: { backgroundColor: '#E2F0D9' },
  badgeInactive: { backgroundColor: '#FADBD8' },
  badgeText: { fontSize: 10, fontWeight: '700' },
  badgeTextActive: { color: '#1E4620' },
  badgeTextInactive: { color: '#900C3F' },
  cardDescription: { fontSize: 12, color: palette.muted, lineHeight: 18 },
  errorBox: { backgroundColor: '#FDEBD0', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#F5CBA7' },
  errorText: { color: '#9b2631', fontSize: 12, fontWeight: '600' },
  noticeBox: { backgroundColor: palette.white, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: palette.line },
  noticeText: { fontSize: 11, color: palette.muted, lineHeight: 17, fontStyle: 'italic' },
});

