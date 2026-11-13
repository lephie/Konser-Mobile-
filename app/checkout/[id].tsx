import { useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, Button, Card, Input, Row } from '../../components/ui';
import { getConcert, ADMIN_FEE, TAX_RATE } from '../../data';
import { useAuth } from '../../lib/auth';
import { colors } from '../../constants/theme';
import { formatRupiah } from '../../lib/format';

const METHODS = [
  { id: 'QRIS', label: 'QRIS', sub: 'Scan dengan GoPay, OVO, DANA, dll', icon: 'qr-code' },
  { id: 'VA', label: 'Transfer Bank (Virtual Account)', sub: 'BCA, BNI, BRI, Mandiri', icon: 'business' },
  { id: 'EWALLET', label: 'E-Wallet', sub: 'GoPay, ShopeePay', icon: 'wallet' },
] as const;

const HOLD_SECONDS = 900; // 15 menit, sama seperti web

export default function Checkout() {
  const { id, tierId, qty } = useLocalSearchParams<{ id: string; tierId: string; qty: string }>();
  const r = useRouter();
  const { user } = useAuth();
  const c = getConcert(Number(id));
  const tier = c.tiers.find((t) => t.id === Number(tierId))!;
  const n = Number(qty);
  const [method, setMethod] = useState<string>('QRIS');
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [left, setLeft] = useState(HOLD_SECONDS);

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const subtotal = tier.price * n;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + ADMIN_FEE + tax;
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const expired = left === 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
          <Pressable onPress={() => r.back()}><Ionicons name="arrow-back" size={24} color="#fff" /></Pressable>
          <T w="semibold" style={{ fontSize: 17 }}>Pembayaran</T>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
          <View style={{ backgroundColor: expired ? '#EF444420' : '#EAB30820', borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
            <T style={{ color: expired ? colors.danger : colors.warning }}>{expired ? 'Waktu pembayaran habis' : 'Selesaikan pembayaran dalam'}</T>
            <T w="bold" style={{ color: expired ? colors.danger : colors.warning }}>{mm}:{ss}</T>
          </View>

          <Card style={{ marginBottom: 14 }}>
            <T w="semibold">{c.title}</T>
            <T style={{ color: colors.muted, fontSize: 12 }}>{tier.name} × {n} tiket</T>
          </Card>

          <T w="semibold" style={{ marginBottom: 8 }}>Data Diri</T>
          <Input label="Nama Lengkap" value={name} onChangeText={setName} />
          <Input label="Nomor HP" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

          <T w="semibold" style={{ marginBottom: 8 }}>Metode Pembayaran</T>
          {METHODS.map((m) => (
            <Pressable key={m.id} onPress={() => setMethod(m.id)} style={{ marginBottom: 8 }}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: method === m.id ? colors.primary : colors.border, borderWidth: method === m.id ? 2 : 1 }}>
                <Ionicons name={m.icon as any} size={22} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <T w="medium">{m.label}</T>
                  <T style={{ color: colors.muted, fontSize: 12 }}>{m.sub}</T>
                </View>
                <Ionicons name={method === m.id ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} />
              </Card>
            </Pressable>
          ))}

          <Card style={{ marginTop: 10 }}>
            <Row l={`${tier.name} × ${n}`} r={formatRupiah(subtotal)} />
            <Row l="Biaya admin" r={formatRupiah(ADMIN_FEE)} />
            <Row l="Pajak (11%)" r={formatRupiah(tax)} />
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
            <Row l="Total" r={formatRupiah(total)} bold />
          </Card>
        </ScrollView>
      </SafeAreaView>
      <SafeAreaView edges={['bottom']} style={{ padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }}>
        {/* TODO integrasi: POST /orders -> dapat snap token -> buka Midtrans Snap di WebView (lihat README) */}
        <Button title={expired ? 'Waktu Habis' : `Bayar ${formatRupiah(total)}`} disabled={expired || !name.trim()}
          onPress={() => r.replace({ pathname: '/checkout/success', params: { concert: c.title, tier: tier.name, qty: String(n), total: String(total), method } })} />
      </SafeAreaView>
    </View>
  );
}
