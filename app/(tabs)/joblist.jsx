import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JobList() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDetails, setUserDetails] = useState(null); // State to hold user details

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.thequackapp.com/api/jobs/company', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (response.ok) {
        setJobs(data);
      } else {
        console.error('Error fetching jobs:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [])
  );

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchUserInfo = async () => {
    try {
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
    }
  };

  const handleBackPress = async () => {
    try {
      // First try fetching user info
      const userResponse = await fetch('https://api.thequackapp.com/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      const userData = await userResponse.json();
  
      if (userResponse.ok && userData.user) {
        const userPackage = userData.user.package;
        if (userPackage === 'Pro') {
          router.push('/prouserdash');
        } else if (userPackage === 'Basic') {
          router.push('/basicuserdash');
        } else {
          router.push('/basicuserdash'); // fallback
        }
        return;
      }
  
      // If user info is not available, try fetching company info
      const companyResponse = await fetch('https://api.thequackapp.com/api/companies/company', {
        method: 'GET',
        credentials: 'include',
      });
      const companyData = await companyResponse.json();
  
      if (companyResponse.ok && companyData.company) {
        router.push('/companydash');
        return;
      }
  
      // If neither user nor company info is available, fallback
      router.push('/');
    } catch (error) {
      console.error('Error handling back press:', error);
      router.push('/');
    }
  };
  

  useEffect(() => {
    fetchUserInfo(); // Fetch user info when the component mounts
  }, []);

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
            <Text style={styles.navTitle}>Job List</Text>
            <Ionicons name="notifications" size={24} color="white" />
          </LinearGradient>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Job..."
              placeholderTextColor="#000"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search" size={24} color="#aaa" style={styles.searchIcon} />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="black" />
              <Text style={styles.loadingText}>Loading jobs...</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              {filteredJobs.length === 0 ? (
                <View style={styles.centeredView}>
                  <Text style={styles.centeredText}>No jobs available.</Text>
                </View>
              ) : (
                <View style={styles.cardSection}>
                  {filteredJobs.map((job, index) => (
                    <TouchableOpacity key={job._id} onPress={() => router.push(`/jobdetails?jobId=${job._id}`)}>
                      <View style={styles.card}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardTextBold}>{index + 1}. {job.title}</Text>
                          <View style={[styles.statusBadge, job.jobStatus === true ? styles.activeStatus : styles.inactiveStatus]}>
                            <Text style={styles.statusText}>{job.jobStatus === true ? "Completed" : "Incomplete"}</Text>
                          </View>
                        </View>
                        <View style={styles.cardBody}>
                          <View style={styles.row}>
                            <Ionicons name="location" size={18} color="#666" />
                            <Text style={styles.cardText}> {job.location}</Text>
                          </View>
                          <View style={styles.row}>
                          <Ionicons name="time" size={18} color="#666" />
                            <Text style={styles.cardText}> Date: {new Date(job.date).toLocaleDateString()}</Text>
                          </View>
                          <View style={styles.row}>
                            <Ionicons name="time" size={18} color="#666" />
                            <Text style={styles.cardText}> Shift: {job.shift}</Text>
                          </View>
                          <View style={styles.row}>
                            <Ionicons name="people" size={18} color="#666" />
                            <Text style={styles.cardText}> Workers Needed: {job.workersRequired}</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
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
    backgroundColor: 'white',
    borderRadius: 25,
    paddingLeft: 20,
    marginTop: 20,
    marginBottom: 20,
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
    marginTop: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTextBold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardBody: {
    marginTop: 5,
  },
  cardText: {
    fontSize: 15,
    color: '#555',
    marginTop: 0,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeStatus: {
    backgroundColor: '#28a745',
  },
  inactiveStatus: {
    backgroundColor: '#dc3545',
  },
  statusText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  centeredView: {
    alignItems: 'center',
    padding: 8,
  },
  centeredText: {
    fontSize: 20,
    color: 'black',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5, // Add some spacing between rows
  },
});