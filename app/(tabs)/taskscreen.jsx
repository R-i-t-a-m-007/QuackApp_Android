import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';


const TasksScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [jobIdToAccept, setJobIdToAccept] = useState(null);

  const slideAnim = useState(new Animated.Value(300))[0]; // Start off-screen

  const navigation = useNavigation();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.thequackapp.com/api/jobs/worker', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch tasks.');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('An error occurred while fetching tasks.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmAccept = (jobId) => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to accept this job?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => handleFirstConfirmation(jobId) }
      ]
    );
  };
  
  const handleFirstConfirmation = (jobId) => {
    Alert.alert(
      "Accept and Read Terms",
      "Please read the terms and conditions before accepting.",
      [
        { text: "Read Terms", onPress: async () => await WebBrowser.openBrowserAsync('https://thequackapp.com/app/terms-and-conditions/accept') },
        { text: "Accept", onPress: () => handleAcceptJob(jobId) }
      ]
    );
  };
  
  const handleAcceptJob = async (jobId) => {
    console.log("🔹 Job ID to Accept:", jobId); // Debugging log
  
    if (!jobId) {
      Alert.alert('Error', 'Job ID is missing.');
      return;
    }
  
    try {
      const response = await fetch(`https://api.thequackapp.com/api/jobs/accept/${jobId}`, {
        method: 'PUT',
        credentials: 'include',
      });
  
      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', data.message);
        fetchTasks(); // Refresh the task list after accepting the job
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to accept job.');
      }
    } catch (error) {
      console.error('❌ Error accepting job:', error);
      Alert.alert('Error', 'An error occurred while accepting the job.');
    }
  };
  
  

  const handleDeclineJob = async (jobId) => {
    try {
      const response = await fetch(`https://api.thequackapp.com/api/jobs/decline/${jobId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', data.message);
        fetchTasks(); // Refresh the task list after declining the job
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to decline job.');
      }
    } catch (error) {
      console.error('Error declining job:', error);
      Alert.alert('Error', 'An error occurred while declining the job.');
    }
  };

  const openModal = (task) => {
    setSelectedTask(task);
    setIsModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0, // Slide to the top
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300, // Slide back down
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsModalVisible(false));
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)}>
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <MaterialIcons name="work" size={24} color="#f3ae0a" />
        </View>
        <Text style={styles.taskDescription}>{item.description}</Text>
        <View style={styles.taskDetailsContainer}>
          <View style={styles.taskDetailColumn}>
            <View style={styles.taskDetail}>
              <MaterialIcons name="location-on" size={16} color="#555" />
              <Text style={styles.taskDetails}>{item.location}</Text>
            </View>
            <View style={styles.taskDetail}>
              <MaterialIcons name="calendar-today" size={16} color="#555" />
              <Text style={styles.taskDetails}>{new Date(item.date).toLocaleDateString('en-GB')}</Text>
            </View>
          </View>
          <View style={styles.taskDetailColumn}>
            <View style={styles.taskDetail}>
              <MaterialIcons name="access-time" size={16} color="#555" />
              <Text style={styles.taskDetails}>{item.shift}</Text>
            </View>
            <View style={styles.taskDetail}>
              <MaterialIcons name="group" size={16} color="#555" />
              <Text style={styles.taskDetails}>{item.workersRequired} Required</Text>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => confirmAccept(item._id)}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => handleDeclineJob(item._id)}
          >
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderModalContent = () => {
    if (!selectedTask) return null;

    return (
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{selectedTask.title}</Text>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Ionicons name="chevron-down-circle" size={30} color="#f3830a" />
          </TouchableOpacity>
        </View>
        <View style={styles.modalDetails}>
          <View style={styles.detailsRow}>
            <Text style={styles.modalText}><Text style={styles.boldText}>Description:</Text></Text>
            <Text style={styles.modalText}>{selectedTask.description}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.modalText}><Text style={styles.boldText}>Location:</Text></Text>
            <Text style={styles.modalText}>{selectedTask.location}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.modalText}><Text style={styles.boldText}>Date:</Text></Text>
            <Text style={styles.modalText}>{new Date(selectedTask.date).toLocaleDateString('en-GB')}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.modalText}><Text style={styles.boldText}>Shift:</Text></Text>
            <Text style={styles.modalText}>{selectedTask.shift}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.modalText}><Text style={styles.boldText}>Workers Required:</Text></Text>
            <Text style={styles.modalText}>{selectedTask.workersRequired}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f3ae0a" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/workerdash')} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          {showSearch ? (
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks..."
              placeholderTextColor="#fff"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          ) : (
            <Text style={styles.headerTitle}>Tasks Requests</Text>
          )}
          <TouchableOpacity onPress={() => setShowSearch((prev) => !prev)} style={styles.iconButton}>
            <MaterialIcons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
        {filteredTasks.length === 0 ? (
          <View style={styles.noTasksContainer}>
            <Text style={styles.noTasksText}>No tasks available</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.taskList}
            showsVerticalScrollIndicator={false}
          />
        )}
        {isModalVisible && selectedTask && (
          <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
            {renderModalContent()}
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3ae0a',
  },
  container: {
    flex: 1,
    backgroundColor: '#edeff2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3ae0a',
    padding: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    marginHorizontal: 10,
  },
  iconButton: {
    paddingHorizontal: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
  taskList: {
    padding: 20,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#f3ae0a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  taskDescription: {
    fontSize: 15,
    color: '#555',
    marginVertical: 5,
  },
  taskDetailsContainer: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskDetailColumn: {
    flex: 1,
  },
  taskDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskDetails: {
    fontSize: 15,
    color: '#777',
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: '#f3ae0a',
    borderRadius: 30,
    padding: 10,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: 'black',
    borderRadius: 30,
    padding: 10,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noTasksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTasksText: {
    fontSize: 18,
    color: '#f3ae0a',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f9d34a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalDetails: {
    marginBottom: 25,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailsRow: {
    width: '48%',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default TasksScreen;