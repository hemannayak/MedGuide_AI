import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const code=ts.transpileModule(fs.readFileSync(new URL('../src/lib/auth/sign-out.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function load(fetcher, token='SYN-token') {
 const exports={};let cleared=false;
 vm.runInNewContext(code,{exports,require:(name)=>name.includes('config')?{API_BASE_URL:'https://example.invalid/api/v1'}:{getSessionToken:()=>token,clearSession:()=>{cleared=true;}},fetch:fetcher,AbortController,setTimeout,clearTimeout});
 return {run:exports.signOutSession,cleared:()=>cleared};
}
test('signout sends actual credential and clears local state',async()=>{
 let request;const h=load(async(url,options)=>{request={url,...options};return {ok:true,status:200};});
 assert.equal(await h.run(),true);assert.equal(h.cleared(),true);
 assert.equal(request.headers.Authorization,'Bearer SYN-token');assert.equal(request.method,'POST');
});
test('offline signout clears device without claiming server revocation',async()=>{
 const h=load(async()=>{throw Error('offline');});assert.equal(await h.run(),false);assert.equal(h.cleared(),true);
});
test('already invalid credentials are treated as signed out',async()=>{
 const h=load(async()=>({ok:false,status:401}));assert.equal(await h.run(),true);assert.equal(h.cleared(),true);
});
