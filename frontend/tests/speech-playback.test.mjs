import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
const ts=createRequire(import.meta.url)('typescript');
const context={exports:{}};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/lib/audio/speech-playback.ts',import.meta.url),'utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
}).outputText,context);
const {SpeechPlayback,splitSpeechText}=context.exports;

test('long multilingual speech stays within provider limits without losing words',()=>{
  const text=('Hello. నమస్కారం. नमस्ते. ').repeat(180).trim();
  const segments=splitSpeechText(text);
  assert.ok(segments.length>1);
  assert.ok(segments.every(segment=>segment.length<=1800));
  assert.equal(segments.join(' '),text);
});

test('cancelled pending synthesis never starts late playback',async()=>{
  const player=new SpeechPlayback();let finish,played=0;
  const pending=player.speak('synthetic',()=>new Promise(resolve=>finish=resolve),()=>{played++;},()=>{});
  player.cancel();finish('synthetic audio');await pending;
  assert.equal(played,0);
});

test('segments play in order and cancellation prevents further synthesis',async()=>{
  const player=new SpeechPlayback();let calls=0,paused=0,audio;
  const pending=player.speak('word '.repeat(800),async()=>{calls++;return 'synthetic';},()=>{
    audio={pause(){paused++;},play:async()=>{},onended:null,onerror:null};return audio;
  },()=>{});
  await new Promise(setImmediate);
  assert.equal(calls,1);
  audio.onended();await new Promise(setImmediate);
  assert.equal(calls,2);
  player.cancel();await pending;
  assert.equal(paused,1);
  assert.equal(calls,2);
});
