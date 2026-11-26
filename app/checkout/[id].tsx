
import { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, Button, Card, Input, Row } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { colors } from '../../constants/theme';
import { formatRupiah } from '../../lib/format';
import { orderApi } from '../../services/orderApi';
import { payOrder } from '../../services/payment';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.18.121:5000/api';


type Tier = {
  id: number;
  name: string;
  price: number | string;
};

type Concert = {
  title: string;
  tiers: Tier[];
};

type Order = {
  id: number;
  status: string;
  total_price: number | string;
};

type SelectedItem = {
  ticket_tier_id: number;
  quantity: number;
};

export default function Checkout() {
  const { id, items } = useLocalSearchParams<{ id: string; items: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [concert, setConcert] = useState<Concert | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [method, setMethod] = useState('QRIS');
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  useEffect(() => {
    const load = async () => {
      try {
        if (!id || !items) throw new Error('Data konser tidak valid');

        const res = await fetch(`${API_URL}/concerts/${id}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.message || 'Gagal mengambil konser');

        const data = json.data ?? json;
        const parsed: SelectedItem[] = JSON.parse(items);

        if (!data.title || !Array.isArray(parsed) || !parsed.length ||
          parsed.some(i => !i.ticket_tier_id || !i.quantity || i.quantity < 1)) {
          throw new Error('Data tiket tidak valid');
        }

        if (parsed.some(i => !data.tiers?.some((t: Tier) => Number(t.id) === Number(i.ticket_tier_id)))) {
          throw new Error('Kategori tiket tidak ditemukan');
        }

        setConcert(data);
        setSelectedItems(parsed);

        const created = await orderApi.create(Number(id), parsed);
        setOrder(created);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, items]);

  const handlePay = async () => {
    if (!order || paying) return;

    try {
      setPaying(true);
      const result = await payOrder(order.id);

      if (result === 'paid') {
        router.replace({
          pathname: '/checkout/success',
          params: { orderId: String(order.id) },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Pembayaran gagal');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.text} />
        <T style={{ marginTop: 12, color: colors.muted }}>Mempersiapkan pesanan...</T>
      </View>
    );
  }

  if (error || !concert || !order) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <T style={{ color: colors.danger, marginBottom: 12 }}>{error || 'Data order tidak ditemukan'}</T>
        <Button title="Kembali" onPress={() => router.back()} />
      </View>
    );
  }

  const subtotal = selectedItems.reduce((sum, item) => {
    const tier = concert.tiers.find(t => Number(t.id) === Number(item.ticket_tier_id));
    return sum + Number(tier?.price || 0) * item.quantity;
  }, 0);

  const total = Number(order.total_price) || 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <T w="semibold" style={{ fontSize: 17 }}>Pembayaran</T>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
          <Card style={{ marginBottom: 14 }}>
            <T w="semibold">{concert.title}</T>
            {selectedItems.map(item => {
              const tier = concert.tiers.find(t => Number(t.id) === Number(item.ticket_tier_id));
              return (
                <T key={item.ticket_tier_id} style={{ color: colors.muted, fontSize: 12 }}>
                  {tier?.name} × {item.quantity} tiket
                </T>
              );
            })}
            <T style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>
              Order #{order.id} · {order.status}
            </T>
          </Card>

          <T w="semibold" style={{ marginBottom: 8 }}>Data Diri</T>
          <Input label="Nama Lengkap" value={name} onChangeText={setName} />
          <Input label="Nomor HP" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <Input label="Alamat Email" keyboardType="email-address" value={email} onChangeText={setEmail} />

     

          <Card style={{ marginTop: 10 }}>
            <Row l="Subtotal" r={formatRupiah(subtotal)} />
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
            <Row l="Total Pembayaran" r={formatRupiah(total)} bold />
          </Card>
        </ScrollView>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={{
        padding: 16,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}>
        <Button
          title={paying ? 'Memproses...' : `Bayar ${formatRupiah(total)}`}
          onPress={handlePay}
          disabled={paying}
        />
      </SafeAreaView>
    </View>
  );
}
