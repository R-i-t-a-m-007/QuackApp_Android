import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Modal,
  Animated,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkerList() {
  const router = useRouter();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [workerToDelete, setWorkerToDelete] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerName, setWorkerName] = useState('');
  const [workerEmail, setWorkerEmail] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerJoiningDate, setWorkerJoiningDate] = useState('');
  const [userDetails, setUserDetails] = useState(null); // State to hold user details
  const [error, setError] = useState(null); // State to hold error messages

  // Sliding modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(300))[0]; // Start off-screen

  // Fetch approved workers from the backend
  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.thequackapp.com/api/workers/approved', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setWorkers(data);
      } else {
        console.error('Error fetching workers:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user info to determine the package
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchWorkers();
      fetchUserInfo(); // Fetch user info when the component is focused
    }, [])
  );

  const updateWorker = async () => {
    try {
      const updatedWorker = {
        name: workerName,
        email: workerEmail,
        phone: workerPhone,
        joiningDate: workerJoiningDate,
      };

      const response = await fetch(`https://api.thequackapp.com/api/workers/${selectedWorker._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedWorker),
      });

      if (response.ok) {
        setWorkers((prevWorkers) =>
          prevWorkers.map((worker) =>
            worker._id === selectedWorker._id ? { ...worker, ...updatedWorker } : worker
          )
        );
        setSuccessMessage("Worker updated successfully!");
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          closeEditModal();
          closeModal();
        }, 2000);
      } else {
        const data = await response.json();
        console.error('Error updating worker:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteWorker = async (workerId) => {
    try {
      const response = await fetch(` https://api.thequackapp.com/api/workers/${workerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWorkers((prevWorkers) => prevWorkers.filter((worker) => worker._id !== workerId));
        setSuccessMessage("Worker deleted successfully!");
        setShowSuccessModal(true);
        closeEditModal();
        closeModal();
        setTimeout(() => setShowSuccessModal(false), 2000);
      } else {
        const data = await response.json();
        console.error('Error deleting worker:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openModal = (worker) => {
    setSelectedWorker(worker);
    setWorkerName(worker.name);
    setWorkerEmail(worker.email);
    setWorkerPhone(worker.phone);
    setWorkerJoiningDate(worker.joiningDate);
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

  const openEditModal = () => {
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
  };

  const filteredWorkers = workers.filter((worker) => 
    worker.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBackPress = async () => {
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
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Worker List</Text>
            <Ionicons name="notifications" size={24} color="white" />
          </LinearGradient>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Worker..."
              placeholderTextColor="#000"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search" size={24} color="#aaa" style={styles.searchIcon} />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="black" />
              <Text style={styles.loadingText}>Loading workers...</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              {filteredWorkers.length === 0 ? (
                <View style={styles.centeredView}>
                  <Text style={styles.centeredText}>No workers available.</Text>
                </View>
              ) : (
                <View style={styles.cardSection}>
                  {filteredWorkers.map((worker) => (
                    <TouchableOpacity key={worker._id} onPress={() => openModal(worker)}>
                      <View style={styles.card}>
                        <View style={styles.cardContent}>
                          <View style={styles.profileImageModal}>
                            {worker.image ? (
                              <Image
                                source={{ uri: worker.image }}
                                style={styles.profileImage}
                                resizeMode="cover"
                              />
                            ) : (
                              <Ionicons name="person" size={28} color="#f3830a" />
                            )}
                          </View>
                          <View style={styles.cardInfo}>
                            <Text style={styles.cardTextBold}>{worker.name}</Text>
                            <Text style={styles.cardText}>
                              {worker.email}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          )}

          {isModalVisible && selectedWorker && (
            <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.profileImageModal}>
                    {selectedWorker.image ? (
                      <Image
                        source={{ uri: selectedWorker.image }}
                        style={styles.modalImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="person" size={40} color="#f3830a"/>
                    )}
                  </View>
                  <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                    <Ionicons name="chevron-down-circle" size={30} color="#f3830a" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalDetails}>
                  <View style={styles.detailsRow}>
                    <Text style={styles.modalText}><Text style={styles.boldText}>Name:</Text></Text>
                    <Text style={styles.modalText}>{selectedWorker.name}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.modalText}><Text style={styles.boldText}>Email:</Text></Text>
                    <Text style={styles.modalText}>{selectedWorker.email}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.modalText}><Text style={styles.boldText}>Phone:</Text></Text>
                    <Text style={styles.modalText}>{selectedWorker.phone}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.modalText}><Text style={styles.boldText}>Employee Code:</Text></Text>
                    <Text style={styles.modalText}>{selectedWorker.userCode}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.modalText}><Text style={styles.boldText}>Joining Date:</Text></Text>
                    <Text style={styles.modalText}>{new Date(selectedWorker.joiningDate).toLocaleDateString('en-GB')}</Text>
                  </View>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={openEditModal} style={styles.editButton}>
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    setWorkerToDelete(selectedWorker._id);
                    setShowConfirmModal(true);
                  }} style={styles.deleteButton}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}

          {isEditModalVisible && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={isEditModalVisible}
              onRequestClose={closeEditModal}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Edit Worker</Text>
                  <View style={styles.editFields}>
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>Name:</Text>
                      <TextInput
                        style={styles.input}
                        value={workerName}
                        onChangeText={setWorkerName}
                      />
                    </View>
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>Email:</Text>
                      <TextInput
                        style={styles.input}
                        value={workerEmail}
                        onChangeText={setWorkerEmail}
                      />
                    </View>
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>Phone:</Text>
                      <TextInput
                        style={styles.input}
                        value={workerPhone}
                        onChangeText={setWorkerPhone}
                      />
                    </View>
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>Role:</Text>
                      <TextInput
                        style={styles.input}
                        value={workerRole}
                        onChangeText={setWorkerRole}
                      />
                    </View>
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>Department:</Text>
                      <Text
                        style={styles.input}
                        value={workerDepartment}
                        onChangeText={setWorkerDepartment}
                      />
                    </View>
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>Address:</Text>
                      <TextInput
                        style={styles.input}
                        value={workerAddress}
                        onChangeText={setWorkerAddress}
                      />
                    </View>
                  </View>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={updateWorker} style={styles.editButton}>
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={closeEditModal} style={styles.deleteButton}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}

          {showSuccessModal && (
            <Modal
              transparent={true}
              animationType="fade"
              visible={showSuccessModal}
              onRequestClose={() => setShowSuccessModal(false)}
            >
              <View style={styles.successModal}>
                <View style={styles.successModalContent}>
                  <Text style={styles.successModalText}>{successMessage}</Text>
                </View>
              </View>
            </Modal>
          )}

          {showConfirmModal && (
            <Modal
              transparent={true}
              animationType="fade"
              visible={showConfirmModal}
              onRequestClose={() => setShowConfirmModal(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.confirmationContent}>
                  <Text style={styles.confirmationText}>Are you sure you want to delete this worker?</Text>
                  <View style={styles.confirmationButtons}>
                    <TouchableOpacity
                      onPress={() => {
                        deleteWorker(workerToDelete);
                        setShowConfirmModal(false);
                      }}
                      style={styles.confirmationButton}
                    >
                      <Text style={styles.confirmationButtonText}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowConfirmModal(false)} style={styles.confirmationButton}>
                      <Text style={styles.confirmationButtonText}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}
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
    paddingTop: 0,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 20,
    paddingTop: 20,
  },
  navTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9d34a',
    borderRadius: 25,
    paddingLeft: 20,
    marginTop: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    alignSelf: 'center',
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  searchIcon: {
    marginRight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
    color: 'black',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardSection: {
    flexDirection: 'column',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#f9d34a',
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  profileImageModal: {
    width: 60,
    height: 60,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTextBold: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
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
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  editButton: {
    backgroundColor: '#f3830a',
    padding: 10,
    borderRadius: 25,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 25,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  confirmationContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  confirmationText: {
    fontSize: 16,
    marginBottom: 15,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmationButton: {
    backgroundColor: '#f3830a',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  confirmationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  successModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    elevation: 10,
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  successModalContent: {
    alignItems: 'center',
  },
  successModalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  centeredText: {
    fontSize: 24,
    fontWeight: '300',
    color: 'black',
    textAlign: 'center',
    marginTop: 20,
  },
  profileImageModal: {
    width: 60,
    height: 60,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
  },
  input: {
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  editFields: {
    width: '100%',
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    width: '30%',
  },
  modalImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f0f0',
  },
});