import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ImageBackground, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkerMessagesScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorker = async () => {
    try {
      setLoading(true);
      setWorker(null); // Reset worker state to force re-fetching
      const response = await fetch('https://api.thequackapp.com/api/workers/me', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setWorker(data);
        fetchMessages(data.userCode);
      } else {
        console.error('Error fetching worker:', data.message);
      }
    } catch (error) {
      console.error('Fetch worker error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userCode) => {
    if (!userCode) return;
    try {
      const response = await fetch(`https://api.thequackapp.com/api/workers/${userCode}/messages`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages || []);
      } else {
        console.error('Error fetching messages:', data.message);
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWorker(); // Ensure worker is fetched each time screen is focused
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f3ae0a" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={require('@/assets/images/main-bg.jpg')}
          style={styles.container}
          resizeMode="cover"
        >
          <LinearGradient colors={['#f3ae0a', '#f3ae0a', '#f3830a']} style={styles.navbar}>
            <TouchableOpacity onPress={() => router.push('/workerdash')}>
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Received Messages</Text>
            <Ionicons name="chatbubble" size={24} color="white" />
          </LinearGradient>

          {messages.length > 0 ? (
            <FlatList
              data={messages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.messageBubble}>
                  <Text style={styles.messageText}>{item.message}</Text>
                </View>
              )}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            <View style={styles.noMessagesContainer}>
              <Text style={styles.noMessagesText}>No messages yet.</Text>
            </View>
          )}
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}

// Styles
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
  messageList: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'white',
  },
  messageText: {
    fontSize: 16,
    color: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3830a',
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMessagesText: {
    fontSize: 18,
    color: 'white',
  },
});
