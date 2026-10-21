const test=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const {readFileSync}=require('node:fs');const ts=require('typescript');
function screen({granted=true,pickerResult={canceled:true},pickerPromise}={}) {
 const states=[],cleanups=[],calls=[];
 const context={exports:{},require:name=>{
  if(name==='../../components/illustrations')return {DoctorConsultSvg:'Art',VoiceMicWaveSvg:'Art',MedicalShieldSvg:'Art',PrescriptionScannerSvg:'Art'};
  if(name==='../../lib/i18n')return {t:key=>key};
  if(name==='../../lib/audio-guide')return {playAudioGuide:()=>false,stopAudioGuide:()=>{},speakGuidance:()=>false,stopGuidance:()=>{}};
  if(name==='react')return {useState:value=>{const i=states.length;states.push(value);return [value,next=>{states[i]=next;}];},useRef:value=>({current:value}),useEffect:fn=>cleanups.push(fn())};
  if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
  if(name==='react-native')return {StyleSheet:{create:x=>x},Pressable:'Pressable',Button:'Button',ScrollView:'ScrollView',Text:'Text',Image:'Image',Switch:'Switch',View:'View'};
  if(name==='../../components/brand-ui')return {Button:'Button',palette:{cream:'#f6f1e8',ink:'#073d37'}};
  if(name==='expo-router')return {router:{replace:()=>assert.fail('selection must not navigate')}};
  if(name==='expo-image-picker')return {requestCameraPermissionsAsync:async()=>{calls.push('permission');return {granted};},launchCameraAsync:async()=>{calls.push('camera');return pickerResult;},launchImageLibraryAsync:async()=>{calls.push('gallery');return pickerPromise??pickerResult;}};
  return {validateUploadImage:()=>{},uploadPrescription:()=>assert.fail('selection must not upload')};
 }};
 vm.runInNewContext(ts.transpileModule(readFileSync('src/app/prescriptions/upload.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
 const flatten=node=>Array.isArray(node)?node.flatMap(flatten):node&&typeof node==='object'?[node,...flatten(node.props?.children)]:[];
 const nodes=flatten(context.exports.default());
 return {states,calls,cleanups,button:title=>nodes.find(node=>node.type==='Button'&&node.props.title===title)};
}
test('camera denial gives a visible error without launching camera or uploading',async()=>{
 const h=screen({granted:false});await h.button('Take a prescription photo').props.onPress();await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(h.calls,['permission']);assert.match(h.states[3],/denied/);assert.equal(h.states[0],null);
});
test('gallery cancellation never uploads or requests blanket gallery permission',async()=>{
 const h=screen();h.button('Choose a prescription image').props.onPress();await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(h.calls,['gallery']);assert.equal(h.states[0],null);assert.equal(h.states[1],false);assert.equal(h.states[2],false);
});
test('selected image remains unconfirmed and requires a separate upload action',async()=>{
 const image={uri:'file:///SYN.png',mimeType:'image/png',fileSize:512};const h=screen({pickerResult:{canceled:false,assets:[image]}});
 h.button('Choose a prescription image').props.onPress();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.states[0],image);assert.equal(h.states[1],false);
});
test('rapid picker taps launch one picker and late results after unmount are discarded',async()=>{
 let resolvePicker;const pickerPromise=new Promise(resolve=>{resolvePicker=resolve;});const h=screen({pickerPromise});
 h.button('Choose a prescription image').props.onPress();h.button('Choose a prescription image').props.onPress();assert.deepEqual(h.calls,['gallery']);
 h.cleanups.forEach(cleanup=>cleanup());resolvePicker({canceled:false,assets:[{uri:'file:///SYN.png'}]});await new Promise(resolve=>setImmediate(resolve));assert.equal(h.states[0],null);
});
