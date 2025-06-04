import React, { useState, useEffect } from 'react';
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
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CompanyList() {
  const router = useRouter();
  const navigation = useNavigation();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [updatedCompany, setUpdatedCompany] = useState({});

  // Sliding modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(300))[0]; // Start off-screen

  // Fetch companies from the backend
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.thequackapp.com/api/companies/list');
      const data = await response.json();
      if (response.ok) {
        setCompanies(data);
      } else {
        console.error('Error fetching companies:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCompanies();
      setSearchQuery('');
    });
    return unsubscribe;
  }, [navigation]);

  const updateCompany = async () => {
    try {
      const response = await fetch(`http://quackapp-env-1.eba-gwsnxptf.us-east-1.elasticbeanstalk.com/api/companies/${selectedCompany._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCompany),
      });

      if (response.ok) {
        setCompanies((prevCompanies) =>
          prevCompanies.map((company) =>
            company._id === selectedCompany._id ? { ...company, ...updatedCompany } : company
          )
        );
        setSuccessMessage("Company updated successfully!");
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          closeEditModal();
          closeModal();
        }, 2000);
      } else {
        const data = await response.json();
        console.error('Error updating company:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteCompany = async (companyId) => {
    try {
      const response = await fetch(`http://quackapp-env-1.eba-gwsnxptf.us-east-1.elasticbeanstalk.com/api/companies/${companyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCompanies((prevCompanies) => prevCompanies.filter((company) => company._id !== companyId));
        setSuccessMessage("Company deleted successfully!");
        setShowSuccessModal(true);
        setIsModalVisible(false);
        setTimeout(() => setShowSuccessModal(false), 2000);
      } else {
        const data = await response.json();
        console.error('Error deleting company:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openModal = (company) => {
    setSelectedCompany(company);
    setUpdatedCompany({
      name: company.name,
      email: company.email,
      phone: company.phone,
      address: company.address,
      country: company.country,
      city: company.city,
      postcode: company.postcode,
    });
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

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <TouchableOpacity onPress={() => router.push('/prouserdash')}>
              <Ionicons name="arrow-back" size={30} color="white" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Company List</Text>
            <Ionicons name="notifications" size={24} color="white" />
          </LinearGradient>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Company..."
              placeholderTextColor="#000"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search" size={24} color="#aaa" style={styles.searchIcon} />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="black" />
              <Text style={styles.loadingText}>Loading companies...</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.cardSection}>
                {filteredCompanies.length === 0 ? (
                  <View style={styles.centeredView}>
                    <Text style={styles.centeredText}>No companies available</Text>
                  </View>
                ) : (
                  filteredCompanies.map((company) => (
                    <TouchableOpacity key={company._id} onPress={() => openModal(company)}>
                      <View style={styles.card}>
                        <View style={styles.cardContent}>
                        <View style={styles.profileImageModal}>
                        {company.image ? (
                          <Image
                            source={{ uri: company.image }}
                            style={styles.profileImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Ionicons name="business" size={28} color="#f3830a" />
                        )}
                      </View>


                          <View style={styles.cardInfo}>
                            <Text style={styles.cardTextBold}>{company.name}</Text>
                            <Text style={styles.cardText}>{company.city}, {company.country}</Text>
                          </View>

                          <Ionicons name="business" size={28} color="#f3830a" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </ScrollView>
          )}

          {isModalVisible && selectedCompany && (
            <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                <View style={styles.profileImageModal}>
                  {selectedCompany.image ? (
                    <Image
                      source={{ uri: selectedCompany.image }}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="business" size={40} color="#f3830a"/>
                  )}
                </View>

                  <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                    <Ionicons name="chevron-down-circle" size={30} color="#f3830a" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalDetails}>
                  <View style={styles.detailsRow}>
                    <Text style={styles.modalText}><Text style={styles.boldText}>Name:</Text></Text>
                    <Text style={styles.modalText}>{selectedCompany.name}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.modalText}><Text style={styles.boldText}>Email:</Text></Text>
                    <Text style={styles.modalText}>{selectedCompany.email}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.modalText}><Text style={styles.boldText}>Phone:</Text></Text>
                    <Text style={styles.modalText}>{selectedCompany.phone}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.modalText}><Text style={styles.boldText}>Company Code:</Text></Text>
                    <Text style={styles.modalText}>{selectedCompany.comp_code}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.modalText}><Text style={styles.boldText}>Address:</Text></Text>
                    <Text style={styles.modalText}>{selectedCompany.address}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.modalText}><Text style={styles.boldText}>City:</Text></Text>
                    <Text style={styles.modalText}>{selectedCompany.city}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.modalText}><Text style={styles.boldText}>Country:</Text></Text>
                    <Text style={styles.modalText}>{selectedCompany.country}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.modalText}><Text style={styles.boldText}>Postcode:</Text></Text>
                    <Text style={styles.modalText}>{selectedCompany.postcode}</Text>
                  </View>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={openEditModal} style={styles.editButton}>
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    setCompanyToDelete(selectedCompany._id);
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
                  <Text style={styles.modalTitle}>Edit Company</Text>
                  <View style={styles.editFields}>
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>Name:</Text>
                      <TextInput
                        style={styles.input}
                        value={updatedCompany.name}
                        onChangeText={(text) => setUpdatedCompany({ ...updatedCompany, name: text })}
                      />
                    </View>
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>Email:</Text>
                      <TextInput
                        style={styles.input}
                        value={updatedCompany.email}
                        onChangeText={(text) => setUpdatedCompany({ ...updatedCompany, email: text })}
                      />
                    </View>
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>Phone:</Text>
                      <TextInput
                        style={styles.input}
                        value={updatedCompany.phone}
                        onChangeText={(text) => setUpdatedCompany({ ...updatedCompany, phone: text })}
                      />
                    </View>
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>Address:</Text>
                      <TextInput
                        style={styles.input}
                        value={updatedCompany.address}
                        onChangeText={(text) => setUpdatedCompany({ ...updatedCompany, address: text })}
                      />
                    </View>
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>City:</Text>
                      <TextInput
                        style={styles.input}
                        value={updatedCompany.city}
                        onChangeText={(text) => setUpdatedCompany({ ...updatedCompany, city: text })}
                      />
                    </View>
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>Country:</Text>
                      <TextInput
                        style={styles.input}
                        value={updatedCompany.country}
                        onChangeText={(text) => setUpdatedCompany({ ...updatedCompany, country: text })}
                      />
                    </View>
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>Postcode:</Text>
                      <TextInput
                        style={styles.input}
                        value={updatedCompany.postcode}
                        onChangeText={(text) => setUpdatedCompany({ ...updatedCompany, postcode: text })}
                      />
                    </View>
                  </View>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={updateCompany} style={styles.editButton}>
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
            <Modal transparent={true}
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
                  <Text style={styles.confirmationText}>Are you sure you want to delete this company?</Text>
                  <View style={styles.confirmationButtons}>
                    <TouchableOpacity
                      onPress={() => {
                        deleteCompany(companyToDelete);
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
    gap:5
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInitials: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f3ae0a',
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
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0', // Optional placeholder background
    marginRight:10
  },
  
  modalImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f0f0',
  },
  
});