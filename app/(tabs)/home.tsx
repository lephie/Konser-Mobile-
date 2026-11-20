
import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T, Logo } from '../../components/ui';
import ConcertCard from '../../components/ConcertCard';
import { colors } from '../../constants/theme';
import { useAuth } from '../../lib/auth';

type Concert = {
  id: string | number;
  title: string;
  venue: string;
  date: string;
  location?: string;
  banner_url?: string;
  description?: string;
  artist?: string;
  genres?: string[];
  genre?: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.16:5000/api';

export default function Home() {
  const { user } = useAuth();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConcerts = useCallback(async (signal: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/concerts`, { signal });

      if (!res.ok) throw new Error(`Gagal mengambil data (${res.status})`);

      const json = await res.json();
      const rows = json?.data?.items ?? [];


      setConcerts(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setError(e?.message ?? 'Terjadi kesalahan');
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchConcerts(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchConcerts]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: 16 }}>
        <Logo />

        <T w="bold" style={{ fontSize: 22, marginTop: 8 }}>
          Halo, {user?.name?.split(' ')[0] ?? 'Teman'}
        </T>

        <T style={{ color: colors.muted, marginBottom: 10 }}>
          Temukan konser favoritmu
        </T>

        {loading && <ActivityIndicator color={colors.text} style={{ marginTop: 20 }} />}

        {!loading && error && (
          <T style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>
            {error}
          </T>
        )}

        {!loading && !error && concerts.length === 0 && (
          <T style={{ color: colors.muted, textAlign: 'center', marginTop: 20 }}>
            Belum ada konser
          </T>
        )}

        {!loading && !error && concerts.map((c) => (
          <ConcertCard key={c.id} c={c} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
