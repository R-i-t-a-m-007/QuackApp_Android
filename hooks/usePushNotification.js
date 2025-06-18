import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// 🔔 Foreground Notification Handler (popup, sound)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const usePushNotification = () => {
  const [expoPushToken, setExpoPushToken] = useState(null);

  useEffect(() => {
    async function registerForPushNotifications() {
      // ✅ Create Android Notification Channel FIRST
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX, // 👈 Must be MAX
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          enableVibrate: true,
          lockscreenVisibility: 1, // public
        });
      }

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

      // ✅ Get Expo push token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token:', token);
      setExpoPushToken(token);
    }

    registerForPushNotifications();

    // ✅ Foreground message listener
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
    });

    // ✅ Response (tap) listener
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Clicked:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return { expoPushToken };
};

export default usePushNotification;
