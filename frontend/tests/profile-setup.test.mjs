import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const ts=createRequire(import.meta.url)('typescript');
function harness(mock=true){const entries=new Map();let token='synthetic-session';const ctx={exports:{},window:{},sessionStorage:{getItem:k=>entries.get(k)||null,setItem:(k,v)=>entries.set(k,v)},require:n=>n.includes('config')?{isMockMode:()=>mock}:{getSessionToken:()=>token},Date};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/lib/profile/setup.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,ctx);return {...ctx.exports,setToken:v=>{token=v;}};}
test('sample setup belongs to its session and never leaks into another session',async()=>{const h=harness();await h.saveSetupProfile({full_name:'Synthetic User'});assert.equal(h.readSampleProfile().full_name,'Synthetic User');h.setToken('different-session');assert.equal(h.readSampleProfile(),null);});
test('live mode and signed-out setup never fake successful profile saves',async()=>{await assert.rejects(harness(false).saveSetupProfile({full_name:'Synthetic'}),/not connected/);const h=harness();h.setToken(null);await assert.rejects(h.saveSetupProfile({full_name:'Synthetic'}),/sign in/);});
