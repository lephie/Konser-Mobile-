import { View, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T, Badge } from './ui';
import { Concert } from '../data';
import { colors } from '../constants/theme';
import { formatDate, formatRupiah } from '../lib/format';

export default function ConcertCard({ c }: { c: Concert }) {
  const r = useRouter();
  const min = Math.min(...c.tiers.map((t) => t.price));
  return (
    <Pressable onPress={() => r.push(`/concert/${c.id}`)}
      style={{ backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 16 }}>
      <Image source={{ uri: c.image }} style={{ height: 160, width: '100%' }} />
      <View style={{ padding: 14 }}>
        <Badge label={c.genre} color={colors.primary} />
        <T w="semibold" style={{ fontSize: 17, marginTop: 8 }}>{c.title}</T>
        <T style={{ color: colors.muted }}>{c.artist}</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
          <Ionicons name="calendar-outline" size={14} color={colors.muted} />
          <T style={{ color: colors.muted, fontSize: 12 }}>{formatDate(c.date)}  •  {c.venue}</T>
        </View>
        <T style={{ marginTop: 10, color: colors.muted, fontSize: 12 }}>Mulai dari</T>
        <T w="bold" style={{ color: colors.primary, fontSize: 16 }}>{formatRupiah(min)}</T>
      </View>
    </Pressable>
  );
}
