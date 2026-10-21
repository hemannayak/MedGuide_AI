import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const ts=createRequire(import.meta.url)('typescript');
function harness(mock=true,response={success:false,message:"SYN unavailable"}){const entries=new Map();let token='synthetic-session';const ctx={exports:{},window:{},sessionStorage:{getItem:k=>entries.get(k)||null,setItem:(k,v)=>entries.set(k,v)},require:n=>n==='@/lib/api/client'?{api:{updatePatientProfile:async data=>{entries.set('SYN-request',data);return response;}}}:n.includes('config')?{isMockMode:()=>mock}:{getSessionToken:()=>token},Date};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/lib/profile/setup.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,ctx);return {...ctx.exports,entries,setToken:v=>{token=v;}};}
test('sample setup belongs to its session and never leaks into another session',async()=>{const h=harness();await h.saveSetupProfile({full_name:'Synthetic User'});assert.equal(h.readSampleProfile().full_name,'Synthetic User');h.setToken('different-session');assert.equal(h.readSampleProfile(),null);});
test('live mode and signed-out setup never fake successful profile saves',async()=>{await assert.rejects(harness(false).saveSetupProfile({full_name:'Synthetic'}),/SYN unavailable/);const h=harness();h.setToken(null);await assert.rejects(h.saveSetupProfile({full_name:'Synthetic'}),/sign in/);});

test('live setup sends only display name and language to the existing API',async()=>{const h=harness(false,{success:true,data:{id:'SYN',user_id:'SYN-user',display_name:'Test',preferred_language:'te',created_at:'2026-10-15'}});await h.saveSetupProfile({full_name:' Test ',primary_language:'te',known_allergies:['ignored']});assert.equal(JSON.stringify(h.entries.get('SYN-request')),JSON.stringify({display_name:'Test',preferred_language:'te'}));assert.equal(h.entries.has('medguide_sample_setup'),false);});
test('invalid setup never submits a profile',async()=>{const h=harness(false);await assert.rejects(h.saveSetupProfile({full_name:'   '}),/display name/);await assert.rejects(h.saveSetupProfile({full_name:'Test',primary_language:'xx'}),/Choose/);assert.equal(h.entries.has('SYN-request'),false);});
