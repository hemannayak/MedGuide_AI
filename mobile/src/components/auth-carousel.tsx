import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  AppState,
  Image,
  ImageSourcePropType,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Language } from '../lib/i18n';

interface CarouselSlide {
  id: number;
  title: Record<Language, string>;
  desc: Record<Language, string>;
  image: ImageSourcePropType;
  fallbackColor: string;
}

export const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    title: {
      en: 'Healthcare in Your Language',
      hi: 'आपकी अपनी भाषा में स्वास्थ्य सेवा',
      te: 'మీ స్వంత భాషలో ఆరోగ్య సేవలు',
    },
    desc: {
      en: 'Express your health symptoms and questions naturally in English, हिन्दी, or తెలుగు.',
      hi: 'अपनी भाषा में स्वास्थ्य संबंधी लक्षण और प्रश्न खुलकर साझा करें।',
      te: 'మీ భాషలోనే ఆరోగ్య సమస్యలను నిస్సందేహంగా తెలపండి.',
    },
    image: require('../../assets/carousel/slide1_language.webp'),
    fallbackColor: '#073d37',
  },
  {
    id: 2,
    title: {
      en: 'Understand Prescriptions',
      hi: 'दवाइयों के पर्चे आसानी से समझें',
      te: 'మందుల చీటీలను సులభంగా అర్థం చేసుకోండి',
    },
    desc: {
      en: 'Clear, approachable explanations of doctor prescriptions, dosages, and schedules.',
      hi: 'डॉक्टर के पर्चे, खुराक और समय सारणी की स्पष्ट और सरल जानकारी।',
      te: 'డాక్టర్ ప్రిస్క్రిప్షన్, మోతాదు మరియు సమయాల స్పష్టమైన సమాచారం.',
    },
    image: require('../../assets/carousel/slide2_prescriptions.webp'),
    fallbackColor: '#246b60',
  },
  {
    id: 3,
    title: {
      en: 'Keep Your Care Organized',
      hi: 'अपनी स्वास्थ्य जानकारी सुरक्षित रखें',
      te: 'మీ ఆరోగ్య రికార్డులను భద్రంగా ఉంచండి',
    },
    desc: {
      en: 'Access and organize your health timeline, consultation notes, and family records.',
      hi: 'अपनी स्वास्थ्य समयरेखा, परामर्श रिपोर्ट और पारिवारिक रिकॉर्ड व्यवस्थित रखें।',
      te: 'మీ ఆరోగ్య టైమ్‌లైన్, రిపోర్టులు మరియు కుటుంబ రికార్డులను అందుబాటులో ఉంచండి.',
    },
    image: require('../../assets/carousel/slide3_records.webp'),
    fallbackColor: '#1d544c',
  },
  {
    id: 4,
    title: {
      en: 'Healthcare Made Simpler',
      hi: 'स्वास्थ्य मार्गदर्शन अब और भी सरल',
      te: 'అందరికీ సులభమైన ఆరోగ్య సంరక్షణ',
    },
    desc: {
      en: 'Accessible, dignified primary healthcare support designed for every rural family.',
      hi: 'ग्रामीण परिवारों और बुजुर्गों के लिए सुलभ, सरल और भरोसेमंद स्वास्थ्य मार्गदर्शन।',
      te: 'గ్రామీణ కుటుంబాలు మరియు పెద్దల కోసం రూపొందించబడిన విశ్వసనీయ ఆరోగ్య సహాయం.',
    },
    image: require('../../assets/carousel/slide4_simpler.webp'),
    fallbackColor: '#073d37',
  },
];

interface AuthCarouselProps {
  language?: Language;
  onSlideChange?: (index: number) => void;
  height?: number;
}

export function AuthCarousel({
  language = 'en',
  onSlideChange,
  height = 150,
}: AuthCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [foreground,setForeground]=useState(AppState.currentState==='active');
  const [reducedMotion,setReducedMotion]=useState(false);
  useEffect(()=>{
    const state=AppState.addEventListener('change',value=>setForeground(value==='active'));
    const motion=AccessibilityInfo.addEventListener('reduceMotionChanged',setReducedMotion);
    return ()=>{state.remove();motion.remove();};
  },[]);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance slides every 5.5s unless paused or reduce-motion enabled
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (reduced || reducedMotion || !foreground || !active) return;
      if (timerRef.current) clearInterval(timerRef.current);
      if (!isPaused) {
        timerRef.current = setInterval(() => {
          setActiveIndex(prev => {
            const next = (prev + 1) % CAROUSEL_SLIDES.length;
            onSlideChange?.(next);
            return next;
          });
        }, 5500);
      }
    }).catch(()=>undefined);

    return () => {
      active = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, onSlideChange, foreground, reducedMotion]);

  const current = CAROUSEL_SLIDES[activeIndex];

  const handleSelect = (idx: number) => {
    setActiveIndex(idx);
    onSlideChange?.(idx);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        },
        onPanResponderGrant: () => {
          setIsPaused(true);
        },
        onPanResponderRelease: (_, gestureState) => {
          setIsPaused(false);
          if (gestureState.dx < -35) {
            // Swiped left -> next
            setActiveIndex(prev => {
              const next = (prev + 1) % CAROUSEL_SLIDES.length;
              onSlideChange?.(next);
              return next;
            });
          } else if (gestureState.dx > 35) {
            // Swiped right -> prev
            setActiveIndex(prev => {
              const next = (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length;
              onSlideChange?.(next);
              return next;
            });
          }
        },
        onPanResponderTerminate: () => {
          setIsPaused(false);
        },
      }),
    [onSlideChange]
  );

  return (
    <View
      style={styles.container}
    >
      {/* Visual Image Card with Swipe Support */}
      <View {...panResponder.panHandlers}>
        <Pressable
          onPressIn={() => setIsPaused(true)}
          onPressOut={() => setIsPaused(false)}
          onPress={() => handleSelect((activeIndex + 1) % CAROUSEL_SLIDES.length)}
          style={[styles.imageCard, { height }]}
          accessibilityRole="button"
          accessibilityLabel="Next slide"
        >
        {!imageError[current.id] ? (
          <Image
            source={current.image}
            style={[styles.image, { height }]}
            resizeMode="cover"
            onError={() => setImageError(prev => ({ ...prev, [current.id]: true }))}
            accessibilityLabel={current.title[language]}
          />
        ) : (
          <View style={[styles.fallbackBox, { backgroundColor: current.fallbackColor, height }]}>
            <Text style={styles.fallbackIcon}>🩺</Text>
          </View>
        )}

      </Pressable>
      </View>

      {/* Slide Text Content */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {current.title[language]}
        </Text>
        <Text style={styles.description}>
          {current.desc[language]}
        </Text>
      </View>

      {/* Pagination Dot Indicators */}
      <View style={styles.dotsRow}>
        {CAROUSEL_SLIDES.map((slide, idx) => {
          const isActive = activeIndex === idx;
          return (
            <Pressable
              key={slide.id}
              onPress={() => handleSelect(idx)}
              style={[styles.dotTouchArea]}
              accessibilityRole="button"
              accessibilityLabel={`Go to slide ${idx + 1}`}
              accessibilityState={{selected:isActive}}
            >
              <View style={[styles.dot, isActive && styles.dotActive]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 8,
  },
  imageCard: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#073d37',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
  },
  fallbackBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackIcon: {
    fontSize: 44,
  },
  textContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#073d37',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: '#3d4d47',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  dotTouchArea: {
    minWidth:44,
    minHeight:44,
    alignItems:'center',
    justifyContent:'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd8d3',
  },
  dotActive: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#073d37',
  },
});
