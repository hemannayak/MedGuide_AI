import { Button, palette } from '../../components/brand-ui';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { canConfirmMedication, confirmMedication, correctOCRMedication, getPrescription, Medication, PrescriptionDetail } from '../../lib/care';
import { PrescriptionScannerSvg } from '../../components/illustrations';

export default function PrescriptionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PrescriptionReview key={id} id={id} />;
}

function PrescriptionReview({ id }: { id: string }) {
  const [record, setRecord] = useState<PrescriptionDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState('');
  const [editing,setEditing]=useState<string|null>(null);
  const [draft,setDraft]=useState({medicine_name:'',dosage:'',instructions:''});
  const [checkedCorrection,setCheckedCorrection]=useState(false);
  const generation = useRef(0);
  const savingRef = useRef(false);
  useEffect(() => {
    const requestGeneration = generation;
    const current = ++generation.current;
    Promise.resolve().then(() => getPrescription(id)).then(result => {
      if (current === generation.current) setRecord(result);
    }).catch(failure => {
      if (current === generation.current) setError(failure instanceof Error ? failure.message : 'Prescription could not load.');
    }).finally(() => { if (current === generation.current) setLoading(false); });
    return () => { requestGeneration.current++; };
  }, [id, revision]);
  async function verify(med: Medication) {
    if (savingRef.current) return;
    savingRef.current = true; setSaving(med.id); setError('');
    const current = generation.current;
    try {
      const updated = await confirmMedication(med, Boolean(confirmed[med.id]));
      if (current === generation.current) {
        setRecord(value => value && ({ ...value, medications: value.medications.map(item => item.id === updated.id ? updated : item) }));
        setConfirmed(value => ({ ...value, [med.id]: false }));
      }
    } catch (failure) {
      if (current === generation.current) setError(failure instanceof Error ? failure.message : 'Confirmation failed.');
    } finally {
      savingRef.current = false;
      if (current === generation.current) setSaving('');
    }
  }
  async function correct(med:Medication){
    if(savingRef.current)return;
    savingRef.current=true;setSaving(med.id);setError('');
    const current=generation.current;
    try{
      const updated=await correctOCRMedication(med,draft,checkedCorrection);
      if(current===generation.current){setRecord(value=>value&&({...value,medications:value.medications.map(item=>item.id===updated.id?updated:item)}));setEditing(null);setConfirmed(value=>({...value,[med.id]:false}));}
    }catch(failure){if(current===generation.current)setError(failure instanceof Error?failure.message:'Correction could not save.');}
    finally{savingRef.current=false;if(current===generation.current)setSaving('');}
  }
  return <ScrollView contentContainerStyle={{ padding: 18, gap: 14, backgroundColor: palette.cream, flexGrow: 1 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <PrescriptionScannerSvg size={40} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: palette.ink }}>Review Prescription Details</Text>
        <Text style={{ fontSize: 11, color: palette.muted }}>Compare extracted OCR output against the paper prescription.</Text>
      </View>
    </View>
    {loading ? <Text>Loading prescription…</Text> : null}
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    <Button disabled={loading || Boolean(saving)} title="Reload prescription" onPress={() => { setLoading(true); setError(''); setRecord(null); setConfirmed({}); setRevision(value => value + 1); }} />
    {!loading && record ? <>
      <Text>Prescription date: {record.prescribed_date || 'Not provided'}</Text>
      <Text>Document status: {record.status}</Text>
      <Text style={{ fontSize: 20 }}>Extracted text — may contain errors</Text>
      {!record.ocr_results.length ? <Text>No OCR result available. Seek human review of the original prescription.</Text> : record.ocr_results.map(ocr => <View key={ocr.id} style={{ gap: 8 }}>
        <Text>Processing status: {ocr.status}</Text>
        <Text selectable>{ocr.raw_text || 'No readable text found. Seek human review.'}</Text>
      </View>)}
      {!record.medications.length ? <Text>No medication details extracted. Ask a healthcare worker to review the original.</Text> : record.medications.map(med => <View key={med.id} style={{ padding: 16, borderWidth: 1, borderRadius: 12, gap: 8 }}>
        <Text style={{ fontWeight: '700' }}>{med.medicine_name}</Text>
        <Text>Recorded dosage: {med.dosage || 'Not recorded'}</Text>
        <Text>Recorded instructions: {med.instructions || 'Not recorded'}</Text>
        <Text>Verification: {med.verification_status}</Text>
        {med.verification_status==='PENDING'?<Button variant="secondary" title="Correct OCR details from original" disabled={Boolean(saving)} onPress={()=>{setEditing(med.id);setDraft({medicine_name:med.medicine_name,dosage:med.dosage||'',instructions:med.instructions||''});setCheckedCorrection(false);setConfirmed(value=>({...value,[med.id]:false}));}}/>:null}
        {editing===med.id?<View style={{gap:10}}>
          <Text>Copy only what is written on the original. Ask a pharmacist or healthcare worker if it is unclear. Saving does not verify or schedule this medicine.</Text>
          {(['medicine_name','dosage','instructions']as const).map(field=><View key={field}><Text>{field==='medicine_name'?'Medicine name':field==='dosage'?'Dosage from prescription':'Instructions from prescription'}</Text><TextInput accessibilityLabel={`Correct ${field}`} value={draft[field]} editable={!saving} maxLength={field==='instructions'?2000:field==='dosage'?100:255} onChangeText={text=>{setDraft(value=>({...value,[field]:text}));setCheckedCorrection(false);}} style={{borderWidth:1,borderColor:palette.line,padding:14,borderRadius:12,backgroundColor:palette.white}}/></View>)}
          <Text>I compared these corrections with my original prescription.</Text>
          <Switch accessibilityLabel="Corrections match original prescription" value={checkedCorrection} disabled={Boolean(saving)} onValueChange={setCheckedCorrection}/>
          <Button title="Save pending correction" disabled={Boolean(saving)||!checkedCorrection||!draft.medicine_name.trim()||!draft.dosage.trim()} onPress={()=>void correct(med)}/>
          <Button variant="quiet" title="Cancel correction" disabled={Boolean(saving)} onPress={()=>setEditing(null)}/>
        </View>:null}
        {canConfirmMedication(med)&&editing!==med.id ? <>
          <Text>I checked the medicine name, dosage and any instructions against my original prescription and they match.</Text>
          <Switch accessibilityLabel={`Details match the original prescription for ${med.medicine_name}`} disabled={Boolean(saving)} value={Boolean(confirmed[med.id])} onValueChange={value => setConfirmed(previous => ({ ...previous, [med.id]: value }))} />
          <Button title={saving === med.id ? 'Saving confirmation…' : 'Confirm matching details'} disabled={Boolean(saving) || !confirmed[med.id]} onPress={() => void verify(med)} />
        </> : med.verification_status !== 'VERIFIED' ? <Text>These details need human review. Incomplete extraction cannot be confirmed here.</Text> : <Text>Details have been confirmed. This status does not establish clinical correctness.</Text>}
      </View>)}
    </> : null}
  </ScrollView>;
}
