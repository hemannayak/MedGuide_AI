import { ScrollView } from 'react-native';
import { SpokenConsentCard } from '../components/spoken-consent-card';
import { router } from 'expo-router';
import { PermissionView } from '../components/permission-view';
export default function PermissionsScreen() {
  return <ScrollView contentContainerStyle={{flexGrow:1}}><SpokenConsentCard/><PermissionView onContinue={() => router.replace('/home')} onConsent={() => router.push('/consent')} /></ScrollView>;
}
