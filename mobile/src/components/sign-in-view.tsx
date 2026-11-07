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
import { Button } from './brand-ui';
import { AuthCarousel } from './auth-carousel';
import { Language } from '../lib/i18n';
import { loginWithOtp, requestOtp, signIn } from '../lib/api';

interface SignInViewProps {
  currentLanguage?: Language;
  onLanguageChange?: (lang: Language) => void;
  onSubmit: () => void;
  onRegister: () => void;
  onBackToIntro: () => void;
  identifier?: string;
  password?: string;
  busy?: boolean;
  error?: string;
  onIdentifierChange?: (val: string) => void;
  onPasswordChange?: (val: string) => void;
}

export function SignInView({
  currentLanguage = 'en',
  onLanguageChange,
  onSubmit,
  onRegister,
  onBackToIntro,
}: SignInViewProps) {
  const [lang, setLang] = useState<Language>(currentLanguage);
  const [authMode, setAuthMode] = useState<'PHONE_OTP' | 'EMAIL'>('PHONE_OTP');
  
  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Email state
  const [emailIdentifier, setEmailIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const active = useRef(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function handleLanguage(newLang: Language) {
    setLang(newLang);
    onLanguageChange?.(newLang);
  }

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

  // Phone: Request OTP
  async function handleSendOtp() {
    setError('');
    setNotice('');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setBusy(true);
    try {
      const result = await requestOtp(formattedPhone, 'LOGIN');
      if (active.current) {
        setOtpSent(true);
        setOtpCode(result.dev_otp || '');
        setNotice(result.dev_otp ? 'Development test code only. No SMS was sent; do not use this flow as verified phone ownership.' : 'Phone delivery is not configured. Use password sign-in.');
        startCountdown(result.resend_after_seconds || 60);
      }
    } catch (err) {
      if (active.current) {
        setError(err instanceof Error ? err.message : 'Unable to send code. Please check your mobile number or register.');
      }
    } finally {
      if (active.current) setBusy(false);
    }
  }

  // Phone: Verify OTP & Sign In
  async function handleVerifyOtpLogin() {
    setError('');
    setNotice('');
    const code = otpCode.trim();
    if (code.length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setBusy(true);
    try {
      await loginWithOtp(formattedPhone, code);
      if (active.current) {
        onSubmit();
      }
    } catch (err) {
      if (active.current) {
        setError(err instanceof Error ? err.message : 'Invalid code. Please try again or request a new code.');
      }
    } finally {
      if (active.current) setBusy(false);
    }
  }

  // Email: Sign In
  async function handleEmailSignIn() {
    setError('');
    setNotice('');
    const ident = emailIdentifier.trim();
    if (!ident) {
      setError('Please enter your email or username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setBusy(true);
    try {
      await signIn(ident, password);
      if (active.current) {
        onSubmit();
      }
    } catch (err) {
      if (active.current) {
        setError(err instanceof Error ? err.message : 'Invalid credentials. Please check your details.');
      }
    } finally {
      if (active.current) setBusy(false);
    }
  }

  function handleGoogleSignIn() {
    setError('');
    setNotice('Google sign-in is currently available for healthcare provider accounts. For patients, please use mobile OTP.');
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
            onPress={onBackToIntro}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back to intro"
          >
            <Text style={styles.backBtnText}>← Intro</Text>
          </Pressable>
          <View style={styles.langPills}>
            {(['en', 'hi', 'te'] as const).map(code => (
              <Pressable
                key={code}
                onPress={() => handleLanguage(code)}
                style={[styles.langBtn, lang === code && styles.langBtnActive]}
                accessibilityRole="button"
                accessibilityLabel={`Select ${code === 'en' ? 'English' : code === 'hi' ? 'Hindi' : 'Telugu'}`}
              >
                <Text style={[styles.langText, lang === code && styles.langTextActive]}>
                  {code === 'en' ? 'EN' : code === 'hi' ? 'हि' : 'తె'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 4-Slide Distinct Auth Carousel */}
        <View style={styles.carouselContainer}>
          <AuthCarousel language={lang} height={145} />
        </View>

        {/* Sign In Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In to MedGuide AI</Text>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabBar}>
            <Pressable
              onPress={() => {
                setAuthMode('PHONE_OTP');
                setError('');
                setNotice('');
              }}
              style={[styles.tab, authMode === 'PHONE_OTP' && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: authMode === 'PHONE_OTP' }}
            >
              <Text style={[styles.tabText, authMode === 'PHONE_OTP' && styles.tabTextActive]}>
                📱 Phone (OTP)
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setAuthMode('EMAIL');
                setError('');
                setNotice('');
              }}
              style={[styles.tab, authMode === 'EMAIL' && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: authMode === 'EMAIL' }}
            >
              <Text style={[styles.tabText, authMode === 'EMAIL' && styles.tabTextActive]}>
                ✉️ Email / Password
              </Text>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorBanner} accessible accessibilityRole="alert">
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          {notice ? (
            <View style={styles.noticeBanner}>
              <Text style={styles.noticeText}>ℹ️ {notice}</Text>
            </View>
          ) : null}

          {authMode === 'PHONE_OTP' ? (
            /* PHONE OTP AUTHENTICATION */
            <View style={styles.fieldsContainer}>
              <View style={styles.field}>
                <Text style={styles.label}>Mobile Phone Number</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.countryBadge}>
                    <Text style={styles.countryText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder="98765 43210"
                    placeholderTextColor="#8a9994"
                    value={phone}
                    onChangeText={t => {
                      setPhone(t);
                      if (otpSent) setOtpSent(false);
                    }}
                    keyboardType="phone-pad"
                    maxLength={15}
                    editable={!busy}
                    accessibilityLabel="Mobile phone number"
                  />
                </View>
              </View>

              {!otpSent ? (
                <Button
                  title={busy ? 'Sending OTP...' : 'Send Verification Code →'}
                  onPress={handleSendOtp}
                  disabled={busy}
                  accessibilityLabel="Send OTP"
                />
              ) : (
                <View style={styles.otpSection}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Enter 6-Digit Code</Text>
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      placeholder="• • • • • •"
                      placeholderTextColor="#8a9994"
                      value={otpCode}
                      onChangeText={setOtpCode}
                      keyboardType="number-pad"
                      maxLength={8}
                      autoFocus
                      accessibilityLabel="Verification code"
                    />
                  </View>

                  <View style={styles.otpTimerRow}>
                    <Pressable onPress={() => setOtpSent(false)} style={styles.linkAction}>
                      <Text style={styles.linkActionText}>Change number</Text>
                    </Pressable>
                    {countdown > 0 ? (
                      <Text style={styles.countdownText}>Resend in {countdown}s</Text>
                    ) : (
                      <Pressable onPress={handleSendOtp} disabled={busy} style={styles.linkAction}>
                        <Text style={styles.resendText}>Resend code</Text>
                      </Pressable>
                    )}
                  </View>

                  <Button
                    title={busy ? 'Signing in...' : 'Verify & Sign In →'}
                    onPress={handleVerifyOtpLogin}
                    disabled={busy}
                    accessibilityLabel="Verify and sign in"
                  />
                </View>
              )}
            </View>
          ) : (
            /* EMAIL & PASSWORD AUTHENTICATION */
            <View style={styles.fieldsContainer}>
              <View style={styles.field}>
                <Text style={styles.label}>Email or Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email or username"
                  placeholderTextColor="#8a9994"
                  value={emailIdentifier}
                  onChangeText={setEmailIdentifier}
                  autoCapitalize="none"
                  accessibilityLabel="Email or username"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor="#8a9994"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  accessibilityLabel="Password"
                />
              </View>

              <Button
                title={busy ? 'Signing in...' : 'Sign In →'}
                onPress={handleEmailSignIn}
                disabled={busy}
                accessibilityLabel="Sign in with email and password"
              />
            </View>
          )}

          {/* Social Google divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            onPress={handleGoogleSignIn}
            style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </Pressable>

          {/* Sign up prompt */}
          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>New to MedGuide AI?</Text>
            <Pressable onPress={onRegister} style={styles.signUpLink}>
              <Text style={styles.signUpLinkText}>Create an account →</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e6ded1',
  },
  backBtnText: {
    fontSize: 13,
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
    minHeight:44,
    justifyContent:'center',
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
    marginBottom: 6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#073d37',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f4f2',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#63736e',
  },
  tabTextActive: {
    color: '#073d37',
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#fdeeed',
    borderWidth: 1,
    borderColor: '#f5c2be',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#a32b24',
    fontSize: 13,
    fontWeight: '600',
  },
  noticeBanner: {
    backgroundColor: '#eaf4f2',
    borderWidth: 1,
    borderColor: '#bcdbd5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  noticeText: {
    color: '#073d37',
    fontSize: 13,
    fontWeight: '600',
  },
  fieldsContainer: {
    gap: 12,
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
  countryBadge: {
    height: 48,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#cbd8d3',
    borderRadius: 12,
    backgroundColor: '#f1f4f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#073d37',
  },
  phoneInput: {
    flex: 1,
  },
  otpSection: {
    gap: 12,
    marginTop: 4,
  },
  otpInput: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
  },
  otpTimerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  linkAction: {
    paddingVertical: 2,
  },
  linkActionText: {
    fontSize: 13,
    color: '#073d37',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  countdownText: {
    fontSize: 13,
    color: '#7b8c87',
  },
  resendText: {
    fontSize: 13,
    color: '#246b60',
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e8e5',
  },
  dividerText: {
    fontSize: 12,
    color: '#8a9994',
    fontWeight: '500',
  },
  googleBtn: {
    height: 46,
    borderWidth: 1.5,
    borderColor: '#cbd8d3',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4285F4',
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#073d37',
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
  signUpLink: {
    paddingVertical: 2,
  },
  signUpLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#073d37',
    textDecorationLine: 'underline',
  },
});
