const test=require('node:test'),assert=require('node:assert/strict'),ts=require('typescript'),vm=require('node:vm');
const {readFileSync}=require('node:fs');
function load(path,requireMock,extra={}) {const c={exports:{},require:requireMock,...extra};vm.runInNewContext(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,c);return c.exports;}
test('onboarding completion is versioned and isolated between accounts',async()=>{
 const saved=new Map();const api=load('src/lib/first-use.ts',name=>name==='react-native'?{Platform:{OS:'android'}}:{getItemAsync:async k=>saved.get(k),setItemAsync:async(k,v)=>saved.set(k,v)});
 assert.equal(await api.hasSeenGuide('SYN-A'),false);await api.finishGuide('SYN-A');assert.equal(await api.hasSeenGuide('SYN-A'),true);assert.equal(await api.hasSeenGuide('SYN-B'),false);assert.equal([...saved.keys()][0],'medguide.guide.v1.SYN-A');assert.equal([...saved.values()][0],'seen');
});
function permissionHarness(preview=false){
 const states=[],calls=[];let complete=0;const result={granted:false,canAskAgain:true};
 const component=load('src/components/permission-view.tsx',name=>{
 if(name==='react')return {useEffect:()=>{},useState:initial=>{const i=states.length;states.push(initial);return [initial,n=>states[i]=n];}};
 if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
 if(name==='react-native')return {Text:'Text',View:'View',ScrollView:'ScrollView',Linking:{}};
 if(name==='expo-audio')return {AudioModule:{requestRecordingPermissionsAsync:async()=>{calls.push('OS microphone');return result;}}};
 if(name==='expo-image-picker')return {requestCameraPermissionsAsync:async()=>{calls.push('OS camera');return result;}};
 if(name==='./brand-ui')return {Brand:'Brand',Button:'Button',palette:{}};
 if(name==='../lib/notifications')return {reminderPermissionStatus:async()=>'Not requested',allowReminders:async()=>{calls.push('OS notifications');return {granted:true};}};
 if(name==='./illustrations')return {VoiceMicWaveSvg:'Art',PrescriptionScannerSvg:'Art',MedicalShieldSvg:'Art'};
 throw Error(name);
 });
 const flat=n=>Array.isArray(n)?n.flatMap(flat):n&&typeof n==='object'?[n,...flat(n.props?.children)]:[];
 const nodes=flat(component.PermissionView({preview,onContinue:()=>complete++,onConsent:()=>{}}));
 return {states,calls,button:t=>nodes.find(n=>n.props?.title===t),completed:()=>complete};
}
test('native permission buttons request OS access and denial remains visible',async()=>{
 const h=permissionHarness();h.button('Allow microphone').props.onPress();await new Promise(setImmediate);assert.deepEqual(h.calls,['OS microphone']);assert.equal(h.states[0],'Not allowed');assert.match(h.states[3],/declined/);h.button('Continue without granting access').props.onPress();assert.equal(h.completed(),1);
});
test('design preview cannot request real device permissions',async()=>{
 const h=permissionHarness(true);h.button('Allow camera').props.onPress();await new Promise(setImmediate);assert.equal(h.calls.length,0);assert.match(h.states[3],/Preview only/);
});
