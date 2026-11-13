import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T, Chip, Card } from '../../components/ui';
import { notifications } from '../../data';
import { colors } from '../../constants/theme';

const CATS = ['Semua', 'Pesanan', 'Pengingat', 'Promo'] as const;
const GROUPS = ['Hari ini', 'Kemarin', 'Sebelumnya'] as const;

export default function Notif() {
  const [cat, setCat] = useState<(typeof CATS)[number]>('Semua');
  const list = notifications.filter((n) => cat === 'Semua' || n.category === cat);
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <T w="bold" style={{ fontSize: 22, padding: 16, paddingBottom: 8 }}>Notifikasi</T>
      <View style={{ height: 52 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {CATS.map((c) => <Chip key={c} label={c} active={cat === c} onPress={() => setCat(c)} />)}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {GROUPS.map((g) => {
          const items = list.filter((n) => n.group === g);
          if (!items.length) return null;
          return (
            <View key={g} style={{ marginBottom: 12 }}>
              <T w="semibold" style={{ color: colors.muted, marginBottom: 8 }}>{g}</T>
              {items.map((n) => (
                <Card key={n.id} style={{ marginBottom: 8, borderColor: n.read ? colors.border : colors.primary }}>
                  <T w="semibold">{n.title}</T>
                  <T style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>{n.body}</T>
                </Card>
              ))}
            </View>
          );
        })}
        {list.length === 0 && <T style={{ color: colors.muted, textAlign: 'center', marginTop: 40 }}>Tidak ada notifikasi</T>}
      </ScrollView>
    </SafeAreaView>
  );
}
