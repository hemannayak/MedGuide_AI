import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Brand, Button } from './brand-ui';
import { AuthCarousel } from './auth-carousel';
import { Language, t } from '../lib/i18n';
import { stopGuidance } from '../lib/audio-guide';

interface WelcomeFlowProps {
  onSignIn: () => void;
  onRegister: () => void;
  initialLanguage?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export function WelcomeFlow({
  onSignIn,
  onRegister,
  initialLanguage = 'en',
  onLanguageChange,
}: WelcomeFlowProps) {
  useEffect(() => () => stopGuidance(), []);
  const [lang, setLang] = useState<Language>(initialLanguage);

  function handleLanguage(newLang: Language) {
    setLang(newLang);
    onLanguageChange?.(newLang);
  }

  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      {/* Top Header with Brand Mark & Language Switcher */}
      <View style={styles.headerRow}>
        <Brand />
        <View style={styles.langPills}>
          {(['en', 'hi', 'te'] as const).map(code => (
            <Pressable
              key={code}
              onPress={() => handleLanguage(code)}
              style={[styles.langBtn, lang === code && styles.langBtnActive]}
              accessibilityRole="button"
              accessibilityLabel={`Select ${code === 'en' ? 'English' : code === 'hi' ? 'Hindi' : 'Telugu'}`}
            >
              <Text style={[styles.langText, lang === code && styles.langTextActive]}>
                {code === 'en' ? 'EN' : code === 'hi' ? 'हि' : 'తె'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 4-Slide Feature Carousel with Distinct Authentic Images */}
      <View style={styles.carouselWrapper}>
        <AuthCarousel language={lang} height={230} />
      </View>

      {/* Primary Action Buttons */}
      <View style={styles.actions}>
        <Button
          title={t('getStarted', lang)}
          onPress={onRegister}
          accessibilityLabel="Get started: create an account"
        />
        <Button
          variant="secondary"
          title={t('alreadyHaveAccount', lang)}
          onPress={onSignIn}
          accessibilityLabel="Already have an account: sign in"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#f6f1e8',
    flexGrow: 1,
    gap: 18,
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  langPills: {
    flexDirection: 'row',
    backgroundColor: '#e6ded1',
    borderRadius: 24,
    padding: 3,
    gap: 4,
  },
  langBtn: {
    minHeight:44,
    justifyContent:'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  langBtnActive: {
    backgroundColor: '#073d37',
  },
  langText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#073d37',
  },
  langTextActive: {
    color: '#ffffff',
  },
  carouselWrapper: {
    marginVertical: 4,
  },
  actions: {
    marginTop: 12,
    gap: 12,
  },
});
