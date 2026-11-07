import { Platform, View } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AudioGuidanceStatus } from '../components/audio-guidance-status';

export default function Layout() {
  const pathname = usePathname();
  const content = (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#f6f1e8' }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#f6f1e8' },
          headerTintColor: '#073d37',
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#f6f1e8' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'MedGuide AI', headerShown: false }} />
        <Stack.Screen name="design-preview" options={{ headerShown: false }} />
        <Stack.Screen name="permissions" options={{ title: 'Permissions', headerShown: false }} />
        <Stack.Screen name="home" options={{ title: 'Your care' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="register" options={{ title: 'Create account' }} />
        <Stack.Screen name="chat" options={{ title: 'Health companion' }} />
        <Stack.Screen name="consent" options={{ title: 'Processing choices' }} />
        <Stack.Screen name="care" options={{ title: 'Your care records' }} />
        <Stack.Screen name="timeline" options={{ title: 'Health timeline' }} />
        <Stack.Screen name="profile" options={{ title: 'Your profile' }} />
        <Stack.Screen name="prescriptions/[id]" options={{ title: 'Review prescription' }} />
        <Stack.Screen name="prescriptions/upload" options={{ title: 'Upload prescription' }} />
      </Stack>
      <AudioGuidanceStatus/>
    </SafeAreaProvider>
  );

  if (Platform.OS === 'web' && pathname !== '/design-preview') {
    return (
      <View style={{ flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: '#f6f1e8' }}>
        {content}
      </View>
    );
  }

  return content;
}
