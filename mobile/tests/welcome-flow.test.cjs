const test=require('node:test'), assert=require('node:assert/strict'), ts=require('typescript'),vm=require('node:vm');
const {readFileSync}=require('node:fs');
function harness(){
 let cursor=0;const values=[],cleanups=[],calls=[];
 const c={exports:{},require:name=>{
 if(name==='react')return {useState:initial=>{const i=cursor++;if(!(i in values))values[i]=initial;return [values[i],next=>values[i]=typeof next==='function'?next(values[i]):next];},useEffect:fn=>cleanups.push(fn())};
 if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
 if(name==='react-native')return {View:'View',Text:'Text',ScrollView:'ScrollView',Pressable:'Pressable',StyleSheet:{create:x=>x}};
 if(name==='./brand-ui')return {Brand:'Brand',Button:'Button',palette:{}};
 if(name==='./rural-scene')return {RuralScene:'RuralScene'};
 if(name==='./auth-carousel')return {AuthCarousel:'AuthCarousel'};
 if(name==='./illustrations')return {MedicalShieldSvg:'Art',VoiceMicWaveSvg:'Art',PrescriptionScannerSvg:'Art',RuralClinicSvg:'Art'};
 if(name==='../lib/i18n')return {t:key=>key};
 if(name==='../lib/audio-guide')return {speakGuidance:()=>calls.push('speak'),stopGuidance:()=>calls.push('stop')};
 throw Error(name);
 }};
 vm.runInNewContext(ts.transpileModule(readFileSync('src/components/welcome-flow.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,c);
 const flatten=n=>Array.isArray(n)?n.flatMap(flatten):n&&typeof n==='object'?[n,...flatten(n.props?.children)]:[];
 return {calls,render:()=>{cursor=0;return flatten(c.exports.WelcomeFlow({onSignIn:()=>calls.push('login'),onRegister:()=>calls.push('register')}));},cleanup:()=>cleanups.forEach(fn=>fn?.())};
}
test('welcome is scrollable and account entry never waits for an animation',()=>{
 const h=harness(),nodes=h.render();assert.ok(nodes.find(n=>n.type==='ScrollView'));
 nodes.find(n=>n.props?.title==='getStarted').props.onPress();nodes.find(n=>n.props?.title==='alreadyHaveAccount').props.onPress();assert.deepEqual(h.calls,['register','login']);
});
test('welcome guidance is opt-in and stops on unmount',()=>{
 const h=harness();h.render();assert.equal(h.calls.length,0);h.cleanup();assert.ok(h.calls.includes('stop'));
});
