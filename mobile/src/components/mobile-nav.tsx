import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from './brand-ui';

const destinations = [
  { route: '/home', label: 'Home', symbol: '⌂' },
  { route: '/chat', label: 'Talk', symbol: '◉' },
  { route: '/care', label: 'Records', symbol: '▤' },
  { route: '/settings', label: 'Settings', symbol: '⚙' },
] as const;

export function MobileNav({ current, disabled = false, onNavigate = route => router.replace(route) }: { current: typeof destinations[number]['route']; disabled?: boolean; onNavigate?: (route: typeof destinations[number]['route']) => void }) {
  return <View style={styles.bar} accessibilityRole="tablist">{destinations.map(item => <Pressable key={item.route} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected: current === item.route, disabled }} disabled={disabled || current === item.route} onPress={() => onNavigate(item.route)} style={({ pressed }) => [styles.item, current === item.route && styles.selected, pressed && styles.pressed]}><Text accessible={false} style={styles.icon}>{item.symbol}</Text><Text style={[styles.label, current === item.route && styles.activeLabel]}>{item.label}</Text></Pressable>)}</View>;
}
const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1, borderColor: palette.line, backgroundColor: palette.white, paddingHorizontal: 8, paddingVertical: 8, gap: 4 },
  item: { flex: 1, minHeight: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 6 },
  selected: { backgroundColor: palette.sage }, pressed: { opacity: 0.65 }, icon: { color: palette.ink, fontSize: 23 }, label: { color: palette.muted, fontSize: 12 }, activeLabel: { color: palette.ink, fontWeight: '700' },
});
