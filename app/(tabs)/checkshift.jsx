import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  ImageBackground,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function WorkerAvailability() {
  const router = useRouter();
  const scrollViewRef = useRef();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);


  const shifts = ['AM', 'PM'];

  const handleDateChange = (event, date) => {
    if (date) setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleShiftSelection = (shift) => {
    setSelectedShift(shift);
  };

  const handleSearchWorkers = async () => {
    if (!selectedShift) {
      Alert.alert('Error', 'Please select a shift.');
      return;
    }

    setLoading(true);
    setAvailableWorkers([]); // Clear previous results
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];


      const response = await fetch(
        `https://api.thequackapp.com/api/workers/shift-date?date=${formattedDate}&shift=${selectedShift}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching workers:', errorData);
        Alert.alert('Error', errorData.message || 'No workers found.');
        return;
      }

      const data = await response.json();
      

      if (data.length === 0) {
        Alert.alert('No Workers Found', 'No workers are available for this shift and date.');
      }

      setAvailableWorkers(data);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch workers.');
    } finally {
      setLoading(false);
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
        return true;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  const handleBackPress = async () => {
    await fetchUserInfo(); // Fetch user info before navigating
    if (userDetails) {
      const userPackage = userDetails.package;
      if (userPackage === 'Pro') {
        router.push('/prouserdash');
      } else if (userPackage === 'Basic') {
        router.push('/basicuserdash');
      } 
    } else {
        router.push('/companydash');
    }
  };
  

  useEffect(() => {
    fetchUserInfo(); // Fetch user info when the component mounts
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground source={require('@/assets/images/main-bg.jpg')} style={styles.container} resizeMode="cover">
          <LinearGradient colors={['#f3ae0a', '#f3830a']} style={styles.navbar}>
            <TouchableOpacity onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Check Worker Availability</Text>
            <Ionicons name="notifications" size={24} color="white" />
          </LinearGradient>

          <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollView}>
            <View style={styles.selectionContainer}>
              <Text style={styles.sectionTitle}>Select Date:</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                <Text style={styles.datePickerText}>{selectedDate.toDateString()}</Text>
                <Ionicons name="calendar" size={20} color="black" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker value={selectedDate} mode="date" display="default" onChange={handleDateChange} />
              )}

              <Text style={styles.sectionTitle}>Select Shift:</Text>
              <View style={styles.shiftContainer}>
                {shifts.map((shift) => (
                  <TouchableOpacity
                    key={shift}
                    style={[
                      styles.shiftButton,
                      selectedShift === shift && styles.selectedShift,
                    ]}
                    onPress={() => handleShiftSelection(shift)}
                  >
                    <Text
                      style={[
                        styles.shiftText,
                        selectedShift === shift && styles.selectedShiftText,
                      ]}
                    >
                      {shift}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={handleSearchWorkers} style={styles.searchButton} disabled={loading}>
                {loading ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.searchButtonText}>Find Available Workers</Text>}
              </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator size="large" color="#f3ae0a" style={{ marginTop: 20 }} />}

            {availableWorkers.length > 0 && (
                <View style={styles.workersList}>
                    <Text style={styles.workersListTitle}>Available Workers:</Text>
                    {availableWorkers.map((worker) => (
                    <View key={worker._id} style={styles.workerCard}>
                        <Ionicons name="person-circle" size={42} color="#f3ae0a" />
                        <View style={styles.workerInfo}>
                        <Text style={styles.workerName}>{worker.name}</Text>
                        <Text style={styles.workerEmail}>{worker.email}</Text>
                        </View>
                    </View>
                    ))}
                </View>
                )}

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
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
    },
  
    navTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
  
    scrollView: {
      padding: 20,
    },
  
    selectionContainer: {
      padding: 16,
      backgroundColor: 'white',
      borderRadius: 10,
    },
  
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
  
    datePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10,
      backgroundColor: '#eee',
      borderRadius: 5,
      marginBottom: 5,
    },
  
    datePickerText: {
      fontSize: 16,
    },
  
    shiftContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
  
    shiftButton: {
      flex: 1,
      padding: 8,
      backgroundColor: '#ddd',
      alignItems: 'center',
      marginHorizontal: 5,
      borderRadius: 5,
    },
  
    selectedShift: {
      backgroundColor: '#f3ae0a',
    },
  
    selectedShiftText: {
      color: 'white',
      fontWeight: 'bold',
    },
  
    shiftText: {
      fontSize: 16,
    },
  
    searchButton: {
      backgroundColor: '#f3ae0a',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'center',
    },
  
    searchButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
  
    workersList: {
      marginTop: 20,
    },
  
    workersListTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
    },
  
    workerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor: '#fff',
      borderRadius: 10,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
  
    workerInfo: {
      marginLeft: 10,
    },
  
    workerName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 2
    },
  
    workerEmail: {
      fontSize: 15,
      color: '#666',
    },
  });
  