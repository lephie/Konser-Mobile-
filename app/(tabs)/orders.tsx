
import { useCallback, useState } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T, Chip, Badge, Card } from '../../components/ui';
import { colors } from '../../constants/theme';
import { formatDate, formatRupiah } from '../../lib/format';
import { orderApi } from '../../services/orderApi';
import QrTicket from '../../components/QrTicket';

type OrderStatus = 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed';

type Order = {
  id: number;
  status: OrderStatus;
  total_price: number | string;
  created_at?: string;
  expires_at?: string;
  seconds_left?: number;
  concert?: {
    id: number;
    title: string;
    date: string;
    venue: string;
    location?: string;
  };
  details?: {
    id: number;
    quantity: number;
    unit_price: number | string;
    subtotal: number | string;
    tier?: {
      id: number;
      name: string;
    };
  }[];
};

const TABS = [
  { label: 'Semua', key: 'all' },
  { label: 'Menunggu', key: 'pending' },
  { label: 'Berhasil', key: 'paid' },
  { label: 'Kedaluwarsa', key: 'expired' },
  { label: 'Dibatalkan', key: 'cancelled' },
] as const;

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Menunggu Pembayaran', color: colors.warning },
  paid: { label: 'Berhasil', color: colors.success },
  expired: { label: 'Kedaluwarsa', color: colors.muted },
  cancelled: { label: 'Dibatalkan', color: colors.danger },
  failed: { label: 'Gagal', color: colors.danger },
};

const toNum = (value: number | string | undefined) => Number(value) || 0;

const getOrderList = (result: any): Order[] => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.rows)) return result.rows;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.data)) return result.data;
  return [];
};

export default function Orders() {
  const r = useRouter();

  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticket, setTickets] = useState<any[]>([])
  const loadOrders = useCallback(async () => {
    const [result, ticketResult] = await Promise.all([
      orderApi.getMyOrders(),
      orderApi.getMyTickets().catch(() => [])
    ]);
    setOrders(getOrderList(result))
    setTickets(getOrderList(ticketResult))
    try {
      setLoading(true);
      setError('');

      const result = await orderApi.getMyOrders();
      setOrders(getOrderList(result));
    } catch (e: any) {
      setError(e?.message ?? 'Gagal mengambil daftar pesanan');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const list = orders.filter(
    order => tab === 'all' || order.status === tab
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 14 }}>
        <T w="bold" style={{ fontSize: 24, marginBottom: 14 }}>
          Pesanan Saya
        </T>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingRight: 16 }}
        >
          {TABS.map(t => (
            <Chip
              key={t.key}
              label={t.label}
              active={tab === t.key}
              onPress={() => setTab(t.key)}
            />
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
          <T style={{ color: colors.muted, marginTop: 10 }}>
            Memuat pesanan...
          </T>
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <T style={{ color: colors.danger, textAlign: 'center', marginBottom: 12 }}>
            {error}
          </T>
          <Pressable onPress={loadOrders}>
            <T w="semibold" style={{ color: colors.primary }}>
              Coba Lagi
            </T>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {list.length === 0 && (
            <T style={{ color: colors.muted, textAlign: 'center', marginTop: 40 }}>
              Belum ada pesanan
            </T>
          )}

          {list.map(order => {
            const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const concert = order.concert;
            const details = order.details ?? [];

            return (
              <Pressable
                key={order.id}
                onPress={() =>
                  r.push({
                    pathname: '/order/[id]',
                    params: { id: String(order.id) },
                  })
                }
                style={{ marginBottom: 12 }}
              >
                <Card>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <T style={{ color: colors.muted, fontSize: 11 }}>
                      Order #{order.id}
                    </T>
                    <Badge label={status.label} color={status.color} />
                  </View>

                  <T w="semibold">
                    {concert?.title ?? 'Konser tidak ditemukan'}
                  </T>

                  {concert && (
                    <T style={{ color: colors.muted, fontSize: 12 }}>
                      {formatDate(concert.date)} • {concert.venue}
                    </T>
                  )}

                  <View style={{ borderTopWidth: 1, borderStyle: 'dashed', borderColor: colors.border, marginVertical: 10 }} />

                  {details.map((detail, index) => (
                    <View
                      key={detail.id ?? index}
                      style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}
                    >
                      <T style={{ color: colors.muted, fontSize: 12 }}>
                        {detail.tier?.name ?? 'Tiket'} × {detail.quantity}
                      </T>
                      <T style={{ fontSize: 12 }}>
                        {formatRupiah(toNum(detail.subtotal))}
                      </T>
                    </View>
                  ))}

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                    <T style={{ color: colors.muted }}>Total Pembayaran</T>
                    <T w="bold" style={{ color: colors.primary }}>
                      {formatRupiah(toNum(order.total_price))}
                    </T>
                  </View>
                  {order.status === 'paid' &&
                  ticket.filter(t => t.order_id === order.id).map((t, i) => (
                    <View key={t.id} style={{marginTop: 12}}>
                      <QrTicket 
                      code={String(t.qr_code ?? t.code ?? t.id)}
                      tier={t.tier?.name ?? details[0]?.tier?.name ?? 'Tiket'}
                      concert={concert?.title ?? ''}
                      index={i + 1}
                      />
                    </View>
                  ))
                  }
                </Card>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}