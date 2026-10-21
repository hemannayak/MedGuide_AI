import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const ts = createRequire(import.meta.url)('typescript');
function fixture() {
  const storage = () => {
    const data = new Map([['medguide_chat_history', 'SYN private conversation'], ['medguide_conv_id', 'SYN-id'], ['medguide_lang', 'te']]);
    return {data, getItem: key => data.get(key), setItem: (key,value) => data.set(key,value), removeItem: key => data.delete(key)};
  };
  const localStorage = storage(), sessionStorage = storage(), events = [];
  const window = {localStorage, sessionStorage, dispatchEvent: event => events.push(event.type)};
  const context = {exports: {}, window, localStorage, sessionStorage, Event: class {constructor(type){this.type=type;}}};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/lib/auth/session.ts',import.meta.url),'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText, context);
  return {...context,events};
}
for (const action of ['clearSession','saveSessionToken']) {
  test(`${action} removes legacy medical data from both storage areas`, () => {
    const f = fixture(); f.exports[action]('SYN-token');
    for(const storage of [f.localStorage,f.sessionStorage]) {
      assert.equal(storage.getItem('medguide_chat_history'),undefined);
      assert.equal(storage.getItem('medguide_conv_id'),undefined);
      assert.equal(storage.getItem('medguide_lang'),'te');
    }
    assert.deepEqual(f.events,['medguide-session']);
    if(action==='clearSession') assert.equal(f.exports.getSessionToken(),undefined);
  });
}
test('legacy cleanup tolerates inaccessible browser storage', () => {
  const f=fixture(); Object.defineProperty(f.window,'localStorage',{get(){throw new Error('Storage denied');}});
  assert.doesNotThrow(()=>f.exports.clearLegacyChatCache());
  assert.equal(f.sessionStorage.getItem('medguide_chat_history'),undefined);
});

test('account change clears the visible conversation and ignores a pending previous-account reply', async () => {
  const states=[], effects=[], listeners=new Map(); let resolveReply;
  const reply=new Promise(resolve=>{resolveReply=resolve;});
  const react={useState:value=>{
    const index=states.length; states.push(value);
    return [value,next=>{states[index]=typeof next==='function'?next(states[index]):next;}];
  },useRef:value=>({current:value}),useEffect:fn=>effects.push(fn),useCallback:fn=>fn};
  const context={exports:{},window:{addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:()=>{}},
    require:name=>{
      if(name==='react')return react;
      if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
      if(name==='framer-motion')return {motion:{div:'div'}};
      if(name==='@/lib/i18n/context')return {useLanguage:()=>({t:key=>key,tr:text=>text,language:'en'})};
      if(name==='@/lib/i18n/symptom-prompts')return {symptomPrompts:{en:{}}};
      if(name==='@/lib/auth/session')return {clearLegacyChatCache:()=>{}};
      if(name==='@/lib/audio/speech-playback')return {SpeechPlayback:class{cancel(){}}};
      if(name==='@/lib/api/client')return {api:{postAIChat:()=>reply}};
      if(name==='@/types/ai')return {ResponseType:{REFUSAL:'REFUSAL'}};
      return {};
    }};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/app/app/chat/page.tsx',import.meta.url),'utf8'),
    {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
  const tree=context.exports.default(); effects.forEach(effect=>effect());
  const flatten=node=>Array.isArray(node)?node.flatMap(flatten):node&&typeof node==='object'?[node,...flatten(node.props?.children)]:[];
  const example=flatten(tree).find(node=>node.type==='button'&&node.props?.onClick&&!node.props?.title);
  assert.ok(example);
  const pending=example.props.onClick();
  assert.equal(states[4].length,1);
  listeners.get('medguide-session')();
  assert.equal(states[4].length,0);
  resolveReply({success:true,data:{conversation_id:'SYN-previous-account',message:'SYN private reply',sources:[],language:'en'}});
  await pending;
  assert.equal(states[4].length,0);
  assert.equal(states[3],undefined);
});
