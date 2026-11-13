import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { T, Logo, Button, Input } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { colors } from '../../constants/theme';

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [f, setF] = useState({ name: '', email: '', phone: '', pw: '', pw2: '' });
  const [loading, setLoading] = useState(false)
  const [e, setE] = useState<Record<string, string>>({});
  const set = (k: string) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    const er: Record<string, string> = {};
    if (!f.name.trim()) er.name = 'Nama lengkap wajib diisi';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = 'Format email tidak valid';
    if (f.phone && !/^[0-9]{9,14}$/.test(f.phone)) er.phone = 'Nomor HP tidak valid';
    if (f.pw.length < 8) er.pw = 'Password minimal 8 karakter';
    if (f.pw2 !== f.pw) er.pw2 = 'Password tidak sama';
    setE(er);
    if (Object.keys(er).length) return;

    try {
    setLoading(true)

    await register(f.name.trim(), f.email.trim(), f.phone, f.pw );

    router.replace('/(tabs)/home');
    } catch (error: any) {
      setE({email: error?.message || 'Gagal melakukan registrasi akun'})
    }finally{
      setLoading(false)
    }


  };

  return (
    <LinearGradient colors={[colors.magenta, colors.magenta2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }} keyboardShouldPersistTaps="handled">
            <View style={{ alignItems: 'center', marginBottom: 20 }}><Logo size={32} /></View>
            <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 22 }}>

              <T w="bold" style={{ fontSize: 22 }}>Buat Akun Baru</T>

              <T style={{ color: colors.muted, marginBottom: 18 }}>Daftar sebagai pengguna untuk mulai membeli tiket</T>
             
              <Input label="Nama Lengkap" placeholder="Nama kamu" value={f.name} onChangeText={set('name')} error={e.name} />
             
              <Input label="Email" placeholder="nama@email.com" autoCapitalize="none" keyboardType="email-address" value={f.email} onChangeText={set('email')} error={e.email} />
              
              <Input label="Nomor HP (Opsional)" placeholder="08xxxxxxxxxx" keyboardType="phone-pad" value={f.phone} onChangeText={set('phone')} error={e.phone} />
              
              <Input label="Password" placeholder="Min 8 karakter" secureTextEntry value={f.pw} onChangeText={set('pw')} error={e.pw} />
              
              <Input label="Ulangi Password" placeholder="Ulangi password" secureTextEntry value={f.pw2} onChangeText={set('pw2')} error={e.pw2} />
             
              <Button 
              title={loading ? 'Memproses' : 'Daftar' } 
              onPress={submit}
              disabled={loading}
               />
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>

                <T style={{ color: colors.muted }}>Sudah punya akun? </T>

                
                <Link href="/(auth)/login" style={{ color: colors.primary, fontFamily: 'Poppins_600SemiBold' }}>Masuk</Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
