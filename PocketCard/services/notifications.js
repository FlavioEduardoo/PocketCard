import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { brl } from '../utils/format';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Alertas do cartão',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Dispara na hora, quando uma compra esgota o limite do cartão
export async function notifyLimitReached(card) {
  if (!(await setupNotifications())) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Limite esgotado',
      body: `O limite do cartão ${card.bank} acabou.`,
    },
    trigger: null,
  });
}

// Agenda um aviso 1 dia antes do vencimento (9h) para cada cartão com fatura aberta
export async function syncDueReminders(items) {
  if (!(await setupNotifications())) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const { card, invoice } of items) {
    if (invoice.total <= 0) continue;
    const when = new Date(invoice.dueDate);
    when.setDate(when.getDate() - 1);
    when.setHours(9, 0, 0, 0);
    if (when.getTime() <= Date.now()) continue;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Fatura do ${card.bank} vence amanhã`,
        body: `Valor atual: ${brl(invoice.total)}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        channelId: 'default',
      },
    });
  }
}