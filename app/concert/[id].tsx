import { useState, useEffect } from 'react';
import { View, ScrollView, Image, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, Button, Badge } from '../../components/ui';
import { colors, tierColors } from '../../constants/theme';
import { formatDate, formatTime, formatRupiah } from '../../lib/format';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.100.130:5000/api';

type Tier = {
  id: string | number;
  name: string;
  price: number;
  quota: number;
  sold: number;
  sale_start?: string;
  sale_end?: string;
};

type Concert = {
  id: string | number;
  title: string;
  description?: string;
  artist?: string;
  venue: string;
  location?: string;
  date: string;
  banner_url?: string;
  genre?: string;
  genres?: string[];
  tiers?: Tier[];
};

export default function ConcertDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = useRouter();
  const [c, setC] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/concerts/${id}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`Gagal ambil detail (${res.status})`);
        const json = await res.json();
        const data = json?.data ?? json;
        setC(data);
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

  const genreLabel = c.genre ?? c.genres?.[0] ?? 'Konser';
  const locationText = [c.venue, c.location].filter(Boolean).join(', ');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView>
        {c.banner_url ? (
          <Image
            source={{ uri: c.banner_url }}
            style={{ height: 260, width: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ height: 260, width: '100%', backgroundColor: '#ddd' }} />
        )}
        <Pressable
          onPress={() => r.back()}
          style={{ position: 'absolute', top: 50, left: 16, backgroundColor: '#000a', borderRadius: 20, padding: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>

        <View style={{ padding: 16 }}>
          <Badge label={genreLabel} color={colors.primary} />
          <T w="bold" style={{ fontSize: 24, marginTop: 8 }}>{c.title}</T>
          {c.artist ? <T style={{ color: colors.muted, marginBottom: 2 }}>{c.artist}</T> : null}

          <T w="semibold" style={{ fontSize: 16, marginTop: 14, marginBottom: 6 }}>Tentang Konser</T>
          <T style={{ color: colors.muted, lineHeight: 22 }}>{c.description ?? '-'}</T>

          <View style={{
            borderWidth: 1,
            borderColor: '#FBADCC',
            padding: 14,
            borderRadius: 8,
            marginTop: 18,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Info icon="calendar-outline" text={`${formatDate(c.date)} • ${formatTime(c.date)}`} />
            <Info icon="location-outline" text={locationText || '-'} />
          </View>

          <T w="semibold" style={{ fontSize: 16, marginTop: 18, marginBottom: 8 }}>Kategori Tiket</T>

          {(!c.tiers || c.tiers.length === 0) ? (
            <T style={{ color: colors.muted }}>Belum ada tiket tersedia</T>
          ) : (
            c.tiers.map((t) => {
              const left = (t.quota ?? 0) - (t.sold ?? 0);
              return (
                <View
                  key={t.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: colors.card,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <View>
                    <T w="semibold" style={{ color: tierColors[t.name] ?? colors.text }}>{t.name}</T>
                    <T style={{ color: colors.muted, fontSize: 12 }}>
                      {left > 0 ? `Sisa ${left} tiket` : 'Habis'}
                    </T>
                  </View>
                  <T w="bold">{formatRupiah(t.price)}</T>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <SafeAreaView
        edges={['bottom']}
        style={{ padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }}
      >
        <Button
          title="Pilih Tiket"
          onPress={() => r.push({ pathname: '/concert/tiers/[id]', params: { id: String(c.id) } })}
        />
      </SafeAreaView>
    </View>
  );
}

const Info = ({ icon, text }: { icon: any; text: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
    <Ionicons name={icon} size={16} color={colors.primary} />
    <T style={{ color: colors.muted }}>{text}</T>
  </View>
);