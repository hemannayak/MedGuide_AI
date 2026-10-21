const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),ts=require('typescript');const {readFileSync}=require('node:fs');
const flat=n=>Array.isArray(n)?n.flatMap(flat):n&&typeof n==='object'?[n,...flat(n.props?.children)]:[];
function load(path,req){const c={exports:{},require:req};vm.runInNewContext(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,c);return c.exports;}
function setup(step){let cursor=0;const values=[],calls=[];let settings={onboarding_step:step,onboarding_complete:false,water_goal_ml:null,step_goal:null};
 const copy=load('src/lib/setup-copy.ts',()=>({}));
 const api=load('src/components/onboarding-panel.tsx',name=>{
 if(name==='react')return {useState:initial=>{const i=cursor++;if(!(i in values))values[i]=initial;return [values[i],n=>values[i]=n];}};
 if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
 if(name==='react-native')return {Text:'Text',TextInput:'Input',View:'View',Switch:'Switch'};
 if(name==='./brand-ui')return {Button:'Button',palette:{}};
 if(name==='../lib/wellness')return {saveWellness:async changes=>{calls.push(changes);settings={...settings,...changes};return settings;}};
 if(name==='../lib/care')return {updateProfile:async(name,language)=>calls.push({name,language})};
 if(name==='../lib/setup-copy')return copy;
 if(name==='./illustrations')return {VoiceMicWaveSvg:'Art',PrescriptionScannerSvg:'Art',MedicalShieldSvg:'Art'};throw Error(name);
 });
 const render=()=>{cursor=0;return flat(api.OnboardingPanel({settings,name:'SYN Name',language:'en',onSaved:()=>{}}));};
 return {calls,render,button:title=>render().find(n=>n.props?.title===title)};
}
test('skipping optional setup persists completion without health data or permissions',async()=>{const h=setup(0);h.button('Skip optional setup').props.onPress();await new Promise(setImmediate);assert.deepEqual(JSON.parse(JSON.stringify(h.calls)),[{onboarding_complete:true}]);});
test('empty optional targets stay unset instead of assigning a universal goal',async()=>{const h=setup(2);h.button('Save and continue').props.onPress();await new Promise(setImmediate);assert.deepEqual(JSON.parse(JSON.stringify(h.calls)),[{onboarding_step:3,onboarding_complete:false}]);});
test('Home setup does not render water or step editors',()=>{const h=setup(2);const nodes=h.render();assert.equal(nodes.some(n=>n.type==='Input'||n.type==='Switch'),false);});
test('pending daily entries restore only for the originating account',async()=>{const saved=new Map();const api=load('src/lib/pending-wellness.ts',name=>name==='react-native'?{Platform:{OS:'android'}}:{getItemAsync:async k=>saved.get(k),setItemAsync:async(k,v)=>saved.set(k,v),deleteItemAsync:async k=>saved.delete(k)});await api.writePending('SYN-A',{operation_id:'SYN-operation',amount:250});assert.equal(await api.readPending('SYN-B'),null);assert.equal((await api.readPending('SYN-A')).amount,250);await api.clearPending();assert.equal(await api.readPending('SYN-A'),null);});
test('BMI is derived only from finite positive height and weight, without categories',()=>{const api=load('src/components/health-overview.tsx',name=>name==='react-native'?{}:name==='react/jsx-runtime'?{}:{});assert.equal(api.calculateBMI([]),null);assert.equal(api.calculateBMI([{kind:'height',unit:'cm',value:0},{kind:'weight',unit:'kg',value:60}]),null);assert.equal(api.calculateBMI([{kind:'height',unit:'cm',value:170},{kind:'weight',unit:'kg',value:68}]),23.5);});
