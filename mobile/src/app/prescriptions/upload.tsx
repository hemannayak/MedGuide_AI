import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Button, palette } from '../../components/brand-ui';
import { uploadPrescription, UploadImage, validateUploadImage } from '../../lib/prescription-upload';
import { PrescriptionScannerSvg, DoctorConsultSvg } from '../../components/illustrations';
import { Language, t } from '../../lib/i18n';
import { speakGuidance, stopGuidance } from '../../lib/audio-guide';

export default function UploadPrescription() {
  const [image, setImage] = useState<UploadImage | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<Language>('en');
  const [speaking, setSpeaking] = useState(false);
  const active = useRef(true);
  const locked = useRef(false);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      stopGuidance();
    };
  }, []);

  function handleAudioGuide() {
    if (speaking) {
      stopGuidance();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      const text = `Upload a prescription. You can take a clear photo of your prescription or choose an image from your device. Our safe OCR tool will read the medicine names. Always verify with your doctor.`;
      speakGuidance(text, lang, () => setSpeaking(true), () => setSpeaking(false));
    }
  }

  async function choose(camera: boolean) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          throw new Error('Camera permission was denied. You can choose an existing image instead.');
        }
        if (!active.current) return;
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
        base64: false,
        exif: false,
      };
      const result = await (camera
        ? ImagePicker.launchCameraAsync(options)
        : ImagePicker.launchImageLibraryAsync(options));
      if (!active.current || result.canceled) return;
      const candidate = result.assets[0];
      if (!candidate) throw new Error('No image was selected.');
      validateUploadImage(candidate);
      setImage(candidate);
      setConfirmed(false);
    } catch (failure) {
      if (active.current) {
        setError(failure instanceof Error ? failure.message : 'The image could not be selected.');
      }
    } finally {
      locked.current = false;
      if (active.current) setBusy(false);
    }
  }

  async function submit() {
    if (locked.current || !image || !confirmed) return;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await uploadPrescription(image, confirmed);
      if (active.current) {
        router.replace({ pathname: '/prescriptions/[id]', params: { id: result.prescription_id } });
      }
    } catch (failure) {
      if (active.current) {
        setError(
          failure instanceof Error
            ? failure.message
            : 'Upload failed. Your selected image is still available.'
        );
      }
    } finally {
      locked.current = false;
      if (active.current) setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Audio Guide Bar */}
      <Pressable
        onPress={handleAudioGuide}
        style={[styles.audioBar, speaking && styles.audioBarActive]}
        accessibilityRole="button"
        accessibilityLabel="Read upload instructions aloud"
      >
        <Text style={styles.audioIcon}>{speaking ? '⏹' : '🔊'}</Text>
        <Text style={[styles.audioText, speaking && styles.audioTextActive]}>
          {speaking ? t('audioGuideStop', lang) : `${t('audioGuideBtn', lang)} · Screen Reader`}
        </Text>
      </Pressable>

      {/* Header with Illustration */}
      <View style={styles.headerBox}>
        <PrescriptionScannerSvg size={44} color={palette.ink} />
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={styles.title}>
            Upload a Prescription
          </Text>
          <Text style={styles.subtitle}>
            Extract medicine names, strengths, and dosage instructions.
          </Text>
        </View>
      </View>

      {/* Upload Zone Card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Take or Choose Document</Text>
        <View style={styles.actionRow}>
          <Button title="Take a prescription photo" disabled={busy} onPress={() => void choose(true)} />
          <Button variant="secondary" title="Choose a prescription image" disabled={busy} onPress={() => void choose(false)} />
        </View>
        <Text style={styles.formatHint}>Supports JPEG, PNG or WebP · Maximum 10 MB.</Text>
        <Text style={styles.formatHint}>Place the paper flat in good light. Include every edge, keep the phone steady and avoid glare. Check that the medicine names are readable before uploading.</Text>

        {image ? (
          <View style={styles.previewBox}>
            <Image
              source={{ uri: image.uri }}
              accessibilityLabel="Selected prescription preview"
              resizeMode="contain"
              style={styles.previewImage}
            />
            <View style={styles.confirmRow}>
              <Switch
                accessibilityLabel="Confirm permission for image upload and OCR"
                value={confirmed}
                disabled={busy}
                onValueChange={setConfirmed}
              />
              <Text style={styles.confirmText}>
                I confirm permission to store and run OCR on this image. OCR output requires human review.
              </Text>
            </View>
            <Button
              variant="quiet"
              title="Remove selected image"
              disabled={busy}
              onPress={() => {
                setImage(null);
                setConfirmed(false);
              }}
            />
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText} accessibilityRole="alert">
              ⚠️ {error}
            </Text>
          </View>
        ) : null}

        <Button
          title={busy ? 'Processing OCR…' : 'Upload & Extract Details'}
          disabled={busy || !image || !confirmed}
          onPress={() => void submit()}
        />
      </View>

      {/* Safety Notice Box */}
      <View style={styles.safetyCard}>
        <DoctorConsultSvg size={28} />
        <Text style={styles.safetyText}>
          MedGuide AI assists in reading prescriptions but never replaces your doctor or pharmacist. Never change or stop prescribed medication without clinical advice.
        </Text>
      </View>

      <Button variant="quiet" title="← Back to care records" disabled={busy} onPress={() => router.replace('/care')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: palette.cream,
    flexGrow: 1,
  },
  audioBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d2dcd0',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  audioBarActive: {
    backgroundColor: '#feeceb',
    borderColor: '#f5b5b0',
  },
  audioIcon: {
    fontSize: 13,
  },
  audioText: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.teal,
  },
  audioTextActive: {
    color: '#9b2631',
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.line,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.ink,
  },
  actionRow: {
    gap: 8,
  },
  formatHint: {
    fontSize: 11,
    color: palette.muted,
  },
  previewBox: {
    marginTop: 8,
    gap: 10,
    padding: 10,
    backgroundColor: '#f8faf6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2ebdf',
  },
  previewImage: {
    height: 220,
    width: '100%',
    borderRadius: 10,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  confirmText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    color: palette.ink,
  },
  errorBox: {
    backgroundColor: '#feeceb',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f5b5b0',
  },
  errorText: {
    fontSize: 12,
    color: '#9b2631',
  },
  safetyCard: {
    backgroundColor: '#f2f5f1',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#cce0ca',
  },
  safetyText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: palette.muted,
  },
});
