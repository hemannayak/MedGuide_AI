import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, palette } from './brand-ui';
import { Wellness, saveWellness } from '../lib/wellness';
import { updateProfile } from '../lib/care';
import { setupCopy } from '../lib/setup-copy';
import { Language } from '../lib/api';
import { VoiceMicWaveSvg, PrescriptionScannerSvg, MedicalShieldSvg } from './illustrations';

/** Lives inside Home; progress is saved server-side after each step. */
export function OnboardingPanel({ settings, name, language, onSaved, onOpenProfile }: {settings: Wellness; name:string; language:Language; onSaved:(value:Wellness)=>void; onOpenProfile?:()=>void}) {
 const [step,setStep]=useState(settings.onboarding_step); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
 const [displayName,setName]=useState(name); const [lang,setLang]=useState(language);
 async function next(skip=false) {
   if(busy)return;setBusy(true);setError('');
   try {
     if(step===1&&!skip)await updateProfile(displayName,lang);
     const changes:Partial<Wellness>={onboarding_step:Math.min(3,step+1),onboarding_complete:step===3};
     const result=await saveWellness(changes);setStep(result.onboarding_step);onSaved(result);
   } catch(e){setError(e instanceof Error?e.message:'Setup could not save. Retry when connected.');}finally{setBusy(false);}
 }
 const c=setupCopy(lang);
 return <View style={{backgroundColor:palette.sage,padding:20,borderRadius:24,gap:14}}>
  <Text style={{color:palette.teal}}>GETTING STARTED · {step+1} / 4</Text><Text accessibilityRole="header" style={{fontSize:23,fontWeight:'700',color:palette.ink}}>{c.titles[step]}</Text>
  {step===0?<><MedicalShieldSvg size={80}/><Text>{c.welcome}</Text></>:null}
  {step===1?<><Text>{c.name}</Text><TextInput accessibilityLabel="Setup display name" style={{backgroundColor:'white',padding:14,borderRadius:12}} value={displayName} onChangeText={setName} maxLength={255}/><View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{(['en','hi','te']as const).map(l=><Button key={l} variant="secondary" title={l==='en'?'English':l==='hi'?'हिन्दी':'తెలుగు'} onPress={()=>setLang(l)}/>)}</View></>:null}
  {step===2?<><Text>{c.targets}</Text><Text>{lang==='hi'?'पानी और कदमों के लक्ष्य प्रोफ़ाइल में बदलें।':lang==='te'?'నీరు, అడుగుల లక్ష్యాలను ప్రొఫైల్‌లో మార్చండి.':'Water and step targets are managed in Profile only.'}</Text>{onOpenProfile?<Button variant="secondary" title={lang==='hi'?'प्रोफ़ाइल खोलें':lang==='te'?'ప్రొఫైల్ తెరవండి':'Open Profile'} onPress={onOpenProfile}/>:null}</>:null}
  {step===3?<><VoiceMicWaveSvg size={64}/><Text>{c.talk}</Text><PrescriptionScannerSvg size={64}/><Text>{c.records}</Text></>:null}
  {error?<Text accessibilityRole="alert">{error}</Text>:null}
  <Button title={busy?c.saving:step===3?c.finish:c.next} disabled={busy} onPress={()=>void next()}/>
  <Button variant="quiet" title={c.skip} disabled={busy} onPress={()=>{setBusy(true);void saveWellness({onboarding_complete:true}).then(onSaved).catch(()=>setError('Could not save. Retry when connected.')).finally(()=>setBusy(false));}}/>
  {step>0?<Button variant="quiet" title={c.back} disabled={busy} onPress={()=>{setBusy(true);void saveWellness({onboarding_step:step-1}).then(r=>{setStep(r.onboarding_step);onSaved(r);}).catch(()=>setError('Could not save setup progress.')).finally(()=>setBusy(false));}}/>:null}
 </View>;
}
