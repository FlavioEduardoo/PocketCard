import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { CardsProvider } from '../store/cards-context';
import { setupNotifications } from '../services/notifications';
import { colors } from '../utils/theme';

export default function RootLayout() {
  useEffect(() => {
    setupNotifications().catch(() => {});
  }, []);

  return (
    <CardsProvider>
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.ink },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="card/[id]" options={{ title: 'Cartão' }} />
        <Stack.Screen name="new-card" options={{ presentation: 'modal', title: 'Novo cartão' }} />
        <Stack.Screen
          name="new-expense"
          options={{ presentation: 'modal', title: 'Nova despesa' }}
        />
      </Stack>
    </CardsProvider>
  );
}