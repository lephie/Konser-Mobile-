
import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T, Chip, Card } from '../../components/ui';
import { colors } from '../../constants/theme';
import { notificationApi } from '../../services/notif';

type Notification = {
  id: number;
  title: string;
  message?: string;
  body?: string;
  type?: string;
  category?: string;
  is_read: boolean;
  created_at: string;
};

const CATS = ['Semua'] as const;

const getCategory = (n: Notification) => {
  const value = String(n.category || n.type || '').toLowerCase();

  if (value.includes('order') || value.includes('pesanan')) return 'Pesanan';
  if (value.includes('reminder') || value.includes('pengingat')) return 'Pengingat';
  if (value.includes('promo')) return 'Promo';

  return 'Lainnya';
};

const getGroup = (date: string) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return 'Sebelumnya';

  if (d.toDateString() === today.toDateString()) return 'Hari ini';
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin';

  return 'Sebelumnya';
};

export default function Notif() {
  const [cat, setCat] = useState<(typeof CATS)[number]>('Semua');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [result, unreadResult] = await Promise.all([
        notificationApi.getAll(1, 50),
        notificationApi.getUnread()
      ]);

      const rows = result.items ?? result.rows ?? [];

      setNotifications(Array.isArray(rows) ? rows : []);
      setUnread(unreadResult.unread ?? 0);
    } catch (e: any) {
      setError(e.message || 'Gagal mengambil notifikasi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );

      setUnread(prev => Math.max(0, prev - 1));
    } catch (e: any) {
      setError(e.message || 'Gagal memperbarui notifikasi');
    }
  };

  const handleReadAll = async () => {
    try {
      await notificationApi.markAllAsRead();

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );

      setUnread(0);
    } catch (e: any) {
      setError(e.message || 'Gagal memperbarui notifikasi');
    }
  };

  const list = notifications;
  const groups = ['Hari ini', 'Kemarin', 'Sebelumnya'] as const;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View>
            <T w="bold" style={{ fontSize: 24 }}>Notifikasi</T>
            <T style={{ color: colors.muted, fontSize: 12 }}>
              {unread} belum dibaca
            </T>
          </View>

          {unread > 0 && (
            <Pressable onPress={handleReadAll}>
              <T style={{ color: colors.primary, fontSize: 12 }}>Baca semua</T>
            </Pressable>
          )}
        </View>

      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4 }}>
        {loading && (
          <ActivityIndicator color={colors.text} style={{ marginTop: 40 }} />
        )}

        {!loading && error !== '' && (
          <T style={{ color: colors.danger, textAlign: 'center', marginTop: 30 }}>
            {error}
          </T>
        )}

        {!loading && !error && groups.map(g => {
          const items = list.filter(n => getGroup(n.created_at) === g);

          if (!items.length) return null;

          return (
            <View key={g} style={{ marginBottom: 12 }}>
              <T w="semibold" style={{ color: colors.muted, marginBottom: 8 }}>
                {g}
              </T>

              {items.map(n => (
                <Pressable
                  key={n.id}
                  onPress={() => !n.is_read && handleRead(n.id)}
                >
                  <Card
                    style={{
                      marginBottom: 8,
                      borderColor: n.is_read ? colors.border : colors.primary,
                      borderWidth: 1
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <T w="semibold">{n.title}</T>
                      {!n.is_read && (
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: colors.primary
                        }} />
                      )}
                    </View>

                    <T style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>
                      {n.message || n.body || ''}
                    </T>
                  </Card>
                </Pressable>
              ))}
            </View>
          );
        })}

        {!loading && !error && list.length === 0 && (
          <T style={{ color: colors.muted, textAlign: 'center', marginTop: 40 }}>
            Tidak ada notifikasi
          </T>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
