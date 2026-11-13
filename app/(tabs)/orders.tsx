import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T, Chip, Badge, Card } from '../../components/ui';
import { orders, getConcert, Order } from '../../data';
import { colors, statusConfig } from '../../constants/theme';
import { formatDate, formatRupiah } from '../../lib/format';

const TABS: { label: string; key: Order['status'] | 'all' }[] = [
  { label: 'Semua', key: 'all' }, { label: 'Menunggu', key: 'pending' },
  { label: 'Berhasil', key: 'paid' }, { label: 'Kedaluwarsa', key: 'expired' },
];

export default function Orders() {
  const r = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('all');
  const list = orders.filter((o) => tab === 'all' || o.status === tab);
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <T w="bold" style={{ fontSize: 22, padding: 16, paddingBottom: 8 }}>Pesanan Saya</T>
      <View style={{ height: 52 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {TABS.map((t) => <Chip key={t.key} label={t.label} active={tab === t.key} onPress={() => setTab(t.key)} />)}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {list.length === 0 && <T style={{ color: colors.muted, textAlign: 'center', marginTop: 40 }}>Belum ada pesanan</T>}
        {list.map((o) => {
          const c = getConcert(o.concertId); const st = statusConfig[o.status];
          return (
            <Pressable key={o.id} onPress={() => r.push({ pathname: '/order/[id]', params: { id: o.id } })} style={{ marginBottom: 12 }}>
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <T style={{ color: colors.muted, fontSize: 11 }}>{o.id}</T>
                  <Badge label={st.label} color={st.color} />
                </View>
                <T w="semibold">{c.title}</T>
                <T style={{ color: colors.muted, fontSize: 12 }}>{formatDate(c.date)} • {c.venue}</T>
                <View style={{ borderTopWidth: 1, borderStyle: 'dashed', borderColor: colors.border, marginVertical: 10 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <T style={{ color: colors.muted }}>{o.tier} × {o.qty}</T>
                  <T w="bold" style={{ color: colors.primary }}>{formatRupiah(o.unitPrice * o.qty)}</T>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
