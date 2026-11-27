import { View, Pressable } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { T } from './ui';
import { colors, tierColors } from '../constants/theme';

type Props = {
  code: string;
  tier: string;
  concert: string;
  index: number;
  tierId?: string;                               // optional colour (from getTierColor)
  status?: 'unused' | 'used' | 'cancelled';
  highlight?: boolean;                           // outline the ticket the user tapped
  onPress?: () => void;
};


const STATUS_LABEL = {
  unused: { label: 'Belum dipakai', color: colors.success },
  used: { label: 'Sudah dipakai', color: colors.muted },
  cancelled: { label: 'Dibatalkan', color: colors.danger },
};


export default function QrTicket({ code, tier, concert, index, tierId, status, highlight, onPress }: Props) {
  const tierColor = tierColors[tier] ?? tierId ?? colors.primary;
  const s = status ? STATUS_LABEL[status] : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderRadius: 18,
        borderWidth: highlight ? 2 : 1,
        borderColor: highlight ? colors.primary : colors.border,
        marginBottom: 14,
        overflow: 'hidden',
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <T w="semibold" numberOfLines={1}>{concert}</T>
          <T w="bold" style={{ color: tierColor, marginTop: 2 }}>{tier} • Tiket #{index}</T>
        </View>
        {s && <T style={{ color: s.color, fontSize: 11 }}>{s.label}</T>}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 16, height: 32, backgroundColor: colors.bg, borderTopRightRadius: 16, borderBottomRightRadius: 16 }} />
        <View style={{ flex: 1, borderTopWidth: 1, borderStyle: 'dashed', borderColor: colors.border }} />
        <View style={{ width: 16, height: 32, backgroundColor: colors.bg, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }} />
      </View>

      <View style={{ alignItems: 'center', padding: 16 }}>
        <View style={{ backgroundColor: '#fff', padding: 10, borderRadius: 12, opacity: status === 'used' ? 0.4 : 1 }}>
          <QRCode value={code} size={150} />
        </View>
        <T style={{ color: colors.muted, fontSize: 11, marginTop: 8 }}>{code}</T>

        {onPress && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 }}>
            <T w="semibold" style={{ color: colors.primary, fontSize: 12 }}>Lihat detail pesanan</T>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        )}
      </View>
    </Pressable>
  );
}
