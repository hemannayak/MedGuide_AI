const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),ts=require('typescript'),{readFileSync}=require('node:fs');
const flat=n=>Array.isArray(n)?n.flatMap(flat):n&&typeof n==='object'?[n,...flat(n.props?.children)]:[];
test('contextual tips support next, previous, skip, finish and explicit spoken help',()=>{
 const calls=[],c={exports:{},require:name=>{
 if(name==='react')return {useSyncExternalStore:(_,snapshot)=>snapshot()};
 if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
 if(name==='react-native')return{Text:'Text',View:'View'};
 if(name==='./brand-ui')return{Button:'Button',palette:{}};
 if(name==='../lib/audio-guide')return{audioSnapshot:()=>({phase:'idle'}),subscribeAudio:()=>()=>{},speakGuidance:text=>calls.push(text),stopGuidance:()=>{}};
 throw Error(name);
 }};
 vm.runInNewContext(ts.transpileModule(readFileSync('src/components/walkthrough-tip.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,c);
 const render=step=>flat(c.exports.WalkthroughTip({step,onChange:n=>calls.push(n),onClose:()=>calls.push('closed')}));
 const press=(nodes,title)=>nodes.find(n=>n.props?.title===title).props.onPress();
 press(render(0),'Next tip');assert.equal(calls.pop(),1);
 press(render(1),'Previous tip');assert.equal(calls.pop(),0);
 press(render(2),'Listen to this tip');assert.match(calls.pop(),/Check extracted medicine details/);
 press(render(0),'Skip walkthrough');assert.equal(calls.pop(),'closed');
 press(render(3),'Finish walkthrough');assert.equal(calls.pop(),'closed');
});

test('Home keeps failed completion retryable, prevents duplicate saves, and preserves card order',async()=>{
 let cursor=0,attempts=0,resolveSave,rejectSave;const states=[];
 const c={exports:{},require:name=>{
 if(name==='react')return {useState:v=>{const i=cursor++;if(!(i in states))states[i]=v;return[states[i],v=>states[i]=v];},useRef:v=>{const i=cursor++;return states[i]??(states[i]={current:v});},useEffect:()=>{}};
 if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
 if(name==='react-native')return{Text:'Text',View:'View',ScrollView:'Scroll',Pressable:'Pressable',StyleSheet:{create:v=>v}};
 if(name==='./brand-ui')return{Brand:'Brand',Button:'Button',palette:{}};
 if(name==='./mobile-nav')return{MobileNav:'Nav'};
 if(name==='./fade-in')return{FadeIn:'Fade'};
 if(name==='./rural-scene')return{RuralScene:'Scene'};
 if(name==='./illustrations')return{};
 if(name==='./walkthrough-tip')return{WalkthroughTip:'Tip'};
 if(name==='../lib/audio-guide')return{stopGuidance:()=>{}};
 throw Error(name);
 }};
 vm.runInNewContext(ts.transpileModule(readFileSync('src/components/home-view.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,c);
 const render=()=>{cursor=0;return flat(c.exports.HomeView({walkthrough:true,onNavigate:()=>{},dailyDashboard:{type:'Daily'},onWalkthroughDone:()=>{attempts++;return new Promise((resolve,reject)=>{resolveSave=resolve;rejectSave=reject;});}}));};
 let nodes=render();assert.ok(nodes.findIndex(n=>n.props?.title==='Type a question')<nodes.findIndex(n=>n.type==='Daily'));assert.ok(nodes.findIndex(n=>n.type==='Daily')<nodes.findIndex(n=>n.props?.accessibilityLabel==='Upload a prescription'));
 const tip=nodes.find(n=>n.type==='Tip');tip.props.onClose();tip.props.onClose();assert.equal(attempts,1);assert.equal(render().find(n=>n.type==='Tip').props.busy,true);
 rejectSave(Error('offline'));await new Promise(setImmediate);
 nodes=render();assert.match(nodes.find(n=>n.type==='Tip').props.error,/Could not save/);
 nodes.find(n=>n.type==='Tip').props.onClose();assert.equal(attempts,2);resolveSave();await new Promise(setImmediate);assert.equal(render().some(n=>n.type==='Tip'),false);
});
