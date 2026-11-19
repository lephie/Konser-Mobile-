
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, Button, Card, Row } from '../../components/ui';
import { colors } from '../../constants/theme';
import { formatRupiah } from '../../lib/format';
import { orderApi } from '../../services/orderApi';

export default function Success() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const r = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadOrder = async () => {
      try {
        const data = await orderApi.getById(Number(orderId));

        if (!active) return;

        if (data.status !== 'paid') {
          setError('Pembayaran belum terkonfirmasi.');
          return;
        }

        setOrder(data);
      } catch (e: any) {
        if (active) setError(e.message || 'Gagal mengambil data order');
      } finally {
        if (active) setLoading(false);
      }
    };

    if (orderId) loadOrder();
    else {
      setError('ID order tidak ditemukan');
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.text} />
        <T style={{ color: colors.muted, marginTop: 12 }}>Memeriksa pembayaran...</T>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Ionicons name="time-outline" size={60} color={colors.warning} />
          <T w="bold" style={{ fontSize: 20, marginTop: 12 }}>Pembayaran Belum Terkonfirmasi</T>
          <T style={{ color: colors.muted, textAlign: 'center', marginTop: 8 }}>
            {error || 'Silakan periksa status pesanan kamu.'}
          </T>
        </View>

        <Button title="Lihat Pesanan Saya" onPress={() => r.replace('/(tabs)/tickets')} />
        <Button title="Kembali ke Beranda" variant="outline" style={{ marginTop: 10 }} onPress={() => r.replace('/(tabs)/home')} />
      </SafeAreaView>
    );
  }

  const details = order.details ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: '#22C55E26',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="checkmark" size={52} color={colors.success} />
        </View>

        <T w="bold" style={{ fontSize: 22, marginTop: 16 }}>
          Pembayaran Berhasil!
        </T>

        <T style={{ color: colors.muted, textAlign: 'center', marginTop: 4 }}>
          Pembayaran sudah dikonfirmasi oleh server.
        </T>
      </View>

      <Card style={{ marginBottom: 20 }}>
        <Row l="Konser" r={order.concert?.title ?? '-'} />

        {details.map((item: any, index: number) => (
          <Row
            key={index}
            l={`${item.tier?.name ?? 'Tiket'} × ${item.quantity}`}
            r={formatRupiah(Number(item.subtotal))}
          />
        ))}

        <Row l="Metode" r={order.payment_method ?? '-'} />
        <Row l="Nomor Order" r={`#${order.id}`} />
        <Row l="Total" r={formatRupiah(Number(order.total_price))} bold />
      </Card>

      <Button
        title="Lihat Tiket Saya"
        onPress={() => r.replace('/(tabs)/tickets')}
      />

      <Button
        title="Kembali ke Beranda"
        variant="outline"
        style={{ marginTop: 10 }}
        onPress={() => r.replace('/(tabs)/home')}
      />
    </SafeAreaView>
  );
}
