import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, Button, Card, Row } from '../../components/ui';
import { colors } from '../../constants/theme';
import { formatRupiah } from '../../lib/format';

export default function Success() {
  const p = useLocalSearchParams<{ concert: string; tier: string; qty: string; total: string; method: string }>();
  const r = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: '#22C55E26', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="checkmark" size={52} color={colors.success} />
        </View>
        <T w="bold" style={{ fontSize: 22, marginTop: 16 }}>Pembayaran Berhasil!</T>
        <T style={{ color: colors.muted, textAlign: 'center', marginTop: 4 }}>Tiketmu sudah aktif dan siap digunakan.</T>
      </View>
      <Card style={{ marginBottom: 20 }}>
        <Row l="Konser" r={p.concert} />
        <Row l="Kategori" r={`${p.tier} × ${p.qty}`} />
        <Row l="Metode" r={p.method} />
        <Row l="Total" r={formatRupiah(Number(p.total))} bold />
      </Card>
      <Button title="Lihat Tiket Saya" onPress={() => r.replace('/(tabs)/tickets')} />
      <Button title="Kembali ke Beranda" variant="outline" style={{ marginTop: 10 }} onPress={() => r.replace('/(tabs)/home')} />
    </SafeAreaView>
  );
}
