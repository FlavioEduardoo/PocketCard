import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../store/auth-context';
import { CardsProvider } from '../store/cards-context';
import { setupNotifications } from '../services/notifications';
import { colors } from '../utils/theme';

function NavigationGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    if (!user && !inAuthGroup) {
      // Redireciona para o login caso não esteja autenticado
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Redireciona para o app caso já esteja logado
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.ink },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ title: 'Cadastro' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="card/[id]" options={{ title: 'Cartão' }} />
      <Stack.Screen name="new-card" options={{ presentation: 'modal', title: 'Novo cartão' }} />
      <Stack.Screen
        name="new-expense"
        options={{ presentation: 'modal', title: 'Nova despesa' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    setupNotifications().catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <CardsProvider>
        <NavigationGuard />
      </CardsProvider>
    </AuthProvider>
  );
}
