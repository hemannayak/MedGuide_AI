import * as Speech from 'expo-speech';
import { Alert, AppState } from 'react-native';
import { Language } from './i18n';

let generation = 0;
let finish: (() => void) | undefined;
const codes: Record<Language, string> = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };
const unavailable: Record<Language, string> = {
  en: 'Audio is unavailable for this language. Enable a matching voice in your phone text-to-speech settings, or use TalkBack.',
  hi: 'इस भाषा की आवाज़ उपलब्ध नहीं है। फ़ोन की टेक्स्ट-टू-स्पीच सेटिंग में आवाज़ जोड़ें या TalkBack का उपयोग करें।',
  te: 'ఈ భాషలో ఆడియో అందుబాటులో లేదు. ఫోన్ టెక్స్ట్ టు స్పీచ్ సెట్టింగ్‌లలో వాయిస్ జోడించండి లేదా TalkBack ఉపయోగించండి.',
};

/** Device TTS only: no patient text is sent to our server for UI guidance. */
export function speakGuidance(text: string, lang: Language = 'en', onStart?: () => void, onEnd?: () => void): boolean {
  stopGuidance();
  const current = generation;
  finish = onEnd;
  const done = () => { if (current === generation) { finish = undefined; onEnd?.(); } };
  const fail = () => { if (current === generation) { done(); Alert.alert('Audio guide', unavailable[lang]); } };
  void Speech.getAvailableVoicesAsync().then(voices => {
    if (current !== generation) return;
    const voice = voices.find(v => v.language.toLowerCase() === codes[lang].toLowerCase())
      ?? voices.find(v => v.language.toLowerCase().startsWith(lang));
    if (!voice) { fail(); return; }
    Speech.speak(text, { language: codes[lang], voice: voice.identifier, rate: 0.9,
      onStart: () => { if (current === generation) onStart?.(); }, onDone: done, onStopped: done, onError: fail });
  }).catch(fail);
  return true;
}
export function stopGuidance() {
  generation++;
  finish?.(); finish = undefined;
  void Speech.stop().catch(() => undefined);
}
AppState.addEventListener('change', state => { if (state !== 'active') stopGuidance(); });
export const playAudioGuide = (text: string, lang: Language = 'en', onEnd?: () => void) => speakGuidance(text, lang, undefined, onEnd);
export const stopAudioGuide = stopGuidance;
