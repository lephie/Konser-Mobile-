
import { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, Button, Card } from '../../../components/ui';
import { colors, tierColors } from '../../../constants/theme';
import { formatRupiah } from '../../../lib/format';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.13:5000/api';
const MAX = 4;

type Tier = {
  id: string | number;
  name: string;
  price: number;
  quota: number;
  sold: number;
  perks?: string;
  sale_start?: string;
  sale_end?: string;
};

type Concert = {
  id: string | number;
  title: string;
  tiers?: Tier[];
};

export default function TierSelection() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = useRouter();

  const [c, setC] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!id) return;

    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/concerts/${id}`, {
          signal: ctrl.signal
        });

        if (!res.ok) throw new Error(`Gagal ambil data (${res.status})`);

        const json = await res.json();
        setC(json?.data ?? json);
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setError(e?.message ?? 'Terjadi kesalahan');
        }
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [id]);

  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);

  const selectedItems = Object.entries(quantities)
    .filter(([_, qty]) => qty > 0)
    .map(([id, quantity]) => ({
      ticket_tier_id: Number(id),
      quantity
    }));

  const total = c?.tiers?.reduce((sum, t) => {
    return sum + t.price * (quantities[String(t.id)] || 0);
  }, 0) || 0;

  const changeQty = (tier: Tier, amount: number) => {
    const key = String(tier.id);
    const current = quantities[key] || 0;
    const remaining = Math.max(0, tier.quota - tier.sold);
    const next = current + amount;

    if (next < 0 || next > remaining) return;
    if (totalQty + amount > MAX) return;

    setQuantities(prev => ({
      ...prev,
      [key]: next
    }));
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (error || !c) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <T style={{ color: 'red', textAlign: 'center', marginBottom: 12 }}>
          {error ?? 'Konser tidak ditemukan'}
        </T>
        <Button title="Kembali" onPress={() => r.back()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
          <Pressable onPress={() => r.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <T w="semibold" style={{ fontSize: 17 }}>Pilih Tiket</T>
            <T style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
              {c.title}
            </T>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
          <View style={{ marginBottom: 14 }}>
            <T w="semibold">Pilih Kategori Tiket</T>
            <T style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
              Pilih beberapa kategori sekaligus. Maksimal {MAX} tiket per transaksi.
            </T>
          </View>

          {(!c.tiers || c.tiers.length === 0) ? (
            <T style={{ color: colors.muted, textAlign: 'center', marginTop: 40 }}>
              Belum ada tiket tersedia
            </T>
          ) : (
            c.tiers.map(t => {
              const rem = Math.max(0, (t.quota ?? 0) - (t.sold ?? 0));
              const qty = quantities[String(t.id)] || 0;
              const soldOut = rem <= 0;

              return (
                <Card
                  key={t.id}
                  style={{
                    marginBottom: 12,
                    borderColor: qty > 0 ? tierColors[t.name] ?? colors.primary : colors.border,
                    borderWidth: qty > 0 ? 2 : 1
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <T w="bold" style={{ fontSize: 18, color: tierColors[t.name] ?? colors.text }}>
                      {t.name}
                    </T>
                    <T w="bold" style={{ fontSize: 16 }}>
                      {formatRupiah(t.price)}
                    </T>
                  </View>

                  {t.perks ? (
                    <T style={{ color: colors.muted, marginVertical: 6, fontSize: 13 }}>
                      {t.perks}
                    </T>
                  ) : null}

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <T style={{ color: soldOut ? colors.danger : rem < 30 ? colors.warning : colors.muted, fontSize: 12 }}>
                      {soldOut ? 'Habis terjual' : rem < 30 ? `Tinggal ${rem} tiket!` : `Tersedia ${rem} tiket`}
                    </T>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                      <Stepper
                        icon="remove"
                        onPress={() => changeQty(t, -1)}
                        disabled={qty <= 0}
                      />

                      <T w="bold" style={{ fontSize: 18, minWidth: 18, textAlign: 'center' }}>
                        {qty}
                      </T>

                      <Stepper
                        icon="add"
                        onPress={() => changeQty(t, 1)}
                        disabled={soldOut || qty >= rem || totalQty >= MAX}
                      />
                    </View>
                  </View>
                </Card>
              );
            })
          )}

          {selectedItems.length > 0 && (
            <Card style={{ marginTop: 4 }}>
              <T w="semibold" style={{ marginBottom: 10 }}>Ringkasan Tiket</T>

              {selectedItems.map(item => {
                const tier = c.tiers?.find(t => Number(t.id) === item.ticket_tier_id);

                return (
                  <View key={item.ticket_tier_id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <T style={{ color: colors.muted, fontSize: 13 }}>
                      {tier?.name} × {item.quantity}
                    </T>
                    <T style={{ fontSize: 13 }}>
                      {formatRupiah((tier?.price || 0) * item.quantity)}
                    </T>
                  </View>
                );
              })}

              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T w="semibold">Total Tiket</T>
                <T w="semibold">{totalQty} tiket</T>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <T w="bold">Subtotal</T>
                <T w="bold" style={{ color: colors.primary, fontSize: 16 }}>
                  {formatRupiah(total)}
                </T>
              </View>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>

      <SafeAreaView
        edges={['bottom']}
        style={{
          padding: 16,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <T style={{ color: colors.muted }}>
            {totalQty} tiket dipilih
          </T>
          <T w="bold" style={{ color: colors.primary, fontSize: 16 }}>
            {formatRupiah(total)}
          </T>
        </View>

        <Button
          title="Lanjut ke Pembayaran"
          disabled={selectedItems.length === 0}
          onPress={() =>
            r.push({
              pathname: '/checkout/[id]',
              params: {
                id: String(c.id),
                items: JSON.stringify(selectedItems)
              }
            })
          }
        />
      </SafeAreaView>
    </View>
  );
}

const Stepper = ({ icon, onPress, disabled }: { icon: any; onPress: () => void; disabled: boolean }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={{
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card2,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.4 : 1
    }}
  >
    <Ionicons name={icon} size={18} color="#fff" />
  </Pressable>
);
