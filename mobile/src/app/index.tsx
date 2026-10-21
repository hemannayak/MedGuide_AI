import { useEffect, useState } from 'react';
import { palette } from '../components/brand-ui';
import { SignInView } from '../components/sign-in-view';
import { router } from 'expo-router';
import { hasSession, request, signIn, signOut } from '../lib/api';
import { BrandIntroduction } from '../components/brand-introduction';
import { WelcomeFlow } from '../components/welcome-flow';
import { SafeAreaView } from 'react-native-safe-area-context';
import { introSeen, finishIntro } from '../lib/introduction';
import { Language } from '../lib/i18n';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showIntroduction, setShowIntroduction] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    let active = true;
    void introSeen().then(seen => {if(active)setShowIntroduction(!seen);}).catch(() => undefined);
    void (async () => {
      try {
        if (await hasSession()) {
          await request('/auth/me');
          if (active) router.replace('/home');
        }
      } catch {
        await signOut();
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function login() {
    setBusy(true);
    setError('');
    try {
      await signIn(identifier, password);
      setPassword('');
      // Navigate to permissions check before home
      router.replace('/home');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to connect.');
    } finally {
      setBusy(false);
    }
  }


  if (showIntroduction) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#073d37' }}>
        <BrandIntroduction
          onContinue={() => {
            setShowIntroduction(false);
            setShowWelcome(false);
            void finishIntro().catch(() => undefined);
          }}
        />
      </SafeAreaView>
    );
  }

  if (showWelcome) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.cream }}>
        <WelcomeFlow
          initialLanguage={language}
          onLanguageChange={setLanguage}
          onSignIn={() => setShowWelcome(false)}
          onRegister={() => router.push('/register')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.cream }}>
      
      <SignInView
        identifier={identifier}
        password={password}
        busy={busy}
        error={error}
        currentLanguage={language}
        onLanguageChange={setLanguage}
        onIdentifierChange={setIdentifier}
        onPasswordChange={setPassword}
        onSubmit={() => void login()}
        onRegister={() => router.push('/register')}
        onBackToIntro={() => setShowWelcome(true)}
      />
    </SafeAreaView>
  );
}
