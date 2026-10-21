import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { Button, palette } from './brand-ui';
import { VoiceMicWaveSvg, PrescriptionScannerSvg, MedicineBottleSvg } from './illustrations';

/** Finite native logo/feature reveal, not a downloaded video or a blocking splash. */
export function BrandIntroduction({ onContinue }: { onContinue: () => void }) {
  const [progress] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let active = true; let animation: Animated.CompositeAnimation | undefined;
    const reduce = (reduced: boolean) => {
      if (!active) return;
      animation?.stop();
      if (reduced) progress.setValue(1);
      else { animation = Animated.timing(progress,{toValue:1,duration:1600,useNativeDriver:Platform.OS !== 'web'}); animation.start(); }
    };
    void AccessibilityInfo.isReduceMotionEnabled().then(reduce).catch(() => reduce(true));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged',reduce);
    return () => {active=false;animation?.stop();sub.remove();};
  },[progress]);
  return <View style={s.page}>
    <Button title="Skip introduction" variant="secondary" onPress={onContinue} />
    <View style={s.orbit}>
      <Animated.View style={{opacity:progress, transform:[{scale:progress.interpolate({inputRange:[0,1],outputRange:[0.86,1]})}]}}>
        <Image source={require('../../assets/medguide-mark.png')} accessibilityLabel="MedGuide AI logo" style={{height:120,width:120}} />
      </Animated.View>
    </View>
    <Text accessibilityRole="header" style={s.title}>MedGuide AI</Text>
    <Text style={s.motto}>Care in your language.</Text>
    <View style={s.features}><VoiceMicWaveSvg size={54} /><PrescriptionScannerSvg size={54} /><MedicineBottleSvg size={54} /></View>
    <Text style={s.body}>Speak your concern. Understand your prescription. Keep your care together.</Text>
    <Button title="Get started" onPress={onContinue} />
    <Text style={s.note}>Preliminary health information. Not a replacement for a doctor.</Text>
  </View>;
}
const s=StyleSheet.create({page:{flex:1,padding:28,gap:24,justifyContent:'center',backgroundColor:palette.sage},orbit:{alignSelf:'center',padding:40,borderRadius:120,backgroundColor:palette.cream},title:{fontSize:36,color:palette.ink,fontWeight:'700',textAlign:'center'},motto:{fontSize:23,color:palette.ink,textAlign:'center'},features:{flexDirection:'row',justifyContent:'space-evenly'},body:{fontSize:18,lineHeight:28,textAlign:'center',color:palette.ink},note:{fontSize:13,lineHeight:20,textAlign:'center',color:palette.muted}});
