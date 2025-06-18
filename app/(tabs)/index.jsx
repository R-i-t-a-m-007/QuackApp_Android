import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

export default function RootScreen() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsReady(true);
      } catch (e) {
        console.error('❌ Splash init error', e);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isReady) {
      router.replace('/login'); // 👈 Use replace here
    }
  }, [isReady]);

  return null;
}
