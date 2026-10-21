import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
const key = (id: string) => `medguide.guide.v1.${id.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
export async function hasSeenGuide(id: string) {
  return (Platform.OS === 'web' ? window.localStorage.getItem(key(id)) : await SecureStore.getItemAsync(key(id))) === 'seen';
}
export async function finishGuide(id: string) {
  if (Platform.OS === 'web') window.localStorage.setItem(key(id), 'seen');
  else await SecureStore.setItemAsync(key(id), 'seen');
}
