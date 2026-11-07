import { useEffect, useState, useSyncExternalStore } from 'react';
import { AppState, Linking, Platform, ScrollView, Text } from 'react-native';
import { router, usePathname } from 'expo-router';
import { audioSnapshot, subscribeAudio, stopGuidance } from '../lib/audio-guide';
import { Button, palette } from './brand-ui';

/** Non-modal feedback shared by every device read-aloud entry point. */
export function AudioGuidanceStatus(){
 const state=useSyncExternalStore(subscribeAudio,audioSnapshot,audioSnapshot);
 const pathname=usePathname();const [help,setHelp]=useState('');
 useEffect(()=>()=>stopGuidance(),[pathname]);
 useEffect(()=>{const sub=AppState.addEventListener('change',s=>{if(s==='active')setHelp('Tap Listen again to check your phone voices.');});return()=>sub.remove();},[]);
 if(state.phase==='idle')return null;
 async function settings(){try{if(Platform.OS==='android')await Linking.sendIntent('com.android.settings.TTS_SETTINGS');else await Linking.openSettings();}catch{setHelp('Open phone Settings, then search for Text-to-speech. You can keep reading here.');}}
 return <ScrollView style={{maxHeight:220,backgroundColor:palette.sage}} contentContainerStyle={{padding:12,gap:8}}>
  <Text accessibilityLiveRegion="polite" style={{fontSize:16,color:palette.ink}}>{state.phase==='loading'?'Preparing read-aloud…':state.phase==='speaking'?'Reading aloud':state.message}</Text>
  {help?<Text>{help}</Text>:null}
  {state.phase==='missing'||state.phase==='declined'?<Button title="Read-aloud choice on Home" onPress={()=>{stopGuidance();router.push('/home?setup=audio');}}/>:null}
  {state.phase==='unavailable'?<Button variant="secondary" title="Open phone voice settings" onPress={()=>void settings()}/>:null}
  <Button variant="quiet" title={state.phase==='speaking'||state.phase==='loading'?'Stop speaking':'Continue reading'} onPress={stopGuidance}/>
 </ScrollView>;
}
