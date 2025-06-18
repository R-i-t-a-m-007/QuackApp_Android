import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, StatusBar, SafeAreaView, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';

export default function CompanyDash() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState({});

  const fetchCompanyInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.thequackapp.com/api/companies/company', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setCompanyDetails(data.company);
      } else {
        console.error(data.message || 'Unable to fetch company data.');
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCompanyInfo();
    }, [])
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
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Ionicons name="arrow-back" size={30} color="white" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Dashboard</Text>
            <Ionicons name="chatbubble-ellipses" size={24} color="white" onPress={()=>router.push('/messages')} />
          </LinearGradient>

          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <LinearGradient colors={['#f3ae0a', '#f3830a']} style={styles.profileImageGradient}>
                  {companyDetails.image ? (
                    <Image source={{ uri: companyDetails.image }} style={styles.profileImage} />
                  ) : (
                    <Ionicons name="business" size={60} color="white" />
                  )}
                </LinearGradient>
              </View>
              <Text style={styles.greeting}>Hi, {companyDetails.name}</Text>
              <Text style={styles.greetingcode}>({companyDetails.comp_code})</Text>
              <Text style={styles.welcome}>Welcome back</Text>
            </View>

            <View style={styles.cardSection}>
              <View style={styles.cardRow}>
                <TouchableOpacity style={styles.cardWrapper} onPress={() => router.push('/workerlist')}>
                  <LinearGradient colors={['#f3ae0a', '#f3ae0a', '#f3830a']} style={styles.card}>
                    <Ionicons name="person" size={50} color="black" />
                    <Text style={styles.cardText}>WORKER LIST</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cardWrapper} onPress={() => router.push('/workerrequest')}>
                  <LinearGradient colors={['#f3ae0a', '#f3ae0a', '#f3830a']} style={styles.card}>
                    <Ionicons name="people" size={50} color="black" />
                    <Text style={styles.cardText}>WORKER REQUESTS</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.cardRow}>
                <TouchableOpacity style={styles.cardWrapper} onPress={() => router.push('/createjob')}>
                  <LinearGradient colors={['#f3ae0a', '#f3ae0a', '#f3830a']} style={styles.card}>
                    <Ionicons name="briefcase" size={50} color="black" />
                    <Text style={styles.cardText}>CREATE JOB</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cardWrapper} onPress={() => router.push('/joblist')}>
                  <LinearGradient colors={['#f3ae0a', '#f3ae0a', '#f3830a']} style={styles.card}>
                    <Ionicons name="layers" size={50} color="black" />
                    <Text style={styles.cardText}>JOB LIST</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Third Row - Centered Card */}
              <View style={styles.cardRow}>
              <TouchableOpacity
                  style={styles.cardWrapper}
                  onPress={() => router.push('/checkshift')}
                >
                  <LinearGradient
                    colors={['#f3ae0a', '#f3ae0a', '#f3830a']}
                    style={styles.card}
                  >
                    <Ionicons name="calendar" size={50} color="black" />
                    <Text style={styles.cardText}>Check Shifts</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cardWrapper} onPress={() => router.push('/companyaccount')}>
                  <LinearGradient colors={['#f3ae0a', '#f3ae0a', '#f3830a']} style={styles.card}>
                    <Ionicons name="person-circle" size={50} color="black" />
                    <Text style={styles.cardText}>MY ACCOUNT</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
    backgroundColor: 'transparent',
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
  scrollContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
    marginTop: 50,
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
  greetingcode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  welcome: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  cardSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap:30
  },
  cardWrapper: {
    width: 150,
    marginHorizontal: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  card: {
    borderRadius: 10,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  cardText: {
    marginTop: 10,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
});