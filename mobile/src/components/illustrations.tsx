import React from 'react';
import { Platform, Text, UIManager, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

export interface IllustrationProps {
  size?: number;
  width?: number;
  height?: number;
  color?: string;
  secondaryColor?: string;
}

export const hasNativeSvg = (): boolean => {
  if (Platform.OS === 'web') return true;
  if (typeof UIManager === 'undefined') return true;
  try {
    return Boolean(
      UIManager?.getViewManagerConfig?.('RNSVGPath') ||
      UIManager?.getViewManagerConfig?.('RCTRNSVGPath')
    );
  } catch {
    return false;
  }
};

function FallbackBadge({
  size = 48,
  bg = '#e8f4f0',
  border = '#246b60',
  icon = '✚',
  color = '#073d37',
}: {
  size?: number;
  bg?: string;
  border?: string;
  icon?: string;
  color?: string;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        borderWidth: 1.5,
        borderColor: border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.5, color, textAlign: 'center', includeFontPadding: false }}>
        {icon}
      </Text>
    </View>
  );
}

/** 1. Medical Shield with Cross — Security, Privacy, and Trust */
export function MedicalShieldSvg({ size = 48, color = '#073d37', secondaryColor = '#246b60' }: IllustrationProps) {
  if (!hasNativeSvg()) {
    return <FallbackBadge size={size} bg="#e8f4f0" border={secondaryColor} icon="🛡️" color={color} />;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path
        d="M32 4L12 12V28C12 42.4 20.6 55.6 32 60C43.4 55.6 52 42.4 52 28V12L32 4Z"
        fill={color}
      />
      {/* Medical Cross */}
      <Rect x="28" y="20" width="8" height="24" rx="2" fill="#ffffff" />
      <Rect x="20" y="28" width="24" height="8" rx="2" fill="#ffffff" />
    </Svg>
  );
}

/** 2. Doctor Consultation & Healthcare Stethoscope */
export function DoctorConsultSvg({ size = 52, color = '#073d37', secondaryColor = '#e57a44' }: IllustrationProps) {
  if (!hasNativeSvg()) {
    return <FallbackBadge size={size} bg="#f1f5ee" border={secondaryColor} icon="🩺" color={color} />;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Friendly Chat Bubble */}
      <Path
        d="M8 14C8 8.48 12.48 4 18 4H46C51.52 4 56 8.48 56 14V38C56 43.52 51.52 48 46 48H22L12 56V48H18C12.48 48 8 43.52 8 38V14Z"
        fill="#f1f5ee"
        stroke={color}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Stethoscope */}
      <Path
        d="M24 16V26C24 30.4 27.6 34 32 34C36.4 34 40 30.4 40 26V16"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path d="M32 34V40C32 42.2 33.8 44 36 44H38" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <Circle cx="40" cy="44" r="4" fill={secondaryColor} />
      <Circle cx="24" cy="15" r="2" fill={color} />
      <Circle cx="40" cy="15" r="2" fill={color} />
    </Svg>
  );
}

/** 3. Medicine Bottle & Dosage Capsules */
export function MedicineBottleSvg({ size = 48, color = '#073d37', secondaryColor = '#e57a44' }: IllustrationProps) {
  if (!hasNativeSvg()) {
    return <FallbackBadge size={size} bg="#fef3ea" border={secondaryColor} icon="💊" color={color} />;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Bottle Cap */}
      <Rect x="22" y="6" width="20" height="8" rx="2" fill="#cad5c6" stroke={color} strokeWidth="2.5" />
      {/* Bottle Body */}
      <Rect x="16" y="14" width="32" height="44" rx="6" fill="#f7f9f5" stroke={color} strokeWidth="2.5" />
      {/* Label */}
      <Rect x="20" y="24" width="24" height="24" rx="3" fill="#eaf0e8" />
      <Path d="M32 28V44M24 36H40" stroke={secondaryColor} strokeWidth="3" strokeLinecap="round" />
      {/* Capsule */}
      <G transform="rotate(25 46 44)">
        <Rect x="44" y="32" width="10" height="22" rx="5" fill="#cad5c6" stroke={color} strokeWidth="2" />
        <Path d="M44 43H54V49C54 51.8 51.8 54 49 54C46.2 54 44 51.8 44 49V43Z" fill={secondaryColor} />
      </G>
    </Svg>
  );
}

/** 4. Voice Audio Mic with Soundwave Frequency */
export function VoiceMicWaveSvg({ size = 52, color = '#073d37', secondaryColor = '#246b60' }: IllustrationProps) {
  if (!hasNativeSvg()) {
    return <FallbackBadge size={size} bg="#eaf4f2" border={secondaryColor} icon="🎙️" color={color} />;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Microphone Body */}
      <Rect x="26" y="10" width="12" height="24" rx="6" fill={color} />
      <Path
        d="M18 24C18 31.7 24.3 38 32 38C39.7 38 46 31.7 46 24"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <Path d="M32 38V50" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <Path d="M22 50H42" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      {/* Voice Waves */}
      <Path d="M12 20C10 24 10 28 12 32" stroke={secondaryColor} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M6 16C3 22 3 30 6 36" stroke={secondaryColor} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <Path d="M52 20C54 24 54 28 52 32" stroke={secondaryColor} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M58 16C61 22 61 30 58 36" stroke={secondaryColor} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </Svg>
  );
}

