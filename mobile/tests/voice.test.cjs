const test=require('node:test');const assert=require('node:assert/strict');
const ts=require('typescript');const vm=require('node:vm');const {readFileSync}=require('node:fs');
function harness({consent=true,permission=true,transcribe=async()=> 'SYN transcript'}={}) {
  let slot=0,background;const values=[],cleanups=[],transcripts=[];let recordings=0,deleted=0,permissions=0;
  const recorder={isRecording:false,uri:'file://SYN.m4a',prepareToRecordAsync:async()=>{},record(){recordings++;this.isRecording=true;},stop:async()=>{recorder.isRecording=false;}};
  class File{constructor(uri){this.uri=uri;this.size=32;this.exists=true;}delete(){deleted++;this.exists=false;}}
  const context={exports:{},setTimeout,clearTimeout,require:name=>{
    if(name==='react')return {useRef:value=>{const i=slot++;return values[i]??(values[i]={current:value});},useState:value=>{const i=slot++;if(!(i in values))values[i]=value;return [values[i],next=>values[i]=next];},useCallback:fn=>fn,useEffect:fn=>cleanups.push(fn())};
    if(name==='react-native')return {AppState:{addEventListener:(_,fn)=>{background=fn;return {remove(){}};}}};
    if(name==='expo-audio')return {useAudioRecorder:()=>recorder,RecordingPresets:{HIGH_QUALITY:{}},AudioModule:{requestRecordingPermissionsAsync:async()=>{permissions++;return {granted:permission};}},setAudioModeAsync:async()=>{}};
    if(name==='expo-file-system')return {File,Paths:{cache:'file://cache'}};
    if(name==='../lib/api')return {request:async()=>consent?[{consent_type:'SPEECH_PROCESSING',status:'GRANTED',created_at:'2026-10-11'}]:[],transcribeRecording:transcribe};
    if(name==='../lib/spoken-consent')return {getSpokenChoice:async()=> 'GRANTED'};
    if(name==='../lib/voice')return {};
    throw Error(name);
  }};
  vm.runInNewContext(ts.transpileModule(readFileSync('src/hooks/use-voice.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
  const voice=context.exports.useVoice('te',text=>transcripts.push(text));
  return {voice,values,transcripts,background:()=>background('background'),cleanup:()=>cleanups.forEach(fn=>fn()),releaseRecorder:()=>Object.defineProperty(recorder,'isRecording',{get(){throw Error('Cannot use shared object that was already released');}}),get recordings(){return recordings;},get deleted(){return deleted;},get permissions(){return permissions;}};
}
test('missing speech consent never requests microphone',async()=>{const h=harness({consent:false});await h.voice.start();assert.equal(h.permissions,0);assert.equal(h.recordings,0);assert.equal(h.transcripts.length,0);h.cleanup();});
test('denied microphone never creates a synthetic concern',async()=>{const h=harness({permission:false});await h.voice.start();assert.equal(h.recordings,0);assert.equal(h.transcripts.length,0);h.cleanup();});
test('real transcript is returned for review and local recording is deleted',async()=>{const h=harness();await h.voice.start();await h.voice.stop();assert.deepEqual(h.transcripts,['SYN transcript']);assert.equal(h.deleted,1);h.cleanup();});
test('background cancellation discards late transcript and deletes recording',async()=>{let complete;const h=harness({transcribe:()=>new Promise(resolve=>complete=resolve)});await h.voice.start();const pending=h.voice.stop();await new Promise(setImmediate);h.background();complete('SYN late');await pending;assert.equal(h.transcripts.length,0);assert.equal(h.deleted,1);h.cleanup();});
test('failed transcription leaves no fabricated result and removes audio',async()=>{const h=harness({transcribe:async()=>{throw Error('SYN failed');}});await h.voice.start();await h.voice.stop();assert.equal(h.transcripts.length,0);assert.equal(h.deleted,1);h.cleanup();});
test('cleanup never reads the recorder after Expo releases its native object',()=>{const h=harness();h.releaseRecorder();assert.doesNotThrow(()=>h.cleanup());assert.doesNotThrow(()=>h.voice.cancel());});
