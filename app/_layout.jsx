import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StripeProvider } from '@stripe/stripe-react-native';
import usePushNotification from '@/hooks/usePushNotification'; // ✅ Fix import

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { expoPushToken } = usePushNotification(); // ✅ Use hook

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StripeProvider publishableKey="pk_live_51R4fcdCYDOMuFCfFqAhGZMbYDfByHhXukLT6KeGiujcEj6RwmH1MR8kZ2IqdrY78YZC9tCETsiBkduqDGQ0ApPbC009Cz0KAog">
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </StripeProvider>
    </ThemeProvider>
  );
}
