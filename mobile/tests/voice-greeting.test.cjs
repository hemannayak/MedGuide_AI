const test=require('node:test'); const assert=require('node:assert/strict');
const ts=require('typescript'); const vm=require('node:vm'); const {readFileSync}=require('node:fs');
function harness(language,profileLanguage=language){
 let cursor=0,phase='idle',complete; const values=[],calls=[],effects=[];
 const voice={get phase(){return phase;},error:'',speak(text,lang){calls.push({text,lang});phase='speaking';return new Promise(resolve=>{complete=()=>{phase='idle';resolve();};});},start(){calls.push('record');},cancel(){phase='idle';complete?.();},stop(){}};
 const context={exports:{},require:name=>{
  if(name==='../components/illustrations')return {DoctorConsultSvg:'Art',VoiceMicWaveSvg:'Art',MedicalShieldSvg:'Art',PrescriptionScannerSvg:'Art'};
  if(name==='../lib/i18n')return {t:key=>key};
  if(name==='../lib/audio-guide')return {playAudioGuide:()=>false,stopAudioGuide:()=>{},speakGuidance:()=>false,stopGuidance:()=>{}};
  if(name==='../lib/accessibility-command')return {isGuidanceCommand:()=>false};
  if(name==='react')return {useState:initial=>{const i=cursor++;if(!(i in values))values[i]=i===0?language:initial;return [values[i],next=>values[i]=typeof next==='function'?next(values[i]):next];},useRef:initial=>{const i=cursor++;return values[i]??(values[i]={current:initial});},useEffect:fn=>effects.push(fn)};
  if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
  if(name==='react-native')return {StyleSheet:{create:x=>x},Text:'Text',View:'View',KeyboardAvoidingView:'View',ScrollView:'View',TextInput:'Input',Pressable:'Pressable'};
  if(name==='../components/mobile-nav')return {MobileNav:'MobileNav'};
  if(name==='../components/brand-ui')return {Button:'Button',Brand:'Brand',palette:{}};
  if(name==='../hooks/use-voice')return {useVoice:()=>voice};
  if(name==='expo-router')return {router:{}};
  if(name==='../lib/api')return {hasSession:async()=>true};
  if(name==='../lib/care')return {getProfile:async()=>({preferred_language:profileLanguage}),updatePreferredLanguage:async code=>({preferred_language:code})};
    if(name==='../components/recording-indicator')return {RecordingIndicator:'RecordingIndicator'};
    throw Error(name);
 }};
 vm.runInNewContext(ts.transpileModule(readFileSync('src/app/chat.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
 const flatten=n=>Array.isArray(n)?n.flatMap(flatten):n&&typeof n==='object'?[n,...flatten(n.props?.children)]:[];
 return {calls,mount:async()=>{effects.splice(0).forEach(fn=>fn());await new Promise(setImmediate);},finish:()=>complete(),button:title=>{cursor=0;return flatten(context.exports.default()).find(n=>(n.type==='Button'&&n.props.title===title)||(n.type==='Pressable'&&n.props.children?.props?.children===title));}};
}

test('saved Telugu preference is applied before the next voice greeting',async()=>{
 const h=harness('en','te');h.button('Start voice mode');await h.mount();
 h.button('Start voice mode').props.onPress();assert.equal(h.calls[0].lang,'te');h.finish();
});

test('explicit language choice is confirmed by the shared backend before speaking',async()=>{
 const h=harness('en');h.button('తెలుగు').props.onPress();await new Promise(setImmediate);
 h.button('Start voice mode').props.onPress();assert.equal(h.calls[0].lang,'te');h.finish();
});
for(const [language,prefix] of [['en','Hello!'],['hi','नमस्ते!'],['te','నమస్కారం!']]){
 test(`Android voice mode greets in ${language} before recording`,async()=>{
  const h=harness(language);h.button('Start voice mode').props.onPress();
  assert.equal(h.calls.length,1);assert.equal(h.calls[0].lang,language);assert.ok(h.calls[0].text.startsWith(prefix));
  assert.equal(h.button('Record your concern').props.disabled,true);
  h.finish();await new Promise(setImmediate);
  assert.equal(h.button('Record your concern').props.disabled,false);
  h.button('Record your concern').props.onPress();assert.equal(h.calls[1],'record');
 });
}
