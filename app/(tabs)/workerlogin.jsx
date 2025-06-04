import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Modal,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';


const { height, width } = Dimensions.get('window');

export default function WorkerLogin() {
  const router = useRouter();
  const [workerCode, setWorkerCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.push('/login');
  };

  const handleAction = async () => {
    if (!workerCode || !email || !password) {
      setErrorMessage('Please enter Worker Code, Email, and Password.');
      setShowErrorModal(true);
      return;
    }
  
    setIsLoading(true);
  
    try {

      const token = (await Notifications.getExpoPushTokenAsync()).data;

      const response = await fetch('https://api.thequackapp.com/api/workers/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userCode: workerCode,
          email,
          password,
          expoPushToken: token,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // ✅ Store token and worker info in AsyncStorage
        await AsyncStorage.setItem('workerToken', data.token);
        await AsyncStorage.setItem('workerInfo', JSON.stringify(data.worker));
  
        // 🚀 Navigate to worker dashboard
        router.push('/workerdash');
      } else {
        setErrorMessage(data.message || 'An error occurred. Please try again.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Server error. Please try again later.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={require('@/assets/images/main-bg.jpg')}
          style={styles.container}
          resizeMode="cover"
        >
          <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.content}>
                <Image
                  source={require('@/assets/images/logo-with-glow-new.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.headerText}>Your Worker Credentials</Text>
                <View style={styles.underline} />

                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color="white" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Code"
                    placeholderTextColor="white"
                    value={workerCode}
                    onChangeText={setWorkerCode}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={20} color="white" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="white"
                    value={email}
                    onChangeText={setEmail}
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

                <TouchableOpacity style={styles.button} onPress={handleAction} disabled={isLoading}>
                  <Text style={styles.buttonText}>{isLoading ? 'Loading...' : 'Proceed'}</Text>
                </TouchableOpacity>
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => router.push('/workerregister')}>
                    <Text style={styles.signUpLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={handleBack} style={styles.backToLoginContainer}>
                  <Text style={styles.backToLoginText}>Go back </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>router.push('/forgotworkerpassword')} style={styles.backToLoginContainer}>
                  <Text style={styles.forgotText}>Forgot Password</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <Modal
              transparent={true}
              visible={showErrorModal}
              animationType="fade"
              onRequestClose={() => setShowErrorModal(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalText}>{errorMessage}</Text>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setShowErrorModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </KeyboardAvoidingView>
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
    alignItems: 'center',
    width: width,
    height: height,
  },
  keyboardContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 0,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
    alignSelf: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    alignSelf: 'center',
    textAlign: 'center',
  },
  underline: {
    width: 120,
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
    paddingHorizontal: 40,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  backToLoginText: {
    color: '#000',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 15,
  },
  forgotText:{
    color: '#fff',
    textDecorationLine: 'underline',
    marginTop: 10,
    textAlign: 'center',
  }
});

