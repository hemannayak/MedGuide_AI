"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { PatientProfile } from "@/types/user";
export function usePatientProfile(){
 const [profile,setProfile]=useState<PatientProfile|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{let active=true;api.getPatientProfile().then(result=>{if(!active)return;if(result.success&&result.data)setProfile(result.data);else setError('Your profile could not be loaded. Please refresh to try again.');}).catch(()=>{if(active)setError('We could not connect to your profile. Please try again later.');}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 return {profile,loading,error};
}
