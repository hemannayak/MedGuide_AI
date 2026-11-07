import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Button, palette } from './brand-ui';
import { getSpokenChoice, saveSpokenChoice, SpokenChoice } from '../lib/spoken-consent';
import { stopGuidance } from '../lib/audio-guide';
import { Language } from '../lib/i18n';
const copy={en:['Would you like MedGuide AI to read health guidance aloud?','Listen to health instructions in your language instead of reading them.','Yes, read aloud','No, thank you'],hi:['क्या MedGuide AI स्वास्थ्य की जानकारी पढ़कर सुनाए?','अपनी भाषा में स्वास्थ्य की जानकारी सुनें।','हाँ, पढ़कर सुनाएँ','नहीं, धन्यवाद'],te:['MedGuide AI ఆరోగ్య సూచనలను చదివి వినిపించాలా?','ఆరోగ్య సూచనలను మీ భాషలో వినండి.','అవును, చదివి వినిపించండి','వద్దు, ధన్యవాదాలు']};
export function SpokenConsentCard({language='en',edit=false}:{language?:Language;edit?:boolean}){
 const [choice,setChoice]=useState<SpokenChoice|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let active=true;getSpokenChoice().then(c=>{if(active)setChoice(c);}).catch(()=>{if(active)setError('Could not load read-aloud choice. Retry when connected.');});return()=>{active=false;};},[]);
 async function save(enabled:boolean){if(busy)return;stopGuidance();setBusy(true);setError('');try{await saveSpokenChoice(enabled);setChoice(enabled?'GRANTED':'DECLINED');}catch{setError('Could not save your choice. Please try again.');}finally{setBusy(false);}}
 if(choice&&choice!=='MISSING'&&!edit)return null;
 const c=copy[language];
 return <View style={{padding:18,gap:12,borderRadius:20,backgroundColor:palette.sage}}>
  <Text accessibilityRole="header" style={{fontSize:20,fontWeight:'700',color:palette.teal}}>◖)) {c[0]}</Text>
  <Text style={{fontSize:16,lineHeight:24}}>{c[1]}</Text>
  {choice&&choice!=='MISSING'?<Text>Read-aloud: {choice==='GRANTED'?'On':'Off'}</Text>:null}
  {error?<Text accessibilityRole="alert">{error}</Text>:null}
  {choice===null?<Button title="Check read-aloud choice" onPress={()=>{void getSpokenChoice().then(setChoice).catch(()=>setError('Please check your connection.'));}}/>:<>
   <Button title={busy?'Saving…':c[2]} disabled={busy} onPress={()=>void save(true)}/>
   <Button variant="secondary" title={c[3]} disabled={busy} onPress={()=>void save(false)}/>
  </>}
  <Text>Optional. Continue with text. Speech starts only when you tap Listen.</Text>
 </View>;
}
