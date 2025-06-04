import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

const { height, width } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem('authToken');
        const workerToken = await AsyncStorage.getItem('workerToken');

        if (userToken) {
          const response = await fetch('https://api.thequackapp.com/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            const userPackage = data.user.package;

            if (userPackage === 'Pro') {
              router.replace('/prouserdash');
            } else if (userPackage === 'Basic') {
              router.replace('/basicuserdash');
            } else {
              // fallback if no valid package
              router.replace('/dashboard');
            }
            return;
          } else {
            // Invalid token, clear it
            await AsyncStorage.removeItem('authToken');
          }
        }

        if (workerToken) {
          router.replace('/workerdash');
          return;
        }

        // If no token, stay on login screen
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
  
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
  
      const response = await fetch('https://api.thequackapp.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, expoPushToken: token }),
      });
      const data = await response.json();
  
      if (response.ok) {
        await AsyncStorage.setItem('authToken', data.token);
  
        const userResponse = await fetch('https://api.thequackapp.com/api/auth/me', {
          method: 'GET',
          headers: { Authorization: `Bearer ${data.token}` },
        });
  
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const userPackage = userData.user.package;
          const subscriptionEndDate = userData.user.subscriptionEndDate
            ? new Date(userData.user.subscriptionEndDate)
            : null;
  
          const now = new Date();
  
          if (subscriptionEndDate && now > subscriptionEndDate) {
            // Subscription has expired
            Alert.alert(
              'Subscription Expired',
              'Your subscription has expired. Would you like to subscribe again?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Subscribe Again', onPress: () => router.push('/packagescreen') },
              ]
            );
            return;
          }
  
          // Subscription is valid or no end date set (treat as active)
          await AsyncStorage.setItem('userPackage', userPackage);
  
          if (userPackage === 'Pro') {
            router.push('/prouserdash');
          } else if (userPackage === 'Basic') {
            router.push('/basicuserdash');
          } else {
            Alert.alert('Error', 'User package is not recognized.');
          }
        } else {
          const errorData = await userResponse.json();
          console.log('Failed to fetch user data:', errorData);
          Alert.alert('Error', 'Failed to fetch user data.');
        }
      } else {
        console.log('Login failed:', data);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  
  

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const userPackage = await AsyncStorage.getItem('userPackage');
  
      if (token && userPackage) {
        if (userPackage === 'Pro') {
          router.push('/prouserdash');
        } else if (userPackage === 'Basic') {
          router.push('/basicuserdash');
        }
      }
    };
  
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const checkWorkerLogin = async () => {
      const worker = await AsyncStorage.getItem('worker');
      if (worker) {
        router.replace('/workerdash');
      }
    };
  
    checkWorkerLogin();
  }, []);

  
  const handleResetPassword = async () => {
    try {
      const response = await fetch('https://api.thequackapp.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Your password has been reset successfully. Please Login Again.');
        setShowOtpModal(false);
        setNewPassword(''); // Clear the new password input
      } else {
        Alert.alert('Error', 'Failed to reset password. Please check your OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  return (
    <>
      <StatusBar barStyle ="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={require('@/assets/images/main-bg.jpg')}
          style={styles.container}
          resizeMode="cover"
        >
          <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.content}>
                <Image
                  source={require('@/assets/images/logo-with-glow-new.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.loginText}>LOGIN</Text>
                <View style={styles.underline} />

                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color="white" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="white"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={20} color="white" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="white"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                  <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
                </TouchableOpacity>

                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={styles.signUpLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => router.push('/forgotpassword')}>
                  <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
                </TouchableOpacity>

                <View style={styles.companyLoginContainer}>
                  <TouchableOpacity onPress={() => router.push('/companylogin')}>
                    <Text style={styles.companyLoginText}>Department/Location</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.companyLoginContainer}>
                  <TouchableOpacity onPress={() => router.push('/workerlogin')}>
                    <Text style={styles.companyLoginText}>Login as a Worker</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          <Modal
            transparent={true}
            visible={showErrorModal}
            animationType="fade"
            onRequestClose={() => setShowErrorModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>Invalid Username or Password</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowErrorModal(false)}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3ae0a',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal:20,
    width: width,
    height: height,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 0,
    alignSelf: 'center',
  },
  loginText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    alignSelf: 'center',
  },
  underline: {
    width: 30,
    height: 2,
    backgroundColor: '#fff',
    marginBottom: 20,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 5,
    width: '100%', // Ensure full width
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
    marginTop: 20,
    width: '100%', // Ensure full width
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'normal',
  },
  signUpLink: {
    color: '#000',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 10, 
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  modalText: {
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#FF0000',
    textAlign: 'center',
  },
  modalButton: { 
    backgroundColor: '#FF0000', 
    borderRadius: 5, 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  scrollContent: {
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingTop: 40, 
    paddingBottom: 40, 
    alignItems: 'center' 
  },
  forgotPasswordLink: {
    color: '#fff',
    textDecorationLine: 'underline',
    marginTop: 10,
    textAlign: 'center',
  },
  forgotPasswordModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  forgotPasswordModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  forgotPasswordModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  forgotPasswordModalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  forgotPasswordModalInput: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  forgotPasswordModalButton: {
    backgroundColor: '#f3ae0a',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  forgotPasswordModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  loadingText: {
    color: 'white',
    marginLeft: 10,
  },
  companyLoginContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  companyLoginText: {
    color: 'black', // Link color
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight:'600'
  },
});