import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Brand, Button } from '../components/brand-ui';
import { AuthCarousel } from '../components/auth-carousel';
import { Language, t } from '../lib/i18n';
import { requestOtp, registerWithOtp } from '../lib/api';

export default function Register() {
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [accepted, setAccepted] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const active = useRef(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startCountdown(seconds: number = 60) {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const cleanPhone = phone.replace(/[^\d]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`;

  // Step 1: Validate and request OTP
  async function handleRequestOtp() {
    setError('');
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 80) {
      setError('Please enter your full name (1 to 80 characters).');
      return;
    }
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }
    if (!accepted) {
      setError('Please agree to data processing terms to create an account.');
      return;
    }

    setBusy(true);
    try {
      const result = await requestOtp(formattedPhone, 'REGISTER');
      if (active.current) {
        setStep('OTP');
        setOtpCode(result.dev_otp || '');
        startCountdown(result.resend_after_seconds || 60);
      }
    } catch (err) {
      if (active.current) {
        setError(err instanceof Error ? err.message : 'Unable to send verification code. Please check your connection.');
      }
    } finally {
      if (active.current) setBusy(false);
    }
  }

  // Step 2: Verify OTP and Register
  async function handleVerifyAndRegister() {
    setError('');
    const trimmedOtp = otpCode.trim();
    if (trimmedOtp.length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setBusy(true);
    try {
      await registerWithOtp(
        formattedPhone,
        trimmedOtp,
        name.trim(),
        language,
        email.trim() || undefined
      );
      if (active.current) {
        // Successfully registered and session established in SecureStore
        // Navigate directly to permissions onboarding flow
        router.replace('/permissions');
      }
    } catch (err) {
      if (active.current) {
        setError(err instanceof Error ? err.message : 'Verification failed. Please check the code or request a new one.');
      }
    } finally {
      if (active.current) setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f6f1e8' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => (step === 'OTP' ? setStep('DETAILS') : router.back())}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Text style={styles.backBtnText}>←</Text>
          </Pressable>
          <Brand />
          <View style={styles.langPills}>
            {(['en', 'hi', 'te'] as const).map(code => (
              <Pressable
                key={code}
                onPress={() => setLanguage(code)}
                style={[styles.langBtn, language === code && styles.langBtnActive]}
                accessibilityRole="button"
                accessibilityLabel={`Select ${code === 'en' ? 'English' : code === 'hi' ? 'Hindi' : 'Telugu'}`}
              >
                <Text style={[styles.langText, language === code && styles.langTextActive]}>
                  {code === 'en' ? 'EN' : code === 'hi' ? 'हि' : 'తె'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Carousel Preview */}
        {step === 'DETAILS' && (
          <View style={styles.carouselContainer}>
            <AuthCarousel language={language} height={140} />
          </View>
        )}

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.titleRow}>
            <Text style={styles.formTitle}>
              {step === 'DETAILS' ? t('registerBtn', language) : 'Verify Mobile Number'}
            </Text>
            <Text style={styles.formSubtitle}>
              {step === 'DETAILS'
                ? 'Create your free MedGuide AI health companion account'
                : 'Development phone verification only. No SMS delivery is connected.'}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBanner} accessible accessibilityRole="alert">
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          {step === 'DETAILS' ? (
            /* STEP 1: Name, Mobile, Optional Email */
            <View style={styles.inputsSection}>
              <View style={styles.field}>
                <Text style={styles.label}>{t('displayNameLabel', language)} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Ramesh Kumar"
                  placeholderTextColor="#8a9994"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  accessibilityLabel="Full display name"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Mobile Phone Number *</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.countryCodeBadge}>
                    <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder="98765 43210"
                    placeholderTextColor="#8a9994"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={15}
                    accessibilityLabel="Mobile phone number"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email Address (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#8a9994"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  accessibilityLabel="Optional email address"
                />
              </View>

              <Pressable
                onPress={() => setAccepted(!accepted)}
                style={styles.consentRow}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: accepted }}
              >
                <View style={[styles.checkbox, accepted && styles.checkboxActive]}>
                  {accepted ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
                <Text style={styles.consentText}>
                  I agree to preliminary health guidance terms and research demonstration processing.
                </Text>
              </Pressable>

              <Button
                title={busy ? 'Sending code...' : 'Send Verification Code →'}
                onPress={handleRequestOtp}
                disabled={busy}
                accessibilityLabel="Send OTP verification code"
              />
            </View>
          ) : (
            /* STEP 2: OTP Verification */
            <View style={styles.inputsSection}>
              <View style={styles.field}>
                <Text style={styles.label}>6-Digit Verification Code</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="• • • • • •"
                  placeholderTextColor="#8a9994"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="number-pad"
                  maxLength={8}
                  autoFocus
                  accessibilityLabel="6-digit verification code"
                />
              </View>

              <View style={styles.otpActionsRow}>
                <Pressable onPress={() => setStep('DETAILS')} style={styles.editPhoneBtn}>
                  <Text style={styles.editPhoneText}>Edit mobile number</Text>
                </Pressable>
                {countdown > 0 ? (
                  <Text style={styles.countdownText}>Resend in {countdown}s</Text>
                ) : (
                  <Pressable onPress={handleRequestOtp} disabled={busy} style={styles.resendBtn}>
                    <Text style={styles.resendText}>Resend code</Text>
                  </Pressable>
                )}
              </View>

              <Button
                title={busy ? 'Verifying...' : 'Verify & Create Account →'}
                onPress={handleVerifyAndRegister}
                disabled={busy}
                accessibilityLabel="Verify OTP and complete registration"
              />
            </View>
          )}

          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>Already have an account?</Text>
            <Pressable onPress={() => router.replace('/')} style={styles.signInLink}>
              <Text style={styles.signInLinkText}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: '#f6f1e8',
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap:12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e6ded1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#073d37',
  },
  langPills: {
    flexDirection: 'row',
    backgroundColor: '#e6ded1',
    borderRadius: 20,
    padding: 3,
    gap: 4,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  langBtnActive: {
    backgroundColor: '#073d37',
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#073d37',
  },
  langTextActive: {
    color: '#ffffff',
  },
  carouselContainer: {
    marginBottom: 8,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  titleRow: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#073d37',
    letterSpacing: -0.3,
  },
  formSubtitle: {
    fontSize: 13,
    color: '#5a6b65',
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: '#fdeeed',
    borderWidth: 1,
    borderColor: '#f5c2be',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#a32b24',
    fontSize: 13,
    fontWeight: '600',
  },
  inputsSection: {
    gap: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#073d37',
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#cbd8d3',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#073d37',
    backgroundColor: '#fafaf8',
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryCodeBadge: {
    height: 48,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#cbd8d3',
    borderRadius: 12,
    backgroundColor: '#f1f4f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#073d37',
  },
  phoneInput: {
    flex: 1,
  },
  otpInput: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#073d37',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: '#073d37',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  consentText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#495853',
  },
  otpActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  editPhoneBtn: {
    paddingVertical: 4,
  },
  editPhoneText: {
    fontSize: 13,
    color: '#073d37',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  countdownText: {
    fontSize: 13,
    color: '#7b8c87',
  },
  resendBtn: {
    paddingVertical: 4,
  },
  resendText: {
    fontSize: 13,
    color: '#246b60',
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 6,
  },
  footerPrompt: {
    fontSize: 13,
    color: '#5a6b65',
  },
  signInLink: {
    paddingVertical: 2,
  },
  signInLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#073d37',
    textDecorationLine: 'underline',
  },
});
