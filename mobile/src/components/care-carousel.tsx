import { useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { Button, palette } from './brand-ui';
import { PrescriptionScannerSvg, MedicineBottleSvg, VoiceMicWaveSvg } from './illustrations';
const slides=[
 {title:'A conversation in your language',body:'Ask in English, हिन्दी or తెలుగు. Review your words before sending.',action:'Open health companion',route:'/chat' as const,Art:VoiceMicWaveSvg},
 {title:'Understand your prescription',body:'Upload a clear photo, then review the extracted details.',action:'Review a prescription',route:'/prescriptions/upload' as const,Art:PrescriptionScannerSvg},
 {title:'Keep your care together',body:'Find your medicines, follow-ups and health records in one place.',action:'View care records',route:'/care' as const,Art:MedicineBottleSvg},
];
export function CareCarousel({onNavigate, compact=false}:{onNavigate?:(route:'/chat'|'/prescriptions/upload'|'/care')=>void; compact?:boolean}){
 const {width}=useWindowDimensions();const cardWidth=Math.min(420,width-60);const [index,setIndex]=useState(0),[imageFailed,setImageFailed]=useState(false);const scroller=useRef<ScrollView>(null);
 function select(i:number){scroller.current?.scrollTo({x:i*(cardWidth+12),animated:false});setIndex(i);}
 return <View style={{gap:compact?4:12}}>{!compact?<Text accessibilityRole="header" style={{fontSize:21,fontWeight:'700',color:palette.ink}}>Your care, made simpler</Text>:null}
  <ScrollView ref={scroller} horizontal showsHorizontalScrollIndicator={false} snapToInterval={cardWidth+12} decelerationRate="fast" onMomentumScrollEnd={e=>setIndex(Math.min(2,Math.max(0,Math.round(e.nativeEvent.contentOffset.x/(cardWidth+12)))))} contentContainerStyle={{gap:12}}>
   {slides.map((slide,i)=><View key={slide.title} style={{width:cardWidth,backgroundColor:i===1?palette.peach:palette.sage,borderRadius:24,overflow:'hidden'}}>
    {i===0&&!imageFailed?<Image source={require('../../assets/voice-care-v1.webp')} accessibilityLabel="Illustration of two women using a phone for health information in a village" resizeMode="cover" onError={()=>setImageFailed(true)} style={{width:'100%',height:compact?140:180}}/>:<View style={{height:compact?140:180,alignItems:'center',justifyContent:'center'}}><slide.Art size={compact?96:120}/></View>}
    <View style={{padding:compact?14:20,gap:compact?6:12}}><Text style={{fontSize:compact?19:24,fontWeight:'700',color:palette.ink}}>{slide.title}</Text><Text style={{fontSize:compact?14:16,lineHeight:compact?20:24,color:palette.muted}}>{slide.body}</Text>{onNavigate?<Button title={slide.action} onPress={()=>onNavigate(slide.route)}/>:null}</View>
   </View>)}
  </ScrollView>
  <View accessibilityRole="tablist" accessibilityLabel="Care feature slides" style={{flexDirection:'row',justifyContent:'center',gap:8}}>{slides.map((slide,i)=><Pressable key={slide.title} accessibilityRole="tab" accessibilityState={{selected:i===index}} accessibilityLabel={`Slide ${i+1}: ${slide.title}`} onPress={()=>select(i)} style={{minWidth:44,minHeight:44,justifyContent:'center',alignItems:'center'}}><View style={{height:8,width:i===index?24:8,borderRadius:4,backgroundColor:i===index?palette.ink:palette.line}}/></Pressable>)}</View>
 </View>;
}
