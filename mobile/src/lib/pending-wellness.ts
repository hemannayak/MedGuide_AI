import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
const key='medguide-pending-wellness-v1';
export async function readPending(patientId:string){
 const raw=Platform.OS==='web'?window.sessionStorage.getItem(key):await SecureStore.getItemAsync(key);
 if(!raw)return null;
 const data=JSON.parse(raw);
 return data.patientId===patientId?data.payload:null;
}
export async function writePending(patientId:string,payload:unknown){
 const raw=JSON.stringify({patientId,payload});
 if(Platform.OS==='web')window.sessionStorage.setItem(key,raw);else await SecureStore.setItemAsync(key,raw);
}
export async function clearPending(){
 if(Platform.OS==='web')window.sessionStorage.removeItem(key);else await SecureStore.deleteItemAsync(key);
}
