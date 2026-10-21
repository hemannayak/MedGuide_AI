import { Image } from 'react-native';

/** Bundled editorial illustration; no remote image request or patient photography. */
export function RuralScene({ height = 140 }: { height?: number }) {
  return <Image source={require('../../assets/rural-village.png')} resizeMode="cover" accessibilityLabel="Illustration of a village and fields at sunrise" style={{ width: '100%', height, borderRadius: 24 }} />;
}
