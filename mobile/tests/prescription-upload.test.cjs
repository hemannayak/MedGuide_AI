const test=require('node:test');const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');const vm=require('node:vm');const ts=require('typescript');
function harness(result={prescription_id:'11111111-2222-3333-4444-555555555555',verification_status:'PENDING'}) {
 const calls=[];class Form{constructor(){this.entries=[];}append(...args){this.entries.push(args);}}
 const context={exports:{},FormData:Form,require:()=>({request:async(...args)=>{calls.push(args);if(result instanceof Error)throw result;return result;}})};
 vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/prescription-upload.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
 return {api:context.exports,calls};
}
const image={uri:'file:///SYN-prescription.png',mimeType:'image/png',fileSize:512,fileName:'SYN-private-name.png'};
test('upload requires explicit permission and does not send before confirmation',async()=>{
 const h=harness();await assert.rejects(h.api.uploadPrescription(image,false));assert.equal(h.calls.length,0);
});
test('unsupported, remote, empty, unknown-size and oversized images never reach server',async()=>{
 const h=harness();for(const changes of [{mimeType:'image/heic'},{uri:'https://example.invalid/private.png'},{fileSize:0},{fileSize:undefined},{fileSize:10*1024*1024+1},{fileSize:NaN}])await assert.rejects(h.api.uploadPrescription({...image,...changes},true));
 assert.equal(h.calls.length,0);
});
test('valid image uses existing multipart route without original filename or extra metadata',async()=>{
 const h=harness();const result=await h.api.uploadPrescription({...image,exif:{GPS:'SYN'}},true);
 assert.equal(result.verification_status,'PENDING');assert.equal(h.calls[0][0],'/prescriptions/upload');assert.equal(h.calls[0][2],'POST');
 const fields=h.calls[0][1].entries;assert.equal(fields.length,1);assert.equal(fields[0][0],'file');
 assert.deepEqual(JSON.parse(JSON.stringify(fields[0][1])),{uri:image.uri,name:'prescription.png',type:'image/png'});
});
test('maximum allowed size passes validation',()=>harness().api.validateUploadImage({...image,fileSize:10*1024*1024}));
test('incomplete backend response reports ambiguity rather than navigating to a fake record',async()=>{
 await assert.rejects(harness({prescription_id:'../patients/me'}).api.uploadPrescription(image,true),/Check your care records/);
});
test('provider errors remain failures and do not mutate the selected image',async()=>{
 const h=harness(new Error('SYN OCR unavailable'));await assert.rejects(h.api.uploadPrescription(image,true),/OCR unavailable/);assert.equal(image.uri,'file:///SYN-prescription.png');
});
