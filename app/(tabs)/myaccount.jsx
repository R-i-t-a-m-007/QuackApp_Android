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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';


export default function MyAccount() {
  const router = useRouter();
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false); // For image loading



  // Fetch user details
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

  // Refresh the screen on focus
  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
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
              await fetch('https://api.thequackapp.com/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
              });
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('userPackage');
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

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? Your benefits will continue until the end of the billing cycle.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const response = await fetch('https://api.thequackapp.com/api/stripe/cancel-subscription', {
                method: 'POST',
                credentials: 'include',
              });
  
              const data = await response.json();
  
              if (response.ok) {
                Alert.alert('Success', data.message);
                //fetchUserInfo(); // Refresh user data
                router.push('/login');
              } else {
                Alert.alert('Error', data.message || 'Failed to cancel subscription');
              }
            } catch (error) {
              console.error('Cancel Subscription Error:', error);
              Alert.alert('Error', 'An error occurred while canceling the subscription.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? All the workers under this User will be deleted too.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`https://api.thequackapp.com/api/auth/users/${userDetails._id}`, {
                method: 'DELETE',
                credentials: 'include',
              });
  
              const data = await response.json();
  
              if (response.ok) {
                Alert.alert('Account Deleted', data.message || 'Your account has been deleted.');
                await AsyncStorage.clear();
                router.replace('/login');
              } else {
                Alert.alert('Error', data.message || 'Failed to delete account.');
              }
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'An error occurred while deleting your account.');
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
  
      // 1. Compress image to 50% quality and resize to 800px width
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Resize to 800px wide (adjust as needed)
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
  
      // 2. Send the base64 string to backend
      const res = await fetch(`https://api.thequackapp.com/api/auth/${userDetails._id}/upload-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: `data:image/jpeg;base64,${manipulatedImage.base64}` }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        Alert.alert('Success', 'Image uploaded successfully!');
        fetchUserInfo();
      } else {
        console.error('Upload failed:', data.message);
        Alert.alert('Error', data.message || 'Upload failed.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'An error occurred while uploading the image.');
    } finally {
      setImageLoading(false);
    }
  };

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

  const handleBackPress = () => {
    if (userDetails.package === 'Pro') {
      router.push('/prouserdash'); // Redirect to Pro User Dashboard
    } else if (userDetails.package === 'Basic') {
      router.push('/basicuserdash'); // Redirect to Basic User Dashboard
    } else {
      router.push('/companydash'); // Fallback to Company Dashboard if package is not defined
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
            style={ styles.navbar}
          >
            <TouchableOpacity onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={30} color="white" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>My Account</Text>
            <Ionicons name="person" size={30} color="white" />
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
                        <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="black" />
                      </View>
                      ) : userDetails.image ? (
                        <Image source={{ uri: userDetails.image }} style={styles.profileImage} />
                      ) : (
                        <Ionicons name="person" size={70} color="white" />
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
                  <Text style={styles.greeting}>Hi, {userDetails.username || ' User '}</Text>
                  <Text style={styles.welcome}>Welcome to your profile</Text>
                </View>

                <View style={styles.detailsSection}>
                  <DetailCard label="Name" value={userDetails.username || 'N/A'} icon="person" />
                  <DetailCard label="Code" value={userDetails.userCode || 'N/A'} icon="code-slash" />
                  <DetailCard label="Email" value={userDetails.email || 'N/A'} icon="mail" />
                  <DetailCard label="Phone" value={userDetails.phone || 'N/A'} icon="call" />
                  <DetailCard 
                    label="Package" 
                    value={userDetails.package || 'N/A'} 
                    icon="home" 
                  />
                  <DetailCard 
                    label="Subscription" 
                    value={userDetails.subscribed ? 'Active' : 'Cancelled'} 
                    icon="checkmark-circle" 
                  />
                  {!userDetails.subscribed && (
                    <DetailCard 
                      label="Subscription Ends"
                      value={
                        userDetails.subscriptionEndDate
                          ? new Date(userDetails.subscriptionEndDate).toLocaleDateString()
                          : 'N/A'
                      }
                      icon="calendar"
                    />
                  )}

                </View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.halfButton} onPress={handleLogout}>
                      <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.halfButton} onPress={handleDeleteAccount}>
                      <Text style={styles.logoutButtonText}>Delete Account</Text>
                    </TouchableOpacity>
                  </View>

                  {userDetails.subscribed && (
                    <TouchableOpacity style={styles.logoutButton} onPress={handleCancelSubscription}>
                      <Text style={styles.logoutButtonText}>Cancel Subscription</Text>
                    </TouchableOpacity>
                  )}
              </View>
            )}
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}

const DetailCard = ({ label, value, icon, onUpgrade }) => (
  <View style={styles.detailCard}>
    <Ionicons name={icon} size={24} color="#f3ae0a" style={styles.icon} />
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
    {onUpgrade && (
      <TouchableOpacity onPress={onUpgrade} style={styles.upgradeButton}>
        <Text style={styles.upgradeButtonText}>Upgrade</Text>
      </TouchableOpacity>
    )}
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
    width: '100%',
    padding: 20,
    paddingTop: 20,
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
    paddingTop: 10,
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
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  upgradeButton: {
    backgroundColor: '#f3ae0a',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  upgradeButtonText: {
    color: '#000',
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
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 10,
  },
  
  halfButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  test :{
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 25,
    paddingVertical: 20,
    alignItems: 'center',
    marginHorizontal: 5,
  }
  
});