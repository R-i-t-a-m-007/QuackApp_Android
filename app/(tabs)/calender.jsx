import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Modal, Alert, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const CalendarScreen = () => {
  const router = useRouter();
  const [workerId, setWorkerId] = useState(null); // State to hold the worker ID
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null); // Change to hold a single shift
  const [modalVisible, setModalVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(false); // Loader state for initial loading
  const [loadingscreen, setLoadingScreen] = useState(true);

  const shifts = ['AM', 'PM'];

  // Fetch the logged-in worker's details
  const fetchLoggedInWorker = async () => {
    try {
      const response = await fetch('https://api.thequackapp.com/api/workers/me', {
        method: 'GET',
        credentials: 'include', // Include credentials for session management
      });

      if (response.ok) {
        const worker = await response.json();
        setWorkerId(worker._id); // Set the worker ID from the response
        fetchWorkerAvailability(worker._id); // Fetch availability after getting worker ID
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch worker details');
      }
    } catch (error) {
      console.error('Error fetching logged-in worker:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  // Fetch worker availability using the new route
  const fetchWorkerAvailability = async (id) => {
    try {
      const response = await fetch(`https://api.thequackapp.com/api/workers/${id}/availability-status`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const availabilityData = await response.json();
        const marked = {};
        availabilityData.forEach(item => {
          // Ensure the date is in the correct format (YYYY-MM-DD)
          const date = new Date(item.date).toISOString().split('T')[0];
          marked[date] = { selected: true, selectedColor: '#5cb3ff' }; // Mark available dates in blue
        });
        setMarkedDates(marked);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch availability');
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoadingScreen(false); // Set loading to false after fetching data
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchLoggedInWorker();
    }, [])
  );

  const handleDateSelect = (date) => {
    const selectedDateString = date.dateString;

    setMarkedDates((prev) => ({
      ...prev,
      [selectedDateString]: { selected: true, selectedColor: '#f3ae0a', customStyles: { container: { borderWidth: 2, borderColor: '#f3ae0a', borderRadius: 50 } } }, // Orange for the current selection
    }));

    setSelectedDate(selectedDateString);
    setSelectedShift(null);
  };

  const handleShiftSelect = (shift) => {
    setSelectedShift(shift); // Set the selected shift directly
  };

  const handleAvailability = async () => {
    if (!selectedDate) {
      Alert.alert('Please select a date');
      return;
    }

    if (!selectedShift) {
      Alert.alert('Please select a shift');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`https://api.thequackapp.com/api/workers/${workerId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          shift: selectedShift,
        }),
      });

      if (response.ok) {
        // Update markedDates to include the selected date
        setMarkedDates((prev) => ({
          ...prev,
          [selectedDate]: { selected: true, selectedColor: '#5cb3ff' }, // Blue color for permanent marking
        }));

        // Update the modal and reset state as needed
        setModalVisible(true);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/workerdash')}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={ styles.headerTitle}>Worker Availability</Text>
      </View>
      {loadingscreen ? ( // Show loading indicator while fetching data
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="black" />
          <Text style={styles.loaderText}>Loading availability...</Text>
        </View>
      ) : (
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={handleDateSelect}
            markingType={'custom'}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              todayTextColor: '#f3ae0a',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              monthTextColor: '#f3ae0a',
              indicatorColor: '#f3ae0a',
              textDayFontSize: 20,
              textMonthFontSize: 25,
              textDayHeaderFontSize: 16,
              selectedDayBackgroundColor: '#f3ae0a',
            }}
            style={styles.calendar}
          />
        </View>
      )}
      <View style={styles.shiftContainer}>
        <Text style={styles.shiftHeader}>Select Shift for {selectedDate}:</Text>
        <View style={styles.shifts}>
          {shifts.map((shift) => (
            <TouchableOpacity
              key={shift}
              style={[
                styles.shiftButton,
                selectedShift === shift && styles.shiftButtonSelected,
              ]}
              onPress={() => handleShiftSelect(shift)}
            >
              <Text
                style={[
                  styles.shiftText,
                  selectedShift === shift && styles.shiftTextSelected,
                ]}
              >
                {shift}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.markButton}
          onPress={handleAvailability}
        >
          <Text style={styles.markButtonText}>Mark Availability</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              You are marked available for {selectedDate} with shift: {selectedShift}.
            </Text>
            <TouchableOpacity onPress={closeModal} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="black" />
          <Text style={styles.loaderText}>Adding your shift...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  calendarContainer: {
    flex: 1,
    padding: 10,
  },
  calendar: {},
  shiftContainer: {
    padding: 30,
    backgroundColor: 'white',
  },
  shiftHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  shifts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  shiftButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#f3ae0a',
    borderRadius: 5,
    alignItems: 'center',
  },
  shiftButtonSelected: {
    backgroundColor: '#f3ae0a',
  },
  shiftText: {
    fontSize: 16,
    color: '#f3ae0a',
  },
  shiftTextSelected: {
    color: '#ffffff',
  },
  markButton: {
    backgroundColor: '#f3ae0a',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  markButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#f3ae0a',
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Optional: semi-transparent background
  },
  loaderText: {
    marginTop: 10,
    fontSize: 25,
    fontWeight: 'normal',
    color: 'black',
  },
});

export default CalendarScreen;