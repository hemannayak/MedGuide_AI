import { useSyncExternalStore } from 'react';
import { Language } from '../lib/i18n';
import { Text, View } from 'react-native';
import { Button, palette } from './brand-ui';
import { speakGuidance, stopGuidance, subscribeAudio, audioSnapshot } from '../lib/audio-guide';

export const homeTour = [
  ['Speak or type', 'Tap Talk about your concern, then choose your language. Recording starts only when you choose it and allow microphone access. You can also type a question.'],
  ['Your daily progress', 'Log the water you drink here. Steps from a supported phone sensor require your permission and an active foreground session. Change both goals in Profile. Browser previews cannot count your steps.'],
  ['Prescriptions and care', 'Upload a prescription photo for review. Check extracted medicine details before using them. My care records opens your saved medicines and follow-ups.'],
  ['Your profile and privacy', 'Open Profile above to edit optional health details and daily goals. Settings contains permissions. You can skip optional setup and replay this walkthrough from Profile.'],
] as const;

export function WalkthroughTip({step,onChange,onClose,busy=false,error='',language='en'}:{step:number;onChange:(step:number)=>void;onClose:()=>void;busy?:boolean;error?:string;language?:Language}) {
  const audio=useSyncExternalStore(subscribeAudio,audioSnapshot,audioSnapshot);
  const [title,body]=(language==='en'?homeTour:translatedTour[language])[step];
  const close=()=>{stopGuidance();onClose();};
  const move=(next:number)=>{stopGuidance();onChange(next);};
  return <View style={{padding:18,gap:10,borderRadius:20,backgroundColor:palette.white,borderWidth:2,borderColor:palette.teal}}>
    <Text style={{color:palette.teal}}>APP WALKTHROUGH · {step+1} / {homeTour.length}</Text>
    <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={{fontSize:21,fontWeight:'700',color:palette.ink}}>{title}</Text>
    <Text style={{fontSize:16,lineHeight:24,color:palette.ink}}>{body}</Text>
    {error?<Text accessibilityRole="alert" style={{color:palette.error}}>{error}</Text>:null}
    <Button variant="secondary" title={audio.phase==='loading'?'Preparing…':audio.phase==='speaking'?'Stop speaking':'Listen to this tip'} onPress={()=>audio.phase==='loading'||audio.phase==='speaking'?stopGuidance():speakGuidance(`${title}. ${body}`,language)}/>
    {step>0?<Button variant="quiet" title="Previous tip" disabled={busy} onPress={()=>move(step-1)}/>:null}
    <Button disabled={busy} title={busy?'Saving walkthrough…':step===homeTour.length-1?'Finish walkthrough':'Next tip'} onPress={()=>step===homeTour.length-1?close():move(step+1)}/>
    <Button variant="quiet" title="Skip walkthrough" disabled={busy} onPress={close}/>
  </View>;
}

const translatedTour = {
 hi: [
 ['बोलें या लिखें','अपनी परेशानी बताने के लिए बात करें पर टैप करें और भाषा चुनें। रिकॉर्डिंग तभी शुरू होती है जब आप चाहें और माइक्रोफ़ोन की अनुमति दें। आप सवाल लिख भी सकते हैं।'],
 ['आज की प्रगति','यहाँ पिया हुआ पानी दर्ज करें। कदम गिनने के लिए फ़ोन का समर्थित सेंसर, आपकी अनुमति और खुला ऐप चाहिए। लक्ष्य प्रोफ़ाइल में बदलें। ब्राउज़र कदम नहीं गिनता।'],
 ['पर्चे और देखभाल','पर्चे की तस्वीर अपलोड करें। निकाली गई दवा की जानकारी जाँचें। देखभाल रिकॉर्ड में अपनी दवाएँ और फ़ॉलो-अप देखें।'],
 ['प्रोफ़ाइल और गोपनीयता','प्रोफ़ाइल में स्वास्थ्य की वैकल्पिक जानकारी और लक्ष्य बदलें। सेटिंग में अनुमतियाँ देखें। यह मार्गदर्शन प्रोफ़ाइल से फिर खोल सकते हैं।']],
 te: [
 ['మాట్లాడండి లేదా రాయండి','మీ సమస్య గురించి మాట్లాడటానికి ట్యాప్ చేసి భాష ఎంచుకోండి. మీరు ఎంచుకుని మైక్రోఫోన్ అనుమతించినప్పుడే రికార్డింగ్ మొదలవుతుంది. ప్రశ్నను టైప్ చేయవచ్చు.'],
 ['ఈ రోజు పురోగతి','తాగిన నీటిని ఇక్కడ నమోదు చేయండి. అడుగులు లెక్కించడానికి ఫోన్ సెన్సర్, మీ అనుమతి, తెరిచి ఉన్న యాప్ అవసరం. లక్ష్యాలను ప్రొఫైల్‌లో మార్చండి. బ్రౌజర్ అడుగులు లెక్కించదు.'],
 ['మందుల చీటీలు, సంరక్షణ','మందుల చీటీ ఫోటోను అప్‌లోడ్ చేయండి. సేకరించిన మందుల వివరాలను తనిఖీ చేయండి. సంరక్షణ రికార్డుల్లో మందులు, తదుపరి సంప్రదింపులు చూడండి.'],
 ['ప్రొఫైల్, గోప్యత','ప్రొఫైల్‌లో ఐచ్ఛిక ఆరోగ్య వివరాలు, లక్ష్యాలను మార్చండి. సెట్టింగ్‌లలో అనుమతులు చూడండి. ఈ మార్గదర్శిని ప్రొఫైల్ నుంచి మళ్లీ తెరవవచ్చు.']]
};
