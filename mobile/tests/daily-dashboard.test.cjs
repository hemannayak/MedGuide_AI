const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),ts=require('typescript');const{readFileSync}=require('node:fs');
function load(path,requireMock,extra={}){const c={exports:{},require:requireMock,...extra};vm.runInNewContext(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,c);return c.exports;}
const flat=n=>Array.isArray(n)?n.flatMap(flat):n&&typeof n==='object'?[n,...flat(n.props?.children)]:[];
const progress=load('src/lib/daily-progress.ts',()=>({}));
test('water uses litre display and exact integer ml storage conversions',()=>{assert.equal(progress.hydrationLabel(1200,2500),'1.2 L / 2.5 L');assert.equal(progress.hydrationLabel(0,null),'0 L / set target');assert.equal(progress.litresToMl('2.5'),2500);assert.throws(()=>progress.litresToMl('-1'));assert.throws(()=>progress.litresToMl('0'));assert.throws(()=>progress.litresToMl('2.5555'));});
test('live steps add only the unsynchronized part of the current session',()=>{assert.equal(progress.liveStepTotal(20,40,60,40),80);assert.equal(progress.liveStepTotal(20,60,60,60),80);});
function harness({platform='android',granted=true,available=true}={}){
 let cursor=0,sensor,appstate;const values=[],effects=[],calls=[],timers=new Map();let nextTimer=0,storedSteps=0,settings={water_goal_ml:2500,step_goal:5000};
 const jsx={jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
 const api=load('src/components/daily-dashboard.tsx',name=>{
 if(name==='react')return {useState:initial=>{const i=cursor++;if(!(i in values))values[i]=typeof initial==='function'?initial():initial;return[values[i],n=>values[i]=typeof n==='function'?n(values[i]):n];},useRef:initial=>{const i=cursor++;return values[i]??(values[i]={current:initial});},useCallback:fn=>fn,useEffect:fn=>effects.push(fn)};
 if(name==='react/jsx-runtime')return jsx;
 if(name==='react-native')return {View:'View',Text:'Text',TextInput:'Input',Switch:'Switch',Platform:{OS:platform},AppState:{addEventListener:(_,fn)=>{appstate=fn;return{remove(){}};}},Linking:{openSettings:async()=>{}}};
 if(name==='expo-sensors')return{Pedometer:{isAvailableAsync:async()=>{calls.push('available');return available;},requestPermissionsAsync:async()=>{calls.push('permission');return {granted,canAskAgain:true};},watchStepCount:fn=>{calls.push('watch');sensor=fn;return{remove:()=>calls.push('remove')};}}};
 if(name==='react-native-svg')return{default:'Svg',Circle:'Circle'};
 if(name==='./illustrations')return{HydrationSvg:'WaterIcon',FootstepsSvg:'StepsIcon'};
 if(name==='./brand-ui')return{Button:'Button',palette:{}};
 if(name==='../lib/daily-progress')return progress;
 if(name==='../lib/pending-wellness')return {readPending:async()=>null,writePending:async()=>{},clearPending:async()=>{}};
 if(name==='../lib/wellness')return{getDaily:async()=>({day:'2026-10-21',water_ml:1200,manual_steps:0,foreground_steps:storedSteps}),localDay:()=> '2026-10-21',entry:(kind,amount,source)=>({operation_id:'SYN-session',day:'2026-10-21',kind,amount,source}),sendEntry:async p=>{calls.push(p);storedSteps=Math.max(storedSteps,p.amount);},saveWellness:async p=>(settings={...settings,...p})};
 throw Error(name);
 },{setTimeout:fn=>{const id=++nextTimer;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),setInterval:()=>999,clearInterval:()=>{}});
 const render=()=>{cursor=0;effects.length=0;return flat(api.DailyDashboard({settings,patientId:'SYN-patient',onProfile:()=>{},onSettingsSaved:s=>settings=s}));};
 const button=title=>render().find(n=>n.props?.title===title);
 return{calls,api,render,button,mount:async()=>{render();effects.splice(0).forEach(fn=>fn());await new Promise(setImmediate);},enable:async()=>{button('Log water or steps').props.onPress();render().find(n=>n.type==='Switch').props.onValueChange(true);button('Enable foreground step counter').props.onPress();await new Promise(setImmediate);},emit:n=>sensor({steps:n}),flush:async()=>{const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());await new Promise(setImmediate);},background:()=>appstate('background')};
}
test('sensor callbacks automatically save real session snapshots without double counting',async()=>{const h=harness();await h.mount();await h.enable();assert.ok(h.calls.includes('watch'));h.emit(40);await h.flush();h.emit(60);await h.flush();const sent=h.calls.filter(c=>typeof c==='object');assert.deepEqual(sent.map(c=>c.amount),[40,60]);const ring=h.render().find(n=>n.type===h.api.Ring&&n.props.label==='Steps');assert.equal(ring.props.value,60);h.background();assert.ok(h.calls.includes('remove'));});
test('permission denial and unavailable browser never create sensor counts',async()=>{for(const options of [{granted:false},{available:false},{platform:'web'}]){const h=harness(options);await h.mount();await h.enable();assert.equal(h.calls.includes('watch'),false);assert.equal(h.calls.some(c=>typeof c==='object'),false);}});
test('Ring uses a portable SVG transform without invalid transform-origin DOM props',()=>{const h=harness();const nodes=flat(h.api.Ring({value:1200,target:2500,label:'Water',display:'1.2 L / 2.5 L'}));const rotated=nodes.find(n=>n.props?.transform);assert.equal(rotated.props.transform,'rotate(-90 40 40)');assert.equal(rotated.props.origin,undefined);assert.equal(rotated.props['transform-origin'],undefined);});
test('Home logging retains intake controls but exposes no goal editors',async()=>{const h=harness();await h.mount();h.button('Log water or steps').props.onPress();const nodes=h.render();assert.ok(nodes.find(n=>n.props?.accessibilityLabel==='Water consumed in millilitres'));assert.equal(nodes.some(n=>n.props?.accessibilityLabel==='Daily water target in litres'),false);assert.equal(nodes.some(n=>n.props?.title==='Save water target'),false);});
test('progress rings use distinct hydration and footsteps artwork',()=>{const h=harness();const water=flat(h.api.Ring({value:250,target:2500,label:'Water'})),steps=flat(h.api.Ring({value:0,target:null,label:'Steps'}));assert.ok(water.some(n=>n.type==='WaterIcon'));assert.ok(steps.some(n=>n.type==='StepsIcon'));});
