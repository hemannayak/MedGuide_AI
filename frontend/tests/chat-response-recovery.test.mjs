import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const ts=createRequire(import.meta.url)('typescript');
function chat(reply) {
 const states=[],refs=[],speech=[]; let cursor=0,refCursor=0,currentLanguage='en';
 const context={exports:{},Audio:class{},window:{addEventListener(){},removeEventListener(){}},require:name=>{
  if(name==='react')return {useState:initial=>{const i=cursor++;if(!(i in states))states[i]=initial;return [states[i],next=>{states[i]=typeof next==='function'?next(states[i]):next;}];},useRef:initial=>{const i=refCursor++;return refs[i]??(refs[i]={current:initial});},useEffect(){},useCallback:fn=>fn};
  if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
  if(name==='framer-motion')return {motion:{div:'div'}};
  if(name==='@/lib/i18n/context')return {useLanguage:()=>({t:key=>key,tr:text=>text,language:currentLanguage})};
  if(name==='@/lib/i18n/symptom-prompts')return {symptomPrompts:{en:{},hi:{},te:{}}};
  if(name==='@/lib/auth/session')return {clearLegacyChatCache(){}};
  if(name==='@/types/ai')return {ResponseType:{REFUSAL:'REFUSAL'}};
  if(name==='@/lib/audio/speech-playback')return {SpeechPlayback:class{cancel(){} async speak(text,synthesize){await synthesize(text);}}};
  if(name==='@/lib/api/client')return {api:{postAIChat:async()=>{if(reply instanceof Error)throw reply;return reply;},speechTTS:async payload=>{speech.push(payload);return {success:true,data:{audio_base64:'SYN'}};}}};
  return {};
 }};
 vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/app/app/chat/page.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
 const flatten=node=>Array.isArray(node)?node.flatMap(flatten):node&&typeof node==='object'?[node,...flatten(node.props?.children)]:[];
 return {states,speech,language:value=>{currentLanguage=value;},render:()=>{cursor=0;refCursor=0;return flatten(context.exports.default());}};
}
for(const reply of [{success:false,message:'SYN unavailable'},new Error('SYN network failure')]) {
 test(`failed chat restores the question for retry: ${reply instanceof Error?'network':'service'}`,async()=>{
  const f=chat(reply); const nodes=f.render();
  await nodes.find(node=>node.type==='button'&&node.props?.onClick&&!node.props?.title).props.onClick();
  assert.ok(f.states[0].length>0);
  assert.equal(f.states[2],false);
  assert.equal(f.states[4].at(-1).serviceError,true);
 });
}
test('previous Hindi reply stays Hindi when UI language changes to Telugu',async()=>{
 const f=chat({success:true,data:{conversation_id:'SYN-id',message:'यह एक परीक्षण है।',language:'hi',sources:[],response_type:'INFORMATIONAL'}});
 await f.render().find(node=>node.type==='button'&&node.props?.onClick&&!node.props?.title).props.onClick();
 f.language('te');
 const read=f.render().find(node=>node.type==='button'&&node.props?.title==='Read aloud in the reply language');
 await read.props.onClick();
 assert.equal(f.speech[0].language,'hi');
 assert.equal(f.speech[0].text,'यह एक परीक्षण है।');
});


test('refusal banner does not label the patient question unsafe',async()=>{
 const f=chat({success:true,data:{conversation_id:'SYN-refusal',message:'Not enough evidence.',language:'en',sources:[],response_type:'REFUSAL',refusal_triggered:true}});
 await f.render().find(node=>node.type==='button'&&node.props?.onClick&&!node.props?.title).props.onClick();
 const nodes=f.render();
 assert.ok(nodes.some(node=>node.type==='strong'&&node.props.children==='ai.refusalTitle'));
 for(const language of ['en','hi','te']){
  const dictionary=JSON.parse(readFileSync(new URL(`../src/lib/i18n/dictionaries/${language}.json`,import.meta.url),'utf8'));
  assert.ok(dictionary.ai.refusalTitle);
  assert.ok(dictionary.ai.refusalNotice);
  assert.doesNotMatch(dictionary.ai.refusalNotice,/unsafe.*query|re-grounding/i);
 }
});
