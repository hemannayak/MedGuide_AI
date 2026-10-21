import { router } from 'expo-router';
import { PermissionView } from '../components/permission-view';
export default function PermissionsScreen() {
  return <PermissionView onContinue={() => router.replace('/home')} onConsent={() => router.push('/consent')} />;
}
