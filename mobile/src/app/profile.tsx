import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Button, palette } from '../components/brand-ui';
import { getProfile, Profile } from '../lib/care';
import { request, Language, signOut } from '../lib/api';
import { getWellness, saveWellness, Wellness, getMeasurements, Measurement, saveMeasurement } from '../lib/wellness';
import { setupCopy } from '../lib/setup-copy';
import { speakGuidance, stopGuidance } from '../lib/audio-guide';
import { litresToMl } from '../lib/daily-progress';
import { HealthOverview } from '../components/health-overview';
import { MobileNav } from '../components/mobile-nav';

type Section = {
  title: string;
  icon: string;
  why: string;
  fields: { key: keyof Wellness; label: string; numeric?: boolean }[];
};

const sections: Section[] = [
  {
    title: 'Basic Details',
    icon: '👤',
    why: 'Optional demographic and contact details for your private account records.',
    fields: [
      { key: 'gender', label: 'Gender (optional)' },
      { key: 'emergency_contact', label: 'Emergency contact (optional, family/friend)' },
    ],
  },
  {
    title: 'Medical History',
    icon: '📋',
    why: 'Self-reported health information. This does not replace a doctor or triage rules.',
    fields: [
      { key: 'conditions', label: 'Existing conditions' },
      { key: 'past_illnesses', label: 'Past illnesses' },
      { key: 'surgeries', label: 'Surgeries' },
      { key: 'allergies', label: 'Allergies' },
      { key: 'accessibility_needs', label: 'Accessibility needs' },
      { key: 'family_history', label: 'Relevant family history' },
      { key: 'treatment_history', label: 'Treatment history' },
    ],
  },
  {
    title: 'Lifestyle & Preferences',
    icon: '🌱',
    why: 'Personal notes on habits and wellness targets.',
    fields: [
      { key: 'sleep_notes', label: 'Sleep patterns' },
      { key: 'activity_notes', label: 'Activity preferences' },
      { key: 'dietary_preferences', label: 'Dietary preferences' },
      { key: 'health_goals', label: 'Personal wellness goals' },
    ],
  },
  {
    title: 'Daily Goals',
    icon: '🎯',
    why: 'Optional personal targets. Leave blank to clear.',
    fields: [
      { key: 'water_goal_ml', label: 'Daily water target (L), optional', numeric: true },
      { key: 'step_goal', label: 'Daily step target, optional', numeric: true },
    ],
  },
  {
    title: 'Other Health Information',
    icon: '📄',
    why: 'Short summaries of providers, vaccinations, and past reports.',
    fields: [
      { key: 'healthcare_provider', label: 'Healthcare provider / Clinic, optional' },
      { key: 'vaccination_notes', label: 'Vaccination record summary' },
      { key: 'lab_report_notes', label: 'Lab report summary' },
    ],
  },
];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<Wellness | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  const [open, setOpen] = useState<string | null>('Account');
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [name, setName] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [dob, setDob] = useState('');
  const [contact, setContact] = useState('');

  const [kind, setKind] = useState('weight');
  const [value, setValue] = useState('');
  const [secondary, setSecondary] = useState('');

  async function load() {
    setError('');
    try {
      const [p, s, m] = await Promise.all([getProfile(), getWellness(), getMeasurements()]);
      setProfile(p);
      setSettings(s);
      setMeasurements(m);
      setName(p.display_name);
      setLanguage(p.preferred_language);
      setDob(p.date_of_birth ?? '');
      setContact(p.contact_reference ?? '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Profile could not load.');
    }
  }

  useEffect(() => {
    void Promise.resolve().then(load);
    return () => stopGuidance();
  }, []);

  async function save(section: Section) {
    if (busy || !accepted) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const changes: Record<string, unknown> = { health_notice_version: '1.0' };
      for (const f of section.fields) {
        if (!(f.key in draft)) continue;
        const v = draft[f.key].trim();
        if (f.key === 'water_goal_ml') {
          changes[f.key] = v ? litresToMl(v) : null;
        } else {
          if (f.numeric && v && !/^\d+$/.test(v)) throw Error('Step targets must be whole numbers.');
          changes[f.key] = v ? (f.numeric ? Number(v) : v) : null;
        }
      }
      const s = await saveWellness(changes);
      setSettings(s);
      setDraft({});
      setNotice(`${section.title} saved.`);
      setAccepted(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Your edits remain available.');
    } finally {
      setBusy(false);
    }
  }

  const age =
    dob && /^\d{4}-\d{2}-\d{2}$/.test(dob)
      ? (() => {
          const b = new Date(`${dob}T12:00:00`),
            now = new Date();
          return (
            now.getFullYear() -
            b.getFullYear() -
            (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())
              ? 1
              : 0)
          );
        })()
      : null;

  function select(title: string) {
    if (Object.keys(draft).length) {
      setError('Save the current section or discard its edits before switching.');
      return;
    }
    setOpen(open === title ? null : title);
    setAccepted(false);
    setNotice('');
  }

  // Calculate profile completion rate
  const completionRate = (() => {
    if (!profile) return 0;
    let score = 2; // name and language are set
    const total = 8;
    if (dob) score++;
    if (contact) score++;
    if (settings?.conditions) score++;
    if (settings?.emergency_contact) score++;
    if (settings?.water_goal_ml || settings?.step_goal) score++;
    if (measurements.length > 0) score++;
    return Math.round((score / total) * 100);
  })();

  async function handleSignOut() {
    await signOut();
    router.replace('/');
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.cream }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.page}>
        {/* Profile Header */}
        <View style={s.profileHeaderCard}>
          <View style={s.avatarRow}>
            <View style={s.avatarCircle}>
              <Text style={s.avatarInitials}>
                {profile?.display_name ? profile.display_name.slice(0, 2).toUpperCase() : 'MG'}
              </Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text accessibilityRole="header" style={s.profileName}>
                {profile?.display_name || 'Loading profile…'}
              </Text>
              <Text style={s.profileRole}>Role: Patient · Language: {language.toUpperCase()}</Text>
              <View style={s.completionBadge}>
                <Text style={s.completionText}>Profile Completion: {completionRate}%</Text>
              </View>
            </View>
          </View>

          {/* Quick Audio Guidance */}
          <View style={s.audioRow}>
            <Pressable
              onPress={() => speakGuidance(setupCopy(language).profileHelp, language)}
              style={s.audioPill}
              accessibilityRole="button"
              accessibilityLabel="Listen to instructions"
            >
              <Text style={s.audioPillText}>🔊 Listen to Instructions</Text>
            </Pressable>
            <Pressable
              onPress={stopGuidance}
              style={[s.audioPill, { backgroundColor: '#feeceb' }]}
              accessibilityRole="button"
              accessibilityLabel="Stop audio"
            >
              <Text style={[s.audioPillText, { color: '#9b2631' }]}>⏹ Stop</Text>
            </Pressable>
          </View>
        </View>

        {error ? <Text accessibilityRole="alert" style={s.errorBanner}>⚠️ {error}</Text> : null}
        {notice ? <Text accessibilityLiveRegion="polite" style={s.noticeBanner}>✓ {notice}</Text> : null}

        {!profile || !settings ? (
          <Button title="Retry loading profile" onPress={() => void load()} />
        ) : (
          <>
            {/* 1. Account & Personal Info */}
            <View style={s.card}>
              <Pressable
                onPress={() => select('Account')}
                style={s.sectionHeaderPressable}
                accessibilityRole="button"
                accessibilityLabel="Account and Personal Information"
              >
                <Text style={s.sectionHeaderTitle}>👤 Personal Information</Text>
                <Text style={s.toggleIndicator}>{open === 'Account' ? '▲' : '▼'}</Text>
              </Pressable>

              {open === 'Account' ? (
                <View style={s.sectionContent}>
                  <Text style={s.label}>Full Display Name</Text>
                  <TextInput
                    accessibilityLabel="Display name"
                    value={name}
                    onChangeText={setName}
                    style={s.input}
                    maxLength={255}
                  />

                  <Text style={s.label}>Date of Birth (YYYY-MM-DD)</Text>
                  <TextInput
                    accessibilityLabel="Date of birth"
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={palette.muted}
                    value={dob}
                    onChangeText={setDob}
                    style={s.input}
                  />
                  {age !== null && age >= 0 ? (
                    <Text style={s.helperText}>Calculated age: {age} years</Text>
                  ) : null}

                  <Text style={s.label}>Contact Reference / Phone</Text>
                  <TextInput
                    accessibilityLabel="Contact reference"
                    placeholder="e.g. +91 98765 43210"
                    placeholderTextColor={palette.muted}
                    value={contact}
                    onChangeText={setContact}
                    style={s.input}
                    maxLength={255}
                  />

                  <Text style={s.label}>Preferred Language</Text>
                  <View style={s.langBtnRow}>
                    {(['en', 'hi', 'te'] as const).map(l => (
                      <Pressable
                        key={l}
                        onPress={() => setLanguage(l)}
                        style={[s.langSelectBtn, language === l && s.langSelectBtnActive]}
                      >
                        <Text style={[s.langSelectText, language === l && s.langSelectTextActive]}>
                          {l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी' : 'తెలుగు'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Button
                    title={busy ? 'Saving…' : 'Save Account Details'}
                    disabled={busy || !name.trim()}
                    onPress={() => {
                      setBusy(true);
                      setError('');
                      void request<Profile>(
                        '/patients/me',
                        {
                          display_name: name.trim(),
                          date_of_birth: dob || null,
                          preferred_language: language,
                          contact_reference: contact || null,
                        },
                        'PATCH'
                      )
                        .then(p => {
                          setProfile(p);
                          setNotice('Account details saved successfully.');
                        })
                        .catch(e => setError(e.message))
                        .finally(() => setBusy(false));
                    }}
                  />
                </View>
              ) : null}
            </View>

            {/* 2. Structured Sections (Medical History, Lifestyle, Daily Goals, etc.) */}
            {sections.map(section => (
              <View key={section.title} style={s.card}>
                <Pressable
                  onPress={() => select(section.title)}
                  style={s.sectionHeaderPressable}
                  accessibilityRole="button"
                  accessibilityLabel={section.title}
                >
                  <Text style={s.sectionHeaderTitle}>
                    {section.icon} {section.title}
                  </Text>
                  <Text style={s.toggleIndicator}>{open === section.title ? '▲' : '▼'}</Text>
                </Pressable>

                {open === section.title ? (
                  <View style={s.sectionContent}>
                    <Text style={s.whyText}>{section.why}</Text>
                    {section.fields.map(f => (
                      <View key={f.key} style={{ gap: 4 }}>
                        <Text style={s.label}>{f.label}</Text>
                        <TextInput
                          accessibilityLabel={f.label}
                          multiline={!f.numeric}
                          keyboardType={
                            f.key === 'water_goal_ml'
                              ? 'decimal-pad'
                              : f.numeric
                              ? 'number-pad'
                              : 'default'
                          }
                          style={s.input}
                          placeholderTextColor={palette.muted}
                          placeholder={`Enter ${f.label.toLowerCase()}`}
                          value={
                            draft[f.key] ??
                            String(
                              f.key === 'water_goal_ml' && settings.water_goal_ml !== null
                                ? settings.water_goal_ml / 1000
                                : settings[f.key] ?? ''
                            )
                          }
                          onChangeText={v => setDraft({ ...draft, [f.key]: v })}
                          maxLength={f.numeric ? 6 : 2000}
                        />
                      </View>
                    ))}

                    <View style={s.switchRow}>
                      <Switch
                        accessibilityLabel="Allow optional health section storage"
                        value={accepted}
                        onValueChange={setAccepted}
                      />
                      <Text style={s.switchLabel}>
                        I choose to store this optional section in my private account (notice version 1.0).
                      </Text>
                    </View>

                    <Button
                      title="Save this section"
                      disabled={busy || !accepted}
                      onPress={() => void save(section)}
                    />
                    <Button
                      variant="quiet"
                      title="Discard unsaved edits"
                      disabled={busy}
                      onPress={() => {
                        setDraft({});
                        setError('');
                      }}
                    />
                  </View>
                ) : null}
              </View>
            ))}

            {/* 3. Vitals and Measurements */}
            <View style={s.card}>
              <Pressable
                onPress={() => select('Measurements')}
                style={s.sectionHeaderPressable}
                accessibilityRole="button"
                accessibilityLabel="Vitals and Measurements"
              >
                <Text style={s.sectionHeaderTitle}>📊 Health Measurements & Vitals</Text>
                <Text style={s.toggleIndicator}>{open === 'Measurements' ? '▲' : '▼'}</Text>
              </Pressable>

              {open === 'Measurements' ? (
                <View style={s.sectionContent}>
                  <HealthOverview onProfile={() => setOpen('Measurements')} onCare={() => router.push('/care')} />
                  <Text style={s.whyText}>
                    Manually entered readings only. No automatic medical alert or diagnosis is generated.
                  </Text>
                  <View style={s.metricPickerRow}>
                    {(['weight', 'height', 'blood_pressure', 'blood_glucose', 'heart_rate'] as const).map(k => (
                      <Pressable
                        key={k}
                        onPress={() => {
                          setKind(k);
                          setValue('');
                          setSecondary('');
                        }}
                        style={[s.metricKindBtn, kind === k && s.metricKindBtnActive]}
                      >
                        <Text style={[s.metricKindText, kind === k && s.metricKindTextActive]}>
                          {k.replaceAll('_', ' ')}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={s.label}>
                    Value (
                    {
                      (
                        {
                          weight: 'kg',
                          height: 'cm',
                          blood_pressure: 'mmHg (Systolic)',
                          blood_glucose: 'mg/dL',
                          heart_rate: 'bpm',
                        } as Record<string, string>
                      )[kind]
                    }
                    )
                  </Text>
                  <TextInput
                    accessibilityLabel="Measurement value"
                    keyboardType="decimal-pad"
                    placeholder="Enter reading"
                    placeholderTextColor={palette.muted}
                    value={value}
                    onChangeText={setValue}
                    style={s.input}
                  />

                  {kind === 'blood_pressure' ? (
                    <>
                      <Text style={s.label}>Diastolic pressure (mmHg)</Text>
                      <TextInput
                        accessibilityLabel="Diastolic blood pressure"
                        keyboardType="decimal-pad"
                        placeholder="e.g. 80"
                        placeholderTextColor={palette.muted}
                        value={secondary}
                        onChangeText={setSecondary}
                        style={s.input}
                      />
                    </>
                  ) : null}

                  <View style={s.switchRow}>
                    <Switch
                      accessibilityLabel="Allow measurement storage"
                      value={accepted}
                      onValueChange={setAccepted}
                    />
                    <Text style={s.switchLabel}>I choose to store this optional self-reported measurement.</Text>
                  </View>

                  <Button
                    title="Save measurement"
                    disabled={busy || !accepted || !value}
                    onPress={() => {
                      setBusy(true);
                      setError('');
                      void saveMeasurement(
                        kind,
                        Number(value),
                        kind === 'blood_pressure' ? Number(secondary) : undefined
                      )
                        .then(m => {
                          setMeasurements([m, ...measurements]);
                          setValue('');
                          setSecondary('');
                          setNotice('Measurement saved.');
                        })
                        .catch(e => setError(e.message))
                        .finally(() => setBusy(false));
                    }}
                  />

                  {measurements.slice(0, 5).map(m => (
                    <Text key={m.id} style={s.recentMetric}>
                      • {m.kind.replaceAll('_', ' ')}: {m.value}
                      {m.secondary_value ? ` / ${m.secondary_value}` : ''} {m.unit} (
                      {new Date(m.measured_at).toLocaleDateString()})
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>

            {/* 4. Health Records Shortcuts */}
            <View style={s.card}>
              <Text style={s.sectionHeaderTitle}>📁 My Care Records & Documents</Text>
              <Text style={s.whyText}>
                Prescriptions, medication schedules, OCR extractions, and health timeline.
              </Text>
              <View style={{ gap: 8 }}>
                <Button title="Open Medicines & Follow-ups" onPress={() => router.push('/care')} />
                <Button variant="secondary" title="Upload a Prescription" onPress={() => router.push('/prescriptions/upload')} />
                <Button variant="quiet" title="View Health Timeline →" onPress={() => router.push('/timeline')} />
              </View>
            </View>

            {/* 5. Account & Privacy Settings */}
            <View style={s.card}>
              <Text style={s.sectionHeaderTitle}>🔒 Account & Privacy</Text>
              <View style={{ gap: 8 }}>
                <Button variant="secondary" title="Review Data Consent Settings" onPress={() => router.push('/consent')} />
                <Button variant="secondary" title="Device Permissions Guidance" onPress={() => router.push('/permissions')} />
                <Button variant="danger" title="Sign Out of MedGuide AI" onPress={() => void handleSignOut()} />
              </View>
            </View>
          </>
        )}

        <Button variant="quiet" title="← Back to Home" onPress={() => router.replace('/home')} />
      </ScrollView>
      <MobileNav current="/settings" onNavigate={r => router.replace(r)} />
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flexGrow: 1,
    padding: 18,
    gap: 14,
    backgroundColor: palette.cream,
  },
  profileHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.line,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.ink,
  },
  profileRole: {
    fontSize: 12,
    color: palette.muted,
  },
  completionBadge: {
    backgroundColor: '#eaf4ee',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  completionText: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.teal,
  },
  audioRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f4ee',
  },
  audioPill: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#f0f4ee',
    alignItems: 'center',
  },
  audioPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.ink,
  },
  errorBanner: {
    backgroundColor: '#feeceb',
    padding: 10,
    borderRadius: 10,
    color: '#9b2631',
    fontSize: 13,
  },
  noticeBanner: {
    backgroundColor: '#eaf4ee',
    padding: 10,
    borderRadius: 10,
    color: palette.teal,
    fontSize: 13,
  },
  card: {
    padding: 16,
    gap: 12,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: palette.line,
  },
  sectionHeaderPressable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.ink,
  },
  toggleIndicator: {
    fontSize: 14,
    color: palette.muted,
  },
  sectionContent: {
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f4f6f3',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.ink,
  },
  input: {
    padding: 12,
    minHeight: 48,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    color: palette.ink,
    backgroundColor: '#fafbf9',
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    color: palette.teal,
    fontWeight: '500',
  },
  whyText: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.muted,
  },
  langBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langSelectBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    backgroundColor: '#fafbf9',
  },
  langSelectBtnActive: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
  langSelectText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.ink,
  },
  langSelectTextActive: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  switchLabel: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: palette.muted,
  },
  metricPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metricKindBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#fafbf9',
  },
  metricKindBtnActive: {
    backgroundColor: palette.teal,
    borderColor: palette.teal,
  },
  metricKindText: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.ink,
  },
  metricKindTextActive: {
    color: '#fff',
  },
  recentMetric: {
    fontSize: 12,
    color: palette.muted,
  },
});
