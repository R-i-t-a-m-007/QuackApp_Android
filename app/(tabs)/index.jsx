// app/index.js
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function RootScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login'); // Immediately redirect to login
  }, [router]);

  return null; // Don't show anything
}
