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
import { router } from 'expo-router';
import { Brand, Button, palette } from '../components/brand-ui';
import { MobileNav } from '../components/mobile-nav';
import { Language } from '../lib/i18n';
import { submitAndAnalyzeSymptoms, SymptomTriageResult } from '../lib/care';
import { DoctorConsultSvg, MedicalShieldSvg } from '../components/illustrations';
import { hasSession } from '../lib/api';

export default function SymptomsScreen() {
  const [symptomText, setSymptomText] = useState('');
  const [duration, setDuration] = useState('2');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [language, setLanguage] = useState<Language>('en');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SymptomTriageResult | null>(null);

  useEffect(() => {
    void (async () => {
      if (!(await hasSession())) {
        router.replace('/');
      }
    })();
  }, []);

  async function handleAnalyze() {
    if (!symptomText.trim() || symptomText.trim().length < 5) {
      setError('Please describe your symptoms in at least 5 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const fullNarrative = `${symptomText.trim()} (Duration: ${duration} days, Severity: ${severity})`;
      const triage = await submitAndAnalyzeSymptoms(fullNarrative, language);
      setResult(triage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Symptom analysis failed. Please check connection.');
    } finally {
      setBusy(false);
    }
  }

  function handleReset() {
    setResult(null);
    setSymptomText('');
    setError('');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
      <View style={{ flex: 1, backgroundColor: palette.cream }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Brand />
            <View style={styles.langPills}>
              {(['en', 'hi', 'te'] as const).map(code => (
                <Pressable
                  key={code}
                  onPress={() => setLanguage(code)}
                  style={[styles.langBtn, language === code && styles.langBtnActive]}
                >
                  <Text style={[styles.langText, language === code && styles.langTextActive]}>
                    {code === 'en' ? 'EN' : code === 'hi' ? 'हि' : 'తె'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Title Area */}
          <View style={styles.titleArea}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <DoctorConsultSvg size={34} />
              <View style={{ flex: 1 }}>
                <Text accessibilityRole="header" style={styles.title}>
                  Symptom Triage
                </Text>
                <Text style={styles.subtitle}>
                  Structured primary evaluation & safety guidance
                </Text>
              </View>
            </View>
          </View>

          {/* Result Card or Input Form */}
          {result ? (
            <View style={styles.resultCard}>
              {/* Risk Badge */}
              <View
                style={[
                  styles.riskBadge,
                  result.risk_level === 'EMERGENCY'
                    ? styles.riskEmergency
                    : result.risk_level === 'URGENT'
                    ? styles.riskUrgent
                    : styles.riskRoutine,
                ]}
              >
                <Text style={styles.riskBadgeText}>
                  {result.risk_level === 'EMERGENCY'
                    ? '🚨 EMERGENCY RISK'
                    : result.risk_level === 'URGENT'
                    ? '⚠️ URGENT CONSULTATION'
                    : '✓ ROUTINE CARE GUIDANCE'}
                </Text>
              </View>

              {/* Red Flags List */}
              {result.red_flags && result.red_flags.length > 0 ? (
                <View style={styles.redFlagsBox}>
                  <Text style={styles.redFlagsTitle}>Red Flags Identified:</Text>
                  {result.red_flags.map((flag, idx) => (
                    <Text key={idx} style={styles.redFlagItem}>
                      • {flag}
                    </Text>
                  ))}
                </View>
              ) : null}

              {/* Guidance Body */}
              <View style={styles.guidanceBox}>
                <Text style={styles.guidanceTitle}>Clinical Guidance</Text>
                <Text style={styles.guidanceText}>{result.guidance}</Text>
              </View>

              {result.risk_level === 'EMERGENCY' ? (
                <View style={styles.emergencyNotice}>
                  <Text style={styles.emergencyTitle}>Seek Immediate Emergency Care</Text>
                  <Text style={styles.emergencyBody}>
                    Please contact emergency medical services (e.g. 108 in India) or visit the nearest hospital emergency department without delay.
                  </Text>
                </View>
              ) : null}

              <Button title="Analyze another concern" onPress={handleReset} />
              <Button
                variant="secondary"
                title="Discuss with AI Companion →"
                onPress={() => router.push('/chat')}
              />
            </View>
          ) : (
            <View style={styles.formCard}>
              <Text style={styles.label}>Describe your symptoms</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholderTextColor={palette.muted}
                placeholder="e.g. I have a sore throat, mild fever for 2 days, and body ache."
                value={symptomText}
                onChangeText={setSymptomText}
                editable={!busy}
              />

              {/* Duration in Days */}
              <Text style={styles.label}>Duration (days)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                maxLength={3}
                placeholder="Number of days"
                placeholderTextColor={palette.muted}
                value={duration}
                onChangeText={setDuration}
                editable={!busy}
              />

              {/* Severity Scale */}
              <Text style={styles.label}>Severity Level</Text>
              <View style={styles.severityRow}>
                {(['mild', 'moderate', 'severe'] as const).map(sev => (
                  <Pressable
                    key={sev}
                    onPress={() => setSeverity(sev)}
                    style={[
                      styles.severityBtn,
                      severity === sev && styles.severityBtnActive,
                      severity === sev && sev === 'severe' && styles.severitySevere,
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        severity === sev && styles.severityTextActive,
                      ]}
                    >
                      {sev.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText} accessibilityRole="alert">
                    ⚠️ {error}
                  </Text>
                </View>
              ) : null}

              <Button
                title={busy ? 'Analyzing symptoms…' : 'Submit for Safety Triage'}
                disabled={busy || !symptomText.trim()}
                onPress={() => void handleAnalyze()}
              />
            </View>
          )}

          {/* Safety Notice */}
          <View style={styles.safetyCard}>
            <MedicalShieldSvg size={24} />
            <Text style={styles.safetyText}>
              Deterministic clinical safety protocol. This preliminary triage does not replace a doctor’s diagnostic evaluation.
            </Text>
          </View>
        </ScrollView>
        <MobileNav current="/home" onNavigate={r => router.replace(r)} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    padding: 18,
    gap: 14,
    backgroundColor: palette.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  titleArea: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.line,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.ink,
  },
  subtitle: {
    fontSize: 12,
    color: palette.muted,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.line,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.ink,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 46,
    fontSize: 15,
    color: palette.ink,
    backgroundColor: '#fafbf9',
  },
  textArea: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 90,
    fontSize: 14,
    color: palette.ink,
    backgroundColor: '#fafbf9',
    textAlignVertical: 'top',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  severityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafbf9',
  },
  severityBtnActive: {
    backgroundColor: palette.teal,
    borderColor: palette.teal,
  },
  severitySevere: {
    backgroundColor: palette.clay,
    borderColor: palette.clay,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.muted,
  },
  severityTextActive: {
    color: '#fff',
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
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: palette.line,
  },
  riskBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  riskEmergency: {
    backgroundColor: '#fee2e2',
  },
  riskUrgent: {
    backgroundColor: '#fef3c7',
  },
  riskRoutine: {
    backgroundColor: '#d1fae5',
  },
  riskBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: palette.ink,
  },
  redFlagsBox: {
    backgroundColor: '#feeceb',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f5b5b0',
    gap: 4,
  },
  redFlagsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9b2631',
  },
  redFlagItem: {
    fontSize: 12,
    color: '#9b2631',
    lineHeight: 18,
  },
  guidanceBox: {
    backgroundColor: '#f6f9f6',
    padding: 14,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e0ebd0',
  },
  guidanceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.ink,
  },
  guidanceText: {
    fontSize: 13,
    lineHeight: 20,
    color: palette.ink,
  },
  emergencyNotice: {
    backgroundColor: '#922f31',
    padding: 14,
    borderRadius: 14,
    gap: 6,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  emergencyBody: {
    fontSize: 12,
    lineHeight: 18,
    color: '#fef2f2',
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 14,
  },
  safetyText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: palette.muted,
  },
});
