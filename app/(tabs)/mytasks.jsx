import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
  SafeAreaView,
  Modal,
  Alert,
  Linking,
  Button,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

const MyTasksScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [jobIdToDelete, setJobIdToDelete] = useState(null);
  const slideAnim = useState(new Animated.Value(300))[0]; // Start off-screen

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.thequackapp.com/api/jobs/mine', {
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
    React.useCallback(() => {
      fetchMyTasks();
    }, [])
  );

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const confirmDelete = (jobId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this job?",
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
        { text: "Read Terms", onPress: async () => await WebBrowser.openBrowserAsync('https://thequackapp.com/app/terms-and-conditions') },
        { text: "Accept", onPress: () => handleDelete(jobId) }
      ]
    );
  };
  
  const handleDelete = async (jobId) => {
    console.log("🗑️ Job ID to Delete:", jobId); // Debugging log
  
    if (!jobId) {
      Alert.alert("Error", "Job ID is missing.");
      return;
    }
  
    try {
      const response = await fetch(`https://api.thequackapp.com/api/jobs/remove-accepted/${jobId}`, {
        method: "PUT",
        credentials: "include",
      });
  
      if (response.ok) {
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== jobId));
        Alert.alert("Success", "Job removed successfully!");
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to remove job.");
      }
    } catch (error) {
      console.error("❌ Error deleting job:", error);
      Alert.alert("Error", "An error occurred while deleting the job.");
    }
  };
  

  const showTermsPopup = async () => {
    Alert.alert(
      'Terms and Conditions',
      'Please read the terms and conditions before accepting the job.',
      [
        { text: 'Read Terms', onPress: async () => await WebBrowser.openBrowserAsync('https://quackapp-admin.netlify.app/terms-and-conditions') },
        { text: 'Accept', style: 'cancel' },
      ]
    );
  };
  

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)}>
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <TouchableOpacity onPress={() => confirmDelete(item._id)}>
            <MaterialIcons name="delete" size={24} color="red" /> {/* Delete icon */}
          </TouchableOpacity>
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
        <Text style={styles.loadingText}>Loading Tasks...</Text>
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
            <Text style={styles.headerTitle}>My Tasks</Text>
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
        {isDeleteModalVisible && (
          <Modal
            transparent={true}
            animationType="fade"
            visible={isDeleteModalVisible}
            onRequestClose={() => setIsDeleteModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent2}>
                <Text style={styles.modalTitle}>Confirm Deletion</Text>
                <Text>Are you sure you want to delete this job?</Text>
                <View style={styles.modalButtons}>
                    <Button title='Delete' onPress={handleDelete} color="red" />
                    <Button title='Cancel' onPress={() => setIsDeleteModalVisible(false)}  />
                </View>
              </View>
            </View>
          </Modal>
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
  noTasksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTasksText: {
    fontSize: 18,
    color: '#f3ae0a',
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
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
  },
  taskDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskDetailColumn: {
    flex: 1,
  },
  taskDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  taskDetails: {
    marginLeft: 5,
    fontSize: 14,
    color: '#555',
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
  modalContent2:{
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default MyTasksScreen;