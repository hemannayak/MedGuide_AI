import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
const ts=createRequire(import.meta.url)('typescript');
function runLayout(route,ready,token){
 const effects=[],redirects=[];
 const context={exports:{},require:name=>{
  if(name==='react')return {useEffect:fn=>effects.push(fn),useSyncExternalStore:(_sub,snapshot)=>snapshot.name==='getSessionToken'?token:ready,useState:value=>[value,()=>{}]};
  if(name==='@/lib/i18n/context')return {useLanguage:()=>({tr:text=>text})};
  if(name==='react/jsx-runtime')return {jsx:()=>null,jsxs:()=>null};
  if(name==='next/navigation')return {usePathname:()=>`/${route}/profile`,useRouter:()=>({replace:path=>redirects.push(path)})};
  if(name==='@/lib/auth/session')return {getSessionToken:function getSessionToken(){return token;}};
  if(name==='@/lib/api/client')return {api:{getCurrentAccount:async()=>({success:true,data:{role:'HEALTHCARE_WORKER'}})}};
  return {};
 }};
 const source=readFileSync(new URL(`../src/app/${route}/layout.tsx`,import.meta.url),'utf8');
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
 context.exports.default({children:null});for(const effect of effects)effect();return redirects;
}
for(const route of ['app','hcw']){
 test(`${route}: server hydration never redirects before browser session is ready`,()=>assert.equal(runLayout(route,false,null).length,0));
 test(`${route}: ready signed-out session redirects to login`,()=>assert.match(runLayout(route,true,null)[0],/^\/login\?redirect=/));
 test(`${route}: ready signed-in session is preserved`,()=>assert.equal(runLayout(route,true,'SYN-token').length,0));
}
