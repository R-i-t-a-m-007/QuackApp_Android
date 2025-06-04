import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateJob() {
  const scrollViewRef = useRef(); // Create a ref for the ScrollView
  const router = useRouter();
  const [jobDate, setJobDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [jobShift, setJobShift] = useState('');
  const [workersRequired, setWorkersRequired] = useState(1);
  const [jobDescription, setJobDescription] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null); // State to hold user details
  const [error, setError] = useState(null); // State to hold error messages

  const handleCreateJob = async () => {
    // Validate input fields
    if (!jobTitle || !jobDescription || !jobLocation || !jobShift) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const jobData = {
      title: jobTitle,
      description: jobDescription,
      location: jobLocation,
      date: jobDate.toISOString(),
      shift: jobShift,
      workersRequired,
    };

    

    setLoading(true);
    try {
      const response = await fetch('https://api.thequackapp.com/api/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      const textResponse = await response.text();
      

      if (response.ok) {
        const data = JSON.parse(textResponse);
        Alert.alert('Success', 'Job created successfully!');
      } else {
        const data = JSON.parse(textResponse);
        Alert.alert('Error', data.message || 'Failed to create job.');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      Alert.alert('Error', 'An error occurred while creating the job.');
    } finally {
      setLoading(false);
      // Clear input fields
      setJobTitle('');
      setJobDescription('');
      setJobLocation('');
      setJobShift('');
      setWorkersRequired(1);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('https://api.thequackapp.com/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setUserDetails(data.user);
      } else {
        setError(data.message || 'Unable to fetch user data.');
      }
    } catch (error) {
      setError('Error fetching user data');
      console.error('Fetch error:', error);
    }
  };

  const handleBackPress = async () => {
    await fetchUserInfo(); // Fetch user info before navigating
    if (userDetails) {
      const userPackage = userDetails.package; // Get the package from user details
      if (userPackage === 'Pro') {
        router.push('/prouserdash'); // Redirect to Pro User Dashboard
      } else if (userPackage === 'Basic') {
        router.push('/basicuserdash'); // Redirect to Basic User Dashboard
      }
    } else {
      router.push('/companydash'); // Fallback if user details are not available
    }
  };

  useEffect(() => {
    fetchUserInfo(); // Fetch user info when the component mounts
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={require('@/assets/images/main-bg.jpg')}
          style={styles.container}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['#f3ae0a', '#f3ae0a', '#f3830a']}
            style={styles.navbar}
          >
            <TouchableOpacity onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={30} color="white" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Create Job</Text>
            <Ionicons name="briefcase" size={30} color="white" />
          </LinearGradient>

          <ScrollView contentContainerStyle={styles.scrollContainer} ref={scrollViewRef}>
            {/* Job Title, Location, and Description */}
            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Job Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter job title"
                  value={jobTitle}
                  onChangeText={setJobTitle}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Job Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter job location"
                  value={jobLocation}
                  onChangeText={setJobLocation}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Job Description</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter job description"
                  multiline
                  numberOfLines={4}
                  value={jobDescription}
                  onChangeText={setJobDescription}
                />
              </View>
            </View>

            {/* Job Date and Shift */}
            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Job Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                  <Text style={styles.inputText}>{jobDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={jobDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setJobDate(selectedDate);
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Job Shift</Text>
                <View style={styles.shiftSelector}>
                  <TouchableOpacity
                    style={[styles.shiftButton, jobShift === 'AM' && styles.selectedShift]}
                    onPress={() => setJobShift('AM')}
                  >
                    <Text style={styles.shiftButtonText}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.shiftButton, jobShift === 'PM' && styles.selectedShift]}
                    onPress={() => setJobShift('PM')}
                  >
                    <Text style={styles.shiftButtonText}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Workers Required */}
            <View style={styles.card}>
              <View style={styles.workerContainer}>
                <Text style={styles.label}>Workers Required</Text>
                <View style={styles.workerSelector}>
                  <TouchableOpacity
                    onPress={() => setWorkersRequired(Math.max(1, workersRequired - 1))}
                    style={styles.workerButton}
                  >
                    <Text style={styles.workerButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.workerCount}>{workersRequired}</Text>
                  <TouchableOpacity
                    onPress={() => setWorkersRequired(workersRequired + 1)}
                    style={styles.workerButton}
                  >
                    <Text style={styles.workerButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Create Job Button */}
            <TouchableOpacity style={styles.createButton} onPress={handleCreateJob}>
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.createButtonText}>Create Job</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  navTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  scrollContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f3830a',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: 'white',
  },
  inputText: {
    color: '#000',
  },
  shiftSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shiftButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white',
    marginHorizontal: 5,
  },
  selectedShift: {
    backgroundColor: '#f3ae0a',
    color: 'white',
  },
  shiftButtonText: {
    fontWeight: 'bold',
  },
  workerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    width: '50%',
  },
  workerButton: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerButtonText: {
    fontSize: 30, // Increased size for better visibility
    fontWeight: 'semibold',
  },
  workerCount: {
    fontSize: 20,
    fontWeight: 'bold',
    width: '50%',
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    color: '#f3ae0a',
    fontSize: 18,
    fontWeight: 'bold',
 },
})