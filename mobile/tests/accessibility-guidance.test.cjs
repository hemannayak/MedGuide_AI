const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const ts = require('typescript');
const {readFileSync} = require('node:fs');
function load(path, requireMock) {
  const context = {exports:{}, require:requireMock};
  vm.runInNewContext(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
  return context.exports;
}
test('explicit accessibility phrases match without swallowing medical questions', () => {
  const {isGuidanceCommand} = load('src/lib/accessibility-command.ts',()=>({}));
  for (const text of [' MedGuide help! ', 'med guide help', 'मेडगाइड मदद', 'మెడ్‌గైడ్ సహాయం']) assert.equal(isGuidanceCommand(text),true);
  for (const text of ['I need help with fever', 'MedGuide help my child is unwell', '', 'help']) assert.equal(isGuidanceCommand(text),false);
});
function audioHarness() {
  let resolveVoices; const spoken=[],alerts=[];
  const Speech={stop:async()=>{},getAvailableVoicesAsync:()=>new Promise(r=>{resolveVoices=r;}),speak:(text,options)=>spoken.push({text,options})};
  const api=load('src/lib/audio-guide.ts',name=>name==='expo-speech'?Speech:name==='react-native'?{Alert:{alert:(...a)=>alerts.push(a)},AppState:{addEventListener:()=>{}}}:{});
  return {api,spoken,alerts,voices:v=>resolveVoices(v)};
}
test('cancelling pending voice lookup prevents late speech',async()=>{
 const h=audioHarness();let ended=0;h.api.speakGuidance('hello','en',undefined,()=>ended++);h.api.stopGuidance();h.voices([{language:'en-IN',identifier:'en'}]);await new Promise(setImmediate);assert.equal(h.spoken.length,0);assert.equal(ended,1);
});
test('missing Telugu voice reports failure instead of simulated playback',async()=>{
 const h=audioHarness();let ended=0;h.api.speakGuidance('hello','te',undefined,()=>ended++);h.voices([{language:'en-IN',identifier:'en'}]);await new Promise(setImmediate);assert.equal(h.spoken.length,0);assert.equal(h.alerts.length,1);assert.equal(ended,1);
});
test('matched Hindi device voice starts and completes callbacks',async()=>{
 const h=audioHarness();let started=0,ended=0;h.api.speakGuidance('नमस्ते','hi',()=>started++,()=>ended++);h.voices([{language:'hi-IN',identifier:'hi'}]);await new Promise(setImmediate);assert.equal(h.spoken[0].options.voice,'hi');h.spoken[0].options.onStart();h.spoken[0].options.onDone();assert.equal(started,1);assert.equal(ended,1);
});
