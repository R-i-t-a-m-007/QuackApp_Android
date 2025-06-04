import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IndividualDash() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({});
  const [error, setError] = useState("");

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('https://api.thequackapp.com/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setUserInfo(data.user); // Store the entire user object
      } else {
        setError(data.message || 'Unable to fetch user data.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } 
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
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
            <TouchableOpacity>
              <Ionicons name="person" size={26} color="white" onPress={() => router.push('/myaccount')} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Dashboard</Text>
            <Ionicons name="chatbubble-ellipses" size={24} color="white" onPress={()=>router.push('/messages')} />
          </LinearGradient>

          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <LinearGradient
                  colors={['#f3ae0a', '#f3830a']}
                  style={styles.profileImageGradient}
                >
                  {userInfo.image ? (
                    <Image source={{ uri: userInfo.image }} style={styles.profileImage} />
                  ) : (
                    <Ionicons name="person" size={70} color="white" />
                  )}
                </LinearGradient>
              </View>
              <Text style={styles.greeting}>Hi, {userInfo.username}</Text>
              <Text style={styles.greetingcode}>({userInfo.userCode})</Text>
              <Text style={styles.welcome}>Welcome back</Text> 
            </View>

            <View style={styles.cardSection}>
              <View style={styles.cardRow}>
                <TouchableOpacity
                  style={styles.cardWrapper}
                  onPress={() => router.push('/addcompany')}
                >
                  <LinearGradient
                    colors={['#f3ae0a', '#f3ae0a', '#f3830a']}
                    style={styles.card}
                  >
                    <Ionicons name="people" size={50} color="black" />
                    <Text style={styles.cardText}>Department/Location</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cardWrapper}
                  onPress={() => router.push('/companylist')}
                >
                  <LinearGradient
                    colors={['#f3ae0a', '#f3ae0a', '#f3830a']}
                    style={styles.card}
                  >
                    <Ionicons name="list" size={50} color="black" />
                    <Text style={styles.cardText}>View Locations/Departments</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.cardRow}>
              <TouchableOpacity
                  style={styles.cardWrapper}
                  onPress={() => router.push('/createjob')}
                >
                  <LinearGradient
                    colors={['#f3ae0a', '#f3ae0a', '#f3830a']}
                    style={styles.card}
                  >
                    <Ionicons name="add-circle" size={50} color="black" />
                    <Text style={styles.cardText}>Create Job</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cardWrapper}
                  onPress={() => router.push('/joblist')}
                >
                  <LinearGradient
                    colors={['#f3ae0a', '#f3ae0a', '#f3830a']}
                    style={styles.card}
                  >
                    <Ionicons name="briefcase" size={50} color="black" />
                    <Text style={styles.cardText}>Job List</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
              </View>

              <View style={styles.cardRow}>
              <TouchableOpacity
                  style={styles.cardWrapper}
                  onPress={() => router.push('/workerrequest')}
                >
                  <LinearGradient
                    colors={['#f3ae0a', '#f3ae0a', '#f3830a']}
                    style={styles.card}
                  >
                    <Ionicons name="people" size={50} color="black" />
                    <Text style={styles.cardText}>Worker Request</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cardWrapper}
                  onPress={() => router.push('/workerlist')}
                >
                  <LinearGradient
                    colors={['#f3ae0a', '#f3ae0a', '#f3830a']}
                    style={styles.card}
                  >
                    <Ionicons name="list" size={50} color="black" />
                    <Text style={styles.cardText}>Worker List</Text>
                  </LinearGradient>
                </TouchableOpacity>

                
              </View>

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
                    <Text style={styles.cardText}>Calendar</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cardWrapper}
                  onPress={() => router.push('/myaccount')}
                >
                  <LinearGradient
                    colors={['#f3ae0a', '#f3ae0a', '#f3830a']}
                    style={styles.card}
                  >
                    <Ionicons name="person" size={50} color="black" />
                    <Text style={styles.cardText}>My Account</Text>
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
    flexGrow: 1,
    justifyContent: 'center',
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
    width: '80%', // Adjusted width for better spacing
    alignItems: 'center',
    marginTop: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    width: '100%',
  },
  centeredCardRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardWrapper: {
    width: 130,
    marginHorizontal: 5, // Added margin for spacing
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
    textAlign:'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
})