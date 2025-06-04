import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const usePushNotification = () => {
  const [expoPushToken, setExpoPushToken] = useState(null);

  useEffect(() => {
    async function registerForPushNotifications() {
      if (!Device.isDevice) {
        console.log('Must use a physical device for push notifications');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token:', token);
      setExpoPushToken(token);
    }

    registerForPushNotifications();
  }, []);

  return { expoPushToken };
};

export default usePushNotification; // ✅ Ensure default export