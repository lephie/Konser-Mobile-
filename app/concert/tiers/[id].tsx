import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, Button, Card } from '../../../components/ui';
import { getConcert, Tier } from '../../../data';
import { colors, tierColors } from '../../../constants/theme';
import { formatRupiah } from '../../../lib/format';

const MAX = 4; // sama dengan batas di web: maks 4 tiket per transaksi

export default function TierSelection() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = useRouter();
  const c = getConcert(Number(id));
  const [tier, setTier] = useState<Tier | null>(null);
  const [qty, setQty] = useState(1);
  const total = tier ? tier.price * qty : 0;
  const left = tier ? tier.quota - tier.sold : 0;
  const max = Math.min(MAX, left);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
          <Pressable onPress={() => r.back()}><Ionicons name="arrow-back" size={24} color="#fff" /></Pressable>
          <View style={{ flex: 1 }}>
            <T w="semibold" style={{ fontSize: 17 }}>Pilih Tiket</T>
            <T style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>{c.title}</T>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
          {c.tiers.map((t) => {
            const rem = t.quota - t.sold; const soldOut = rem <= 0; const sel = tier?.id === t.id;
            return (
              <Pressable key={t.id} disabled={soldOut} onPress={() => { setTier(t); setQty(1); }}
                style={{ opacity: soldOut ? 0.4 : 1, marginBottom: 12 }}>
                <Card style={{ borderColor: sel ? tierColors[t.name] : colors.border, borderWidth: sel ? 2 : 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <T w="bold" style={{ fontSize: 18, color: tierColors[t.name] }}>{t.name}</T>
                    <T w="bold" style={{ fontSize: 16 }}>{formatRupiah(t.price)}</T>
                  </View>
                  <T style={{ color: colors.muted, marginVertical: 6, fontSize: 13 }}>{t.perks}</T>
                  <T style={{ color: soldOut ? colors.danger : rem < 30 ? colors.warning : colors.muted, fontSize: 12 }}>
                    {soldOut ? 'Habis terjual' : rem < 30 ? `Tinggal ${rem} tiket!` : `Tersedia ${rem} tiket`}
                  </T>
                </Card>
              </Pressable>
            );
          })}
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
      <SafeAreaView edges={['bottom']} style={{ padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <T style={{ color: colors.muted }}>Subtotal</T>
          <T w="bold" style={{ color: colors.primary, fontSize: 16 }}>{formatRupiah(total)}</T>
        </View>
        <Button title="Lanjut ke Pembayaran" disabled={!tier}
          onPress={() => r.push({ pathname: '/checkout/[id]', params: { id: String(c.id), tierId: String(tier!.id), qty: String(qty) } })} />
      </SafeAreaView>
    </View>
  );
}
const Stepper = ({ icon, onPress, disabled }: { icon: any; onPress: () => void; disabled: boolean }) => (
  <Pressable onPress={onPress} disabled={disabled} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card2, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : 1 }}>
    <Ionicons name={icon} size={18} color="#fff" />
  </Pressable>
);
