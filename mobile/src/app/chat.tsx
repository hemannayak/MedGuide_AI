import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, Text, TextInput, View, StyleSheet, Pressable } from 'react-native';
import { Brand, Button, palette } from '../components/brand-ui';
import { MobileNav } from '../components/mobile-nav';
import { router } from 'expo-router';
import { ChatReply, hasSession, Language, sendChat, signOut } from '../lib/api';
import { useVoice } from '../hooks/use-voice';
import { getProfile, updatePreferredLanguage } from '../lib/care';
import { DoctorConsultSvg, VoiceMicWaveSvg, MedicalShieldSvg } from '../components/illustrations';
import { playAudioGuide, stopAudioGuide } from '../lib/audio-guide';
import { t } from '../lib/i18n';
import { RecordingIndicator } from '../components/recording-indicator';

const voiceGreetings = {
  en: 'Hello! I’m MedGuide, your AI health assistant. What is worrying you today? Tap Record when you’re ready.',
  hi: 'नमस्ते! मैं मेडगाइड, आपका एआई स्वास्थ्य सहायक हूँ। आज आपको क्या परेशानी है? तैयार होने पर रिकॉर्ड दबाएँ।',
  te: 'నమస్కారం! నేను మెడ్‌గైడ్, మీ ఏఐ ఆరోగ్య సహాయకుడిని. ఈరోజు మీకు ఏ సమస్య ఉంది? సిద్ధంగా ఉన్నప్పుడు రికార్డ్ నొక్కండి.',
};

