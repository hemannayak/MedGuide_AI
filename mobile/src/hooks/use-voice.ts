import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { AudioModule, createAudioPlayer, RecordingPresets, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { Language, request, synthesizeSpeech, transcribeRecording } from '../lib/api';
import { decodeAudio, speechSegments } from '../lib/voice';

type Phase = 'idle' | 'preparing' | 'recording' | 'transcribing' | 'speaking';
export function useVoice(language: Language, onTranscript: (text: string) => void) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const generation = useRef(0);
  const active = useRef(true);
  const finish = useRef<(() => void) | null>(null);
  const player = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = useCallback(() => {
    generation.current++;
    if (timeout.current) clearTimeout(timeout.current);
    player.current?.pause();
    finish.current?.(); finish.current = null;
    // Expo owns recorder release. Its cleanup may run before this effect's
    // cleanup (including Fast Refresh); never read a released native object.
    if (!active.current) return;
    if (recorder.isRecording) {
      if (active.current) setPhase('preparing');
      const current = generation.current;
      void recorder.stop().then(() => {
        if (active.current && recorder.uri) { const file = new File(recorder.uri); if (file.exists) file.delete(); }
      }).catch(() => {
        if (active.current) setError('Recording could not be discarded. Please close and reopen this screen.');
      }).finally(() => { if (active.current && current === generation.current) setPhase('idle'); });
    } else if (active.current) setPhase('idle');
  }, [recorder]);
  useEffect(() => {
    active.current = true;
    const subscription = AppState.addEventListener('change', state => { if (state !== 'active') cancel(); });
    return () => { active.current = false; subscription.remove(); cancel(); };
  }, [cancel]);

  async function start() {
    cancel(); const current = generation.current; setError(''); setPhase('preparing');
    try {
      const records = await request<{ consent_type: string; status: string; created_at: string }[]>('/consent');
      const consent = records.filter(item => item.consent_type === 'SPEECH_PROCESSING').sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
      if (consent?.status !== 'GRANTED') throw new Error('Allow speech processing in your permissions before recording.');
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) throw new Error('Microphone access was denied. You can type your question instead.');
      if (!active.current || current !== generation.current) return;
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true, shouldPlayInBackground: false });
      await recorder.prepareToRecordAsync();
      if (!active.current || current !== generation.current) return;
      recorder.record(); setPhase('recording');
      timeout.current = setTimeout(() => { cancel(); if (active.current) setError('Recording reached the 60-second limit. Please record a shorter concern.'); }, 60000);
    } catch (failure) {
      if (active.current && current === generation.current) { setError(failure instanceof Error ? failure.message : 'Recording could not start.'); setPhase('idle'); }
    }
  }
  async function stop() {
    const current = generation.current;
    if (timeout.current) clearTimeout(timeout.current);
    setPhase('transcribing');
    let file: File | null = null;
    try {
      await recorder.stop();
      if (!recorder.uri) throw new Error('No recording was created.');
      file = new File(recorder.uri);
      if (!file.size || file.size > 10 * 1024 * 1024) throw new Error('Recording is empty or too large. Please record again.');
      const transcript = await transcribeRecording(file.uri, language);
      if (active.current && current === generation.current) onTranscript(transcript);
    } catch (failure) {
      if (active.current && current === generation.current) setError(failure instanceof Error ? failure.message : 'Speech recognition failed.');
    } finally {
      if (file?.exists) file.delete();
      if (active.current && current === generation.current) setPhase('idle');
    }
  }
  async function speak(text: string, replyLanguage: Language = language) {
    cancel(); const current = generation.current; setError(''); setPhase('speaking');
    try {
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true, shouldPlayInBackground: false });
      for (const segment of speechSegments(text)) {
        const audio = await synthesizeSpeech(segment, replyLanguage);
        if (!active.current || current !== generation.current) return;
        const file = new File(Paths.cache, `medguide-reply-${Date.now()}-${current}.mp3`);
        let nativePlayer: ReturnType<typeof createAudioPlayer> | null = null;
        try {
          file.write(decodeAudio(audio));
          nativePlayer = createAudioPlayer(file.uri); player.current = nativePlayer;
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Audio playback timed out. Please retry.')), 120000);
            const done = () => { clearTimeout(timer); resolve(); };
            finish.current = done;
            nativePlayer!.addListener('playbackStatusUpdate', status => {
              if (status.error) { clearTimeout(timer); reject(new Error('Audio playback failed.')); }
              else if (status.didJustFinish) done();
            });
            nativePlayer!.play();
          });
        } finally {
          nativePlayer?.remove(); player.current = null; finish.current = null;
          if (file.exists) file.delete();
        }
        if (!active.current || current !== generation.current) return;
      }
    } catch (failure) {
      if (active.current && current === generation.current) setError(failure instanceof Error ? failure.message : 'Spoken reply failed. The text answer is available.');
    } finally { if (active.current && current === generation.current) setPhase('idle'); }
  }
  return { phase, error, start, stop, speak, cancel };
}
