import { Text, View } from 'react-native';
import { Button, palette } from './brand-ui';
import { speakGuidance, stopGuidance } from '../lib/audio-guide';

export const homeTour = [
  ['Speak or type', 'Tap Talk about your concern, then choose your language. Recording starts only when you choose it and allow microphone access. You can also type a question.'],
  ['Your daily progress', 'Log the water you drink here. Steps from a supported phone sensor require your permission and an active foreground session. Change both goals in Profile. Browser previews cannot count your steps.'],
  ['Prescriptions and care', 'Upload a prescription photo for review. Check extracted medicine details before using them. My care records opens your saved medicines and follow-ups.'],
  ['Your profile and privacy', 'Open Profile above to edit optional health details and daily goals. Settings contains permissions. You can skip optional setup and replay this walkthrough from Profile.'],
] as const;

export function WalkthroughTip({step,onChange,onClose,busy=false,error=''}:{step:number;onChange:(step:number)=>void;onClose:()=>void;busy?:boolean;error?:string}) {
  const [title,body]=homeTour[step];
  const close=()=>{stopGuidance();onClose();};
  const move=(next:number)=>{stopGuidance();onChange(next);};
  return <View style={{padding:18,gap:10,borderRadius:20,backgroundColor:palette.white,borderWidth:2,borderColor:palette.teal}}>
    <Text style={{color:palette.teal}}>APP WALKTHROUGH · {step+1} / {homeTour.length}</Text>
    <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={{fontSize:21,fontWeight:'700',color:palette.ink}}>{title}</Text>
    <Text style={{fontSize:16,lineHeight:24,color:palette.ink}}>{body}</Text>
    {error?<Text accessibilityRole="alert" style={{color:palette.error}}>{error}</Text>:null}
    <Button variant="secondary" title="Listen to this tip" onPress={()=>speakGuidance(`${title}. ${body}`)}/>
    {step>0?<Button variant="quiet" title="Previous tip" disabled={busy} onPress={()=>move(step-1)}/>:null}
    <Button disabled={busy} title={busy?'Saving walkthrough…':step===homeTour.length-1?'Finish walkthrough':'Next tip'} onPress={()=>step===homeTour.length-1?close():move(step+1)}/>
    <Button variant="quiet" title="Skip walkthrough" disabled={busy} onPress={close}/>
  </View>;
}
