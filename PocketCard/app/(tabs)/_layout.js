import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

const icon = (name) => ({ color, size, focused }) => (
  <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />
);

export default function TabsLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtle,
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(13, 17, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        headerStyle: {
          backgroundColor: colors.bg,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderSubtle,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          color: colors.ink,
          fontWeight: '800',
          fontSize: 18,
          letterSpacing: -0.3,
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cartões',
          tabBarIcon: icon('card'),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Despesas',
          tabBarIcon: icon('receipt'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: icon('person'),
        }}
      />
    </Tabs>
  );
}
