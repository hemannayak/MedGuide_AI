import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Brand, Button, palette } from './brand-ui';
import { HomeView } from './home-view';
import { SignInView } from './sign-in-view';
import { MobileNav } from './mobile-nav';
import { FadeIn } from './fade-in';
import { WelcomeFlow } from './welcome-flow';
import { PermissionView } from './permission-view';
import { BrandIntroduction } from './brand-introduction';
import { router } from 'expo-router';
import { RuralScene } from './rural-scene';
import {
  MedicalShieldSvg,
  DoctorConsultSvg,
  PrescriptionScannerSvg,
  MedicineBottleSvg,
  VoiceMicWaveSvg,
} from './illustrations';

const screens = [
  'Intro',
  'Sign in',
  'Register',
  'Permissions',
  'Home',
  'Voice',
  'Transcript',
  'Prescription',
  'Medicines',
  'Profile',
] as const;
type Screen = (typeof screens)[number];

export function MobileDesignStudio() {
  const [introFinished, setIntroFinished] = useState(false);
  const [screen, setScreen] = useState<Screen>('Sign in');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Simulated registration state for the studio workbench
  const [regName, setRegName] = useState('SYN Preview user');
  const [regLogin, setRegLogin] = useState('SYN-preview');
  const [regPass, setRegPass] = useState('SecurePass123');
  const [regConfirm, setRegConfirm] = useState('SecurePass123');
  const [regAccepted, setRegAccepted] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  const [transcript, setTranscript] = useState('What does high blood pressure mean in my mother?');
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState('');
  const { width, height } = useWindowDimensions();
  const [fit, setFit] = useState(true);
  const scale = fit
    ? Math.min(1, Math.max(0.4, (height - 230) / 824), (width - 48) / 406)
    : Math.min(1, (width - 48) / 406);

  function select(next: Screen) {
    setNotice('');
    setListening(false);
    setScreen(next);
  }

  function navigate(route: string) {
    if (route === '/chat') select('Voice');
    else if (route === '/home') select('Home');
    else if (route === '/prescriptions/upload') select('Prescription');
    else if (route === '/care') select('Medicines');
    else if (route === '/profile' || route === '/settings') select('Profile');
    else select('Home');
  }

  if (!__DEV__) {
    return (
      <View style={s.page}>
        <Text>Design preview is available in development only.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.canvas} contentContainerStyle={s.canvasContent}>
      {/* Studio Header Bar */}
      <View style={s.studioHeader}>
        <View>
          <Text style={s.overline}>MEDGUIDE / MOBILE STUDIO</Text>
          <Text style={s.studioTitle}>Care, made simpler.</Text>
          <Text style={s.studioDescription}>
            Full mobile application interactive preview · Switch screens anytime
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={fit ? 'Show actual size' : 'Fit phone to panel'}
          onPress={() => setFit(value => !value)}
          style={s.badge}
        >
          <Text style={s.badgeText}>{fit ? 'FIT VIEW · 100% ↗' : 'ACTUAL SIZE · FIT ↙'}</Text>
        </Pressable>
      </View>

      <Button title="Open connected mobile app · real account and dashboard" onPress={() => router.push('/')} />
      {/* Screen Selector Tabs */}
      <View style={s.selectors}>
        {screens.map(item => (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: screen === item }}
            onPress={() => select(item)}
            style={[s.selector, screen === item && s.selectorActive]}
          >
            <Text style={[s.selectorText, screen === item && s.selectorTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {/* Main Studio Viewport */}
      <View style={[s.stage, width > 960 && s.stageWide]}>
        <View style={s.phoneColumn}>
          <Text style={s.screenCaption}>{screen} · React Native · scroll inside the phone</Text>
          <View
            style={{
              width: 406 * scale,
              height: 824 * scale,
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={[s.phone, { width: 406, flexShrink: 0, transform: [{ scale }] }]}>
              {/* Phone Status Bar with Notch and Battery */}
              <View style={s.statusBar}>
                <Text style={s.time}>9:41</Text>
                <View style={s.camera} />
                <Text style={s.time}>▮▮ ▰</Text>
              </View>

              {/* Dynamic Screen Container */}
              <FadeIn key={screen} style={s.screen}>
                {screen === 'Intro' && !introFinished ? <BrandIntroduction onContinue={() => setIntroFinished(true)} /> : screen === 'Intro' ? (
                  <WelcomeFlow
                    onSignIn={() => select('Sign in')}
                    onRegister={() => select('Register')}
                  />
                ) : screen === 'Register' ? (
                  <ScrollView contentContainerStyle={s.regPage} keyboardShouldPersistTaps="handled">
                    <Brand /><RuralScene height={150} />
                    <Text style={s.bodyText}>Design preview · synthetic fields · no account is created</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <MedicalShieldSvg size={28} />
                      <Text style={s.regTitle}>{regSuccess ? 'Account Ready' : 'Create Patient Account'}</Text>
                    </View>

                    {regSuccess ? (
                      <View style={s.successBox}>
                        <DoctorConsultSvg size={52} />
                        <Text style={s.successTitle}>Welcome, {regName}!</Text>
                        <Text style={s.bodyText}>
                          Your demo patient account is simulated and ready. Review permissions next.
                        </Text>
                        <Button
                          title="Continue to Permissions"
                          onPress={() => {
                            setRegSuccess(false);
                            select('Permissions');
                          }}
                        />
                        <Button
                          variant="secondary"
                          title="Back to Sign In"
                          onPress={() => {
                            setRegSuccess(false);
                            select('Sign in');
                          }}
                        />
                      </View>
                    ) : (
                      <View style={s.regCard}>
                        <Text style={s.regLabel}>Display Name</Text>
                        <TextInput
                          style={s.regInput}
                          accessibilityLabel="Display name"
                          value={regName}
                          onChangeText={setRegName}
                          placeholder="Your nickname"
                        />

                        <Text style={s.regLabel}>Email or Username</Text>
                        <TextInput
                          style={s.regInput}
                          accessibilityLabel="Email or username"
                          value={regLogin}
                          onChangeText={setRegLogin}
                          placeholder="Username"
                        />

                        <View style={{ gap: 12 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={s.regLabel}>Password</Text>
                            <TextInput
                              style={s.regInput}
                              secureTextEntry
                              accessibilityLabel="Password"
                              value={regPass}
                              onChangeText={setRegPass}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={s.regLabel}>Confirm</Text>
                            <TextInput
                              style={s.regInput}
                              secureTextEntry
                              accessibilityLabel="Confirm password"
                              value={regConfirm}
                              onChangeText={setRegConfirm}
                            />
                          </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 }}>
                          <Switch accessibilityLabel="Agree to demonstration account processing" value={regAccepted} onValueChange={setRegAccepted} />
                          <Text style={{ fontSize: 11, color: palette.muted, flex: 1 }}>
                            I agree to account data processing for this demonstration.
                          </Text>
                        </View>

                        <Button
                          title="Create Patient Account"
                          disabled={!regAccepted || !regName.trim() || !regLogin.trim()}
                          onPress={() => setRegSuccess(true)}
                        />

                        <Button
                          variant="quiet"
                          title="Already have an account? Sign in"
                          onPress={() => select('Sign in')}
                        />
                      </View>
                    )}
                  </ScrollView>
                ) : screen === 'Permissions' ? (
                  <PermissionView preview onContinue={() => select('Home')} onConsent={() => setNotice('Processing choices are saved only in the installed app. This studio does not change consent.')} />
                ) : screen === 'Profile' ? (
                  <ScrollView contentContainerStyle={s.regPage}><MedicalShieldSvg size={100} /><Text style={s.regTitle}>Your profile</Text><Text style={s.bodyText}>Synthetic preview only. No patient record is loaded.</Text><Text>SYN Preview user</Text><Button title="Back to Home" onPress={() => select('Home')} /></ScrollView>
                ) : screen === 'Home' ? (
                  <HomeView onNavigate={navigate} />
                ) : screen === 'Sign in' ? (
                  <SignInView
                    identifier={identifier}
                    password={password}
                    busy={false}
                    error=""
                    onIdentifierChange={setIdentifier}
                    onPasswordChange={setPassword}
                    onSubmit={() => {
                      setIdentifier('');
                      setPassword('');
                      select('Home');
                    }}
                    onRegister={() => select('Register')}
                    onBackToIntro={() => select('Intro')}
                  />
                ) : (
                  <>
                    <View style={s.appHeader}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Back to preview home"
                        onPress={() => select('Home')}
                        style={s.back}
                      >
                        <Text style={s.backText}>‹</Text>
                      </Pressable>
                      <Text style={s.appHeaderTitle}>
                        {screen === 'Voice'
                          ? 'Talk to MedGuide'
                          : screen === 'Transcript'
                            ? 'Check what we heard'
                            : screen === 'Prescription'
                              ? 'Review prescription'
                              : 'My medicines'}
                      </Text>
                    </View>
                    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
                      {screen === 'Voice' ? (
                        <>
                          <View style={s.languagePill}>
                            <Text style={s.small}>English · हिन्दी · తెలుగు</Text>
                          </View>
                          <View style={s.voiceHalo}>
                            <View style={s.voiceCircle}>
                              <VoiceMicWaveSvg size={54} color="#ffffff" secondaryColor="#9fe3d5" />
                            </View>
                          </View>
                          <Text style={s.centerTitle}>{listening ? 'Listening…' : 'Ready when you are'}</Text>
                          <Text style={s.centerBody}>
                            {listening
                              ? 'Sample recording state. Microphone is active.'
                              : 'One tap. Your own words. Your language.'}
                          </Text>
                          <View style={s.wave} accessible={false}>
                            {[12, 20, 34, 48, 28, 18, 38, 58, 32, 20, 44, 30, 18, 10].map(
                              (height, i) => (
                                <View key={i} style={[s.waveBar, { height: listening ? height : 8 }]} />
                              )
                            )}
                          </View>
                          <Button
                            variant={listening ? 'danger' : 'primary'}
                            title={listening ? 'Stop recording' : 'Start recording preview'}
                            onPress={() => (listening ? select('Transcript') : setListening(true))}
                          />
                          <Button
                            variant="secondary"
                            title="Cancel"
                            onPress={() => {
                              setListening(false);
                              select('Home');
                            }}
                          />
                        </>
                      ) : screen === 'Transcript' ? (
                        <>
                          <Text style={s.small}>SAMPLE TRANSCRIPT · EDITABLE</Text>
                          <Text style={s.title}>Your words,{'\n'}before we answer.</Text>
                          <Text style={s.body}>Check the words we heard. You can change anything before sending.</Text>
                          <Text style={s.label}>Your words</Text>
                          <TextInput
                            accessibilityLabel="Sample transcript"
                            multiline
                            maxLength={2000}
                            value={transcript}
                            onChangeText={setTranscript}
                            style={s.input}
                          />
                          <Button
                            title="Send question"
                            disabled={!transcript.trim()}
                            onPress={() =>
                              setNotice('Preview only: sample question sent and verified in studio.')
                            }
                          />
                          <Button variant="secondary" title="Record again" onPress={() => select('Voice')} />
                        </>
                      ) : screen === 'Prescription' ? (
                        <>
                          <Text style={s.small}>PRESCRIPTION DOCUMENT · OCR EXTRACTION</Text>
                          <View style={s.document}>
                            <PrescriptionScannerSvg size={46} color={palette.ink} />
                            <Text style={s.body}>Prescription photo verified</Text>
                          </View>
                          <Text style={s.sectionTitle}>Extracted Information</Text>
                          {['Paracetamol 500mg', 'Amoxicillin 250mg', '1 tablet OD after meals'].map(
                            field => (
                              <View key={field} style={s.fieldRow}>
                                <Text style={s.label}>{field}</Text>
                                <View style={s.reviewBadge}>
                                  <Text style={s.reviewBadgeText}>Needs Review</Text>
                                </View>
                              </View>
                            )
                          )}
                          <View style={s.warning}>
                            <Text style={s.label}>Check every field before saving</Text>
                            <Text style={s.body}>
                              If anything is unclear, ask a healthcare professional.
                            </Text>
                          </View>
                          <Button
                            title="Confirm Extracted Medicines"
                            onPress={() => select('Medicines')}
                          />
                          <Button
                            variant="secondary"
                            title="Upload another document"
                            onPress={() => select('Prescription')}
                          />
                        </>
                      ) : (
                        <>
                          <View style={s.calendar}>
                            <MedicineBottleSvg size={56} color={palette.ink} />
                          </View>
                          <Text style={s.centerTitle}>Active Medicines</Text>
                          <Text style={s.centerBody}>
                            Review dosage schedules and community follow-up appointments.
                          </Text>
                          <Button title="Upload New Prescription" onPress={() => select('Prescription')} />
                        </>
                      )}
                      <View style={s.emergency}>
                        <Text style={s.emergencyText}>For emergencies, seek immediate professional help.</Text>
                      </View>
                    </ScrollView>
                    <MobileNav
                      current={screen === 'Voice' || screen === 'Transcript' ? '/chat' : '/care'}
                      onNavigate={navigate}
                    />
                  </>
                )}
              </FadeIn>
              {/* Phone Gesture Bottom Bar */}
              <View style={s.gesture} />
            </View>
          </View>
        </View>

        {/* Side Workbench Notes */}
        <View style={[s.notes, width > 960 && s.notesWide]}>
          <Text style={s.overline}>DESIGN CONSOLE</Text>
          <Text style={s.notesTitle}>{screen}</Text>
          <Text style={s.body}>
            Cream surfaces, forest-green controls and quiet sage cards. Scalable vector SVGs, audio guide support, and clean mobile responsiveness.
          </Text>
          <View style={s.rule} />
          <Text style={s.label}>Interactive Navigation</Text>
          <Text style={s.body}>
            Preview navigation: Sign in, Register, Permissions, Audio Guide, Voice, Prescription, Medicines, and Profile are available for design review. Device accessibility testing is pending.
          </Text>
          <View style={s.rule} />
          <Text style={s.label}>Palette Tokens</Text>
          <View style={s.swatches}>
            {[palette.ink, palette.cream, palette.sage, palette.clay].map(color => (
              <View key={color} style={[s.swatch, { backgroundColor: color }]} />
            ))}
          </View>
          {notice ? (
            <Text accessibilityRole="alert" style={s.notice}>
              {notice}
            </Text>
          ) : (
            <Text style={s.hint}>Choose any screen tab above or interact directly inside the phone.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: '#e8ebe6' },
  canvasContent: { padding: 20, gap: 16, alignItems: 'center' },
  studioHeader: {
    width: '100%',
    maxWidth: 1040,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  overline: { color: palette.teal, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  studioTitle: { color: palette.ink, fontSize: 26, fontWeight: '700', marginVertical: 8 },
  studioDescription: { color: palette.muted, fontSize: 14 },
  badge: { backgroundColor: palette.white, padding: 12, borderRadius: 20 },
  badgeText: { color: palette.ink, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  selectors: { width: '100%', maxWidth: 1040, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selector: {
    minHeight: 40,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: palette.white,
    borderRadius: 12,
  },
  selectorActive: { backgroundColor: palette.ink },
  selectorText: { color: palette.ink, fontSize: 12, fontWeight: '600' },
  selectorTextActive: { color: '#fff' },
  stage: { width: '100%', maxWidth: 1040, alignItems: 'center', gap: 32 },
  stageWide: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' },
  phoneColumn: { width: 406, maxWidth: '100%', gap: 10 },
  screenCaption: { color: palette.muted, fontSize: 11, textAlign: 'center' },
  phone: {
    height: 824,
    borderWidth: 7,
    borderColor: '#17352d',
    borderRadius: 40,
    backgroundColor: palette.cream,
    overflow: 'hidden',
  },
  statusBar: {
    height: 36,
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: { color: palette.ink, fontSize: 11, fontWeight: '700' },
  camera: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#17352d' },
  screen: { flex: 1, overflow: 'hidden' },
  gesture: {
    height: 4,
    width: 90,
    borderRadius: 2,
    backgroundColor: palette.ink,
    alignSelf: 'center',
    margin: 7,
  },
  notes: {
    width: '100%',
    maxWidth: 406,
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  notesWide: { width: 280 },
  notesTitle: { color: palette.ink, fontSize: 26, fontWeight: '700' },
  rule: { height: 1, backgroundColor: palette.line },
  body: { color: palette.muted, fontSize: 13, lineHeight: 20 },
  label: { color: palette.ink, fontSize: 13, fontWeight: '600' },
  hint: { color: palette.muted, fontSize: 12, lineHeight: 18 },
  notice: {
    color: palette.ink,
    backgroundColor: palette.peach,
    padding: 12,
    borderRadius: 12,
    fontSize: 12,
    lineHeight: 18,
  },
  swatches: { flexDirection: 'row', gap: 10 },
  swatch: { height: 32, width: 32, borderWidth: 1, borderColor: palette.line, borderRadius: 10 },

  page: { flexGrow: 1, padding: 18, gap: 14, backgroundColor: palette.cream },
  appHeader: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appHeaderTitle: { color: palette.ink, fontSize: 16, fontWeight: '700' },
  back: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backText: { color: palette.ink, fontSize: 28 },
  small: { fontSize: 10, fontWeight: '600', letterSpacing: 0.8, color: palette.muted },
  languagePill: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: palette.line,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  voiceHalo: {
    marginTop: 16,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: palette.sage,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 12,
    borderColor: '#edf0e5',
  },
  voiceCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    textAlign: 'center',
  },
  centerBody: { color: palette.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  wave: { height: 50, flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center' },
  waveBar: { width: 4, borderRadius: 3, backgroundColor: palette.teal },
  title: { color: palette.ink, fontSize: 24, lineHeight: 30, fontWeight: '700' },
  input: {
    minHeight: 120,
    backgroundColor: palette.white,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    color: palette.ink,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  document: {
    height: 120,
    backgroundColor: '#e9e7df',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sectionTitle: { color: palette.ink, fontWeight: '700', fontSize: 16 },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.white,
    borderRadius: 12,
  },
  reviewBadge: { backgroundColor: '#ffe8bd', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10 },
  reviewBadgeText: { fontSize: 10, color: '#6c3908', fontWeight: '700' },
  warning: { backgroundColor: '#fff0d7', borderRadius: 14, padding: 12, gap: 6 },
  calendar: {
    marginTop: 20,
    height: 140,
    backgroundColor: palette.sage,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergency: { marginTop: 'auto', paddingTop: 16, borderTopWidth: 1, borderColor: palette.line },
  emergencyText: { textAlign: 'center', color: palette.clay, fontSize: 11, lineHeight: 16 },

  // Register simulation styles inside studio
  regPage: { flexGrow: 1, padding: 16, gap: 10, backgroundColor: palette.cream },
  regTitle: { fontSize: 18, fontWeight: '700', color: palette.ink },
  regCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: palette.line,
  },
  regLabel: { fontSize: 11, color: palette.ink, fontWeight: '600' },
  regInput: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#fafbf9',
    fontSize: 13,
    color: palette.ink,
  },
  successBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: palette.line,
  },
  successTitle: { fontSize: 17, fontWeight: '700', color: palette.ink },
  bodyText: { fontSize: 12, color: palette.muted, textAlign: 'center' },
});
