import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
const ts=createRequire(import.meta.url)('typescript');
const source=readFileSync(new URL('../src/components/voice/med-voice.tsx',import.meta.url),'utf8');
function harness({denied=false,result={success:false,message:'SYN unavailable'}}={}){
 let index=0,recorder;const values=[],transcripts=[],uploads=[];let stops=0;
 const react={useState:initial=>{const slot=index++;if(!(slot in values))values[slot]=initial;return [values[slot],value=>values[slot]=value];},useRef:initial=>{const slot=index++;if(!(slot in values))values[slot]={current:initial};return values[slot];},useEffect:()=>{}};
 class Recorder{constructor(){recorder=this;this.mimeType='audio/webm;codecs=opus';this.state='inactive';}start(){this.state='recording';}async stop(){this.state='inactive';this.ondataavailable({data:new Blob(['SYN audio'],{type:this.mimeType})});await this.onstop();}}
 const context={exports:{},Blob,MediaRecorder:Recorder,navigator:{mediaDevices:{getUserMedia:async()=>{if(denied)throw Error('denied');return {getTracks:()=>[{stop:()=>stops++}]};}}},require:name=>{
  if(name==='react')return react;
  if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
  if(name==='@/lib/i18n/context')return {useLanguage:()=>({language:'te'})};
  if(name==='@/lib/api/client')return {api:{speechSTT:async(blob)=>{uploads.push(blob);return result;}}};
  return {};
 }};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
 const render=()=>{index=0;return context.exports.MedVoice({onTranscription:text=>transcripts.push(text)});};
 const button=tree=>tree.props.children.find(child=>child?.type==='button');
 return {start:async()=>{button(render()).props.onClick();await new Promise(setImmediate);},finish:()=>recorder.stop(),values,transcripts,uploads,get stops(){return stops;}};
}
test('microphone denial never invents a transcript',async()=>{const h=harness({denied:true});await h.start();assert.equal(h.values[0],'error');assert.equal(h.transcripts.length,0);assert.equal(h.uploads.length,0);});
test('STT failure never submits synthetic symptoms and releases microphone',async()=>{const h=harness();await h.start();await h.finish();assert.equal(h.values[0],'error');assert.equal(h.transcripts.length,0);assert.equal(h.stops,1);});
test('successful recording preserves actual codec and only returns real transcript',async()=>{const h=harness({result:{success:true,data:{transcript:'SYN recognized speech'}}});await h.start();await h.finish();assert.equal(h.uploads[0].type,'audio/webm;codecs=opus');assert.deepEqual(h.transcripts,['SYN recognized speech']);assert.equal(h.stops,1);});
