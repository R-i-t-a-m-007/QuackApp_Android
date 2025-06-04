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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';

export default function WorkerRegistration() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [address, setAddress] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date());
  const [password, setPassword] = useState('');
  const [userCode, setUserCode] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleBack = () => {
    router.push('/workerlogin');
  };

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !userCode) {
      setErrorMessage('Please fill in all fields.');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {

      const token = (await Notifications.getExpoPushTokenAsync()).data;

      const response = await fetch('https://api.thequackapp.com/api/workers/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          joiningDate: joiningDate.toISOString().split('T')[0], // Format date to YYYY-MM-DD
          password,
          userCode,
          expoPushToken: token,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Registration successful! You will be notified via email if you are approved.');
        router.push('/workerlogin'); // Redirect to worker login after successful registration
      } else {
        setErrorMessage(data.message || 'An error occurred. Please try again.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrorMessage('Server error. Please try again later.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || joiningDate;
    setShowDatePicker(false);
    setJoiningDate(currentDate);
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
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Image
                  source={require('@/assets/images/logo-with-glow-new.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.headerText}>Worker Registration</Text>
                <View style={styles.underline} />

                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="white"
                  value={name}
                  onChangeText={setName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="white"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone"
                  placeholderTextColor="white"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType='phone-pad'
                />
                <TouchableOpacity onPress={showDatePickerModal} style={styles.input}>
                  <Text style={{ color: 'white' }}>
                    {joiningDate.toISOString().split('T')[0] || 'Joining Date'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={joiningDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                  />
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="white"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Code"
                  placeholderTextColor="white"
                  value={userCode}
                  onChangeText={setUserCode}
                />

                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
                  <Text style={styles.buttonText}>{isLoading ? 'Loading...' : 'Register'}</Text>
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
                  <Text style={styles.modalText}>{errorMessage }</Text>
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
  },
  keyboardContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
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
    textAlign: 'center',
  },
  underline: {
    width: 120,
    height: 2,
    backgroundColor: '#fff',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 5,
    color: 'white',
    justifyContent: 'left', // Center vertically
    alignItems: 'center', // Center horizontally
    flexDirection: 'row', // Use row direction for alignment
    fontSize:16,
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
});