import { useEffect, useState } from 'react';
import { AccessibilityInfo, ScrollView, Text, View } from 'react-native';
import { Brand, Button, palette } from './brand-ui';
import { DoctorConsultSvg, VoiceMicWaveSvg, PrescriptionScannerSvg, MedicineBottleSvg } from './illustrations';
import { Language } from '../lib/i18n';
import { speakGuidance, stopGuidance } from '../lib/audio-guide';

const copy = {
  en: { skip: 'Skip guide', next: 'Next', back: 'Back', done: 'Start using MedGuide', listen: 'Listen to this step', title: 'A little help to get started', steps: [
    ['Choose your language', 'Select English, Hindi or Telugu. Home takes you back to the main choices.'],
    ['Talk or type', 'Open Talk. Choose Record, speak, stop and check your transcript before sending. You can type instead.'],
    ['Review a prescription', 'Choose a clear photo. Check every extracted medicine with a qualified professional before adding a schedule.'],
    ['Find your care records', 'Records shows your medicines and follow-ups. Settings contains your account and data choices.'],
  ], access: 'Using TalkBack? Swipe right to move between controls, then double-tap to activate. Android Voice Access can operate labelled controls by voice. In Talk, record “MedGuide help” for spoken instructions. The app does not listen in the background.' },
  hi: { skip: 'गाइड छोड़ें', next: 'आगे', back: 'पीछे', done: 'मेडगाइड शुरू करें', listen: 'यह चरण सुनें', title: 'शुरू करने में मदद', steps: [
    ['अपनी भाषा चुनें', 'अंग्रेज़ी, हिन्दी या तेलुगु चुनें। होम मुख्य विकल्पों पर वापस लाता है।'],
    ['बोलें या लिखें', 'टॉक खोलें। रिकॉर्ड चुनें, बोलें, रोकें और भेजने से पहले लिखे शब्द जाँचें। आप टाइप भी कर सकते हैं।'],
    ['पर्चा जाँचें', 'साफ़ फोटो चुनें। दवा का समय जोड़ने से पहले निकाली गई जानकारी स्वास्थ्य पेशेवर से जाँचें।'],
    ['अपने रिकॉर्ड देखें', 'रिकॉर्ड में दवाएँ और फॉलो-अप हैं। सेटिंग में खाता और डेटा विकल्प हैं।'],
  ], access: 'TalkBack में दाएँ स्वाइप करके कंट्रोल चुनें, फिर दो बार टैप करें। Android Voice Access से आवाज़ द्वारा कंट्रोल चला सकते हैं। टॉक में “MedGuide help” रिकॉर्ड करके निर्देश सुनें। ऐप बैकग्राउंड में नहीं सुनता।' },
  te: { skip: 'గైడ్ దాటవేయండి', next: 'తరువాత', back: 'వెనుకకు', done: 'మెడ్‌గైడ్ ప్రారంభించండి', listen: 'ఈ దశ వినండి', title: 'ప్రారంభించడానికి సహాయం', steps: [
    ['మీ భాష ఎంచుకోండి', 'ఇంగ్లీష్, హిందీ లేదా తెలుగు ఎంచుకోండి. హోమ్ ప్రధాన ఎంపికలకు తీసుకువెళ్తుంది.'],
    ['మాట్లాడండి లేదా టైప్ చేయండి', 'టాక్ తెరవండి. రికార్డ్ ఎంచుకుని మాట్లాడండి, ఆపండి. పంపే ముందు వచ్చిన పదాలు సరిచూడండి. టైప్ కూడా చేయవచ్చు.'],
    ['ప్రిస్క్రిప్షన్ సరిచూడండి', 'స్పష్టమైన ఫోటో ఎంచుకోండి. మందుల సమయం చేర్చే ముందు ఆరోగ్య నిపుణుడితో వివరాలు సరిచూడండి.'],
    ['మీ రికార్డులు చూడండి', 'రికార్డులలో మందులు, ఫాలో-అప్‌లు ఉంటాయి. సెట్టింగ్స్‌లో ఖాతా, డేటా ఎంపికలు ఉంటాయి.'],
  ], access: 'TalkBackలో కుడికి స్వైప్ చేసి కంట్రోల్ ఎంచుకుని రెండుసార్లు నొక్కండి. Android Voice Accessతో మాటల ద్వారా కంట్రోల్స్ వాడవచ్చు. టాక్‌లో “MedGuide help” రికార్డ్ చేసి సూచనలు వినండి. యాప్ నేపథ్యంలో వినదు.' },
};
const artwork = [DoctorConsultSvg, VoiceMicWaveSvg, PrescriptionScannerSvg, MedicineBottleSvg];
export function FirstUseGuide({ onFinish, initialLanguage = 'en' }: { onFinish: () => void; initialLanguage?: Language }) {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<Language>(initialLanguage);
  const c = copy[lang]; const [title, body] = c.steps[step]; const Art = artwork[step];
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isScreenReaderEnabled().then(enabled => { if (active && enabled) AccessibilityInfo.announceForAccessibility(`${step + 1} / 4. ${title}. ${body}`); });
    return () => { active = false; stopGuidance(); };
  }, [step, title, body]);
  function finish() { stopGuidance(); onFinish(); }
  return <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 20, backgroundColor: palette.cream }}>
    <Brand /><Button variant="quiet" title={c.skip} onPress={finish} />
    <View style={{ flexDirection: 'row', gap: 8 }}>{(['en','hi','te'] as const).map(l => <Button key={l} title={l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी' : 'తెలుగు'} variant="secondary" onPress={() => setLang(l)} />)}</View>
    <Text style={{ fontSize: 15, color: palette.teal }}>{c.title} · {step + 1} / 4</Text>
    <View accessible={false} style={{ alignItems: 'center', backgroundColor: palette.sage, borderRadius: 32, padding: 32 }}><Art size={140} /></View>
    <Text accessibilityRole="header" style={{ fontSize: 28, fontWeight: '700', color: palette.ink }}>{title}</Text>
    <Text style={{ fontSize: 18, lineHeight: 28, color: palette.ink }}>{body}</Text>
    <Button title={c.listen} variant="secondary" onPress={() => speakGuidance(`${title}. ${body}. ${c.access}`, lang)} />
    <Text style={{ fontSize: 15, lineHeight: 23, color: palette.muted }}>{c.access}</Text>
    {step > 0 ? <Button variant="quiet" title={c.back} onPress={() => setStep(step - 1)} /> : null}
    <Button title={step === 3 ? c.done : c.next} onPress={() => step === 3 ? finish() : setStep(step + 1)} />
  </ScrollView>;
}
