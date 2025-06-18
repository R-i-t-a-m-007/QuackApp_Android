import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export default function CompanyAccount() {
  const [selectedImage, setSelectedImage] = useState(null);
  const router = useRouter();
  const [companyDetails, setCompanyDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageLoading, setImageLoading] = useState(false); // For image loading

  // Fetch company details
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
        setError(data.message || 'Unable to fetch company data.');
      }
    } catch (error) {
      setError('Error fetching company data');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh the screen on focus
  useFocusEffect(
    useCallback(() => {
      fetchCompanyInfo();
    }, [])
  );

  // Logout handler
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await fetch('https://api.thequackapp.com/api/companies/logout', {
                method: 'POST',
                credentials: 'include',
              });
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'There was an issue logging out.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Function to upload image
  const uploadImage = async (uri) => {
    try {
      setImageLoading(true);

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Resize to 800px wide (adjust as needed)
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

        const res = await fetch(`https://api.thequackapp.com/api/companies/${companyDetails._id}/upload-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: `data:image/jpeg;base64,${manipulatedImage.base64}` }),
        });

        const data = await res.json();

        if (res.ok) {
          Alert.alert('Success', 'Image uploaded successfully!');
          fetchCompanyInfo(); // Refresh worker info to get the updated image  
        } else {
          console.error('Error uploading image:', data.message);
          Alert.alert('Error', data.message || 'Failed to upload image.');
        }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'An error occurred while uploading the image.');
    }
    finally {
      setImageLoading(false);
    }
  };

  // Function to pick an image
  // Function to pick an image
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        setSelectedImage(selectedUri); // Set the selected image URI
        uploadImage(selectedUri); // Upload the image
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'An error occurred while selecting the image.');
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
            <TouchableOpacity onPress={() => router.push('/companydash')}>
              <Ionicons name="arrow-back" size={30} color="white" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Company Account</Text>
            <Ionicons name="business" size={24} color="white" />
          </LinearGradient>

          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="black" />
                <Text style={styles.loadingText}>Loading Profile...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : (
              <View style={styles.contentContainer}>
                <View style={styles.profileSection}>
                  <View style={styles.profileImageContainer}>
                    <LinearGradient
                      colors={['#f3ae0a', '#f3830a']}
                      style={styles.profileImageGradient}
                    >
                      {imageLoading ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : companyDetails.image ? (
                          <Image source={{ uri: companyDetails.image }} style={styles.profileImage} />
                        ) : (
                          <Ionicons name="business" size={70} color="white" />
                        )}
                      <TouchableOpacity
                          style={styles.editIcon}
                          onPress={pickImage}
                          disabled={imageLoading}
                        >
                          <Ionicons
                            name={imageLoading ? 'hourglass' : 'image-outline'}
                            size={24}
                            color="white"
                          />
                        </TouchableOpacity>
                    </LinearGradient>
                  </View>
                  <Text style={styles.greeting}>Hi, {companyDetails.name}</Text>
                  <Text style={styles.welcome}>Welcome to your company profile</Text>
                </View>

                <View style={styles.detailsSection}>
                  <DetailCard label="Company Name" value={companyDetails.name || 'N/A'} icon="people" />
                  <DetailCard label="Company Code" value={companyDetails.comp_code || 'N/A'} icon="business" />
                  <DetailCard label="Email" value={companyDetails.email || 'N/A'} icon="mail" />
                  <DetailCard label="Phone" value={companyDetails.phone || 'N/A'} icon="call" />
                  <DetailCard label="Address" value={companyDetails.address || 'N/A'} icon="location" />
                  <DetailCard label="Country" value={companyDetails.country || 'N/A'} icon="flag" />
                  <DetailCard label="City" value={companyDetails.city || 'N/A'} icon="location" />
                  <DetailCard label="Postcode" value={companyDetails.postcode || 'N/A'} icon="home" />
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}

const DetailCard = ({ label, value, icon }) => (
  <View style={styles.detailCard}>
    <Ionicons name={icon} size={24} color="#f3ae0a" style={styles.icon} />
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3ae0a',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 0,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    elevation: 5,
  },
  navTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
  },
  profileImageContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  profileImageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 65,
  },
  editIcon: {
    position: 'absolute',
    top: 20,
    right: 15,
    borderRadius: 15,
    padding: 5,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  welcome: {
    marginTop: 5,
    fontSize: 18,
    color: '#555',
  },
  detailsSection: {
    width: '100%',
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  detailValue: {
    fontSize: 16,
    color: '#555',
  },
  logoutButton: {
    backgroundColor: '#000',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    width: '90%',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
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
});