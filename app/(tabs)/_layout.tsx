import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../../constants/theme';
import { useAuth } from '../../lib/auth';

const icon = (name: keyof typeof Ionicons.glyphMap) =>
  ({ color, size }: { color: any; size: number }) => <Ionicons name={name} size={size} color={color} />;

export default function TabsLayout() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  if (!user) return <Redirect href="/(auth)/login" />;
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.dim,
      tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: 58 + insets.bottom, paddingBottom: insets.bottom + 4, paddingTop: 6 },
      tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 10 },
    }}>
      <Tabs.Screen name="home" options={{ title: 'Beranda', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="orders" options={{ title: 'Pesanan', tabBarIcon: icon('receipt') }} />
      <Tabs.Screen name="tickets" options={{ title: 'Tiket', tabBarIcon: icon('ticket') }} />
      <Tabs.Screen name="notif" options={{ title: 'Notifikasi', tabBarIcon: icon('notifications') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: icon('person') }} />
    </Tabs>
  );
}
