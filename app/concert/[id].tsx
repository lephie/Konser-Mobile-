import { View, ScrollView, Image, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, Button, Badge } from '../../components/ui';
import { getConcert } from '../../data';
import { colors, tierColors } from '../../constants/theme';
import { formatDate, formatTime, formatRupiah } from '../../lib/format';

export default function ConcertDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = useRouter();
  const c = getConcert(Number(id));
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView>
        <Image source={{ uri: c.image }} style={{ height: 260, width: '100%' }} />
        <Pressable onPress={() => r.back()} style={{ position: 'absolute', top: 50, left: 16, backgroundColor: '#000a', borderRadius: 20, padding: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={{ padding: 16 }}>
          <Badge label={c.genre} color={colors.primary} />
          <T w="bold" style={{ fontSize: 24, marginTop: 8 }}>{c.title}</T>
          <T style={{ color: colors.muted, marginBottom: 14 }}>{c.artist}</T>
          <Info icon="calendar-outline" text={`${formatDate(c.date)} • ${formatTime(c.date)}`} />
          <Info icon="location-outline" text={`${c.venue}, ${c.city}`} />
          <T w="semibold" style={{ fontSize: 16, marginTop: 18, marginBottom: 6 }}>Tentang Konser</T>
          <T style={{ color: colors.muted, lineHeight: 22 }}>{c.description}</T>
          <T w="semibold" style={{ fontSize: 16, marginTop: 18, marginBottom: 8 }}>Kategori Tiket</T>
          {c.tiers.map((t) => {
            const left = t.quota - t.sold;
            return (
              <View key={t.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 8 }}>
                <View>
                  <T w="semibold" style={{ color: tierColors[t.name] }}>{t.name}</T>
                  <T style={{ color: colors.muted, fontSize: 12 }}>{left > 0 ? `Sisa ${left} tiket` : 'Habis'}</T>
                </View>
                <T w="bold">{formatRupiah(t.price)}</T>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={{ padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }}>
        <Button title="Pilih Tiket" onPress={() => r.push({ pathname: '/concert/tiers/[id]', params: { id: String(c.id) } })} />
      </SafeAreaView>
    </View>
  );
}
const Info = ({ icon, text }: { icon: any; text: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
    <Ionicons name={icon} size={16} color={colors.primary} /><T style={{ color: colors.muted }}>{text}</T>
  </View>
);