/** 5. Prescription Scanner & Camera Document OCR */
export function PrescriptionScannerSvg({ size = 52, color = '#073d37', secondaryColor = '#246b60' }: IllustrationProps) {
  if (!hasNativeSvg()) {
    return <FallbackBadge size={size} bg="#f6f8f5" border={secondaryColor} icon="📋" color={color} />;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Document Sheet */}
      <Path
        d="M16 8C16 5.8 17.8 4 20 4H38L48 14V56C48 58.2 46.2 60 44 60H20C17.8 60 16 58.2 16 56V8Z"
        fill="#f8faf6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Folded Corner */}
      <Path d="M38 4V14H48" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill="#e4ebe0" />
      {/* Rx Header */}
      <Path d="M24 18H32M24 24H36M24 30H34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Scanner Corners */}
      <Path d="M8 16V10H14" stroke={secondaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M50 10H56V16" stroke={secondaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8 48V54H14" stroke={secondaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M56 48V54H50" stroke={secondaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Laser Scan Line */}
      <Path d="M10 32H54" stroke={secondaryColor} strokeWidth="2" strokeDasharray="3 3" />
    </Svg>
  );
}

/** 6. Rural Community Clinic & Sub-centre */
export function RuralClinicSvg({ size = 54, color = '#073d37', secondaryColor = '#e57a44' }: IllustrationProps) {
  if (!hasNativeSvg()) {
    return <FallbackBadge size={size} bg="#fdeddd" border={secondaryColor} icon="🏥" color={color} />;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Sun / Hill background */}
      <Circle cx="32" cy="22" r="14" fill="#fae8d4" />
      {/* Clinic Building Roof */}
      <Path d="M12 26L32 10L52 26H12Z" fill={color} />
      {/* Building Body */}
      <Rect x="16" y="26" width="32" height="30" fill="#f8faf6" stroke={color} strokeWidth="2.5" />
      {/* Door */}
      <Rect x="27" y="38" width="10" height="18" fill="#e3ebe0" stroke={color} strokeWidth="2" />
      {/* Red Cross on Clinic */}
      <Rect x="30" y="28" width="4" height="8" fill={secondaryColor} rx="1" />
      <Rect x="28" y="30" width="8" height="4" fill={secondaryColor} rx="1" />
      {/* Ground */}
      <Path d="M6 56H58" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

/** 7. Smartwatch & Health Vitals (Future Scope Showcase) */
export function SmartwatchVitalsSvg({ size = 50, color = '#073d37', secondaryColor = '#e57a44' }: IllustrationProps) {
  if (!hasNativeSvg()) {
    return <FallbackBadge size={size} bg="#edf7f1" border={secondaryColor} icon="⌚" color={color} />;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Watch Straps */}
      <Rect x="25" y="4" width="14" height="12" rx="3" fill="#cbd5c8" stroke={color} strokeWidth="2" />
      <Rect x="25" y="48" width="14" height="12" rx="3" fill="#cbd5c8" stroke={color} strokeWidth="2" />
      {/* Watch Dial */}
      <Rect x="17" y="14" width="30" height="36" rx="10" fill="#0f2620" stroke={color} strokeWidth="2.5" />
      {/* Screen Heartbeat ECG curve */}
      <Path
        d="M21 32H27L29 24L33 40L35 30L35 34H43"
        stroke="#4ade80"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Mini Pulse Indicator */}
      <Circle cx="41" cy="22" r="2.5" fill={secondaryColor} />
    </Svg>
  );
}

/** Recognizable hydration mark, with no embedded words or clinical claim. */
export function HydrationSvg({ size = 40, color = '#247e9a' }: IllustrationProps) {
  if (!hasNativeSvg()) {
    return <FallbackBadge size={size} bg="#e0f2fe" border={color} icon="💧" color={color} />;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path d="M32 5C26 16 13 29 13 40a19 19 0 0 0 38 0C51 29 38 16 32 5Z" fill="#dceff5" stroke={color} strokeWidth={3.5} strokeLinejoin="round" />
      <Path d="M22 39c0 7 4 11 10 12" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
    </Svg>
  );
}

/** Pair of footprints, distinct from the hydration symbol. */
export function FootstepsSvg({ size = 40, color = '#42704d' }: IllustrationProps) {
  if (!hasNativeSvg()) {
    return <FallbackBadge size={size} bg="#dcfce7" border={color} icon="👣" color={color} />;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path d="M22 9c-8 1-11 16-7 23 2 4 9 3 11-1 4-7 5-23-4-22Zm-4 30c-6 0-9 6-6 11 3 4 9 4 12-1 3-4 1-10-6-10Z" fill="#dcebd9" stroke={color} strokeWidth={3} />
      <Path d="M44 17c8 1 11 16 7 23-2 4-9 3-11-1-4-7-5-23 4-22Zm4 30c6 0 9 6 6 11-3 4-9 4-12-1-3-4-1-10 6-10Z" fill="#dcebd9" stroke={color} strokeWidth={3} />
    </Svg>
  );
}
