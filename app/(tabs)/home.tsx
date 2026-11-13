import { useState, useMemo } from 'react';
import { View, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { T, Logo, Chip } from '../../components/ui';
import ConcertCard from '../../components/ConcertCard';
import { concerts, genres } from '../../data';
import { useAuth } from '../../lib/auth';
import { colors, fonts } from '../../constants/theme';

export default function Home() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [g, setG] = useState('Semua');
  const list = useMemo(() => concerts.filter((c) =>
    (g === 'Semua' || c.genre === g) &&
    (c.title + c.artist + c.venue).toLowerCase().includes(q.toLowerCase())), [q, g]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Logo />
        <T w="bold" style={{ fontSize: 22, marginTop: 14 }}>Halo, {user?.name.split(' ')[0]} 👋</T>
        <T style={{ color: colors.muted, marginBottom: 14 }}>Temukan konser favoritmu</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card2, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, marginBottom: 12 }}>
          <Ionicons name="search" size={18} color={colors.dim} />
          <TextInput value={q} onChangeText={setQ} placeholder="Cari konser, artis, atau lokasi" placeholderTextColor={colors.dim}
            style={{ flex: 1, height: 46, marginLeft: 8, color: colors.text, fontFamily: fonts.regular }} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {genres.map((x) => <Chip key={x} label={x} active={g === x} onPress={() => setG(x)} />)}
        </ScrollView>
        {list.length === 0
          ? <T style={{ color: colors.muted, textAlign: 'center', marginTop: 40 }}>Konser tidak ditemukan</T>
          : list.map((c) => <ConcertCard key={c.id} c={c} />)}
      </ScrollView>
    </SafeAreaView>
  );
}
