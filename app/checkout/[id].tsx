import { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, Button, Card, Input, Row } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { colors } from '../../constants/theme';
import { formatRupiah } from '../../lib/format';
import { orderApi } from '../../services/orderApi';
import { payOrder } from '../../services/payment';
import { TAX_RATE } from '../../data';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.13:5000/api';

const METHODS = [
  { id: 'QRIS', label: 'QRIS', sub: 'Scan dengan GoPay, OVO, DANA, dll', icon: 'qr-code' },
  { id: 'VA', label: 'Transfer Bank (Virtual Account)', sub: 'BCA, BNI, BRI, Mandiri', icon: 'business' },
  { id: 'EWALLET', label: 'E-Wallet', sub: 'GoPay, ShopeePay', icon: 'wallet' },
] as const;

type Tier = {
  id: string | number;
  name: string;
  price: number | string;
  quota: number;
  sold: number;
};

type Concert = {
  id: string | number;
  title: string;
  tiers?: Tier[];
};

type Order = {
  id: number;
  status: string;
  total_price: number | string;
  seconds_left: number;
  expires_at: string;
};

const toNum = (v: number | string | undefined) => Number(v) || 0;

export default function Checkout() {
  const { id, tierId, qty } = useLocalSearchParams<{
    id: string;
    tierId: string;
    qty: string;
  }>();

  const r = useRouter();
  const { user } = useAuth();

  const [c, setC] = useState<Concert | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState<string>('QRIS');
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  const n = Math.max(1, Number(qty) || 1);

  useEffect(() => {
    if (!id || !tierId) {
      setLoading(false);
      setError('Data konser tidak valid');
      return;
    }

    const ctrl = new AbortController();

    const loadCheckout = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch detail konser (publik, tanpa token)
        const res = await fetch(`${API_URL}/concerts/${id}`, { signal: ctrl.signal });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || 'Gagal mengambil detail konser');
        }

        const data = json.data ?? json;

        if (!data?.title) {
          throw new Error('Data konser tidak valid');
        }

        const found = (data.tiers ?? []).find(
          (t: Tier) => String(t.id) === String(tierId)
        );

        if (!found) {
          throw new Error('Kategori tiket tidak ditemukan');
        }

        setC(data);
        setTier(found);

        // 2. Create order → status pending di backend
        const created = await orderApi.create(Number(id), [
          { ticket_tier_id: Number(tierId), quantity: n },
        ]);

        if (ctrl.signal.aborted) return;
        setOrder(created);
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setError(e?.message ?? 'Terjadi kesalahan');
        }
      } finally {
        if (!ctrl.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadCheckout();
    return () => ctrl.abort();
  }, [id, tierId]);

  const handlePay = async () => {
    if(!order || paying ) return;
    try {
      setPaying(true);
      const outCome = await payOrder(order.id);
      if(outCome === 'paid'){
        r.replace({pathname: '/checkout/success', params: {orderId: String(order.id)}})
      }
    } catch (err) {
      
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.text} />
        <T style={{ marginTop: 12, color: colors.muted }}>Mempersiapkan pesanan...</T>
      </View>
    );
  }

  if (error || !c || !tier || !order) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <T style={{ color: colors.danger, textAlign: 'center', marginBottom: 12 }}>
          {error ?? 'Data order tidak ditemukan'}
        </T>
        <Button title="Kembali" onPress={() => r.back()} />
      </View>
    );
  }

  const subtotal = toNum(tier.price) * n;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = toNum(order.total_price);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
          <Pressable onPress={() => r.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <T w="semibold" style={{ fontSize: 17 }}>Pembayaran</T>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
          <Card style={{ marginBottom: 14 }}>
            <T w="semibold">{c.title}</T>
            <T style={{ color: colors.muted, fontSize: 12 }}>
              {tier.name} × {n} tiket
            </T>
            <T style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>
              Order #{order.id} · status: {order.status}
            </T>
          </Card>

          <T w="semibold" style={{ marginBottom: 8 }}>Data Diri</T>
          <Input label="Nama Lengkap" value={name} onChangeText={setName} />
          <Input label="Nomor HP" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <Input label="Alamat Email" keyboardType="email-address" value={email} onChangeText={setEmail} />

          <T w="semibold" style={{ marginBottom: 8 }}>Metode Pembayaran</T>
          <T style={{ color: colors.muted, fontSize: 11, marginBottom: 10 }}>
            Pilihan metode pembayaran tersedia pada halaman Midtrans.
          </T>

          {METHODS.map(m => (
            <Pressable key={m.id} onPress={() => setMethod(m.id)} style={{ marginBottom: 8 }}>
              <Card
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  borderColor: method === m.id ? colors.primary : colors.border,
                  borderWidth: method === m.id ? 2 : 1,
                }}
              >
                <Ionicons name={m.icon as any} size={22} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <T w="medium">{m.label}</T>
                  <T style={{ color: colors.muted, fontSize: 12 }}>{m.sub}</T>
                </View>
                <Ionicons
                  name={method === m.id ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={colors.primary}
                />
              </Card>
            </Pressable>
          ))}

          <Card style={{ marginTop: 10 }}>
            <Row l={`${tier.name} × ${n}`} r={formatRupiah(subtotal)} />
            <Row l="Pajak" r={formatRupiah(tax)} />
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
            <Row l="Total dari backend" r={formatRupiah(total)} bold />
          </Card>
        </ScrollView>
      </SafeAreaView>

      <SafeAreaView
        edges={['bottom']}
        style={{
          padding: 16,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Button
          title={paying ? 'Memproses..' :  `Bayar  ${formatRupiah(total)}`}
          onPress={handlePay}
          disabled={paying}
        />
      </SafeAreaView>
    </View>
  );
}