export default function Chat() {
  const [language, setLanguage] = useState<Language>('en');
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<{ question: string; reply: ChatReply; language: Language }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [playingAudio, setPlayingAudio] = useState(false);
  const conversation = useRef<string | undefined>(undefined);
  const languageChosen = useRef(false);
  const [reviewingVoice, setReviewingVoice] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const voice = useVoice(language, text => { setQuestion(text); setReviewingVoice(true); });
  const greetingLock = useRef(false);

  async function chooseLanguage(code: Language) {
    if (busy || voice.phase !== 'idle') return;
    languageChosen.current = true;
    setBusy(true);
    setError('');
    try {
      const profile = await updatePreferredLanguage(code);
      if (profile.preferred_language !== code) throw new Error('The service did not confirm your language preference. Please retry from your profile.');
      setVoiceMode(false);
      setLanguage(code);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Language preference could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  async function enterVoiceMode() {
    if (greetingLock.current || busy || voice.phase !== 'idle') return;
    greetingLock.current = true;
    setVoiceMode(true);
    try {
      await voice.speak(voiceGreetings[language], language);
    } finally {
      greetingLock.current = false;
    }
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        if (!await hasSession()) {
          if (active) router.replace('/');
          return;
        }
        const profile = await getProfile();
        if (active && !languageChosen.current && ['en', 'hi', 'te'].includes(profile.preferred_language)) {
          setLanguage(profile.preferred_language);
        }
      } catch {
        if (active) setError('Your language preference could not load. You can choose a language below.');
      }
    })();
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
      playAudioGuide(t('audioChat', language), language, () => setPlayingAudio(false));
    }
  };

  async function send() {
    if (busy || !question.trim()) return;
    const text = question.trim();
    setBusy(true);
    setError('');
    try {
      const reply = await sendChat(text, language, conversation.current);
      conversation.current = reply.conversation_id;
      setTurns(previous => [...previous, { question: text, reply, language }]);
      setQuestion('');
      if (reviewingVoice) {
        setReviewingVoice(false);
        // Replies remain text until the user explicitly taps Listen.
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Connection failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.page} behavior="height">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Brand />
        <Button title={voiceMode ? "Replay spoken guidance" : "Start voice mode"} onPress={() => void enterVoiceMode()} disabled={busy || voice.phase !== 'idle'} />
        {voiceMode ? <Text accessibilityLiveRegion="polite">Recording only starts when you choose Record. Review your words before sending.</Text> : null}

        {/* Accessibility & Language bar */}
        <View style={styles.topRow}>
          <View style={styles.languages}>
            {(['en', 'hi', 'te'] as const).map(code => (
              <Pressable
                key={code}
                onPress={() => void chooseLanguage(code)}
                disabled={busy || voice.phase !== 'idle'}
                style={[styles.langChip, language === code && styles.langChipActive]}
              >
                <Text style={[styles.langText, language === code && styles.langTextActive]}>
                  {code === 'en' ? 'English' : code === 'hi' ? 'हिन्दी' : 'తెలుగు'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleAudioGuide}
            style={[styles.audioBtn, playingAudio && styles.audioBtnPlaying]}
          >
            <Text style={[styles.audioBtnText, playingAudio && styles.audioBtnTextPlaying]}>
              {playingAudio ? t('audioGuideStop', language) : t('audioGuideBtn', language)}
            </Text>
          </Pressable>
        </View>

        <Button
          variant="quiet"
          title="Review AI and speech permissions"
          disabled={busy || voice.phase !== 'idle'}
          onPress={() => router.push('/consent')}
        />

        {/* Welcome card if no turns */}
        {turns.length === 0 ? (
          <View style={styles.welcome}>
            <View style={{ flex: 1 }}>
              <Text style={styles.welcomeEyebrow}>AI HEALTH COMPANION</Text>
              <Text style={styles.title}>How are you feeling today?</Text>
              <Text style={styles.help}>
                Describe your symptoms in your own words. Speak or type in Telugu, Hindi, or English.
              </Text>
              <Text style={styles.disclaimerNote}>
                Preliminary guidance only. In emergencies, visit the nearest PHC or hospital immediately.
              </Text>
            </View>
            <DoctorConsultSvg width={72} height={72} />
          </View>
        ) : null}

        {/* Conversation Turns */}
        <View style={{ gap: 12 }}>
          {turns.map((turn, index) => (
            <View key={index} style={styles.turn}>
              <View style={styles.userBubble}>
                <Text style={styles.userLabel}>You</Text>
                <Text style={styles.question}>{turn.question}</Text>
              </View>

              <View style={styles.assistantBubble}>
                <View style={styles.aiHeader}>
                  <MedicalShieldSvg width={20} height={20} />
                  <Text style={styles.aiLabel}>MedGuide AI</Text>
                </View>
                {turn.reply.response_type==='EMERGENCY'?<Text accessibilityRole="alert" style={{color:palette.error,fontSize:18,fontWeight:'700'}}>Emergency guidance · seek immediate professional help</Text>:<Text style={{color:palette.teal}}>Preliminary health information · not a diagnosis</Text>}
                <Text style={styles.reply} selectable>{turn.reply.message}</Text>
                <Button
                  variant="secondary"
                  title="🔊 Read reply aloud"
                  disabled={busy || voice.phase !== 'idle'}
                  onPress={() => void voice.speak(turn.reply.message, turn.language)}
                />
                {turn.reply.sources.map((source, position) => (
                  <Text style={styles.sourceText} key={position}>
                    [{position + 1}] {source.title}
                  </Text>
                ))}
                <Text style={styles.turnDisclaimer}>{turn.reply.disclaimer}</Text>
              </View>
            </View>
          ))}
        </View>

        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        {voice.error ? <Text style={styles.error} accessibilityRole="alert">{voice.error}</Text> : null}

        {/* Voice Interaction Card */}
        <View style={styles.voicePanel}>
          {voice.phase==='recording'?<RecordingIndicator/>:null}
          <View style={styles.voiceHeader}>
            <VoiceMicWaveSvg width={48} height={48} />
            <View style={{ flex: 1 }}>
              <Text style={styles.voiceTitle} accessibilityLiveRegion="polite">
                {voice.phase === 'idle'
                  ? 'Voice consultation'
                  : voice.phase === 'recording'
                  ? 'Listening to you…'
                  : voice.phase === 'speaking'
                  ? 'Speaking response…'
                  : 'Processing audio…'}
              </Text>
              <Text style={styles.voiceSub}>
                {voice.phase === 'recording'
                  ? 'Speak clearly near your phone'
                  : 'Tap below to speak in your language'}
              </Text>
            </View>
          </View>

          <Button
            variant={voice.phase === 'recording' ? 'danger' : 'primary'}
            title={voice.phase === 'recording' ? 'Stop and review transcript' : 'Record your concern'}
            disabled={busy || !['idle', 'recording'].includes(voice.phase)}
            onPress={() => void (voice.phase === 'recording' ? voice.stop() : voice.start())}
          />

          {voice.phase !== 'idle' ? (
            <Button variant="secondary" title="Cancel audio" onPress={voice.cancel} />
          ) : null}
        </View>

        {reviewingVoice ? (
          <View style={styles.review}>
            <Text style={styles.label}>Check recognized words</Text>
            <Text style={styles.help}>
              Review the transcribed text below. You can edit any medicine names or symptoms before sending.
            </Text>
          </View>
        ) : null}

        {/* Text Input */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>Or type your question</Text>
          <TextInput
            accessibilityLabel="Your health question"
            placeholderTextColor={palette.muted}
            multiline
            maxLength={2000}
            style={styles.input}
            placeholder="E.g., I have had fever and cough for two days..."
            value={question}
            onChangeText={setQuestion}
            editable={!busy}
          />
          <Button
            title={busy ? 'Analyzing with medical knowledge…' : 'Send Question'}
            onPress={() => void send()}
            disabled={busy || voice.phase !== 'idle' || !question.trim()}
          />
        </View>

        <Button
          variant="quiet"
          title="Sign out"
          disabled={busy}
          onPress={() => {
            voice.cancel();
            void signOut().then(() => {
              setTurns([]);
              router.replace('/');
            });
          }}
        />
      </ScrollView>
      <MobileNav current="/chat" disabled={busy || voice.phase !== 'idle'} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.cream },
  content: { padding: 18, gap: 12, flexGrow: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  languages: { flexDirection: 'row', gap: 6 },
  langChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line },
  langChipActive: { backgroundColor: palette.ink, borderColor: palette.ink },
  langText: { fontSize: 12, fontWeight: '700', color: palette.muted },
  langTextActive: { color: palette.cream },
  audioBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: '#E2F0D9', borderWidth: 1, borderColor: '#A2C594' },
  audioBtnPlaying: { backgroundColor: '#FADBD8', borderColor: '#E74C3C' },
  audioBtnText: { fontSize: 11, fontWeight: '700', color: '#1E4620' },
  audioBtnTextPlaying: { color: '#900C3F' },
  welcome: { padding: 18, borderRadius: 22, backgroundColor: palette.sage, flexDirection: 'row', alignItems: 'center', gap: 12 },
  welcomeEyebrow: { fontSize: 10, fontWeight: '800', color: palette.muted, letterSpacing: 0.8 },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '800', color: palette.ink, marginTop: 2 },
  help: { fontSize: 12, lineHeight: 18, color: palette.muted, marginTop: 4 },
  disclaimerNote: { fontSize: 11, color: '#6E4D1B', fontStyle: 'italic', marginTop: 6, lineHeight: 16 },
  label: { color: palette.ink, fontSize: 13, fontWeight: '700' },
  turn: { gap: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: palette.ink, borderRadius: 18, padding: 14, maxWidth: '85%' },
  userLabel: { color: '#A3B899', fontSize: 11, fontWeight: '700', marginBottom: 2 },
  question: { color: palette.cream, fontSize: 15, lineHeight: 22 },
  assistantBubble: { backgroundColor: palette.white, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: palette.line, gap: 10 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiLabel: { fontSize: 13, fontWeight: '800', color: palette.ink },
  reply: { color: palette.ink, fontSize: 15, lineHeight: 23 },
  sourceText: { fontSize: 11, color: palette.muted, fontStyle: 'italic' },
  turnDisclaimer: { fontSize: 11, color: '#888', fontStyle: 'italic' },
  voicePanel: { backgroundColor: palette.white, borderRadius: 22, padding: 16, gap: 12, borderWidth: 1, borderColor: palette.line },
  voiceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  voiceTitle: { fontSize: 16, fontWeight: '800', color: palette.ink },
  voiceSub: { fontSize: 12, color: palette.muted, marginTop: 2 },
  review: { backgroundColor: palette.peach, padding: 14, gap: 6, borderRadius: 16 },
  inputCard: { backgroundColor: palette.white, borderRadius: 20, padding: 14, gap: 10, borderWidth: 1, borderColor: palette.line },
  input: { borderWidth: 1, borderColor: palette.line, borderRadius: 14, padding: 12, backgroundColor: palette.cream, minHeight: 70, maxHeight: 140, color: palette.ink, fontSize: 15 },
  error: { backgroundColor: '#fff0ed', color: palette.error, padding: 12, borderRadius: 14, fontSize: 13, fontWeight: '600' },
});

