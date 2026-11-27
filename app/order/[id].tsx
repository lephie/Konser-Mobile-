import { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, Badge, Card, Row, Button } from '../../components/ui';
import { colors, statusConfig, getTierColor } from '../../constants/theme';
import { formatDate, formatTime, formatRupiah } from '../../lib/format';
import { orderApi } from '../../services/orderApi';
import { payOrder } from '../../services/payment';
import QrTicket from '../../components/QrTicket';

type Order = {
    id: number;
    status: 'pending' | 'paid' | 'cancelled' | 'expired';
    total_price: number | string;
    payment_method?: string | null;
    expires_at: string;
    seconds_left: number;
    concert: { id: number; title: string; date: string; venue: string; location: string };
    details: {
        id: number;
        quantity: number;
        unit_price: number | string;
        subtotal: number | string;
        tier: { id: number; name: string };
    }[];
};

type Ticket = {
    id: number;
    qr_code: string;
    status: 'unused' | 'used' | 'cancelled';
    check_in_at?: string | null;
    tier?: { id: number; name: string };
    detail?: { id: number; order_id: number };
};

const getList = (result: any): Ticket[] => {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.items)) return result.items;
    if (Array.isArray(result?.rows)) return result.rows;
    return [];
};

export default function OrderDetail() {
    const { id, ticketId } = useLocalSearchParams<{ id: string; ticketId?: string }>();
    const r = useRouter();

    const [order, setOrder] = useState<Order | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const result: Order = await orderApi.getById(Number(id));
            setOrder(result);

            // tickets only exist once the order is paid
            if (result.status === 'paid' && result.concert?.id) {
                const all = getList(await orderApi.getTicketsByConcert(result.concert.id));
                setTickets(all.filter((t) => t.detail?.order_id === result.id));
            } else {
                setTickets([]);
            }
        } catch (error: any) {
            Alert.alert('Gagal', error.message || 'Gagal mengambil detail pesanan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handlePay = async () => {
        if (!order) return;
        try {
            setPaying(true);
            const outcome = await payOrder(order.id);
            if (outcome === 'paid') {
                r.replace({ pathname: '/checkout/success', params: { orderId: String(order.id) } });
                return;
            }
            if (outcome === 'failed') Alert.alert('Pembayaran gagal', 'Pesanan dibatalkan atau expired');
            await fetchOrder();
        } catch (error: any) {
            Alert.alert('Pembayaran gagal', error.message || 'Tidak dapat membuka pembayaran');
        } finally {
            setPaying(false);
        }
    };

    const handleCancel = (orderId: number) => {
        Alert.alert('Batalkan Order?', 'Kuota tiket akan dilepas dan tidak bisa dikembalikan.', [
            { text: 'Tidak', style: 'cancel' },
            {
                text: 'Ya, Batalkan',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await orderApi.cancel(orderId);
                        Alert.alert('Berhasil', 'Order dibatalkan');
                        await fetchOrder();
                    } catch (err: any) {
                        Alert.alert('Gagal', err.message);
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <T style={{ color: colors.muted, marginTop: 12 }}>Memuat pesanan...</T>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
                <T w="semibold" style={{ fontSize: 18, marginBottom: 12 }}>Pesanan tidak ditemukan</T>
                <Button title="Coba Lagi" onPress={fetchOrder} />
            </SafeAreaView>
        );
    }

    const concert = order.concert;
    const status = statusConfig[order.status];
    const usedCount = tickets.filter((t) => t.status === 'used').length;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
                <Pressable onPress={() => r.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <T w="semibold" style={{ fontSize: 17 }}>Detail Pesanan</T>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 30 }}>
                <Card style={{ marginBottom: 14 }}>
                    <Badge label={status?.label || order.status} color={status?.color || colors.muted} />
                    <T w="bold" style={{ fontSize: 19, marginTop: 12 }}>{concert?.title}</T>
                    <T style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>Order #{order.id}</T>

                    <View style={{ marginTop: 16, gap: 12 }}>
                        <Row l="Tanggal" r={`${formatDate(concert.date)} • ${formatTime(concert.date)}`} />
                        <Row l="Tempat" r={concert.venue} />
                        <Row l="Lokasi" r={concert.location} />
                        {order.payment_method ? <Row l="Metode" r={order.payment_method} /> : null}
                    </View>
                </Card>

                <Card style={{ marginBottom: 14 }}>
                    <T w="semibold" style={{ fontSize: 16, marginBottom: 14 }}>Detail Tiket</T>
                    {order.details?.map((item) => (
                        <View key={item.id} style={{ marginBottom: 14 }}>
                            <T w="semibold">{item.tier?.name || 'Tiket'}</T>
                            <Row
                                l={`${item.quantity} tiket × ${formatRupiah(Number(item.unit_price))}`}
                                r={formatRupiah(Number(item.subtotal))}
                            />
                        </View>
                    ))}
                    <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 12 }}>
                        <Row l="Total Pembayaran" r={formatRupiah(Number(order.total_price))} bold />
                    </View>
                </Card>

                {order.status === 'paid' && (
                    <>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <T w="semibold" style={{ fontSize: 16 }}>Tiket Kamu</T>
                            {tickets.length > 0 && (
                                <T style={{ color: colors.muted, fontSize: 12 }}>
                                    {usedCount}/{tickets.length} sudah check-in
                                </T>
                            )}
                        </View>

                        {tickets.length === 0 ? (
                            <Card style={{ marginBottom: 14 }}>
                                <T style={{ color: colors.muted, fontSize: 13 }}>
                                    Tiket sedang diterbitkan. Tarik ulang halaman ini sebentar lagi.
                                </T>
                            </Card>
                        ) : (
                            tickets.map((t, i) => (
                                <View key={t.id}>
                                    <QrTicket
                                        code={t.qr_code}
                                        tier={t.tier?.name ?? 'Tiket'}
                                        concert={concert.title}
                                        index={i + 1}
                                        tierId={getTierColor(t.tier?.name, t.tier?.id)}
                                        status={t.status}
                                        highlight={String(t.id) === ticketId}
                                    />
                                    {t.status === 'used' && t.check_in_at && (
                                        <T style={{ color: colors.muted, fontSize: 11, marginTop: -8, marginBottom: 14, textAlign: 'center' }}>
                                            Check-in {formatDate(t.check_in_at)} • {formatTime(t.check_in_at)}
                                        </T>
                                    )}
                                </View>
                            ))
                        )}
                    </>
                )}

                {order.status === 'pending' && (
                    <>
                        <Card style={{ marginBottom: 14 }}>
                            <T w="semibold" style={{ marginBottom: 6 }}>Batas Pembayaran</T>
                            <T style={{ color: colors.muted, fontSize: 13 }}>
                                {order.seconds_left > 0
                                    ? `Sisa waktu ${Math.floor(order.seconds_left / 60)} menit ${order.seconds_left % 60} detik`
                                    : 'Waktu pembayaran telah habis'}
                            </T>
                        </Card>

                        <Button
                            title={paying ? 'Memproses...' : `Bayar ${formatRupiah(Number(order.total_price))}`}
                            onPress={handlePay}
                            disabled={paying || order.seconds_left <= 0}
                        />

                        <Pressable
                            onPress={() => handleCancel(order.id)}
                            style={{ marginTop: 14, paddingVertical: 11, borderRadius: 10, backgroundColor: '#131313', borderWidth: 1, borderColor: '#DC2626', alignItems: 'center' }}
                        >
                            <T style={{ color: '#DC2626', fontSize: 13, fontWeight: '600' }}>Batalkan Pesanan</T>
                        </Pressable>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}