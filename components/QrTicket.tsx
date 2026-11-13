import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { T } from './ui';
import { colors, tierColors } from '../constants/theme';

export default function QrTicket({ code, tier, concert, index }: { code: string; tier: string; concert: string; index: number }) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, marginBottom: 14, overflow: 'hidden' }}>
      <View style={{ padding: 14 }}>
        <T w="semibold" numberOfLines={1}>{concert}</T>
        <T w="bold" style={{ color: tierColors[tier], marginTop: 2 }}>{tier} • Tiket #{index}</T>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 16, height: 32, backgroundColor: colors.bg, borderTopRightRadius: 16, borderBottomRightRadius: 16 }} />
        <View style={{ flex: 1, borderTopWidth: 1, borderStyle: 'dashed', borderColor: colors.border }} />
        <View style={{ width: 16, height: 32, backgroundColor: colors.bg, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }} />
      </View>
      <View style={{ alignItems: 'center', padding: 16 }}>
        <View style={{ backgroundColor: '#fff', padding: 10, borderRadius: 12 }}>
          <QRCode value={code} size={150} />
        </View>
        <T style={{ color: colors.muted, fontSize: 11, marginTop: 8 }}>{code}</T>
      </View>
    </View>
  );
}
