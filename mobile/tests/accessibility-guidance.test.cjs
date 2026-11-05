const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const ts=require('typescript');
const {readFileSync}=require('node:fs');
function harness(choice='GRANTED',voices=[{language:'en-GB',identifier:'english'}]){
 const spoken=[];let checks=0,stops=0,resolveVoices;
 const speech={stop:async()=>{stops++;},getAvailableVoicesAsync:async()=>{checks++;return typeof voices==='function'?await new Promise(r=>{resolveVoices=r;}):voices;},speak:(text,options)=>spoken.push({text,options})};
 const context={exports:{},setTimeout,Promise,require:n=>n==='expo-speech'?speech:n==='react-native'?{AppState:{addEventListener:()=>{}}}:n==='./spoken-consent'?{getSpokenChoice:async()=>choice}:n==='./api'?{getStoredToken:async()=> 'SYN-session'}:{}};
 vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/audio-guide.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
 return {api:context.exports,spoken,checks:()=>checks,stops:()=>stops,resolve:v=>resolveVoices(v)};
}
const tick=()=>new Promise(setImmediate);
for(const choice of ['MISSING','DECLINED','WITHDRAWN'])test(`no speech engine lookup without affirmative choice: ${choice}`,async()=>{const h=harness(choice);h.api.speakGuidance('private');await tick();assert.equal(h.checks(),0);assert.equal(h.spoken.length,0);assert.equal(h.api.audioSnapshot().phase,choice==='MISSING'?'missing':'declined');});
test('compatible English voice uses its actual locale',async()=>{const h=harness();h.api.speakGuidance('hello');await tick();assert.equal(h.spoken[0].options.language,'en-GB');});
for(const language of ['hi','te'])test(`correct ${language} voice selected`,async()=>{const h=harness('GRANTED',[{language:`${language}-IN`,identifier:language}]);h.api.speakGuidance('SYN text',language);await tick();assert.equal(h.spoken[0].options.voice,language);});
test('unavailable language stays inline with text available',async()=>{const h=harness();h.api.speakGuidance('text','te');await tick();assert.equal(h.spoken.length,0);assert.equal(h.api.audioSnapshot().phase,'unavailable');});
test('cancelled initialization cannot speak later',async()=>{const h=harness('GRANTED',()=>{});h.api.speakGuidance('old');await tick();h.api.stopGuidance();h.resolve([{language:'en-IN',identifier:'en'}]);await tick();assert.equal(h.spoken.length,0);});
test('repeated taps cancel preceding request',async()=>{const h=harness();h.api.speakGuidance('old');h.api.speakGuidance('new');await tick();assert.deepEqual(h.spoken.map(x=>x.text),['new']);});
test('initialization failure reports safe inline error',async()=>{const h=harness();h.api.speakGuidance('text');await tick();h.spoken[0].options.onError();assert.equal(h.api.audioSnapshot().phase,'error');});
