import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform, Text, TextInput, View, Switch } from 'react-native';
import { Pedometer } from 'expo-sensors';
import Svg, { Circle } from 'react-native-svg';
import { HydrationSvg, FootstepsSvg } from './illustrations';
import { Button, palette } from './brand-ui';
import { readPending, writePending, clearPending } from '../lib/pending-wellness';
import { hydrationLabel, liveStepTotal } from '../lib/daily-progress';
import { Daily, Entry, entry, getDaily, localDay, sendEntry, Wellness } from '../lib/wellness';

export function Ring({value,target,label,display}:{value:number;target:number|null;label:string;display?:string}) {
 const ratio=target?Math.min(1,value/target):0;const length=2*Math.PI*32;
 return <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{text:display ?? `${value}${target?` of ${target}`:''}`}} style={{alignItems:'center',gap:6}}><View style={{width:68,height:68,alignItems:'center',justifyContent:'center'}}><Svg width={68} height={68} viewBox="0 0 80 80"><Circle cx={40} cy={40} r={32} stroke="#dce5dc" strokeWidth={7} fill="none"/><Circle cx={40} cy={40} r={32} stroke={palette.teal} strokeWidth={7} fill="none" strokeDasharray={`${length*ratio} ${length}`} transform="rotate(-90 40 40)"/></Svg><View style={{position:'absolute'}}>{label==='Water'?<HydrationSvg size={28} />:<FootstepsSvg size={28} />}</View></View><Text style={{fontSize:18,fontWeight:'700',color:palette.ink}}>{display ?? value}</Text><Text>{label}{!display && target?` / ${target}`:!display?' · set target':''}</Text></View>;
}
export function DailyDashboard({settings,patientId}:{settings:Wellness;patientId:string}) {
 const [expanded,setExpanded]=useState(false);
 const [savedSessionSteps,setSavedSessionSteps]=useState(0);
 const [sessionDay,setSessionDay]=useState<string|null>(null);
 const [data,setData]=useState<Daily|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState('');const [amount,setAmount]=useState('250');const [manualSteps,setManualSteps]=useState('');const [accepted,setAccepted]=useState(false);
 const [pending,setPending]=useState<Entry|null>(null),[sessionAvailable,setSessionAvailable]=useState(false);
 const [tracking,setTracking]=useState(false);const [sessionSteps,setSessionSteps]=useState(0);
 const committedSession=useRef(0),syncTimer=useRef<ReturnType<typeof setTimeout>|null>(null),refreshVersion=useRef(0);
 const sensorPayload=useRef<Entry|null>(null),subscription=useRef<ReturnType<typeof Pedometer.watchStepCount>|null>(null),active=useRef(true),locked=useRef(false);
 const refresh=useCallback(async()=>{const version=++refreshVersion.current;try{const d=await getDaily();if(active.current&&version===refreshVersion.current){setData(d);setSavedSessionSteps(committedSession.current);}}catch(e){if(active.current)setError(e instanceof Error?e.message:'Could not load daily records.');}},[]);
 const stop=useCallback((retain=true)=>{
   subscription.current?.remove();subscription.current=null;
   if(syncTimer.current){clearTimeout(syncTimer.current);syncTimer.current=null;}
   const payload=sensorPayload.current;
   if(retain&&payload&&payload.amount>committedSession.current&&!locked.current){const snapshot={...payload};if(active.current)setPending(snapshot);void writePending(patientId,snapshot).catch(()=>{if(active.current)setError('Could not retain session steps. Save before leaving this screen.');});}
   if(active.current)setTracking(false);
 },[patientId]);
 useEffect(()=>{active.current=true;void readPending(patientId).then(p=>{if(active.current&&p){setPending(p);setNotice('An unsent entry was restored. Review and retry it.');}}).catch(()=>{if(active.current)setError('Pending entry storage could not load.');});void Promise.resolve().then(refresh);const sub=AppState.addEventListener('change',s=>{if(s!=='active')stop();else void refresh();});const timer=setInterval(()=>void refresh(),60000);return()=>{active.current=false;stop();sub.remove();clearInterval(timer);};},[refresh,stop,patientId]);
 async function save(payload:Entry) {
   if(locked.current||!active.current)return;
   if(!Number.isInteger(payload.amount)||payload.amount<0||payload.amount>200000||(payload.kind==='water'&&(payload.amount<1||payload.amount>5000))){setError('Check your entry: water must be 1–5000 ml per entry, steps 0–200000. These are storage limits, not health targets.');return;}
   locked.current=true;setBusy(true);setError('');setPending(payload);
   try{await writePending(patientId,payload);await sendEntry(payload);await clearPending();if(payload.source==='foreground_sensor'){committedSession.current=payload.amount;if(!subscription.current){sensorPayload.current=null;if(active.current)setSessionAvailable(false);}}if(active.current)setPending(null);await refresh();if(active.current)setNotice('Saved to your account.');}
   catch(e){if(active.current)setError((e instanceof Error?e.message:'Could not save.')+' Your entry is retained here. Use Retry without adding it again.');}
   finally{locked.current=false;if(active.current)setBusy(false);}
 }
 async function track(){
   if(!accepted){setError('Choose optional storage before enabling activity tracking.');return;}
   if(Platform.OS==='web'){setNotice('Step sensors are unavailable in this browser. Enter manual steps below.');return;}
   if(locked.current||tracking||pending)return;locked.current=true;setBusy(true);setError('');
   try{if(!await Pedometer.isAvailableAsync())throw Error('No supported step sensor. Manual entry is available.');const p=await Pedometer.requestPermissionsAsync();if(!p.granted)throw Error(p.canAskAgain?'Activity access declined. Manual entry is available.':'Activity access blocked. Enable it in phone settings or use manual entry.');
     if(!active.current)return;
     committedSession.current=0;setSavedSessionSteps(0);setSessionAvailable(true);sensorPayload.current=entry('steps',0,'foreground_sensor');setSessionDay(localDay());setSessionSteps(0);setTracking(true);
     subscription.current=Pedometer.watchStepCount(result=>{if(!active.current)return;const payload=sensorPayload.current;if(payload&&payload.day!==localDay()){stop();setNotice('A new day started. Save the prior session and start a new one.');return;}if(payload&&Number.isInteger(result.steps)&&result.steps>=0){payload.amount=Math.max(payload.amount,result.steps);setSessionSteps(payload.amount);if(!syncTimer.current){syncTimer.current=setTimeout(()=>{syncTimer.current=null;if(active.current&&sensorPayload.current&&!locked.current)void save({...sensorPayload.current});},5000);}}});
   }catch(e){setError(e instanceof Error?e.message:'Activity access failed.');}finally{locked.current=false;if(active.current)setBusy(false);}
 }
 const total=data?liveStepTotal(data.manual_steps,data.foreground_steps,sessionDay===data.day?sessionSteps:0,savedSessionSteps):0;

 return <View style={{backgroundColor:'white',borderRadius:24,padding:16,gap:10}}>
  <Text accessibilityRole="header" style={{fontSize:20,color:palette.ink,fontWeight:'700'}}>Today, at your pace</Text><Text>{data?.day??'Loading your records…'}</Text>
  {data?<View style={{flexDirection:'row',justifyContent:'space-around',flexWrap:'wrap',gap:12}}><Ring value={data.water_ml} target={settings.water_goal_ml} label="Water" display={hydrationLabel(data.water_ml,settings.water_goal_ml)}/><Ring value={total} target={settings.step_goal} label="Steps"/></View>:<Text>No daily records loaded yet. Refresh to check your saved entries.</Text>}
  <Text style={{fontSize:12,color:palette.muted}}>{tracking?"Live foreground step counter · saves automatically":"Foreground sensor sessions + manual entries"}. {Platform.OS==='web'?"No step sensor in browser.":"Background steps are not included."}</Text>
  <Button variant="secondary" title={expanded?"Hide daily logging controls":"Log water or steps"} onPress={()=>setExpanded(!expanded)} />
  {expanded?<>
  <Switch accessibilityLabel="Allow private daily record storage" value={accepted} onValueChange={setAccepted}/><Text>I choose to store these optional water and activity entries in my private account. No medical target is assigned by the app.</Text>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{[150,250,500].map(ml=><Button key={ml} title={`+${ml/1000} L`} disabled={busy||tracking||!accepted||!!pending} onPress={()=>void save(entry('water',ml))}/>)}</View>
  <TextInput accessibilityLabel="Water consumed in millilitres" keyboardType="number-pad" value={amount} onChangeText={setAmount} style={{borderWidth:1,borderColor:palette.line,borderRadius:12,padding:14}}/>
  <Button title="Log water (ml)" disabled={busy||tracking||!accepted||!!pending||!/^\d+$/.test(amount)} onPress={()=>void save(entry('water',Number(amount)))}/>
  <TextInput accessibilityLabel="Additional manually counted steps" placeholder="Additional manual steps" keyboardType="number-pad" value={manualSteps} onChangeText={setManualSteps} style={{borderWidth:1,borderColor:palette.line,borderRadius:12,padding:14}}/>
  <Button variant="secondary" title="Add manual steps" disabled={busy||tracking||!accepted||!!pending||!/^\d+$/.test(manualSteps)} onPress={()=>void save(entry('steps',Number(manualSteps)))}/>
  <Button variant="secondary" title={tracking?'Stop activity session':'Enable foreground step counter'} disabled={busy} onPress={()=>tracking?stop():void track()}/>
  {sessionAvailable?<><Text>Session: {sessionSteps} steps; {Math.max(0,sessionSteps-savedSessionSteps)} awaiting sync. Live foreground session. Saves automatically every 5 seconds while steps arrive.</Text><Button title="Save session steps" disabled={busy||!!pending||!accepted} onPress={()=>{stop(false);if(sensorPayload.current)void save({...sensorPayload.current});}}/></>:null}
  {pending?<Button title="Retry same entry" disabled={busy||!accepted} onPress={()=>{if(pending)void save(pending);}}/>:null}
  <Button variant="quiet" title="Refresh saved records" disabled={busy} onPress={()=>void refresh()}/>
  {Platform.OS!=='web'?<Button variant="quiet" title="Open device permission settings" onPress={()=>void Linking.openSettings().catch(()=>setError('Open permissions from your phone settings.'))}/>:null}
  </>:null}
  {error?<Text accessibilityRole="alert">{error}</Text>:null}{notice?<Text accessibilityLiveRegion="polite">{notice}</Text>:null}
 </View>;
}
