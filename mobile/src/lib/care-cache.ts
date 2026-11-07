import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { digestStringAsync, CryptoDigestAlgorithm } from 'expo-crypto';
import { getStoredToken } from './api';

const prefix='medguide-care-offline-';
const get=async(key:string)=>Platform.OS==='web'?window.sessionStorage.getItem(prefix+key):SecureStore.getItemAsync(prefix+key);
const set=async(key:string,value:string)=>{if(Platform.OS==='web')window.sessionStorage.setItem(prefix+key,value);else await SecureStore.setItemAsync(prefix+key,value);};
const remove=async(key:string)=>{if(Platform.OS==='web')window.sessionStorage.removeItem(prefix+key);else await SecureStore.deleteItemAsync(prefix+key);};
export const cacheEnabled=async()=>await get('enabled')==='yes';
export async function enableCareCache(enabled:boolean){
  if(enabled){await set('enabled','yes');return;}
  await remove('enabled');await remove('index');
  await Promise.all(Array.from({length:96},(_,i)=>remove(String(i))));
}
type Stored={owner:string;resources:Record<string,{data:unknown;savedAt:string}>};
async function owner(){const token=await getStoredToken();return token?digestStringAsync(CryptoDigestAlgorithm.SHA256,token):null;}
async function read():Promise<Stored|null>{
  if(!await cacheEnabled())return null;
  const current=await owner();if(!current)return null;
  const raw=await get('index');if(!raw)return null;
  try{
    const index=JSON.parse(raw);if(index.owner!==current||!Number.isInteger(index.count)||index.count<1||index.count>96)return null;
    const chunks=await Promise.all(Array.from({length:index.count},(_,i)=>get(String(i))));
    if(chunks.some(chunk=>chunk===null))return null;
    const data=JSON.parse(chunks.join('')) as Stored;
    if(!data.resources||typeof data.resources!=='object')return null;
    return data.owner===current&&await owner()===current?data:null;
  }catch{return null;}
}
let writing=Promise.resolve();
async function writeResource(key:string,value:unknown){
  const write=async()=>{
    if(!await cacheEnabled())return;
    const current=await owner();if(!current)return;
    const previous=await read();
    const data:Stored={owner:current,resources:{...previous?.resources,[key]:{data:value,savedAt:new Date().toISOString()}}};
    const characters=Array.from(JSON.stringify(data)),chunks:string[]=[];
    for(let offset=0;offset<characters.length;offset+=400)chunks.push(characters.slice(offset,offset+400).join(''));
    if(chunks.length>96)throw new Error('Offline storage is full. Keep fewer records on this device.');
    await remove('index');
    for(let i=0;i<chunks.length;i++){
      if(await owner()!==current||!await cacheEnabled())return;
      await set(String(i),chunks[i]);
    }
    if(await owner()===current&&await cacheEnabled())await set('index',JSON.stringify({owner:current,count:chunks.length}));
  };
  const result=writing.then(write);writing=result.catch(()=>undefined);return result;
}
export async function loadCareResource<T>(key:string,fetcher:()=>Promise<T>):Promise<{data:T;cachedAt:string|null;cacheWarning?:string}>{
  const current=await owner();
  try{
    const data=await fetcher();
    if(await owner()!==current)throw new Error('Account changed. Sign in again.');
    try{await writeResource(key,data);return{data,cachedAt:null};}catch{return{data,cachedAt:null,cacheWarning:'Records loaded, but the offline copy could not be saved.'};}
  }catch(error){
    // Server rejections (including authorization failures) never use stale data.
    if(!(error instanceof Error)||!['TypeError','AbortError'].includes(error.name))throw error;
    const saved=await read();
    if(!saved||!Object.prototype.hasOwnProperty.call(saved.resources,key)||!saved.resources[key]||typeof saved.resources[key].savedAt!=='string')throw error;
    return{data:saved.resources[key].data as T,cachedAt:saved.resources[key].savedAt};
  }
}
