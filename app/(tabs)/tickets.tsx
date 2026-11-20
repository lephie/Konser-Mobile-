
import { orderApi } from '../../services/orderApi';
import { useCallback, useState } from 'react';
import { ScrollView, View, ActivityIndicator, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T } from '../../components/ui';
import { colors } from '../../constants/theme';
import QrTicket from '../../components/QrTicket';


type Ticket = {
    id: number,
    qr_code: string,
    status: 'unused' | 'used' | 'cancelled';
    concert?: {id: number, title: string};
    tier?: {id: number, name: string};
  };

  const getList = (result: any): Ticket[] => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.rows)) return result.rows;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.data)) return result.data;
  return [];
};

export default function Tickets() {

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setTickets(getList(await orderApi.getMyTicketsStatus()));
    } catch (err : any) {
      setError(err?.message ?? 'Gagal mengambil tiket')
    }finally{
      setLoading(false);
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  );

  return (
     <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <T w="bold" style={{ fontSize: 22, padding: 16, paddingBottom: 8 }}>Tiket Saya</T>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <T style={{ color: colors.danger, textAlign: 'center', marginBottom: 12 }}>{error}</T>
          <Pressable onPress={load}>
            <T w="semibold" style={{ color: colors.primary }}>Coba Lagi</T>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {tickets.length === 0 && (
            <T style={{ color: colors.muted, textAlign: 'center', marginTop: 40 }}>
              Belum ada tiket aktif
            </T>
          )}

          {tickets.map((t, i) => (
            <QrTicket
              key={t.id}
              code={t.qr_code}
              tier={t.tier?.name ?? 'Tiket'}
              concert={t.concert?.title ?? '-'}
              index={i + 1}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
