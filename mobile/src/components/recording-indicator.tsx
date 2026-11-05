import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, View } from 'react-native';
import { palette } from './brand-ui';

/** Activity animation only; it deliberately makes no claim to measure sound levels. */
export function RecordingIndicator(){
  const [opacity]=useState(()=>new Animated.Value(1));
  useEffect(()=>{
    let active=true;
    let loop:Animated.CompositeAnimation|undefined;
    const stop=()=>{loop?.stop();opacity.setValue(1);};
    const start=(reduced:boolean)=>{
      stop();if(reduced||!active)return;
      loop=Animated.loop(Animated.sequence([Animated.timing(opacity,{toValue:0.35,duration:500,useNativeDriver:Platform.OS!=='web'}),Animated.timing(opacity,{toValue:1,duration:500,useNativeDriver:Platform.OS!=='web'})]));loop.start();
    };
    void AccessibilityInfo.isReduceMotionEnabled().then(start).catch(stop);
    const motion=AccessibilityInfo.addEventListener('reduceMotionChanged',start);
    return()=>{active=false;motion.remove();stop();};
  },[opacity]);
  return <View accessibilityLabel="Recording in progress. Animation shows activity, not microphone volume." accessibilityRole="text" style={{alignItems:'center',padding:12}}><Animated.View accessible={false} style={{flexDirection:'row',gap:5,alignItems:'center',height:40,opacity}}>{[12,23,34,19,30,40,24,14].map((height,index)=><View key={index} style={{height,width:6,borderRadius:3,backgroundColor:palette.teal}}/>)}</Animated.View></View>;
}
