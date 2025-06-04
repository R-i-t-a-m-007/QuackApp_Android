import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { ActivityIndicator } from 'react-native';

export default function AgencyDash() {
  const router = useRouter();
  const [totalCompanies, setTotalCompanies] = useState(0); // Store the total companies
  const [loading, setLoading] = useState(false); // To control the loading state

  // Function to fetch the total number of companies
  const fetchTotalCompanies = async () => {
    setLoading(true); // Start loading
    try {
      const response = await fetch('https://api.thequackapp.com/api/companies/list'); // Adjust URL accordingly
      const data = await response.json();
      if (response.ok) {
        setTotalCompanies(data.length); // Assuming the data is an array of companies
      } else {
        console.error('Error fetching total companies:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false); // Stop loading after the request is finished
    }
  };

  // Fetch total companies whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchTotalCompanies(); // Reload companies when screen is focused
    }, [])
  );

  // Handle navigation to company list after fetching data
  const handleCompanyListNavigation = async () => {
    setLoading(true);
    await fetchTotalCompanies(); // Ensure you fetch total companies data first
    
    // Pass the totalCompanies count as a query parameter
    router.push({
      pathname: '/companylist',
      query: { totalCompanies: totalCompanies.toString() }, // Pass as string
    });
  };
  
  
  

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require('@/assets/images/main-bg.jpg')}
        style={styles.container}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['#f3ae0a', '#f3ae0a', '#f3830a']}
          style={styles.navbar}
        >
          <TouchableOpacity onPress={() => router.push('/packagescreen')}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Dashboard</Text>
          <Ionicons name="notifications" size={24} color="white" />
        </LinearGradient>

        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <LinearGradient
              colors={['#f3ae0a', '#f3ae0a', '#f3830a']}
              style={styles.profileImageGradient}
            >
              <Ionicons name="person" size={50} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.greeting}>Hi, there</Text>
          <Text style={styles.welcome}>Welcome back</Text>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.cardRow}>
            <TouchableOpacity style={styles.cardWrapper} onPress={handleCompanyListNavigation}>
              <LinearGradient
                colors={['#f3ae0a', '#f3ae0a', '#f3830a']}
                style={styles.card}
              >
                <Image
                  source={require('@/assets/images/company.png')}
                  style={styles.cardImage}
                />
                <Text style={styles.cardText}>TOTAL COMPANY</Text>
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.cardText2}>{totalCompanies}</Text> // Display total companies
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardWrapper} onPress={() => router.push('/addcompany')}>
              <LinearGradient
                colors={['#f3ae0a', '#f3ae0a', '#f3830a']}
                style={styles.card}
              >
                <Image
                  source={require('@/assets/images/add-company.png')}
                  style={styles.cardImage}
                />
                <Text style={styles.cardText}>ADD COMPANY</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cardWrapper}
            onPress={() => router.push('/myaccount')}
          >
            <LinearGradient
              colors={['#f3ae0a', '#f3ae0a', '#f3830a']}
              style={styles.card}
            >
              <Image
                source={require('@/assets/images/my-account.png')}
                style={styles.cardImage}
              />
              <Text style={styles.cardText}>MY ACCOUNT</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
        </TouchableOpacity>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingTop: 30,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  profileImageGradient: {
    flex: 1,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
  },
  welcome: {
    fontSize: 16,
    color: 'white',
  },
  cardSection: {
    width: '80%',
    alignItems: 'center',
    marginTop: 0,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  cardWrapper: {
    width: '45%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  card: {
    borderRadius: 10,
    height: 130,
    width: 130,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  cardImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  cardText: {
    marginTop: 10,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardText2: {
    marginTop: 5,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
  },
  cancelButton: {
    backgroundColor: '#000',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '90%',
    marginTop: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
