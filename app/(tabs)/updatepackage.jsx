import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ImageBackground,
  Alert,
  Modal,
  StatusBar,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const UpdatePackageScreen = () => {
  const router = useRouter();
  const scrollViewRef = useRef();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const packages = [
    {
      id: 1,
      title: 'Basic Version',
      price: 14.95,
      features: ['One Company', 'One Login', 'One Department', 'One Set of Workers'],
      disabled: true, // Disable the Basic package
    },
    {
      id: 2,
      title: 'Premium Version',
      price: 29.95,
      features: ['Many Companies', 'Many Logins', 'Many Departments', 'Multiple Worker Sets'],
    },
  ];

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const handleSelectPackage = (pkgId) => {
    if (!packages.find(pkg => pkg.id === pkgId).disabled) {
      setSelectedPackage(pkgId);
    }
  };

  const initializePaymentSheet = async (priceId) => {
    setLoading(true);
    try {
      const response = await fetch('https://api.thequackapp.com/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { clientSecret } = await response.json();
      if (!clientSecret) {
        throw new Error('PaymentIntent client secret is missing.');
      }

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
      });

      if (error) {
        Alert.alert('Error', error.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      openPaymentSheet();
    } catch (error) {
      console.error('Error initializing payment sheet:', error);
      Alert.alert('Error', 'Unable to process payment at the moment.');
      setLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      setModalMessage('Payment failed. Please try again.');
      setIsSuccess(false);
      setModalVisible(true); // Show failure modal immediately
    } else {
      setModalMessage('Payment successful! You are now a Pro User.');
      setIsSuccess(true);
      await storeSelectedPackage(); // Call the function to store the selected package
    }
  };

  const storeSelectedPackage = async () => {
    const packageName = 'Pro'; // Only allow Pro package

    try {
      const response = await fetch('https://api.thequackapp.com/api/auth/updatepackage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ newPackage: packageName }),
      });

      if (response.ok) {
        // Show success modal after storing the package
        setModalVisible(true);
        router.push('/prouserdash'); // Redirect to Pro User Dashboard
      } else {
        Alert.alert('Error', 'Failed to store selected package. Please try again.');
      }
    } catch (error) {
      console.error('Error storing selected package:', error);
      Alert.alert('Error', 'Something went wrong while storing the package.');
    }
  };

  const handleNext = async () => {
    if (!selectedPackage) {
      Alert.alert('No Package Selected', 'Please select a package before proceeding.');
 return;
    }

    const priceId = selectedPackage === 1
      ? 'price_1QU1Mq02CrK5yqCqx9csNo64'
      : 'price_1QU1Nt02CrK5yqCqi9yehdop';

    initializePaymentSheet(priceId);
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
          <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.headerContainer}>
              <Image source={require('@/assets/images/logonew.png')} style={styles.logo} resizeMode="contain" />
              <Text style={styles.heading}>Upgrade Package</Text>
              <View style={styles.underline} />
            </View>

            <FlatList
              data={packages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={[
                  styles.card, 
                  selectedPackage === item.id && styles.selectedCard, 
                  item.disabled && styles.disabledCard // Apply disabled style
                ]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardPrice}>€{item.price.toFixed(2)}/month</Text>
                  </View>
                  <View style={styles.cardBody}>
                    {item.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="black" />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                    <TouchableOpacity
                      style={[styles.selectButton, selectedPackage === item.id && styles.selectedButton]}
                      onPress={() => handleSelectPackage(item.id)}
                      disabled={item.disabled} // Disable the button if the package is disabled
                    >
                      <Text style={styles.buttonText}>Select Package</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.carouselContainer}
            />

            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={handleNext}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Processing...' : 'Upgrade Package'}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Modal for Upgrade Result */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
              if (isSuccess) {
                router.push('/prouserdash'); // Redirect to Pro User Dashboard on success
              }
            }}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, isSuccess ? styles.successModal : styles.failureModal]}>
                <Ionicons
                  name={isSuccess ? 'checkmark-circle' : 'close-circle'}
                  size={50}
                  color={isSuccess ? 'green' : 'red'}
                />
                <Text style={styles.modalText}>{modalMessage}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setModalVisible(false);
                    if (isSuccess) {
                      router.push('/prouserdash'); // Redirect handled in modal close
                    }
                  }}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
};

export default UpdatePackageScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3ae0a',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#f0f0f0'
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10
  },
  logo: {
    width:  100,
    height: 100,
    marginBottom: 5,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color : '#fff',
  },
  underline: {
    width: 60,
    height: 2,
    backgroundColor: '#fff',
    marginTop: 5,
  },
  carouselContainer: {
    alignItems: 'center',
    paddingVertical: 0,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: 250,
    height: 300,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 0,
    borderColor: 'white'
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
  },
  disabledCard: {
    backgroundColor: '#d3d3d3', // Light gray to indicate disabled state
  },
  cardHeader: {
    backgroundColor: '#d94e04',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  cardBody: {
    padding: 15,
    alignItems: 'start'
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: 'black'
  },
  selectButton: {
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    width: '100%'
  },
  selectedButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  registerButton: {
    backgroundColor: '#000',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '90%',
    marginBottom: 20
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: '#e0ffe5',
  },
  failureModal: {
    backgroundColor: '#ffe0e0',
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: 'black',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});