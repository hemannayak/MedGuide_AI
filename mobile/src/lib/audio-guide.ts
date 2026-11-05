import { AppState } from 'react-native';
import { Language } from './i18n';
import { getSpokenChoice } from './spoken-consent';
import { getStoredToken } from './api';
let speech: typeof import('expo-speech') | null = null;
// Old installed builds may lack the native module.
// eslint-disable-next-line @typescript-eslint/no-require-imports
try { speech = require('expo-speech'); } catch { speech=null; }
export type AudioState = {phase:'idle'|'loading'|'speaking'|'missing'|'declined'|'unavailable'|'error'; message?:string};
let state:AudioState={phase:'idle'};
const listeners=new Set<()=>void>();
export const audioSnapshot=()=>state;
export const subscribeAudio=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};};
function publish(value:AudioState){state=value;listeners.forEach(fn=>fn());}
let generation=0;
let finish:(()=>void)|undefined;
let stopping=Promise.resolve();
const locales={en:'en-IN',hi:'hi-IN',te:'te-IN'};
export function selectGuidanceVoice<T extends {language:string}>(voices:T[],lang:Language):T|undefined {
 const norm=(s:string)=>s.replace(/_/g,'-').toLowerCase();
 return voices.find(v=>norm(v.language)===locales[lang].toLowerCase())??voices.find(v=>norm(v.language).split('-')[0]===lang);
}
/** Every request checks account consent before initializing device speech. */
export function speakGuidance(text:string,lang:Language='en',onStart?:()=>void,onEnd?:()=>void):boolean {
 stopGuidance(); const current=generation;finish=onEnd;publish({phase:'loading'});
 const done=()=>{if(current===generation){finish=undefined;onEnd?.();publish({phase:'idle'});}};
 const fail=(phase:AudioState['phase'],message:string)=>{if(current===generation){finish=undefined;onEnd?.();publish({phase,message});}};
 void(async()=>{try{
  const owner=await getStoredToken();
  const choice=await getSpokenChoice();if(current!==generation)return;
  if(choice!=='GRANTED'){fail(choice==='MISSING'?'missing':'declined',choice==='MISSING'?'Choose read-aloud during setup on Home. Text is always available.':'Read-aloud is off. Keep reading or change your choice on Home.');return;}
  if(!speech){fail('error','Update the app to use read-aloud. Text is still available.');return;}
  await stopping;
  // Native Expo resolves inventory after initialization; web voices can arrive later.
  let voices=await speech.getAvailableVoicesAsync();
  if(!voices.length){await new Promise(resolve=>setTimeout(resolve,400));voices=await speech.getAvailableVoicesAsync();}
  if(current!==generation)return;
  if(!owner || owner!==await getStoredToken()){done();return;}
  const voice=selectGuidanceVoice(voices,lang);
  if(!voice){fail('unavailable','Your phone has no ready voice for this language. Keep reading, or add this language in phone voice settings and try again.');return;}
  speech.speak(text,{language:voice.language,voice:voice.identifier,rate:0.9,onStart:()=>{if(current===generation){publish({phase:'speaking'});onStart?.();}},onDone:done,onStopped:done,onError:()=>fail('error','Read-aloud could not start. Keep reading or try again.')});
 }catch{fail('error','Read-aloud could not be checked. Check your connection and try again. Text is still available.');}})();return true;
}
export function stopGuidance(){generation++;finish?.();finish=undefined;publish({phase:'idle'});if(speech)stopping=speech.stop().catch(()=>undefined);}
AppState.addEventListener('change',s=>{if(s!=='active')stopGuidance();});
export const playAudioGuide=(text:string,lang:Language='en',onEnd?:()=>void)=>speakGuidance(text,lang,undefined,onEnd);
export const stopAudioGuide=stopGuidance;
