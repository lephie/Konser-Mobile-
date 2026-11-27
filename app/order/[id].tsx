
import { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, Badge, Card, Row, Button } from '../../components/ui';
import { colors, statusConfig } from '../../constants/theme';
import { formatDate, formatTime, formatRupiah } from '../../lib/format';
import { orderApi } from '../../services/orderApi';
import { payOrder } from '../../services/payment';

type Order = {
    id: number;
    status: 'pending' | 'paid' | 'cancelled' | 'expired';
    total_price: number | string;
    expires_at: string;
    seconds_left: number;
    concert: {
        id: number;
        title: string;
        date: string;
        venue: string;
        location: string;
    };
    details: {
        id: number;
        quantity: number;
        unit_price: number | string;
        subtotal: number | string;
        tier: {
            id: number;
            name: string;
        };
    }[];
};

export default function OrderDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const r = useRouter();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const result = await orderApi.getById(Number(id));
            setOrder(result);
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
                r.replace({ pathname: 'checkout/success', params: { orderId: String(order.id) } })
            }
            if (outcome === 'failed') {
                Alert.alert('Pembayaran gagal', 'Pesanan dibatalkan atau expired')
            }

            await fetchOrder()

        } catch (error: any) {
            Alert.alert('Pembayaran gagal', error.message || 'Tidak dapat membuka pembayaran');
        } finally {
            setPaying(false);
        }
    };

    const handleCancel = async (orderId: number) => {
        Alert.alert(
            'Batalkan Order?',
            'Kuota tiket akan dilepas dan tidak bisa dikembalikan.',
            [
                { text: 'Tidak', style: 'cancel' },
                {
                    text: 'Ya, Batalkan',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const updated = await orderApi.cancel(orderId);
                            // updated = order terbaru dari backend (status 'cancelled')
                            Alert.alert('Berhasil', 'Order dibatalkan');
                            // misal: refresh list atau navigasi
                            // router.back();
                        } catch (err: any) {
                            Alert.alert('Gagal', err.message);
                        }
                    },
                },
            ]
        );
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
                <T w="semibold" style={{ fontSize: 18 }}>Pesanan tidak ditemukan</T>
                <Button title="Coba Lagi" onPress={fetchOrder} />
            </SafeAreaView>
        );
    }

    const concert = order.concert;
    const status = statusConfig[order.status];

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
                    <Badge
                        label={status?.label || order.status}
                        color={status?.color || colors.muted}
                    />

                    <T w="bold" style={{ fontSize: 19, marginTop: 12 }}>
                        {concert?.title}
                    </T>

                    <T style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
                        Order #{order.id}
                    </T>

                    <View style={{ marginTop: 16, gap: 12 }}>
                        <Row
                            l="Tanggal"
                            r={`${formatDate(concert.date)} • ${formatTime(concert.date)}`}
                        />
                        <Row l="Tempat" r={concert.venue} />
                        <Row l="Lokasi" r={concert.location} />
                    </View>
                </Card>

                <Card style={{ marginBottom: 14 }}>
                    <T w="semibold" style={{ fontSize: 16, marginBottom: 14 }}>
                        Detail Tiket
                    </T>

                    {order.details?.map((item) => (
                        <View key={item.id} style={{ marginBottom: 14 }}>
                            <T w="semibold">{item.tier?.name || 'Tiket'}</T>
                            <Row
                                l={`${item.quantity} tiket × ${formatRupiah(Number(item.unit_price))}`}
                                r={formatRupiah(Number(item.subtotal))}
                            />
                        </View>
                    ))}

                    <View style={{ borderTopWidth: 1, borderColor: '#333', paddingTop: 12 }}>
                        <Row
                            l="Total Pembayaran"
                            r={formatRupiah(Number(order.total_price))}
                            bold
                        />
                    </View>
                </Card>

                {order.status === 'pending' && (
                    <Card style={{ marginBottom: 14 }}>
                        <T w="semibold" style={{ marginBottom: 6 }}>
                            Batas Pembayaran
                        </T>
                        <T style={{ color: colors.muted, fontSize: 13 }}>
                            {order.seconds_left > 0
                                ? `Sisa waktu ${Math.floor(order.seconds_left / 60)} menit ${order.seconds_left % 60} detik`
                                : 'Waktu pembayaran telah habis'}
                        </T>
                    </Card>
                )}

                {order.status === 'pending' && (
                    <Button
                        title={paying ? 'Memproses...' : `Bayar ${formatRupiah(Number(order.total_price))}`}
                        onPress={handlePay}
                        disabled={paying || order.seconds_left <= 0}
                    />
                )}

                {order.status === 'pending' && (
                    <Pressable
                        onPress={() => handleCancel(order.id)}
                        style={{ marginTop: 14, paddingVertical: 11, borderRadius: 10, backgroundColor: '#131313', borderWidth: 1, borderColor: '#DC2626', alignItems: 'center', }}                    >
                        <T style={{ color: '#DC2626', fontSize: 13, fontWeight: '600' }}>
                            Batalkan Pesanan
                        </T>
                    </Pressable>
                )}

                {order.status === 'paid' && (
                    <Card>
                        <T w="semibold" style={{ marginBottom: 6 }}>
                            Pembayaran Berhasil
                        </T>
                        <T style={{ color: colors.muted, fontSize: 13 }}>
                            Pesanan kamu sudah dibayar. Tiket digital dapat dilihat melalui halaman tiket.
                        </T>
                    </Card>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
