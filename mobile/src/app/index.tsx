import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { hasSession, request, signOut } from '../lib/api';
import { BrandIntroduction } from '../components/brand-introduction';
import { WelcomeFlow } from '../components/welcome-flow';
import { SignInView } from '../components/sign-in-view';
import { finishIntro, introSeen } from '../lib/introduction';
import { Language } from '../lib/i18n';

export default function Login() {
  const [showIntroduction, setShowIntroduction] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    let active = true;
    void introSeen()
      .then(seen => {
        if (active) setShowIntroduction(!seen);
      })
      .catch(() => undefined);

    void (async () => {
      try {
        if (await hasSession()) {
          await request('/auth/me');
          if (active) router.replace('/home');
        }
      } catch (failure) {
        if(failure instanceof Error&&['TypeError','AbortError'].includes(failure.name)){
          if(active)router.replace('/care');
        }else await signOut();
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (showIntroduction) {
    return (
      <View style={{ flex: 1, backgroundColor: '#073d37' }}>
        <BrandIntroduction
          onContinue={() => {
            setShowIntroduction(false);
            setShowWelcome(true);
            void finishIntro().catch(() => undefined);
          }}
        />
      </View>
    );
  }

  if (showWelcome) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f6f1e8' }}>
        <WelcomeFlow
          initialLanguage={language}
          onLanguageChange={setLanguage}
          onSignIn={() => setShowWelcome(false)}
          onRegister={() => router.push('/register')}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f6f1e8' }}>
      <SignInView
        currentLanguage={language}
        onLanguageChange={setLanguage}
        onSubmit={() => router.replace('/home')}
        onRegister={() => router.push('/register')}
        onBackToIntro={() => setShowWelcome(true)}
      />
    </View>
  );
}
