import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export const palette = { ink: '#073d37', muted: '#52665f', cream: '#f6f1e8', teal: '#0f766e', line: '#d7e0da', sage: '#e6eee1', white: '#fffdf8', clay: '#a94129', peach: '#faeadc', error: '#922f31' };

export function Brand() {
  return <View style={styles.brand} accessibilityLabel="MedGuide AI">
    <Image source={require('../../assets/medguide-mark.png')} accessible={false} resizeMode="contain" style={styles.logo}/>
    <View><Text style={styles.name}>MedGuide AI</Text><Text style={styles.tag}>Care in your language</Text></View>
  </View>;
}

export function Button({ title, onPress, disabled = false, variant = 'primary' }: { title: string; onPress: () => void; disabled?: boolean; variant?: 'primary' | 'secondary' | 'quiet' | 'danger' }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, variant === 'secondary' && styles.secondary, variant === 'quiet' && styles.quiet, variant === 'danger' && styles.danger, disabled && styles.disabled, pressed && !disabled && styles.pressed]}>
    {({ pressed }) => <Text style={[styles.buttonText, (variant === 'secondary' || variant === 'quiet') && styles.secondaryText, pressed && !disabled && styles.buttonText, disabled && styles.disabledText]}>{title}</Text>}
  </Pressable>;
}

/** Decorative microphone, drawn with native views; the enclosing control supplies its label. */
export function VoiceMark() {
  return <View style={styles.voiceMark} accessible={false} importantForAccessibility="no-hide-descendants"><View style={styles.micHead}/><View style={styles.micCurve}/><View style={styles.micStem}/><View style={styles.micBase}/></View>;
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  logo: { width: 46, height: 46 },
  name: { color: palette.ink, fontSize: 23, fontWeight: '700' },
  tag: { color: palette.muted, fontSize: 12, marginTop: 0, letterSpacing: 0.3 },
  button: { backgroundColor: palette.ink, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14, minHeight: 50, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: palette.ink }, secondaryText: { color: palette.ink },
  quiet: { backgroundColor: 'transparent' }, danger: { backgroundColor: palette.clay },
  voiceMark: { width: 34, height: 44, alignItems: 'center', justifyContent: 'center' },
  micHead: { position: 'absolute', top: 1, width: 15, height: 25, borderRadius: 9, borderWidth: 2.5, borderColor: '#fff' },
  micCurve: { position: 'absolute', top: 13, width: 27, height: 21, borderWidth: 2.5, borderTopWidth: 0, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, borderColor: '#fff' },
  micStem: { position: 'absolute', top: 33, width: 2.5, height: 7, backgroundColor: '#fff' }, micBase: { position: 'absolute', top: 39, width: 16, height: 2.5, backgroundColor: '#fff' },
  disabled: { backgroundColor: '#e2e7e2' }, disabledText: { color: '#53635b' }, pressed: { backgroundColor: palette.teal },
});
