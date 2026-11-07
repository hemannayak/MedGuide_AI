import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Brand, Button, palette } from '../components/brand-ui';
import { MobileNav } from '../components/mobile-nav';
import { router } from 'expo-router';
import { FollowUp, getProfile, getFollowUps, getMedications, getPrescriptions, Medication, Prescription } from '../lib/care';
import { MedicineBottleSvg, PrescriptionScannerSvg, DoctorConsultSvg } from '../components/illustrations';
import { Language, t } from '../lib/i18n';
import { cacheEnabled, enableCareCache, loadCareResource } from '../lib/care-cache';
import { scheduleCareReminders } from '../lib/notifications';

export default function CareScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [revision, setRevision] = useState(0);
  const [lang, setLang] = useState<Language>('en');
  const [offlineEnabled,setOfflineEnabled]=useState(false);
  const [savedAt,setSavedAt]=useState<string|null>(null);
  const [notice,setNotice]=useState('');
  const [reminding,setReminding]=useState(false);

  useEffect(() => {
    let active = true;
    void getProfile().then(profile=>{if(active)setLang(profile.preferred_language);}).catch(()=>undefined);
    void cacheEnabled().then(value=>{if(active)setOfflineEnabled(value);}).catch(()=>{if(active)setNotice('Offline storage is unavailable on this device.');});
    loadCareResource('care',()=>Promise.all([getMedications(), getFollowUps(), getPrescriptions()]))
      .then(({data:[meds, visits, documents],cachedAt,cacheWarning}) => {
        if (active) {
          setMedications(meds);
          setFollowUps(visits);
          setPrescriptions(documents);
          setSavedAt(cachedAt);setNotice(cacheWarning||'');setError('');
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
    };
  }, [revision]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.page}>
        <Brand />

        {/* Header with Illustration */}
        <View style={styles.headerBox}>
          <MedicineBottleSvg size={42} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Your Care Records</Text>
            <Text style={styles.subtitle}>Prescriptions, active medicines, and clinic follow-ups.</Text>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <Text>Optional offline copies contain private health records. On the phone they use encrypted device storage; the browser keeps them only for this tab session. They are cleared on sign-out. Offline copies can be outdated.</Text>
        <Button variant="secondary" title={offlineEnabled?'Remove offline copies':'Save records for offline viewing'} disabled={busy||reminding} onPress={()=>{setBusy(true);void enableCareCache(!offlineEnabled).then(()=>{setOfflineEnabled(!offlineEnabled);setRevision(value=>value+1);}).catch(()=>{setError('Offline storage could not be changed.');setBusy(false);});}}/>
        {savedAt?<Text accessibilityRole="alert">Offline copy · last saved {new Date(savedAt).toLocaleString()}. Connect and refresh before relying on changes.</Text>:null}
        {notice?<Text accessibilityLiveRegion="polite">{notice}</Text>:null}
        <Button title="Refresh care records" disabled={busy||reminding} onPress={()=>{setBusy(true);setRevision(value=>value+1);}}/>
        <Button variant="secondary" title={reminding?'Scheduling reminders…':'Enable reminders for today and tomorrow'} disabled={busy||reminding||Boolean(savedAt)||Boolean(error)} onPress={()=>{setReminding(true);setNotice('');void scheduleCareReminders(medications).then(count=>setNotice(`${count} reminder times scheduled for today and tomorrow. Device settings may delay delivery; reopen Care to refresh.`)).catch(e=>setNotice(e instanceof Error?e.message:'Reminders unavailable.')).finally(()=>setReminding(false));}}/>
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
              <Text style={styles.sectionTitle}>Medicines and review status</Text>
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
                  {(med.schedules??[]).map(schedule=><Text key={schedule.id} style={styles.medDetail}>Saved schedule: {schedule.schedule_data.times.join(', ')} · {schedule.timezone} · {schedule.status}</Text>)}
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
