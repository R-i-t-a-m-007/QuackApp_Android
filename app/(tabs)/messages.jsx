import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, ImageBackground, StatusBar, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

export default function MessagesScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user info
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('https://api.thequackapp.com/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setUserInfo(data.user);
      }
    } catch (error) {
      console.error('Fetch user info error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch('https://api.thequackapp.com/api/companies/company', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setCompanyInfo(data.company);
      }
    } catch (error) {
      console.error('Fetch company info error:', error);
    }
    finally {
      setLoading(false);
    }
  };
  
  const handleBackPress = async () => {
    await fetchUserInfo(); // Fetch user info before navigating
    if (userInfo) {
      const userPackage = userInfo.package;
      if (userPackage === 'Pro') {
        router.push('/prouserdash');
      } else if (userPackage === 'Basic') {
        router.push('/basicuserdash');
      }
      else if (companyInfo) {
        router.push('/companydash');
      } 
    } else {
        router.push('/companydash');
    }
  };
  

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
      fetchMessages();
      fetchCompanyInfo();
    }, [])
  );

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      // Handle the notification (e.g., fetch messages again)
      fetchMessages();
    });
  
    return () => {
      subscription.remove();
    };
  }, []);

  // Fetch messages
  const fetchMessages = async () => {

    const senderCode = userInfo?.userCode || companyInfo?.comp_code;

    if (!senderCode) return;
    try {
      const response = await fetch(`https://api.thequackapp.com/api/workers/${senderCode}/messages`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    const senderCode = userInfo?.userCode || companyInfo?.comp_code;
    if (!senderCode) {
      console.error('No user or company logged in.');
      return;
    }

    try {
      const response = await fetch(`https://api.thequackapp.com/api/workers/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: messageInput }),
      });
      if (response.ok) {
        setMessageInput('');
        await fetchMessages();
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  useEffect(() => { fetchUserInfo(); }, []);
  useEffect(() => { if (userInfo?.userCode) fetchMessages(); }, [userInfo]);

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
          {/* Keyboard Avoiding View */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
              {/* Navbar */}
              <LinearGradient colors={['#f3ae0a', '#f3ae0a', '#f3830a']} style={styles.navbar}>
              <TouchableOpacity onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
                <Text style={styles.navTitle}>Messages</Text>
                <Ionicons name="chatbubble" size={24} color="white" />
              </LinearGradient>

              {/* Messages List */}
              <View style={styles.messageContainer}>
                <FlatList
                  data={messages}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View style={[styles.messageBubble, item.senderId === userInfo?.userCode ? styles.myMessage : styles.otherMessage]}>
                      <Text style={styles.messageText}>{item.message}</Text>
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                
                />
              </View>
            </ScrollView>

            {/* Input Box */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="white"
                value={messageInput}
                onChangeText={setMessageInput}
                onSubmitEditing={sendMessage} // Allows sending message via keyboard return button
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                <Ionicons name="send" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
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
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'white',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
  },
  messageText: {
    fontSize: 16,
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3830a',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  sendButton: {
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3830a',
  },
});

