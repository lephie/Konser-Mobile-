import { useState } from 'react';
import { View, Image, Pressable, Modal, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { T } from './ui';
import { colors } from '../constants/theme';
import { assetUrl } from '../lib/assets';

// Only Google Maps *embed* URLs can be shown in a WebView/iframe.
const isEmbed = (u: string) => /^https:\/\/(www\.)?google\.com\/maps\/embed/.test(u);

export default function VenueInfo({ layoutUrl, mapUrl }: { layoutUrl?: string | null; mapUrl?: string | null }) {
  const [zoom, setZoom] = useState(false);
  const layout = assetUrl(layoutUrl);
  const map = mapUrl && isEmbed(mapUrl) ? mapUrl : '';
  if (!layout && !map) return null;

  return (
    <View>
      {layout ? (
        <>
          <T w="semibold" style={{ fontSize: 16, marginTop: 18, marginBottom: 8 }}>Layout Venue</T>
          <Pressable onPress={() => setZoom(true)}>
            <Image source={{ uri: layout }} resizeMode="contain"
              style={{ width: '100%', height: 220, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }} />
            <T style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>Ketuk untuk memperbesar</T>
          </Pressable>
          <Modal visible={zoom} transparent animationType="fade" onRequestClose={() => setZoom(false)}>
            <Pressable onPress={() => setZoom(false)} style={{ flex: 1, backgroundColor: '#000e', justifyContent: 'center' }}>
              <Image source={{ uri: layout }} resizeMode="contain" style={{ width: '100%', height: '80%' }} />
              <Ionicons name="close" size={28} color="#fff" style={{ position: 'absolute', top: 50, right: 20 }} />
            </Pressable>
          </Modal>
        </>
      ) : null}

      {map ? (
        <>
          <T w="semibold" style={{ fontSize: 16, marginTop: 18, marginBottom: 8 }}>Lokasi</T>
          <View style={{ height: 240, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
            <WebView
              source={{
                html: `
      <html>
        <body style="margin:0">
          <iframe
            src="${map}"
            width="100%"
            height="100%"
            style="border:0;"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </body>
      </html>
    `
              }}
              style={{ flex: 1 }}
              originWhitelist={['*']}
              startInLoadingState
              nestedScrollEnabled
              renderLoading={() => (
                <ActivityIndicator color={colors.text} style={{ position: 'absolute', top: '45%', alignSelf: 'center' }} />
              )}
            />
          </View>
        </>
      ) : null}
    </View>
  );
}