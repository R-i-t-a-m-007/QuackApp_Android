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
  Animated,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkerRequests() {
  const router = useRouter();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(300))[0];
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.thequackapp.com/api/workers/pending', {
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
      fetchUserInfo();
    }, [])
  );

  const approveWorker = async (workerId) => {
    try {
      const response = await fetch(`https://api.thequackapp.com/api/workers/approve/${workerId}`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (response.ok) {
        setWorkers((prevWorkers) => prevWorkers.filter((worker) => worker._id !== workerId));
        Alert.alert('Success', 'Worker approved successfully.');
      } else {
        const data = await response.json();
        console.error('Error approving worker:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteWorker = async (workerId) => {
    try {
      const response = await fetch(`https://api.thequackapp.com/api/workers/decline/${workerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWorkers((prevWorkers) => prevWorkers.filter((worker) => worker._id !== workerId));
        Alert.alert('Success', 'Worker request declined successfully.');
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
    setIsModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsModalVisible(false));
  };

  const filteredWorkers = workers.filter((worker) => 
    worker.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBackPress = async () => {
    if (userDetails) {
      const userPackage = userDetails.package;
      if (userPackage === 'Pro') {
        router .push('/prouserdash');
      } else if (userPackage === 'Basic') {
        router.push('/basicuserdash');
      }
    } else {
      router.push('/companydash');
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
            <Text style={styles.navTitle}>Worker Requests</Text>
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
                  <Text style={styles.centeredText}>No worker requests available.</Text>
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

                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => {
                              Alert.alert(
                                'Confirm Accept',
                                'Are you sure you want to accept this worker?',
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  { text: 'Accept', onPress: () => approveWorker(worker._id) }
                                ]
                              );
                            }}
                          >
                            <Text style={styles.buttonText}>Accept</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.declineButton}
                            onPress={() => {
                              Alert.alert(
                                'Confirm Decline',
                                'Are you sure you want to decline this worker?',
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  { text: 'Decline', onPress: () => deleteWorker(worker._id) }
                                ]
                              );
                            }}
                          >
                            <Text style={styles.buttonText}>Decline</Text>
                          </TouchableOpacity>
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
                    <Text style={styles.modalText}><Text style={styles .boldText}>Name:</Text></Text>
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
                    <Text style={styles.modalText}><Text style={styles.boldText}>User  Code:</Text></Text>
                    <Text style={styles.modalText}>{selectedWorker.userCode}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.modalText}><Text style={styles.boldText}>Request Date:</Text></Text>
                    <Text style={styles.modalText}>{new Date(selectedWorker.joiningDate).toLocaleDateString('en-GB')}</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: '#f3ae0a', // Green background for accept button
    borderRadius: 30,
    padding: 10,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: 'black', // Green background for accept button
    borderRadius: 30,
    padding: 10,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    alignItems: 'center',
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
});