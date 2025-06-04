import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ImageBackground, ScrollView, Modal, KeyboardAvoidingView, Platform, StatusBar, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';

const { height, width } = Dimensions.get('window');

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    package: '', // Keep package empty for now
  });

  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    setFormData({
      username: '',
      email: '',
      phone: '',
      password: '',
      package: '', // Keep package empty for now
    });
    setErrors({});
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prevState) => ({ ...prevState, [field]: value }));
    setErrors((prevState) => ({ ...prevState, [field]: '' }));
  };

  const validateFields = () => {
    const newErrors = {};

    // Validate required fields
    Object.keys(formData).forEach((field) => {
      if (field !== 'package' && !formData[field]) { // Exclude package from validation
        newErrors[field] = 'Please enter this field';
      }
    });

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Validate phone to allow only numbers
    const phoneRegex = /^[0-9]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validate password length
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    return newErrors;
  };

  const handleRegister = async () => {
    const newErrors = validateFields();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setLoading(true); // Start loading
  
    // Create a copy of formData to avoid mutating the original state
    const dataToSend = { ...formData };
  
    // Remove package if it's empty
    if (!dataToSend.package) {
      delete dataToSend.package;
    }
  
    try {

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      dataToSend.expoPushToken = token;
      
      const response = await fetch('https://api.thequackapp.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      const data = await response.json();
  
      setLoading(false); // Stop loading
  
      if (response.ok) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          router.push('/packagescreen'); // Redirect to login after successful registration
        }, 2000);
      } else {
        // Use the existing error handling for displaying the error message
        setErrorMessage(data.message || 'Registration failed. Please check your details.');
        setErrorModalVisible(true);
        // Automatically close the modal after 2 seconds
        setTimeout(() => {
          setErrorModalVisible(false);
        }, 1500);
      }
    } catch (error) {
      setLoading(false); // Stop loading
      setErrorMessage('Something went wrong. Please try again later.');
      setErrorModalVisible(true);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={require('@/assets/images/main-bg.jpg')} 
        style={styles.container} 
        resizeMode="cover"
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollViewContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Image 
              source={require('@/assets/images/logo-with-glow-new.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
            
            <Text style={styles.registerText}>REGISTRATION</Text>
            <View style={styles.underline} />

            {['username', 'email', 'phone', 'password'].map((field, index) => (
              <View style={styles.inputContainer} key={index}>
                <Ionicons 
                  name={field === 'username' ? 'person' : 
                        field === 'email' ? 'mail' : 
                        field === 'phone' ? 'call' : 'home'} 
                  size={20} 
                  color="white" 
                  style={styles.icon} 
                />
                <TextInput
                  style={[styles.input, errors[field] && styles.inputError]}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  placeholderTextColor="white"
                  value={formData[field]}
                  onChangeText={(text) => handleInputChange(field, text)}
                  keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
                  secureTextEntry={field === 'password'}
                />
                {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
              </View>
            ))}

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleRegister}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
            </TouchableOpacity>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.loadingText}>Registering...</Text>
              </View>
            )}

            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <Modal 
              transparent={true} 
              visible={showSuccessModal} 
              animationType="fade"
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalText}>Registration Successful!</Text>
                </View>
              </View>
            </Modal>

            <Modal 
              transparent={true} 
              visible={errorModalVisible} 
              animationType="fade"
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalText}>{errorMessage}</Text>
                </View>
              </View>
            </Modal>

          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea:{
    flex:1,
    backgroundColor: '#f3ae0a',
  },
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    paddingHorizontal: 20,
    width: width,
    height: height, 
  },
  scrollViewContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingTop: 40, 
    paddingBottom: 40, 
    alignItems: 'center' 
  },
  logo: { 
    width: 140, 
    height: 120, 
    marginBottom: 20 
  },
  registerText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 5 
  },
  underline: { 
    width: 30, 
    height: 2, 
    backgroundColor: '#fff', 
    marginBottom: 20 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0,  0.5)', 
    borderRadius: 25, 
    paddingHorizontal: 15, 
    marginVertical: 5, 
    width: '90%', 
    height: 50 
  },
  icon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: 'white' 
  },
  inputError: { 
    borderColor: 'red', 
    borderWidth: 1 
  },
  errorText: { 
    color: 'red', 
    fontSize: 12, 
    marginTop: 5,
    marginBottom: 5, 
    marginLeft: 15 
  },
  button: { 
    backgroundColor: '#000', 
    borderRadius: 25, 
    paddingVertical: 15, 
    paddingHorizontal: 40, 
    alignItems: 'center', 
    marginTop: 20, 
    width: '90%' 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  signInContainer: { 
    flexDirection: 'row', 
    marginTop: 20 
  },
  signInText: { 
    color: '#000' 
  },
  signInLink: { 
    color: '#000', 
    fontWeight: 'bold', 
    textDecorationLine: 'underline' 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)' 
  },
  modalContent: { 
    padding: 20, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  modalText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: 'green' 
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 25,
    marginTop: 10,
    color: 'black',
    fontWeight: '900'
  },
});