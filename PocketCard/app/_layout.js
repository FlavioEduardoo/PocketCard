import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../utils/theme';
import { AuthProvider, useAuth } from '../store/auth-context';
import { CardsProvider } from '../store/cards-context';
import { setupNotifications } from '../services/notifications';

function NavigationGuard() {
  const { user, loading } = useAuth();
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup =
      segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'cadastro';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
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
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.ink, fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'Cadastro' }} />
        <Stack.Screen name="cadastro" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="card/[id]" options={{ title: 'Detalhes do Cartão' }} />
        <Stack.Screen
          name="new-card"
          options={{ presentation: 'modal', title: 'Novo Cartão' }}
        />
        <Stack.Screen
          name="new-expense"
          options={{ presentation: 'modal', title: 'Nova Despesa' }}
        />
        <Stack.Screen
          name="edit-card"
          options={{ presentation: 'modal', title: 'Editar Cartão' }}
        />
        <Stack.Screen
          name="edit-expense"
          options={{ presentation: 'modal', title: 'Editar Despesa' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    setupNotifications().catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CardsProvider>
          <NavigationGuard />
        </CardsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
