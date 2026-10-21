const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const assert=require('node:assert/strict');
const test=require('node:test');
function harness(status=200) {
  const saved=new Map();const calls=[];
  const storage={getItemAsync:async key=>saved.get(key),setItemAsync:async(key,value)=>saved.set(key,value),deleteItemAsync:async key=>saved.delete(key)};
  const context={exports:{},__DEV__:false,process:{env:{EXPO_PUBLIC_API_BASE_URL:'https://synthetic.example/api/v1'}},AbortController,FormData,setTimeout,clearTimeout,
    require:name=>name==='react-native'?{Platform:{OS:'android'}}:storage,fetch:async(url,options)=>{calls.push({url,options});return {status,ok:status===200,json:async()=>({success:true,data:url.endsWith('/login')?{access_token:'SYN-token'}:{message:'SYN-response'}})};}};
  vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/api.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
  return {api:context.exports,saved,calls,context};
}
test('login stores token securely and chat uses the shared API contract',async()=>{
  const h=harness();await h.api.signIn(' SYN@example.invalid ','SYN-password');
  await h.api.sendChat('SYN concern','te','SYN-conversation');
  assert.equal(h.calls[1].options.headers.Authorization,'Bearer SYN-token');
  assert.equal(h.calls[1].url,'https://synthetic.example/api/v1/ai/chat');
  assert.deepEqual(JSON.parse(h.calls[1].options.body),{message:'SYN concern',language:'te',conversation_id:'SYN-conversation'});
  await h.api.signOut();assert.equal(h.saved.size,0);
});
test('expired sessions are cleared and errors never become fake answers',async()=>{
  const h=harness(401);h.saved.set('medguide-session','SYN-token');
  await assert.rejects(()=>h.api.sendChat('SYN concern','en'),/sign in again/);
  assert.equal(h.saved.size,0);
});
test('release configuration rejects insecure HTTP',async()=>{
  const h=harness();h.context.process.env.EXPO_PUBLIC_API_BASE_URL='http://synthetic.example/api/v1';
  await assert.rejects(()=>h.api.sendChat('SYN concern','en'),/HTTPS/);
  assert.equal(h.calls.length,0);
});

test('speech raw responses do not require the care API envelope',async()=>{
  const h=harness();h.context.fetch=async()=>({status:200,ok:true,json:async()=>({audio_base64:'U1lO',format:'mp3'})});
  assert.equal(await h.api.synthesizeSpeech('SYN reply','hi'),'U1lO');
});

test('speech provider errors stay visible rather than becoming fake audio',async()=>{
  const h=harness();h.context.fetch=async()=>({status:403,ok:false,json:async()=>({detail:'Consent required: SPEECH_PROCESSING'})});
  await assert.rejects(()=>h.api.synthesizeSpeech('SYN reply','te'),/Consent required/);
});

test('multipart audio keeps boundary ownership and selected language',async()=>{
  const h=harness();class NativeFormData {constructor(){this.entries=[];}append(name,value){this.entries.push([name,value]);}}
  h.context.FormData=NativeFormData;
  h.context.fetch=async(url,options)=>{h.calls.push({url,options});return {status:200,ok:true,json:async()=>({transcript:'SYN recognized'})};};
  assert.equal(await h.api.transcribeRecording('file://SYN.m4a','te'),'SYN recognized');
  const call=h.calls[0];assert.equal(call.url,'https://synthetic.example/api/v1/speech/stt');
  assert.equal(call.options.headers['Content-Type'],undefined);
  assert.equal(call.options.body.entries[0][1].type,'audio/mp4');
  assert.equal(call.options.body.entries[1][1],'te');
});

test('patient registration uses the shared backend and never sends an elevated role',async()=>{
  const h=harness();await h.api.registerPatient(' SYN@example.invalid ','SyntheticTestOnly123!',' SYN patient ','te');
  assert.equal(h.calls[0].url,'https://synthetic.example/api/v1/auth/register');
  assert.deepEqual(JSON.parse(h.calls[0].options.body),{login_identifier:'SYN@example.invalid',password:'SyntheticTestOnly123!',display_name:'SYN patient',preferred_language:'te'});
  assert.equal(h.saved.size,0); // creation alone never grants a session
});

test('invalid registration and rejected backend response never create a session',async()=>{
  const h=harness();await assert.rejects(h.api.registerPatient('id','short',' ','en'));
  await assert.rejects(h.api.registerPatient('SYN@example.invalid','SyntheticTestOnly123!','SYN','xx'));
  assert.equal(h.calls.length,0);
  const failed=harness(409);await assert.rejects(failed.api.registerPatient('SYN@example.invalid','SyntheticTestOnly123!','SYN','en'));
  assert.equal(failed.saved.size,0);
});
