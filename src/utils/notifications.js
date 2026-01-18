import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuración de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Solicitar permisos
export const requestNotificationPermissions = async () => {
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
      lightColor: '#6366f1',
    });
  }

  return true;
};

// Notificación diaria para marcar turnos (8:00 AM)
export const scheduleDailyReminder = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Recuerda marcar tus turnos',
      body: '¡No olvides registrar los turnos de hoy en TurnosApp!',
      sound: true,
    },
    trigger: {
      hour: 8,
      minute: 0,
      repeats: true,
    },
  });
};

// Notificación de día de pago (miércoles 7:00 AM)
export const schedulePayDayReminder = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💰 ¡Hoy es día de pago!',
      body: 'Recuerda cobrar tu pago semanal',
      sound: true,
    },
    trigger: {
      weekday: 4, // Miércoles (1=Domingo, 4=Miércoles)
      hour: 7,
      minute: 0,
      repeats: true,
    },
  });
};

// Cancelar todas las notificaciones
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Enviar notificación inmediata (para testing)
export const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✅ Notificaciones activadas',
      body: 'Recibirás recordatorios diarios a las 8:00 AM',
      sound: true,
    },
    trigger: null,
  });
};
