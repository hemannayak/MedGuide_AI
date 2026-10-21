import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Button, palette } from '../components/brand-ui';
import { getProfile, Profile } from '../lib/care';
import { request, Language } from '../lib/api';
import { getWellness, saveWellness, Wellness, getMeasurements, Measurement, saveMeasurement } from '../lib/wellness';
import { setupCopy } from '../lib/setup-copy';
import { speakGuidance, stopGuidance } from '../lib/audio-guide';
import { litresToMl } from '../lib/daily-progress';
import { HealthOverview } from '../components/health-overview';
import { MedicalShieldSvg } from '../components/illustrations';

type Section={title:string;why:string;fields:{key:keyof Wellness;label:string;numeric?:boolean}[]};
const sections:Section[]=[
 {title:'Basic details',why:'Optional context for your own records. Use a nickname if you prefer.',fields:[{key:'gender',label:'Gender (optional)'},{key:'emergency_contact',label:'Emergency contact (optional, tell this person first)'}]},
 {title:'Medical history',why:'Self-reported information only. This does not change triage rules or confirm a diagnosis.',fields:[{key:'conditions',label:'Existing conditions'},{key:'past_illnesses',label:'Past illnesses'},{key:'surgeries',label:'Surgeries'},{key:'allergies',label:'Allergies'},{key:'accessibility_needs',label:'Accessibility needs (only what helps us assist you)'},{key:'family_history',label:'Relevant family history'},{key:'treatment_history',label:'Treatment history'}]},
 {title:'Lifestyle and preferences',why:'Optional notes, not medical recommendations.',fields:[{key:'sleep_notes',label:'Sleep patterns'},{key:'activity_notes',label:'Activity preferences'},{key:'dietary_preferences',label:'Dietary preferences'},{key:'health_goals',label:'Your personal goals'}]},
 {title:'Daily goals',why:'Optional personal targets, not medical recommendations. Follow any fluid or activity limits given by your clinician. Leave a field blank to clear it.',fields:[{key:'water_goal_ml',label:'Daily water target (L), optional',numeric:true},{key:'step_goal',label:'Daily step target, optional',numeric:true}]},
 {title:'Other health information',why:'Keep short summaries only. Do not enter private identifiers or other people’s records.',fields:[{key:'healthcare_provider',label:'Healthcare provider, optional'},{key:'vaccination_notes',label:'Vaccination record summary'},{key:'lab_report_notes',label:'Lab report summary'}]},
];
export default function ProfileScreen(){
 const [profile,setProfile]=useState<Profile|null>(null),[settings,setSettings]=useState<Wellness|null>(null),[measurements,setMeasurements]=useState<Measurement[]>([]);
 const [open,setOpen]=useState<string|null>('Account'),[draft,setDraft]=useState<Record<string,string>>({}),[accepted,setAccepted]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [name,setName]=useState(''),[language,setLanguage]=useState<Language>('en'),[dob,setDob]=useState(''),[contact,setContact]=useState('');
 const [kind,setKind]=useState('weight'),[value,setValue]=useState(''),[secondary,setSecondary]=useState('');
 async function load(){setError('');try{const[p,s,m]=await Promise.all([getProfile(),getWellness(),getMeasurements()]);setProfile(p);setSettings(s);setMeasurements(m);setName(p.display_name);setLanguage(p.preferred_language);setDob(p.date_of_birth??'');setContact(p.contact_reference??'');}catch(e){setError(e instanceof Error?e.message:'Profile could not load.');}}
 useEffect(()=>{void Promise.resolve().then(load);return()=>stopGuidance();},[]);
 async function save(section:Section){if(busy||!accepted)return;setBusy(true);setError('');setNotice('');try{
  const changes:Record<string,unknown>={health_notice_version:'1.0'};
  for(const f of section.fields){if(!(f.key in draft))continue;const v=draft[f.key].trim();if(f.key==='water_goal_ml'){changes[f.key]=v?litresToMl(v):null;}else{if(f.numeric&&v&&!/^\d+$/.test(v))throw Error('Step targets must be whole numbers.');changes[f.key]=v?(f.numeric?Number(v):v):null;}}
  const s=await saveWellness(changes);setSettings(s);setDraft({});setNotice(`${section.title} saved.`);setAccepted(false);
 }catch(e){setError(e instanceof Error?e.message:'Could not save. Your edits remain available.');}finally{setBusy(false);}}
 const age=dob&&/^\d{4}-\d{2}-\d{2}$/.test(dob)?(()=>{const b=new Date(`${dob}T12:00:00`),now=new Date();return now.getFullYear()-b.getFullYear()-(now.getMonth()<b.getMonth()||(now.getMonth()===b.getMonth()&&now.getDate()<b.getDate())?1:0);})():null;
 function select(title:string){if(Object.keys(draft).length){setError('Save the current section or discard its edits before switching.');return;}setOpen(open===title?null:title);setAccepted(false);setNotice('');}
 return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.page}>
  <MedicalShieldSvg size={64}/><Button variant="quiet" title="Listen to profile instructions" onPress={()=>speakGuidance(setupCopy(language).profileHelp,language)} /><Button variant="quiet" title="Stop spoken instructions" onPress={stopGuidance}/><Text accessibilityRole="header" style={s.heading}>Your profile, your choice</Text><Text>Only name and language are needed. Health details are optional, self-reported and private to your account. They do not replace professional care.</Text>
  {error?<Text accessibilityRole="alert">{error}</Text>:null}{notice?<Text accessibilityLiveRegion="polite">{notice}</Text>:null}
  {!profile||!settings?<Button title="Retry loading profile" onPress={()=>void load()}/>:<>
  <View style={s.card}><Button variant="secondary" title="Account and language" onPress={()=>select('Account')}/>{open==='Account'?<>
   <Text>Display name</Text><TextInput accessibilityLabel="Display name" value={name} onChangeText={setName} style={s.input} maxLength={255}/>
   <Text>Date of birth (optional, YYYY-MM-DD)</Text><TextInput accessibilityLabel="Date of birth" placeholder="YYYY-MM-DD" value={dob} onChangeText={setDob} style={s.input}/>{age!==null&&age>=0?<Text>Calculated age: {age}</Text>:null}
   <Text>Contact reference (optional)</Text><TextInput accessibilityLabel="Contact reference" value={contact} onChangeText={setContact} style={s.input} maxLength={255}/>
   {(['en','hi','te']as const).map(l=><Button key={l} variant={language===l?'primary':'secondary'} title={l==='en'?'English':l==='hi'?'हिन्दी':'తెలుగు'} onPress={()=>setLanguage(l)}/>)}
   <Button title={busy?'Saving…':'Save account details'} disabled={busy||!name.trim()} onPress={()=>{setBusy(true);setError('');void request<Profile>('/patients/me',{display_name:name,date_of_birth:dob||null,preferred_language:language,contact_reference:contact||null},'PATCH').then(p=>{setProfile(p);setNotice('Account details saved.');}).catch(e=>setError(e.message)).finally(()=>setBusy(false));}}/>
  </>:null}</View>
  {sections.map(section=><View key={section.title} style={s.card}><Button variant="secondary" title={section.title} onPress={()=>select(section.title)}/>{open===section.title?<><Text>{section.why}</Text>{section.fields.map(f=><View key={f.key} style={{gap:6}}><Text>{f.label}</Text><TextInput accessibilityLabel={f.label} multiline={!f.numeric} keyboardType={f.key==='water_goal_ml'?'decimal-pad':f.numeric?'number-pad':'default'} style={s.input} value={draft[f.key]??String(f.key==='water_goal_ml'&&settings.water_goal_ml!==null?settings.water_goal_ml/1000:settings[f.key]??'')} onChangeText={v=>setDraft({...draft,[f.key]:v})} maxLength={f.numeric?6:2000}/></View>)}<Switch accessibilityLabel="Allow optional health section storage" value={accepted} onValueChange={setAccepted}/><Text>I choose to store this optional section in my private account (notice version 1.0). I can clear fields later. This does not grant AI processing or worker access.</Text><Button title="Save this section" disabled={busy||!accepted} onPress={()=>void save(section)}/><Button variant="quiet" title="Discard unsaved section edits" disabled={busy} onPress={()=>{setDraft({});setError('');}}/></>:null}</View>)}
  <View style={s.card}><Button variant="secondary" title="Vitals and measurements" onPress={()=>select('Measurements')}/>{open==='Measurements'?<>
   <HealthOverview onProfile={()=>setOpen('Measurements')} onCare={()=>router.push('/care')} />
   <Text>Manually entered readings only. Use the unit shown. No interpretation or automatic alert is generated here.</Text>
   {(['weight','height','blood_pressure','blood_glucose','heart_rate']as const).map(k=><Button key={k} variant={kind===k?'primary':'secondary'} title={k.replaceAll('_',' ')} onPress={()=>{setKind(k);setValue('');setSecondary('');}}/>)}
   <Text>{({weight:'kg',height:'cm',blood_pressure:'mmHg',blood_glucose:'mg/dL',heart_rate:'bpm'}as Record<string,string>)[kind]}</Text><TextInput accessibilityLabel="Measurement value" keyboardType="decimal-pad" value={value} onChangeText={setValue} style={s.input}/>{kind==='blood_pressure'?<TextInput accessibilityLabel="Diastolic blood pressure" keyboardType="decimal-pad" value={secondary} onChangeText={setSecondary} style={s.input}/>:null}
   <Switch accessibilityLabel="Allow measurement storage" value={accepted} onValueChange={setAccepted}/><Text>I choose to store this optional self-reported measurement.</Text>
   <Button title="Save measurement" disabled={busy||!accepted||!value} onPress={()=>{setBusy(true);setError('');void saveMeasurement(kind,Number(value),kind==='blood_pressure'?Number(secondary):undefined).then(m=>{setMeasurements([m,...measurements]);setValue('');setSecondary('');setNotice('Measurement saved.');}).catch(e=>setError(e.message)).finally(()=>setBusy(false));}}/>
   {measurements.slice(0,10).map(m=><Text key={m.id}>{m.kind.replaceAll('_',' ')}: {m.value}{m.secondary_value?` / ${m.secondary_value}`:''} {m.unit} · manually entered · {new Date(m.measured_at).toLocaleDateString()}</Text>)}
  </>:null}</View>
  <View style={s.card}><Text style={s.subheading}>Medicines, treatments and documents</Text><Text>Review your existing prescription and care records. Optional profile notes never create prescriptions, medicine alerts or schedules.</Text><Button title="Open medicines and follow-ups" onPress={()=>router.push('/care')}/><Button variant="secondary" title="Upload a prescription" onPress={()=>router.push('/prescriptions/upload')}/><Button variant="quiet" title="View health timeline" onPress={()=>router.push('/timeline')}/></View>
  <Button variant="secondary" title="Replay setup and walkthrough on Home" onPress={()=>router.push({pathname:'/home',params:{setup:'replay'}})}/>
  </>}
  <Button variant="quiet" title="Back to Home" onPress={()=>router.replace('/home')}/>
 </ScrollView>;
}
const s=StyleSheet.create({page:{flexGrow:1,padding:22,gap:18,backgroundColor:palette.cream},card:{padding:18,gap:14,borderRadius:22,backgroundColor:'white'},heading:{fontSize:28,fontWeight:'700',color:palette.ink},subheading:{fontSize:21,fontWeight:'600',color:palette.ink},input:{padding:14,minHeight:52,borderWidth:1,borderColor:palette.line,borderRadius:12,color:palette.ink}});
