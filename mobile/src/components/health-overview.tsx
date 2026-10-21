import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Button, palette } from './brand-ui';
import { getMeasurements, Measurement } from '../lib/wellness';
import { FollowUp, getFollowUps, getMedications } from '../lib/care';
export function calculateBMI(measurements:Measurement[]):number|null {
 const h=measurements.find(m=>m.kind==='height'&&m.unit==='cm'),w=measurements.find(m=>m.kind==='weight'&&m.unit==='kg');
 if(!h||!w||!Number.isFinite(h.value)||!Number.isFinite(w.value)||h.value<=0||w.value<=0)return null;
 const value=w.value/((h.value/100)**2);return Number.isFinite(value)?Math.round(value*10)/10:null;
}
export function HealthOverview({onProfile,onCare}:{onProfile:()=>void;onCare:()=>void}){
 const [asOf]=useState(()=>Date.now());
 const [metrics,setMetrics]=useState<Measurement[]|null>(null),[medCount,setMedCount]=useState<number|null>(null),[visits,setVisits]=useState<FollowUp[]>([]),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true;void Promise.all([getMeasurements(),getMedications(),getFollowUps()]).then(([m,meds,v])=>{if(active){setMetrics(m);setMedCount(meds.length);setVisits(v);}}).catch(()=>{if(active)setError('Could not load your health overview. Your saved records have not been replaced.');});return()=>{active=false;};},[attempt]);
 const latest=metrics?.filter((m,i,all)=>all.findIndex(x=>x.kind===m.kind)===i)??[];const bmi=metrics?calculateBMI(metrics):null;
 const upcoming=visits.filter(v=>v.status==='SCHEDULED'&&new Date(v.scheduled_at).getTime()>=asOf).sort((a,b)=>a.scheduled_at.localeCompare(b.scheduled_at)).slice(0,2);
 return <View style={{padding:20,gap:12,borderRadius:24,backgroundColor:'white'}}><Text accessibilityRole="header" style={{fontSize:22,color:palette.ink,fontWeight:'700'}}>Your health overview</Text>
  {metrics===null&&!error?<Text>Loading your saved records…</Text>:null}
  {metrics?.length===0?<Text>No measurements yet. Add a reading in Profile when you have one.</Text>:null}
  {latest.map(m=><Text key={m.id}>{m.kind.replaceAll('_',' ')}: {m.value}{m.secondary_value?` / ${m.secondary_value}`:''} {m.unit} · manual · {new Date(m.measured_at).toLocaleDateString()}</Text>)}
  {bmi!==null?<Text>Calculated BMI: {bmi} kg/m², from your latest saved height and weight. No health category is assigned. Measurement dates may differ.</Text>:null}
  {medCount!==null?<Text>{medCount} saved medicine records. Check verification and schedules in care records.</Text>:null}
  {upcoming.map(v=><Text key={v.id}>Follow-up: {new Date(v.scheduled_at).toLocaleString()}</Text>)}
  {error?<><Text accessibilityRole="alert">{error}</Text><Button title="Retry health overview" onPress={()=>{setError('');setAttempt(attempt+1);}}/></>:null}
  <Button variant="quiet" title="Add or review measurements" onPress={onProfile}/><Button variant="quiet" title="Review medicines and follow-ups" onPress={onCare}/>
 </View>;
}
