import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T } from '../../components/ui';
import QrTicket from '../../components/QrTicket';
import { orders, getConcert } from '../../data';
import { colors } from '../../constants/theme';

export default function Tickets() {
  const paid = orders.filter((o) => o.status === 'paid');
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <T w="bold" style={{ fontSize: 22, padding: 16, paddingBottom: 8 }}>Tiket Saya</T>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {paid.length === 0 && <T style={{ color: colors.muted, textAlign: 'center', marginTop: 40 }}>Belum ada tiket aktif</T>}
        {paid.flatMap((o) => Array.from({ length: o.qty }, (_, i) => (
          <QrTicket key={`${o.id}-${i}`} code={`${o.id}-${i + 1}`} tier={o.tier} concert={getConcert(o.concertId).title} index={i + 1} />
        )))}
      </ScrollView>
    </SafeAreaView>
  );
}
