import { View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, Badge, Card, Row, Button } from '../../components/ui';
import QrTicket from '../../components/QrTicket';
import { orders, getConcert, ADMIN_FEE, TAX_RATE } from '../../data';
import { colors, statusConfig } from '../../constants/theme';
import { formatDate, formatTime, formatRupiah } from '../../lib/format';

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = useRouter();
  const o = orders.find((x) => x.id === id)!;
  const c = getConcert(o.concertId); const st = statusConfig[o.status];
  const sub = o.unitPrice * o.qty; const tax = Math.round(sub * TAX_RATE);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => r.back()}><Ionicons name="arrow-back" size={24} color="#fff" /></Pressable>
        <T w="semibold" style={{ fontSize: 17 }}>Detail Pesanan</T>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
        <Card style={{ marginBottom: 14 }}>
          <Badge label={st.label} color={st.color} />
          <T w="semibold" style={{ fontSize: 17, marginTop: 8 }}>{c.title}</T>
          <T style={{ color: colors.muted, fontSize: 12 }}>{o.id}</T>
          <T style={{ color: colors.muted, marginTop: 6 }}>{formatDate(c.date)} • {formatTime(c.date)}</T>
          <T style={{ color: colors.muted }}>{c.venue}, {c.city}</T>
        </Card>
        <Card style={{ marginBottom: 14 }}>
          <T w="semibold" style={{ marginBottom: 6 }}>Ringkasan Pembayaran</T>
          <Row l={`${o.tier} × ${o.qty}`} r={formatRupiah(sub)} />
          <Row l="Biaya admin" r={formatRupiah(ADMIN_FEE)} />
          <Row l="Pajak (11%)" r={formatRupiah(tax)} />
          <Row l="Total" r={formatRupiah(sub + ADMIN_FEE + tax)} bold />
        </Card>
        {o.status === 'pending' && <Button title="Bayar Sekarang" onPress={() => r.push({ pathname: '/checkout/[id]', params: { id: String(c.id), tierId: String(c.tiers.find((t) => t.name === o.tier)!.id), qty: String(o.qty) } })} />}
        {o.status === 'paid' && Array.from({ length: o.qty }, (_, i) => (
          <QrTicket key={i} code={`${o.id}-${i + 1}`} tier={o.tier} concert={c.title} index={i + 1} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
