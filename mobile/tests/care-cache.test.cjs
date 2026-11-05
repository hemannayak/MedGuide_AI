const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),ts=require('typescript'),{readFileSync}=require('node:fs');
function harness(){
 const values=new Map();let token='SYN-A';
 const storage={getItemAsync:async k=>values.get(k)??null,setItemAsync:async(k,v)=>values.set(k,v),deleteItemAsync:async k=>values.delete(k)};
 const c={exports:{},Error,require:name=>{
 if(name==='react-native')return{Platform:{OS:'android'}};
 if(name==='expo-secure-store')return storage;
 if(name==='expo-crypto')return{CryptoDigestAlgorithm:{SHA256:'SHA256'},digestStringAsync:async(_,v)=>'SYN-hash-'+v};
 if(name==='./api')return{getStoredToken:async()=>token};throw Error(name);
 }};
 vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/care-cache.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,c);
 return{api:c.exports,values,account:v=>token=v};
}
test('private cache is opt-in, session-bound and never substitutes for authorization rejection',async()=>{
 const h=harness(),fetcher=async()=>[{id:'SYN-1'}],offline=async()=>{throw new TypeError('offline');};
 await h.api.loadCareResource('care',fetcher);assert.equal(h.values.size,0);
 await h.api.enableCareCache(true);await h.api.loadCareResource('care',fetcher);
 const result=await h.api.loadCareResource('care',offline);assert.equal(result.data[0].id,'SYN-1');assert.ok(result.cachedAt);
 await assert.rejects(()=>h.api.loadCareResource('care',async()=>{throw Error('Forbidden');}),/Forbidden/);
 h.account('SYN-B');await assert.rejects(()=>h.api.loadCareResource('care',offline),/offline/);
 h.account(null);await assert.rejects(()=>h.api.loadCareResource('care',offline),/offline/);
 await h.api.enableCareCache(false);assert.equal(h.values.size,0);
});
test('cached resource timestamps and pages remain separate; oversized writes report failure',async()=>{
 const h=harness();await h.api.enableCareCache(true);
 await h.api.loadCareResource('care',async()=>['SYN-care']);await h.api.loadCareResource('timeline-1',async()=>['SYN-event']);
 const offline=async()=>{throw new TypeError('offline');};
 assert.equal((await h.api.loadCareResource('care',offline)).data[0],'SYN-care');
 const result=await h.api.loadCareResource('large',async()=>'SYN'.repeat(20000));assert.match(result.cacheWarning,/could not be saved/);
 assert.equal((await h.api.loadCareResource('care',offline)).data[0],'SYN-care');
});
