// app/payment-success.jsx

import { useRouter, useSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PaymentSuccessScreen() {
  const { package: selectedPackage } = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (selectedPackage === 'basic') {
      router.replace('/(tabs)/basicuserdash');
    } else if (selectedPackage === 'pro') {
      router.replace('/(tabs)/prouserdash');
    } else {
      router.replace('/(tabs)'); // fallback to tab root
    }
  }, [selectedPackage]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ Payment Successful</Text>
      <Text style={styles.subtext}>Redirecting to your dashboard...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
  },
  text: {
    fontSize: 24, fontWeight: 'bold', color: 'green',
  },
  subtext: {
    marginTop: 10, fontSize: 16, color: '#555',
  },
});
