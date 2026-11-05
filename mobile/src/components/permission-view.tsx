import { useEffect, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { AudioModule } from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { Brand, Button, palette } from './brand-ui';
import { VoiceMicWaveSvg, PrescriptionScannerSvg, MedicalShieldSvg } from './illustrations';
import { allowReminders, reminderPermissionStatus } from '../lib/notifications';

/** The workbench never requests OS access. Native actions always use system dialogs. */
export function PermissionView({ preview = false, onContinue, onConsent }: { preview?: boolean; onContinue: () => void; onConsent: () => void }) {
  const [mic, setMic] = useState('Not checked');
  const [camera, setCamera] = useState('Not checked');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notifications,setNotifications]=useState('Not requested');
  useEffect(() => {
    if (preview) return;
    let active = true;
    void Promise.all([AudioModule.getRecordingPermissionsAsync(), ImagePicker.getCameraPermissionsAsync(),reminderPermissionStatus()]).then(([m, c,n]) => {
      if (active) { setMic(m.granted ? 'Allowed' : 'Not allowed'); setCamera(c.granted ? 'Allowed' : 'Not allowed');setNotifications(n); }
    }).catch(() => { if (active) setError('Could not check device permissions. You can continue and try later.'); });
    return () => { active = false; };
  }, [preview]);
  async function allow(kind: 'microphone' | 'camera') {
    if (preview) { setError('Preview only. Android displays its own permission dialog in the installed app.'); return; }
    setBusy(true); setError('');
    try {
      const result = kind === 'microphone' ? await AudioModule.requestRecordingPermissionsAsync() : await ImagePicker.requestCameraPermissionsAsync();
      (kind === 'microphone' ? setMic : setCamera)(result.granted ? 'Allowed' : 'Not allowed');
      if (!result.granted) setError(result.canAskAgain ? 'Access declined. You can keep using text and choose a photo instead.' : 'Access is blocked. You can change it in phone settings.');
    } catch { setError('Permission could not be requested. Try again or continue without it.'); }
    finally { setBusy(false); }
  }
  return <ScrollView contentContainerStyle={{ padding: 22, gap: 20, backgroundColor: palette.cream, flexGrow: 1 }}>
    <Brand /><Text accessibilityRole="header" style={{ fontSize: 28, color: palette.ink, fontWeight: '700' }}>Your phone. Your choices.</Text>
    <Text style={{ color: palette.muted, fontSize: 16, lineHeight: 24 }}>Choose what to enable. None of these permissions is required to read or type. You can decide later.</Text>
    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 24, gap: 14 }}><VoiceMicWaveSvg size={72} /><Text>Microphone · {mic}</Text><Text>For recording a question after you choose Record. This does not start listening.</Text><Button title="Allow microphone" disabled={busy} onPress={() => void allow('microphone')} /></View>
    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 24, gap: 14 }}><PrescriptionScannerSvg size={72} /><Text>Camera · {camera}</Text><Text>For taking a prescription photo. You can also select an existing photo.</Text><Button title="Allow camera" disabled={busy} onPress={() => void allow('camera')} /></View>
    <Text>Choosing an existing image uses the system picker. We do not ask for access to your entire photo library.</Text>
    <View style={{backgroundColor:'white',padding:20,borderRadius:24,gap:14}}><Text>Medication notifications · {notifications}</Text><Text>Optional reminders from saved, verified medicine schedules. Permission alone does not create reminders. Choose Enable reminders in Care records when ready.</Text><Button title="Allow medication notifications" disabled={busy} onPress={()=>{if(preview){setError('Preview only. Notification permission is available in the installed phone app.');return;}setBusy(true);setError('');void allowReminders().then(()=>setNotifications('Allowed')).catch(e=>{setNotifications('Not enabled');setError(e instanceof Error?e.message:'Notifications are unavailable. You can continue.');}).finally(()=>setBusy(false));}}/></View>
    <MedicalShieldSvg size={48} /><Button title="Review AI and speech data choices" variant="secondary" onPress={onConsent} />
    <Text>Device permission does not grant consent to AI or speech processing. Review those choices separately.</Text>
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    {!preview ? <Button title="Open phone permission settings" variant="quiet" onPress={() => void Linking.openSettings().catch(() => setError('Open MedGuide permissions from your phone settings.'))} /> : null}
    <Button title="Continue without granting access" onPress={onContinue} />
  </ScrollView>;
}
