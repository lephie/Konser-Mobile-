import { View, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T, Badge } from './ui';
import { colors } from '../constants/theme';
import { formatDate, formatRupiah } from '../lib/format';

type Concert = {
  id: string | number;
  title: string;
  venue: string;
  date: string;
  banner_url?: string;
  artist?: string;
  genre?: string;
  starting_price?: number | null;
  tiers?: {
    id: number;
    name: string;
    price: number;
  }[];
};

export default function ConcertCard({ c }: { c: Concert }) {
  const r = useRouter();
  const min = c.starting_price ?? 0;
  return (
    <Pressable
      onPress={() => r.push(`/concert/${c.id}`)}
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        marginBottom: 16,
      }}
    >
      <Image
        source={c.banner_url ? { uri: c.banner_url } : undefined}
        style={{
          height: 175,
          width: '100%',
          backgroundColor: colors.border,
        }}
      />

      <View style={{ padding: 14 }}>
        <T w="bold" style={{ fontSize: 17 }}>
          {c.title}
        </T>

        {!!c.artist && (
          <T style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
            {c.artist}
          </T>
        )}

        <View style={{ gap: 9, marginTop: 13 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="calendar-outline" size={14} color="#FBADCC" />
            <T style={{ color: colors.muted, fontSize: 12 }}>
              {formatDate(c.date)}
            </T>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="location-outline" size={14} color="#FBADCC" />
            <T style={{ color: colors.muted, fontSize: 12 }}>
              {c.venue}
            </T>
          </View>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            marginVertical: 13,
          }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <T style={{ color: colors.muted, fontSize: 11 }}>
              Mulai dari
            </T>
            <T w="bold" style={{ color: colors.primary, fontSize: 17, marginTop: 3 }}>
              {formatRupiah(min)}
            </T>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <T style={{ color: colors.primary, fontSize: 12 }} w="semibold">
              Lihat Detail
            </T>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
