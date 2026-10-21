import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
const key='medguide.intro.v1';
export async function introSeen(){return (Platform.OS==='web'?window.localStorage.getItem(key):await SecureStore.getItemAsync(key))==='seen';}
export async function finishIntro(){if(Platform.OS==='web')window.localStorage.setItem(key,'seen');else await SecureStore.setItemAsync(key,'seen');}
