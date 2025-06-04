import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Modal,
  Button,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

export default function JobDetails() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const scrollViewRef = useRef();
  const [assignedWorkers, setAssignedWorkers] = useState([]);
  const [showAssignedWorkers, setShowAssignedWorkers] = useState(false);

  const fetchJobDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.thequackapp.com/api/jobs/${jobId}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setJob(data);
      } else {
        Alert.alert('Error', 'Failed to load job details.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching job details.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useFocusEffect(
    useCallback(() => {
      fetchJobDetails();
      fetchAssignedWorkers();
    }, [fetchJobDetails])
  );

  const fetchAssignedWorkers = async () => {
    if (!job) return;
  
    setSearchLoading(true);
    setShowAssignedWorkers(false);
    try {
      const response = await fetch(`https://api.thequackapp.com/api/jobs/assigned-workers/${job._id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.ok) {
        const data = await response.json();
        setAssignedWorkers(data);
        setShowAssignedWorkers(true);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch assigned workers.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch assigned workers.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    try {
      const response = await fetch(`https://api.thequackapp.com/api/jobs/job/${jobToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Job deleted successfully!');
        router.push('/joblist'); // Navigate back to the job list
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to delete job.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the job.');
    } finally {
      setIsModalVisible(false);
      setJobToDelete(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="black" />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.centeredView}>
        <Text style={styles.centeredText}>Job not found.</Text>
        <TouchableOpacity onPress={() => router.push('/joblist')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={require('@/assets/images/main-bg.jpg')}
          style={styles.container}
          resizeMode="cover"
        >
          <LinearGradient colors={['#f3ae0a', '#f3830a']} style={styles.navbar}>
            <TouchableOpacity onPress={() => router.push('/joblist')}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Job Details</Text>
            <Ionicons name="notifications" size={24} color ="white" />
          </LinearGradient>
          <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollView}>
            <View style={styles.jobDetailsContainer}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  setJobToDelete(job._id); // Set the job ID to delete
                  setIsModalVisible(true); // Show the confirmation modal
                }}
              >
                <Ionicons name="trash" size={24} color="red" />
              </TouchableOpacity>
              {/* Confirmation Modal */}
              <Modal
                transparent={true}
                animationType="fade"
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Confirm Deletion</Text>
                    <Text>Are you sure you want to delete this job?</Text>
                    <View style={styles.modalButtons}>
                      <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
                      <Button title="Delete" onPress={handleDeleteJob} color="red" />
                    </View>
                  </View>
                </View>
              </Modal>
              <View style={styles.jobInfoContainer}>
                <View style={styles.jobInfoRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="calendar" size={35} color="#f3ae0a" />
                    <Text style={styles.jobInfoText}>{new Date(job.date).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.iconContainer}>
                    <Ionicons name="location" size={35} color="#f3ae0a" />
                    <Text style={styles.jobInfoText}>{job.location}</Text>
                  </View>
                  <View style={styles.iconContainer}>
                    <Ionicons name="time" size={35} color="#f3ae0a" />
                    <Text style={styles.jobInfoText}>{job.shift}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.workersRequired}>Workers Required: {job.workersRequired}</Text>
              <Text style={styles.userCode}>User  Code: <Text style={styles.boldText}>{job.userCode}</Text></Text>
              <Text style={styles.jobDescription}>Description: <Text style={styles.boldText}>{job.description}</Text></Text>
              <TouchableOpacity onPress={fetchAssignedWorkers} style={styles.searchButton}>
                <Text style={styles.searchButtonText}>View Assigned Workers</Text>
              </TouchableOpacity>
              {searchLoading && <ActivityIndicator size="small" color="#f3ae0a" />}
              {showAssignedWorkers && (
                <View style={styles.workersList}>
                  <Text style={styles.workersListTitle}>Assigned Workers:</Text>
                  {assignedWorkers.length === 0 ? (
                    <Text style={styles.noWorkersText}>No workers assigned yet.</Text>
                  ) : (
                    assignedWorkers.map(worker => (
                      <View key={worker._id} style={styles.workerCard}>
                        <Ionicons name="person-circle" size={30} color="#f3ae0a" />
                        <Text style={styles.workerName}>{worker.name}</Text>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}
   
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3ae0a',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 20,
    color: 'black',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3ae0a',
  },
  centeredText: {
    fontSize: 18,
    marginBottom: 20,
    color: 'white',
  },
  backButton: {
    padding: 10,
    backgroundColor: '#f3830a',
    borderRadius: 5,
  },
  backButtonText: {
    color: 'white',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f3ae0a',
  },
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 20,
  },
  navTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  scrollView: {
    padding: 20,
  },
  jobDetailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  jobTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  jobInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  jobInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  iconContainer: {
    alignItems: 'center',
  },
  jobInfoText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    fontWeight: 'bold',
  },
  workersRequired: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userCode: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  jobDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  boldText: {
    fontWeight: 'bold',
  },
  searchButton: {
    padding: 15,
    backgroundColor: '#f3ae0a',
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    color: '#333',
  },
  noWorkersText: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },
  workerCard: {
    fontSize: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  workerName: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    fontSize: 20,
  },
  requestButton: {
    marginLeft: 'auto',
    padding: 10,
 backgroundColor: '#f3ae0a',
    borderRadius: 5,
  },
  requestedButton: {
    marginLeft: 'auto',
    padding: 10,
    backgroundColor: '#ccc', // Grey color for disabled state
    borderRadius: 5,
  },
  requestButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});