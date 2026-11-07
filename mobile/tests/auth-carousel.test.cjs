const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),ts=require('typescript'),{readFileSync}=require('node:fs');
const flat=n=>Array.isArray(n)?n.flatMap(flat):n&&typeof n==='object'?[n,...flat(n.props?.children)]:[];
function harness(){
 let cursor=0,stateChange,motionChange;const values=[],effects=[],cleanup=[],timers=new Map();let timerId=0;
 const c={exports:{},setInterval:fn=>{timers.set(++timerId,fn);return timerId;},clearInterval:id=>timers.delete(id),require:name=>{
 if(name==='react')return{useState:initial=>{const i=cursor++;if(!(i in values))values[i]=initial;return[values[i],next=>values[i]=typeof next==='function'?next(values[i]):next];},useRef:initial=>{const i=cursor++;return values[i]??(values[i]={current:initial});},useMemo:fn=>fn(),useEffect:fn=>effects.push(fn)};
 if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
 if(name==='react-native')return{View:'View',Text:'Text',Image:'Image',Pressable:'Button',StyleSheet:{create:v=>v},PanResponder:{create:handlers=>({panHandlers:handlers})},AppState:{currentState:'active',addEventListener:(_,fn)=>{stateChange=fn;return{remove(){}};}},AccessibilityInfo:{isReduceMotionEnabled:async()=>false,addEventListener:(_,fn)=>{motionChange=fn;return{remove(){}};}}};
 if(name.startsWith('../../assets/'))return name;throw Error(name);
 }};
 vm.runInNewContext(ts.transpileModule(readFileSync('src/components/auth-carousel.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,c);
 const render=()=>{cursor=0;effects.length=0;return flat(c.exports.AuthCarousel({language:'en'}));};
 const runEffects=async()=>{cleanup.splice(0).forEach(fn=>fn());effects.splice(0).forEach(fn=>{const result=fn();if(result)cleanup.push(result);});await new Promise(setImmediate);};
 return{api:c.exports,render,runEffects,timers,background:()=>stateChange('background'),reduce:()=>motionChange(true)};
}
test('all slides have distinct bundled images, no image badges and usable selected pagination',()=>{
 const h=harness();assert.equal(new Set(h.api.CAROUSEL_SLIDES.map(s=>s.image)).size,4);
 for(let index=0;index<4;index++){
  const nodes=h.render();assert.equal(nodes.find(n=>n.type==='Image').props.source,h.api.CAROUSEL_SLIDES[index].image);
  assert.equal(nodes.some(n=>typeof n.props?.children==='string'&&/0[1-4]\s*\/\s*04/.test(n.props.children)),false);
  const selected=nodes.find(n=>n.props?.accessibilityLabel===`Go to slide ${index+1}`);assert.equal(selected.props.accessibilityState.selected,true);
  nodes.find(n=>n.props?.accessibilityLabel==='Next slide').props.onPress();
 }
});
test('carousel autoplay cleans up on background and reduced-motion changes',async()=>{
 const h=harness();h.render();await h.runEffects();assert.equal(h.timers.size,1);
 h.background();h.render();await h.runEffects();assert.equal(h.timers.size,0);
 const reduced=harness();reduced.render();await reduced.runEffects();reduced.reduce();reduced.render();await reduced.runEffects();assert.equal(reduced.timers.size,0);
});
