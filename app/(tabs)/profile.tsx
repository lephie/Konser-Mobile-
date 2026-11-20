import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, Button, Card, Row } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { colors } from '../../constants/theme';

export default function Profile() {
  const { user, logout } = useAuth();
  const r = useRouter();

  const menu = (icon: any, label: string, tab: 'data' | 'password') => (
    <Pressable
      onPress={() => r.push({ pathname: '/edit-profile', params: { tab } })}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}
    >
      <Ionicons name={icon} size={20} color={colors.primary} />
      <T style={{ flex: 1 }}>{label}</T>
      <Ionicons name="chevron-forward" size={18} color={colors.dim} />
    </Pressable>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <T w="bold" style={{ fontSize: 30, color: '#131313' }}>{user?.name?.[0]?.toUpperCase()}</T>
          </View>
          <T w="bold" style={{ fontSize: 18, marginTop: 10 }}>{user?.name}</T>
          <T style={{ color: colors.muted }}>{user?.email}</T>
        </View>

        <Card style={{ marginBottom: 14 }}>
          <Row l="Nama" r={user?.name ?? '-'} />
          <Row l="Email" r={user?.email ?? '-'} />
          <Row l="Nomor HP" r={user?.phone || '-'} />
        </Card>

        <Card style={{ marginBottom: 14 }}>
          {menu('create-outline', 'Edit Profil', 'data')}
          <View style={{ height: 1, backgroundColor: colors.border }} />
          {menu('lock-closed-outline', 'Ubah Password', 'password')}
        </Card>

        <Button title="Keluar" variant="danger" onPress={() => { logout(); r.replace('/(auth)/login'); }} />
      </ScrollView>
    </SafeAreaView>
  );
}