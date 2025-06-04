import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://api.thequackapp.com/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Check your email for a password reset link.');
      } else {
        Alert.alert('Error', data.message || 'Failed to send reset link.');
      }
    } catch (error) {
      console.error('Error sending reset link:', error);
      Alert.alert('Error', 'An error occurred while sending the reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/main-bg.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password</Text>
        <View style={styles.underline} />

        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="white" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="white"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity onPress={handleForgotPassword} style={styles.button} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.loginLink}>Go back to login</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 0,
    textAlign: 'center',
  },
  underline: {
    width: 120,
    height: 2,
    backgroundColor: '#fff',
    marginTop: 5,
    marginBottom: 10,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
    width: '100%',
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 0,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    color: '#fff',
    textDecorationLine: 'underline',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
