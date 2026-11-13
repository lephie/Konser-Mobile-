import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { T, Logo, Button, Input } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { colors } from '../../constants/theme';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<Record<string, string>>({});
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [wrongRole, setWrongRole] = useState(false);

  const submit = async () => {
   setWrongRole(false);
    const newError: Record<string, string> = {};

    if (!email.trim()) newError.email = 'Email wajib diisi';

    if (password.length < 8) newError.password = 'Password minimal 8 karakter';

    setErr(newError)
    if(Object.keys(newError).length > 0) return;


try {
      setLoading(true);
      setErr({}); // Reset error sebelumnya


      const result = await login(email.trim(), password);

      if (!result.ok) {
        setErr({ general: result.message || 'Email atau password salah' });
        return;
      }

      console.log('Navigating to tabs home...');
      router.replace('/(tabs)/home');
      
    } catch (error: any) {
      setErr({ general: 'Terjadi kesalahan koneksi. Silakan coba lagi.' });
    } finally {
      setLoading(false);
    }
  };


  return (
    <LinearGradient colors={[colors.magenta, colors.magenta2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }} keyboardShouldPersistTaps="handled">
            <View style={{ alignItems: 'center', marginBottom: 24 }}><Logo size={32} /></View>
            <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 22 }}>
              <T w="bold" style={{ fontSize: 22 }}>Masuk Akun</T>

              <T style={{ color: colors.muted, marginBottom: 18 }}>Masuk untuk membeli tiket konser favoritmu</T>
             
              {err.general ? (
                <View style={{ backgroundColor: '#FFEEEE', padding: 10, borderRadius: 8, marginBottom: 14 }}>
                  <T style={{ color: '#D8000C', fontSize: 13 }}>{err.general}</T>
                </View>
              ) : null}

              <Input 
              label="Email" 
              placeholder="nama@email.com" 
              autoCapitalize="none"
              keyboardType="email-address" 
              value={email}
              onChangeText={setEmail}
              error={err.email}
              editable={!loading} />

              <Input 
              label="Password" 
              placeholder="Min 8 karakter" 
              secureTextEntry value={password} 
              onChangeText={setPassword}
              error= {err.password}
              editable={!loading} />
              
          
              {err.general ? (
                <View style={{ backgroundColor: '#EF444420', borderRadius: 10, padding: 10, marginBottom: 12 }}>
                  <T style={{ color: colors.danger, fontSize: 13 }}>{error}</T>
                  {wrongRole && (
                    <Link href="/(auth)/register" style={{ color: colors.primary, marginTop: 6, fontFamily: 'Poppins_600SemiBold' }}>
                      Daftar akun pengguna baru →
                    </Link>
                  )}
                </View>
              ) : null}

              <Button 
              title="Masuk" 
              onPress={submit}
              disabled={loading}
               />

              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
                <T style={{ color: colors.muted }}>Belum punya akun? </T>
                <Link href="/(auth)/register" style={{ color: colors.primary, fontFamily: 'Poppins_600SemiBold' }}>Daftar</Link>
              </View>
            </View>
            <T style={{ color: '#fff', textAlign: 'center', marginTop: 14, fontSize: 12 }}>Tip demo: email berisi "admin" atau "eo" untuk mencoba penolakan peran.</T>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
