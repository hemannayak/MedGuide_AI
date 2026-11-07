import { request } from './api';
export type SpokenChoice = 'GRANTED' | 'DECLINED' | 'WITHDRAWN' | 'MISSING';
type ConsentRecord = {consent_type:string; status:SpokenChoice; version:string; created_at:string};
export async function getSpokenChoice(): Promise<SpokenChoice> {
 const records=await request<ConsentRecord[]>('/consent');
 return records.filter(r=>r.consent_type==='SPOKEN_GUIDANCE'&&r.version==='1.0').sort((a,b)=>b.created_at.localeCompare(a.created_at))[0]?.status??'MISSING';
}
export async function saveSpokenChoice(enabled:boolean){await request('/consent/spoken-guidance',{enabled},'PUT');}
