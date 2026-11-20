import { useState } from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, Button, Input, Card, Chip } from '../components/ui';
import { useAuth } from '../lib/auth';
import { authApi } from '../services/authApi';
import { colors } from '../constants/theme';

export default function EditProfile() {
  const { tab: initial } = useLocalSearchParams<{ tab?: string }>();
  const { user, updateProfile } = useAuth();
  const r = useRouter();

  const [tab, setTab] = useState<'data' | 'password'>(initial === 'password' ? 'password' : 'data');
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [pw, setPw] = useState({ old: '', n: '', n2: '' });

  const saveProfile = async () => {
    if (!name.trim()) return Alert.alert('Gagal', 'Nama tidak boleh kosong');
    try {
      setSaving(true);
      const updated = await authApi.updateProfile(name.trim(), phone.trim());
      updateProfile({ name: updated.name, phone: updated.phone ?? '' });
      Alert.alert('Berhasil', 'Profil berhasil disimpan', [{ text: 'OK', onPress: () => r.back() }]);
    } catch (e: any) {
      Alert.alert('Gagal', e.message);
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!pw.old) return Alert.alert('Gagal', 'Password lama wajib diisi');
    if (pw.n.length < 6) return Alert.alert('Gagal', 'Password baru minimal 6 karakter');
    if (pw.n !== pw.n2) return Alert.alert('Gagal', 'Konfirmasi password tidak sama');
    try {
      setSaving(true);
      await authApi.changePassword(pw.old, pw.n);
      setPw({ old: '', n: '', n2: '' });
      Alert.alert('Berhasil', 'Password berhasil diubah', [{ text: 'OK', onPress: () => r.back() }]);
    } catch (e: any) {
      Alert.alert('Gagal', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => r.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <T w="semibold" style={{ fontSize: 17 }}>Edit Profil</T>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 }}>
        <Chip label="Data Diri" active={tab === 'data'} onPress={() => setTab('data')} />
        <Chip label="Password" active={tab === 'password'} onPress={() => setTab('password')} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4 }} keyboardShouldPersistTaps="handled">
        {tab === 'data' ? (
          <Card>
            <Input label="Nama Lengkap" value={name} onChangeText={setName} />
            <Input label="Nomor HP" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            <Button title={saving ? 'Menyimpan...' : 'Simpan Perubahan'} onPress={saveProfile} disabled={saving} />
          </Card>
        ) : (
          <Card>
            <Input label="Password Lama" secureTextEntry value={pw.old} onChangeText={(v) => setPw({ ...pw, old: v })} />
            <Input label="Password Baru" placeholder="Min 6 karakter" secureTextEntry value={pw.n} onChangeText={(v) => setPw({ ...pw, n: v })} />
            <Input label="Ulangi Password Baru" secureTextEntry value={pw.n2} onChangeText={(v) => setPw({ ...pw, n2: v })} />
            <Button title={saving ? 'Menyimpan...' : 'Ubah Password'} onPress={savePassword} disabled={saving} />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}