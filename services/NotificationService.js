import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const setupNotifications = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
};

export const scheduleMealReminder = async (hour = 12, minute = 0) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Meal Time! 🍽️",
      body: "Don't forget to log your meal and track your nutrition.",
      sound: 'default',
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
};

export const scheduleWaterReminder = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Stay Hydrated! 💧",
      body: "Remember to drink water throughout the day.",
      sound: 'default',
    },
    trigger: {
      hour: 10,
      minute: 0,
      repeats: true,
    },
  });
};

export const sendLocalNotification = async (title, body) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
    },
    trigger: null,
  });
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
