import { useCallback, useEffect, useState } from 'react';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, palette } from '../components/brand-ui';
import { HomeView } from '../components/home-view';
import { OnboardingPanel } from '../components/onboarding-panel';
import { DailyDashboard } from '../components/daily-dashboard';
import { hasSession } from '../lib/api';
import { getProfile, Profile } from '../lib/care';
import { getWellness, Wellness, saveWellness } from '../lib/wellness';

export default function Home() {
 const [profile,setProfile]=useState<Profile|null>(null),[settings,setSettings]=useState<Wellness|null>(null),[error,setError]=useState('');
 const params=useLocalSearchParams<{setup?:string}>();
 const load=useCallback(async()=>{setError('');try{if(!await hasSession()){router.replace('/');return;}const [p,s]=await Promise.all([getProfile(),getWellness()]);setProfile(p);setSettings(s);}catch(e){setError(e instanceof Error?e.message:'Could not load your account.');}},[]);
 useFocusEffect(useCallback(()=>{let active=true;void(async()=>{try{if(!await hasSession()){if(active)router.replace('/');return;}const[p,s]=await Promise.all([getProfile(),getWellness()]);if(active){setProfile(p);setSettings(s);}}catch{if(active)setError('Account could not load. Check connection and retry.');}})();return()=>{active=false;};},[]));
 useEffect(()=>{if(params.setup==='replay'){void saveWellness({onboarding_complete:false,onboarding_step:0}).then(setSettings).catch(()=>setError('Could not reopen setup. Retry.'));router.setParams({setup:undefined});}},[params.setup]);
 if(!profile||!settings)return <View style={{flex:1,padding:24,justifyContent:'center',backgroundColor:palette.cream}}><Text accessibilityRole={error?'alert':'text'}>{error||'Loading your care…'}</Text>{error?<Button title="Retry" onPress={()=>void load()}/>:null}</View>;
 return <HomeView onNavigate={route=>router.push(route)} walkthrough={!settings.onboarding_complete&&settings.onboarding_step===3} onWalkthroughDone={async()=>{setSettings(await saveWellness({onboarding_complete:true}));}} dailyDashboard={<DailyDashboard patientId={profile.id} settings={settings}/>}>
  <Text accessibilityRole="header" style={{fontSize:22,fontWeight:'600',color:palette.ink}}>Hello, {profile.display_name}</Text>
  {!settings.onboarding_complete&&settings.onboarding_step<3?<OnboardingPanel settings={settings} name={profile.display_name} language={profile.preferred_language} onSaved={setSettings} onOpenProfile={()=>router.push('/profile')}/>:null}
  {error?<Text accessibilityRole="alert">{error}</Text>:null}
 </HomeView>;
}
