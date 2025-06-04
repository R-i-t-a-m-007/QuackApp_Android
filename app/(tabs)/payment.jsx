import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ImageBackground, TextInput, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CardField, useStripe } from '@stripe/stripe-react-native';

export default function PaymentScreen() {
  const router = useRouter();
  const { price } = useLocalSearchParams(); // Use useLocalSearchParams
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [loading, setLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    name: '',
    email: '',
    address: '',
    postalCode: '',
  });

  useEffect(() => {
    const setupPaymentSheet = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://api.thequackapp.com/api/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: parseFloat(price) * 100 }), // Convert to cents
        });
        const { clientSecret } = await response.json();

        const { error } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
        });

        if (error) {
          console.log('Error initializing payment sheet:', error);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.log('Error fetching payment intent:', error);
        setLoading(false);
      }
    };

    setupPaymentSheet();
  }, [price]);

  const handlePayment = async () => {
    try {
      const { error } = await presentPaymentSheet();
      if (error) {
        alert(`Payment failed: ${error.message}`);
      } else {
        alert('Payment successful');
        router.push('/success'); // Navigate to a success page
      }
    } catch (error) {
      console.log('Error presenting payment sheet:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setPaymentInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <ImageBackground
      source={require('@/assets/images/main-bg.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Image source={require('@/assets/images/logonew.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.heading}>Complete Your Payment</Text>
          <View style={styles.underline} />

          <View style={styles.inputGroup}>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={paymentInfo.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#aaa"
              style={styles.input}
              keyboardType="email-address"
              value={paymentInfo.email}
              onChangeText={(text) => handleInputChange('email', text)}
            />
            <TextInput
              placeholder="Billing Address"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={paymentInfo.address}
              onChangeText={(text) => handleInputChange('address', text)}
            />
            <TextInput
              placeholder="Postal Code"
              placeholderTextColor="#aaa"
              style={styles.input}
              keyboardType="numeric"
              value={paymentInfo.postalCode}
              onChangeText={(text) => handleInputChange('postalCode', text)}
            />
          </View>

          <View style={styles.cardFieldContainer}>
            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: 'Card Number',
              }}
              style={styles.cardField}
            />
          </View>

          <View style={styles.paymentSummary}>
            <Text style={styles.summaryText}>Total Amount</Text>
            <Text style={styles.amountText}>€{price}</Text>
          </View>

          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePayment}
            disabled={loading}
          >
            <Text style={styles.payButtonText}>
              {loading ? 'Processing...' : 'Pay Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    paddingBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  underline: {
    width: 60,
    height: 2,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    paddingLeft: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  cardFieldContainer: {
    width: '100%',
    marginBottom: 20,
  },
  cardField: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
  },
  paymentSummary: {
    marginBottom: 30,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    color: '#ddd',
  },
  amountText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  payButton: {
    backgroundColor: '#000',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
