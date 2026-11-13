import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T, Button, Input, Card } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { colors } from '../../constants/theme';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const r = useRouter();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saved, setSaved] = useState(false);
  const [pw, setPw] = useState({ old: '', n: '', n2: '' });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const changePw = () => {
    if (pw.n.length < 8) return setPwMsg({ ok: false, text: 'Password baru minimal 8 karakter' });
    if (pw.n !== pw.n2) return setPwMsg({ ok: false, text: 'Konfirmasi password tidak sama' });
    setPwMsg({ ok: true, text: 'Password berhasil diubah' }); setPw({ old: '', n: '', n2: '' });
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <T w="bold" style={{ fontSize: 30, color: '#131313' }}>{user?.name[0]?.toUpperCase()}</T>
          </View>
          <T w="bold" style={{ fontSize: 18, marginTop: 10 }}>{user?.name}</T>
          <T style={{ color: colors.muted }}>{user?.email}</T>
        </View>

        <Card style={{ marginBottom: 14 }}>
          <T w="semibold" style={{ marginBottom: 10 }}>Edit Profil</T>
          <Input label="Nama Lengkap" value={name} onChangeText={setName} />
          <Input label="Nomor HP" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          {saved && <T style={{ color: colors.success, marginBottom: 8 }}>Profil berhasil disimpan</T>}
          <Button title="Simpan Perubahan" onPress={() => { updateProfile({ name: name.trim(), phone }); setSaved(true); }} />
        </Card>

        <Card style={{ marginBottom: 14 }}>
          <T w="semibold" style={{ marginBottom: 10 }}>Ubah Password</T>
          <Input label="Password Lama" secureTextEntry value={pw.old} onChangeText={(v) => setPw({ ...pw, old: v })} />
          <Input label="Password Baru" placeholder="Min 8 karakter" secureTextEntry value={pw.n} onChangeText={(v) => setPw({ ...pw, n: v })} />
          <Input label="Ulangi Password Baru" secureTextEntry value={pw.n2} onChangeText={(v) => setPw({ ...pw, n2: v })} />
          {pwMsg && <T style={{ color: pwMsg.ok ? colors.success : colors.danger, marginBottom: 8 }}>{pwMsg.text}</T>}
          <Button title="Ubah Password" variant="outline" onPress={changePw} />
        </Card>

        <Button title="Keluar" variant="danger" onPress={() => { logout(); r.replace('/(auth)/login'); }} />
      </ScrollView>
    </SafeAreaView>
  );
}
