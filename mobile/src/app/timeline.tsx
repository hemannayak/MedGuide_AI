import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Brand, Button, palette } from '../components/brand-ui';
import { getTimeline, TimelineEvent } from '../lib/care';
import { MedicalShieldSvg, MedicineBottleSvg, DoctorConsultSvg } from '../components/illustrations';
import { playAudioGuide, stopAudioGuide } from '../lib/audio-guide';
import { Language, t } from '../lib/i18n';

export default function Timeline() {
  const [records, setRecords] = useState<TimelineEvent[]>([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<Language>('en');
  const [playingAudio, setPlayingAudio] = useState(false);
  
  const active = useRef(true);
  const locked = useRef(false);
  const generation = useRef(0);
  const lastAttempt = useRef({ page: 1, replace: true });

  const load = useCallback(async (nextPage: number, replace = false) => {
    if (locked.current) return;
    locked.current = true;
    const current = ++generation.current;
    lastAttempt.current = { page: nextPage, replace };
    setBusy(true);
    setError('');
    try {
      const result = await getTimeline(nextPage);
      if (active.current && current === generation.current) {
        setRecords(previous => [...new Map((replace ? result : [...previous, ...result]).map(item => [item.id, item])).values()]);
        setPage(nextPage);
        setMore(result.length === 20);
      }
    } catch (failure) {
      if (active.current && current === generation.current) {
        setError(failure instanceof Error ? failure.message : 'Timeline could not load.');
      }
    } finally {
      if (current === generation.current) {
        locked.current = false;
        if (active.current) setBusy(false);
      }
    }
  }, []);

  const deactivate = useCallback(() => {
    active.current = false;
    generation.current++;
    stopAudioGuide();
  }, []);

  useEffect(() => {
    active.current = true;
    locked.current = false;
    const mounted = ++generation.current;
    void Promise.resolve().then(() => {
      if (active.current && generation.current === mounted) void load(1, true);
    });
    return deactivate;
  }, [load, deactivate]);

  const handleAudioGuide = () => {
    if (playingAudio) {
      stopAudioGuide();
      setPlayingAudio(false);
    } else {
      setPlayingAudio(true);
      playAudioGuide(t('audioTimeline', lang), lang, () => setPlayingAudio(false));
    }
  };

  const getEventIcon = (type: string) => {
    if (type.toLowerCase().includes('prescription') || type.toLowerCase().includes('med')) {
      return <MedicineBottleSvg width={36} height={36} />;
    }
    if (type.toLowerCase().includes('consult') || type.toLowerCase().includes('chat')) {
      return <DoctorConsultSvg width={36} height={36} />;
    }
    return <MedicalShieldSvg width={36} height={36} />;
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Brand />

      {/* Language switcher & audio accessibility */}
      <View style={styles.topBar}>
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

      <View style={styles.banner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerEyebrow}>MEDGUIDE CARE TIMELINE</Text>
          <Text style={styles.title}>Your health history</Text>
          <Text style={styles.body}>
            A verified chronological record of care milestones. These records assist health workers and do not replace formal diagnosis.
          </Text>
        </View>
        <MedicalShieldSvg width={52} height={52} />
      </View>

      <View style={styles.controls}>
        <Button title="Refresh timeline" disabled={busy} onPress={() => void load(1, true)} />
      </View>

      {busy ? (
        <View style={styles.stateCard}>
          <Text accessibilityLiveRegion="polite" style={styles.body}>Loading your records…</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>
          <Button title="Retry loading records" disabled={busy} onPress={() => void load(lastAttempt.current.page, lastAttempt.current.replace)} />
          <Button variant="secondary" title="Go to sign in" onPress={() => router.replace('/')} />
        </View>
      ) : null}

      {!busy && !error && !records.length ? (
        <View style={styles.emptyCard}>
          <DoctorConsultSvg width={64} height={64} />
          <Text style={styles.emptyTitle}>No timeline events recorded yet</Text>
          <Text style={styles.emptyBody}>
            As you ask health questions, upload prescriptions, or record care notes, your timeline will safely appear here.
          </Text>
          <Button title="Ask AI Health Companion" onPress={() => router.push('/chat')} />
        </View>
      ) : null}

      {records.map(event => (
        <View key={event.id} style={styles.card}>
          <View style={styles.eventHeader}>
            <View style={styles.iconCircle}>
              {getEventIcon(event.event_type)}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>{event.event_type.replace(/_/g, ' ').toUpperCase()}</Text>
              <Text style={styles.eventTime}>
                {Number.isNaN(Date.parse(event.event_time)) ? 'Date unavailable' : new Date(event.event_time).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      ))}

      {more && !error ? (
        <Button title="Load older records" disabled={busy} onPress={() => void load(page + 1)} />
      ) : null}

      <Button variant="secondary" title="Back to care overview" disabled={busy} onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, backgroundColor: palette.cream, padding: 18, gap: 14 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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
  bannerEyebrow: { fontSize: 10, fontWeight: '800', color: palette.muted, letterSpacing: 0.8 },
  title: { color: palette.ink, fontWeight: '800', fontSize: 20, marginTop: 2 },
  body: { color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  controls: { flexDirection: 'row', gap: 10 },
  stateCard: { padding: 16, backgroundColor: palette.white, borderRadius: 16, alignItems: 'center' },
  errorBox: { backgroundColor: '#FDEBD0', padding: 16, borderRadius: 16, gap: 10, borderWidth: 1, borderColor: '#F5CBA7' },
  errorText: { color: '#9b2631', fontSize: 13, fontWeight: '600' },
  emptyCard: { backgroundColor: palette.white, borderRadius: 20, padding: 24, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: palette.line },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: palette.ink, textAlign: 'center' },
  emptyBody: { fontSize: 12, color: palette.muted, textAlign: 'center', lineHeight: 18 },
  card: { backgroundColor: palette.white, borderRadius: 18, borderWidth: 1, borderColor: palette.line, padding: 14 },
  eventHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.sage, alignItems: 'center', justifyContent: 'center' },
  eventTitle: { color: palette.ink, fontWeight: '700', fontSize: 13, letterSpacing: 0.3 },
  eventTime: { color: palette.muted, fontSize: 11, marginTop: 2 },
});

