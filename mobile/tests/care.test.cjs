const test=require('node:test');const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');const vm=require('node:vm');const ts=require('typescript');
function harness() {
  const calls=[];const context={exports:{},require:()=>({request:async(...args)=>{calls.push(args);return {display_name:'SYN Patient',preferred_language:'te'};}})};
  vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/care.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
  return {api:context.exports,calls};
}
test('profile changes use PATCH and only intended account fields',async()=>{
  const h=harness();await h.api.updateProfile(' SYN Patient ','te');
  assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0])),['/patients/me',{display_name:'SYN Patient',preferred_language:'te'},'PATCH']);
});

test('language selection persists only a supported language to the patient profile',async()=>{
  const h=harness();await h.api.updatePreferredLanguage('te');
  assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0])),['/patients/me',{preferred_language:'te'},'PATCH']);
  assert.throws(()=>h.api.updatePreferredLanguage('unsupported'));
  assert.equal(h.calls.length,1);
});
test('blank and oversized names never reach the backend',()=>{
  const h=harness();assert.throws(()=>h.api.updateProfile('  ','en'));
  assert.throws(()=>h.api.updateProfile('a'.repeat(256),'en'));assert.equal(h.calls.length,0);
});
test('care reads use authenticated patient-owned resource routes',async()=>{
  const h=harness();await h.api.getMedications();await h.api.getFollowUps();await h.api.getPrescriptions();
  assert.deepEqual(h.calls.map(item=>item[0]),['/medications','/follow-ups','/prescriptions']);
});

test('timeline requests explicit pages and rejects invalid page input before HTTP',async()=>{
  const h=harness();await h.api.getTimeline(2);
  assert.equal(h.calls[0][0],'/timeline?page=2&page_size=20');
  for(const page of [0,-1,1.5,NaN]) assert.throws(()=>h.api.getTimeline(page));
  assert.equal(h.calls.length,1);
});
const medicationId='11111111-2222-3333-4444-555555555555';
const pending={id:medicationId,medicine_name:'SYN medicine',dosage:'SYN strength',verification_status:'PENDING'};
test('prescription detail uses a valid owned-resource reference and rejects path injection',async()=>{
  const h=harness();await h.api.getPrescription(medicationId);
  assert.equal(h.calls[0][0],`/prescriptions/${medicationId}`);
  assert.throws(()=>h.api.getPrescription('../patients/me'));assert.equal(h.calls.length,1);
});
test('verification never reaches API without explicit original-prescription review',()=>{
  const h=harness();assert.throws(()=>h.api.confirmMedication(pending,false));assert.equal(h.calls.length,0);
});
test('incomplete or already verified medication is not eligible for confirmation',()=>{
  const h=harness();
  for(const changes of [{dosage:''},{dosage:'Unspecified'},{medicine_name:'Unknown Medicine'},{verification_status:'VERIFIED'}]) {
    const med={...pending,...changes};assert.equal(h.api.canConfirmMedication(med),false);
    assert.throws(()=>h.api.confirmMedication(med,true));
  }
  assert.equal(h.calls.length,0);
});
test('explicit review submits only the existing verification action',async()=>{
  const h=harness();await h.api.confirmMedication(pending,true);
  assert.equal(h.calls[0][0],`/medications/${medicationId}/verify`);
  assert.equal(h.calls[0][1],undefined);assert.equal(h.calls[0][2],'POST');
});
