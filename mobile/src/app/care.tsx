import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Brand, Button, palette } from '../components/brand-ui';
import { MobileNav } from '../components/mobile-nav';
import { router } from 'expo-router';
import { FollowUp, getFollowUps, getMedications, getPrescriptions, Medication, Prescription } from '../lib/care';
import { MedicineBottleSvg, PrescriptionScannerSvg, DoctorConsultSvg } from '../components/illustrations';
import { Language, t } from '../lib/i18n';
import { speakGuidance, stopGuidance } from '../lib/audio-guide';

export default function CareScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [revision, setRevision] = useState(0);
  const [lang, setLang] = useState<Language>('en');
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getMedications(), getFollowUps(), getPrescriptions()])
      .then(([meds, visits, documents]) => {
        if (active) {
          setMedications(meds);
          setFollowUps(visits);
          setPrescriptions(documents);
        }
      })
      .catch(failure => {
        if (active) setError(failure instanceof Error ? failure.message : 'Care records could not load.');
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
      stopGuidance();
    };
  }, [revision]);

  function handleAudioGuide() {
    if (speaking) {
      stopGuidance();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      const text = `Your Care Records. You have ${medications.length} medications, ${followUps.length} follow-up appointments, and ${prescriptions.length} prescriptions on file.`;
      speakGuidance(text, lang, () => setSpeaking(true), () => setSpeaking(false));
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.page}>
        <Brand />

        {/* Audio Guide Bar */}
        <Pressable
          onPress={handleAudioGuide}
          style={[styles.audioBar, speaking && styles.audioBarActive]}
          accessibilityRole="button"
          accessibilityLabel="Read care records summary aloud"
        >
          <Text style={styles.audioIcon}>{speaking ? '⏹' : '🔊'}</Text>
          <Text style={[styles.audioText, speaking && styles.audioTextActive]}>
            {speaking ? t('audioGuideStop', lang) : `${t('audioGuideBtn', lang)} · Listen to Records`}
          </Text>
        </Pressable>

        {/* Header with Illustration */}
        <View style={styles.headerBox}>
          <MedicineBottleSvg size={42} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Your Care Records</Text>
            <Text style={styles.subtitle}>Prescriptions, active medicines, and clinic follow-ups.</Text>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionRow}>
          <Button title="📷 Upload Prescription" onPress={() => router.push('/prescriptions/upload')} />
          <Button variant="secondary" title="📅 Health Timeline" onPress={() => router.push('/timeline')} />
        </View>

        {busy ? <Text style={styles.loadingText}>Loading care records…</Text> : null}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText} accessibilityRole="alert">
              ⚠️ {error}
            </Text>
          </View>
        ) : null}

        {!busy && !error ? (
          <>
            {/* Medications Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Confirmed Medications</Text>
              <Text style={styles.badgeCount}>{medications.length}</Text>
            </View>

            {!medications.length ? (
              <View style={styles.emptyCard}>
                <MedicineBottleSvg size={36} color="#718d6b" />
                <Text style={styles.emptyTitle}>No confirmed medicines yet</Text>
                <Text style={styles.emptyBody}>
                  Upload and review a doctor prescription to add validated medicines here.
                </Text>
              </View>
            ) : (
              medications.map(med => (
                <View key={med.id} style={styles.medCard}>
                  <View style={styles.medHeader}>
                    <Text style={styles.medName}>{med.medicine_name}</Text>
                    <Text
                      style={[
                        styles.verifyBadge,
                        med.verification_status === 'VERIFIED' ? styles.verifyOk : styles.verifyPending,
                      ]}
                    >
                      {med.verification_status}
                    </Text>
                  </View>
                  <Text style={styles.medDetail}>Dosage: {med.dosage || 'Not recorded'}</Text>
                  {med.instructions ? (
                    <Text style={styles.medDetail}>Instructions: {med.instructions}</Text>
                  ) : null}
                  {med.verification_status !== 'VERIFIED' ? (
                    <Text style={styles.verifyWarning}>
                      Requires healthcare worker verification before medication schedule.
                    </Text>
                  ) : null}
                </View>
              ))
            )}

            {/* Prescriptions Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Uploaded Prescriptions</Text>
              <Text style={styles.badgeCount}>{prescriptions.length}</Text>
            </View>

            {!prescriptions.length ? (
              <Text style={styles.emptyInline}>No prescription documents uploaded yet.</Text>
            ) : (
              prescriptions.map(doc => (
                <View key={doc.id} style={styles.docCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <PrescriptionScannerSvg size={30} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.docDate}>Prescription Date: {doc.prescribed_date || 'Recent'}</Text>
                      <Text style={styles.docStatus}>Status: {doc.status} · {doc.medications_count} extracted medicines</Text>
                    </View>
                  </View>
                  <Button
                    variant="secondary"
                    title="Review Extracted Details"
                    onPress={() => router.push({ pathname: '/prescriptions/[id]', params: { id: doc.id } })}
                  />
                </View>
              ))
            )}

            {/* Clinic Follow-ups Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Clinic Follow-Ups</Text>
              <Text style={styles.badgeCount}>{followUps.length}</Text>
            </View>

            {!followUps.length ? (
              <Text style={styles.emptyInline}>No community clinic follow-ups scheduled.</Text>
            ) : (
              followUps.map(visit => (
                <View key={visit.id} style={styles.visitCard}>
                  <DoctorConsultSvg size={28} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.visitReason}>{visit.reason}</Text>
                    <Text style={styles.visitTime}>{new Date(visit.scheduled_at).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.visitStatus}>{visit.status}</Text>
                </View>
              ))
            )}
          </>
        ) : null}

        <Text style={styles.disclaimer}>{t('emergencyDisclaimer', lang)}</Text>
      </ScrollView>
      <MobileNav current="/care" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  page: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
    paddingBottom: 90,
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
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.ink,
  },
  subtitle: {
    fontSize: 12,
    color: palette.muted,
  },
  actionRow: {
    gap: 8,
  },
  loadingText: {
    color: palette.muted,
    fontSize: 13,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.ink,
  },
  badgeCount: {
    backgroundColor: '#e6ebe2',
    color: palette.ink,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emptyCard: {
    backgroundColor: '#f1f5ee',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#d8e4d6',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.ink,
  },
  emptyBody: {
    fontSize: 11,
    color: palette.muted,
    textAlign: 'center',
  },
  emptyInline: {
    fontSize: 12,
    color: palette.muted,
    fontStyle: 'italic',
  },
  medCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: palette.line,
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medName: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.ink,
  },
  verifyBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifyOk: {
    backgroundColor: '#d8eed5',
    color: '#1a5c18',
  },
  verifyPending: {
    backgroundColor: '#feeceb',
    color: '#9b2631',
  },
  medDetail: {
    fontSize: 12,
    color: palette.muted,
  },
  verifyWarning: {
    fontSize: 11,
    color: '#9b2631',
    fontStyle: 'italic',
  },
  docCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: palette.line,
  },
  docDate: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.ink,
  },
  docStatus: {
    fontSize: 11,
    color: palette.muted,
  },
  visitCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: palette.line,
  },
  visitReason: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.ink,
  },
  visitTime: {
    fontSize: 11,
    color: palette.muted,
  },
  visitStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.teal,
  },
  disclaimer: {
    fontSize: 10,
    lineHeight: 14,
    color: palette.muted,
    textAlign: 'center',
    paddingTop: 8,
  },
});
