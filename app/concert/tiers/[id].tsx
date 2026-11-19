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

  const [tier, setTier] = useState<Tier | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/concerts/${id}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`Gagal ambil data (${res.status})`);
        const json = await res.json();
        setC(json?.data ?? json);
      } catch (e: any) {
        if (e?.name !== 'AbortError') setError(e?.message ?? 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [id]);

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
        <T style={{ color: 'red', textAlign: 'center', marginBottom: 12 }}>{error ?? 'Konser tidak ditemukan'}</T>
        <Button title="Kembali" onPress={() => r.back()} />
      </View>
    );
  }

  const total = tier ? tier.price * qty : 0;
  const left = tier ? tier.quota - tier.sold : 0;
  const max = Math.min(MAX, left);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
          <Pressable onPress={() => r.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <T w="semibold" style={{ fontSize: 17 }}>Pilih Tiket</T>
            <T style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>{c.title}</T>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
          {(!c.tiers || c.tiers.length === 0) ? (
            <T style={{ color: colors.muted, textAlign: 'center', marginTop: 40 }}>
              Belum ada tiket tersedia
            </T>
          ) : (
            c.tiers.map((t) => {
              const rem = (t.quota ?? 0) - (t.sold ?? 0);
              const soldOut = rem <= 0;
              const sel = tier?.id === t.id;
              return (
                <Pressable
                  key={t.id}
                  disabled={soldOut}
                  onPress={() => { setTier(t); setQty(1); }}
                  style={{ opacity: soldOut ? 0.4 : 1, marginBottom: 12 }}
                >
                  <Card style={{ borderColor: sel ? tierColors[t.name] : colors.border, borderWidth: sel ? 2 : 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <T w="bold" style={{ fontSize: 18, color: tierColors[t.name] ?? colors.text }}>{t.name}</T>
                      <T w="bold" style={{ fontSize: 16 }}>{formatRupiah(t.price)}</T>
                    </View>
                    {t.perks ? (
                      <T style={{ color: colors.muted, marginVertical: 6, fontSize: 13 }}>{t.perks}</T>
                    ) : null}
                    <T style={{ color: soldOut ? colors.danger : rem < 30 ? colors.warning : colors.muted, fontSize: 12 }}>
                      {soldOut ? 'Habis terjual' : rem < 30 ? `Tinggal ${rem} tiket!` : `Tersedia ${rem} tiket`}
                    </T>
                  </Card>
                </Pressable>
              );
            })
          )}

          {tier && (
            <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <T w="semibold">Jumlah Tiket</T>
                <T style={{ color: colors.muted, fontSize: 12 }}>Maksimal {max} per transaksi</T>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Stepper icon="remove" onPress={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} />
                <T w="bold" style={{ fontSize: 18 }}>{qty}</T>
                <Stepper icon="add" onPress={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max} />
              </View>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>

      <SafeAreaView
        edges={['bottom']}
        style={{ padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <T style={{ color: colors.muted }}>Subtotal</T>
          <T w="bold" style={{ color: colors.primary, fontSize: 16 }}>{formatRupiah(total)}</T>
        </View>
        <Button
          title="Lanjut ke Pembayaran"
          disabled={!tier}
          onPress={() =>
            r.push({
              pathname: '/checkout/[id]',
              params: { id: String(c.id), tierId: String(tier!.id), qty: String(qty) },
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
      opacity: disabled ? 0.4 : 1,
    }}
  >
    <Ionicons name={icon} size={18} color="#fff" />
  </Pressable>
);