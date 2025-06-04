import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  ImageBackground, Image, ScrollView, Alert, StatusBar, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser'; // ✅ Add this at the top


const PackageScreen = () => {
  const router = useRouter();
  const scrollViewRef = useRef();
  const [selectedPackage, setSelectedPackage] = useState(null);

  // 👇 Define Stripe Payment Links directly here
  const PAYMENT_LINKS = {
    Basic: 'https://buy.stripe.com/5kA5o32Vocg4880288', // replace with your real link
    Pro: 'https://buy.stripe.com/28obMrcvY7ZOfAs001',     // replace with your real link
  };

  const packages = [
    {
      id: 1,
      title: 'Basic Package',
      price: 14.95,
      features: ['One Company', 'One Login', 'One Department', 'One Set of Workers'],
    },
    {
      id: 2,
      title: 'Premium Package',
      price: 29.95,
      features: ['Many Companies', 'Many Logins', 'Many Departments', 'Multiple Worker Sets'],
    },
  ];

  const handleSelectPackage = (pkgId) => {
    setSelectedPackage(pkgId);
  };

  const handleNext = async () => {
    if (!selectedPackage) {
      Alert.alert('No Package Selected', 'Please select a package before proceeding.');
      return;
    }

    const selected = selectedPackage === 1 ? 'Basic' : 'Pro';
    const paymentLink = PAYMENT_LINKS[selected];

    try {
      // Store package in backend
      const storeRes = await fetch('https://api.thequackapp.com/api/auth/store-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ packageName: selected }),
      });

      if (!storeRes.ok) throw new Error('Failed to store selected package.');

      // Open Stripe Payment Link
      // Open Stripe Payment Link in in-app browser
      await WebBrowser.openBrowserAsync(paymentLink);

// ⚠️ Don't redirect to dashboard here, wait for Stripe to redirect back to the app.


      // Redirect to dashboard
      if (selected === 'Basic') {
        router.replace('/basicuserdash');
      } else {
        router.replace('/prouserdash');
      }

    } catch (err) {
      Alert.alert('Error', err.message || 'An error occurred.');
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground source={require('@/assets/images/main-bg.jpg')} style={styles.container} resizeMode="cover">
          <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.headerContainer}>
              <Image source={require('@/assets/images/logonew.png')} style={styles.logo} resizeMode="contain" />
              <Text style={styles.heading}>Packages</Text>
              <View style={styles.underline} />
            </View>

            <FlatList
              data={packages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={[styles.card, selectedPackage === item.id && styles.selectedCard]}>
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
                    >
                      <Text style={styles.buttonText}>Select Package</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id.toString()}
            />

            <TouchableOpacity style={styles.registerButton} onPress={handleNext}>
              <Text style={styles.registerButtonText}>Proceed to Payment</Text>
            </TouchableOpacity>
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
};

export default PackageScreen;

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
    backgroundColor: '#f0f0f0',
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 5,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  underline: {
    width: 60,
    height: 2,
    backgroundColor: '#fff',
    marginTop: 5,
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
  cardHeader: {
    backgroundColor: '#d94e04',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
    marginBottom: 10,
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
});
