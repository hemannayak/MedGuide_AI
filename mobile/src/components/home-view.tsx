import { ReactNode, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Brand, Button, palette } from './brand-ui';
import { MobileNav } from './mobile-nav';
import { FadeIn } from './fade-in';
import { RuralScene } from './rural-scene';
import { VoiceMicWaveSvg, PrescriptionScannerSvg, MedicineBottleSvg } from './illustrations';
import { WalkthroughTip } from './walkthrough-tip';
import { stopGuidance } from '../lib/audio-guide';
type Destination = '/home' | '/chat' | '/care' | '/settings' | '/timeline' | '/prescriptions/upload' | '/profile';
/** Keep daily tracking between the conversation actions and care shortcuts. */
export function HomeView({ onNavigate, children, dailyDashboard, walkthrough=false, onWalkthroughDone }: { onNavigate: (route: Destination) => void; children?: ReactNode; dailyDashboard?: ReactNode; walkthrough?:boolean; onWalkthroughDone?:()=>Promise<void> }) {
  const [tip,setTip]=useState<number|null>(walkthrough?0:null);
  const [previousWalkthrough,setPreviousWalkthrough]=useState(walkthrough);
  if(previousWalkthrough!==walkthrough){setPreviousWalkthrough(walkthrough);if(walkthrough)setTip(0);}
  const scroll=useRef<ScrollView>(null);
  const closing=useRef(false);
  const [saving,setSaving]=useState(false);
  const [tourError,setTourError]=useState('');
  useEffect(()=>()=>stopGuidance(),[]);
  async function closeTour(){
    if(closing.current)return;
    closing.current=true;setSaving(true);setTourError('');
    try{await onWalkthroughDone?.();setTip(null);}catch{setTourError('Could not save walkthrough completion. Check your connection and try Finish or Skip again.');}
    finally{closing.current=false;setSaving(false);}
  }
  const guidance=(step:number)=>tip===step?<WalkthroughTip step={step} busy={saving} error={tourError} onChange={setTip} onClose={()=>void closeTour()}/>:null;
  const tourLayout=(step:number,y:number)=>{if(tip===step)scroll.current?.scrollTo({y:Math.max(0,y-12),animated:false});};
  return <FadeIn style={{ flex: 1, backgroundColor: palette.cream }}>
    <ScrollView ref={scroll} contentContainerStyle={styles.page}>
      <View style={styles.header}><Brand /><Button variant="quiet" title="Profile" onPress={() => onNavigate('/profile')} /></View>
      <View onLayout={e=>tourLayout(3,e.nativeEvent.layout.y)}>{guidance(3)}</View>
      <RuralScene height={126} />
      {children}
      <Button variant="quiet" title="Show me how to use MedGuide" onPress={()=>setTip(0)}/>
      <View style={{gap:14}} onLayout={e=>tourLayout(0,e.nativeEvent.layout.y)}>
      {guidance(0)}
      <Text style={styles.eyebrow}>CARE IN YOUR LANGUAGE</Text>
      <Text accessibilityRole="header" style={styles.heading}>How can we help today?</Text>
      <Text style={styles.body}>Speak, type or upload. Take one step at a time.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Talk about your concern" accessibilityHint="Opens the health companion. Recording starts only when you choose it." onPress={() => onNavigate('/chat')} style={({pressed}) => [styles.voiceCard, pressed && {opacity:0.8}]}>
        <View style={styles.voiceCircle}><VoiceMicWaveSvg size={40} color="#ffffff" secondaryColor="#a3d9cf" /></View>
        <Text style={styles.voiceTitle}>Talk about your concern</Text>
        <Text style={styles.body}>English · हिन्दी · తెలుగు</Text>
      </Pressable>
      <Button variant="secondary" title="Type a question" onPress={() => onNavigate('/chat')} />
      </View>
      <View style={{gap:14}} onLayout={e=>tourLayout(1,e.nativeEvent.layout.y)}>
      {guidance(1)}
      {dailyDashboard}
      </View>
      <View style={{gap:14}} onLayout={e=>tourLayout(2,e.nativeEvent.layout.y)}>
      {guidance(2)}
      <View style={styles.tiles}>
        <Pressable accessibilityRole="button" accessibilityLabel="Upload a prescription" onPress={() => onNavigate('/prescriptions/upload')} style={[styles.tile, { backgroundColor: palette.peach }]}>
          <PrescriptionScannerSvg size={28} /><Text style={styles.cardTitle}>Upload a prescription</Text><Text style={styles.body}>Choose a photo to review</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Open care records" onPress={() => onNavigate('/care')} style={[styles.tile, { backgroundColor: palette.sage }]}>
          <MedicineBottleSvg size={28} /><Text style={styles.cardTitle}>My care records</Text><Text style={styles.body}>Medicines & follow-ups</Text>
        </Pressable>
      </View>
      </View>
      <Button variant="quiet" title="View health timeline →" onPress={() => onNavigate('/timeline')} />
      <Text style={styles.safety}>Health information, not a diagnosis. For emergencies, seek immediate professional help.</Text>
    </ScrollView>
    <MobileNav current="/home" onNavigate={onNavigate} />
  </FadeIn>;
}
const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 18, gap: 14, backgroundColor: palette.cream },
  eyebrow: {fontSize:11, fontWeight:'700', letterSpacing:1.5, color:palette.teal},
  heading: {fontSize:28, lineHeight:34, fontWeight:'700', color:palette.ink},
  body: {fontSize:14,lineHeight:21,color:palette.muted},
  voiceCard: {padding:22,gap:12,borderRadius:26,alignItems:'center',backgroundColor:palette.sage},
  voiceCircle: {width:76,height:76,borderRadius:38,backgroundColor:palette.ink,alignItems:'center',justifyContent:'center'},
  voiceTitle: {fontSize:20,fontWeight:'700',color:palette.ink,textAlign:'center'},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { flexGrow: 1, flexBasis: 130, borderRadius: 18, padding: 14, gap: 8, minHeight: 140 },
  cardTitle: { color: palette.ink, fontSize: 16, fontWeight: '600' },
  safety: { color: palette.muted, fontSize: 12, lineHeight: 18 },
});
