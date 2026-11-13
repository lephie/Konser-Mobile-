// DUMMY DATA — ganti dengan pemanggilan API (lib/api.ts) saat integrasi BE.
export type Tier = { id: number; name: 'VIP' | 'Gold' | 'Silver'; price: number; quota: number; sold: number; perks: string };
export type Concert = {
  id: number; title: string; artist: string; venue: string; city: string;
  date: string; genre: string; image: string; description: string; tiers: Tier[];
};
export type OrderStatus = 'paid' | 'pending' | 'expired' | 'cancelled';
export type Order = {
  id: string; concertId: number; tier: Tier['name']; qty: number; unitPrice: number;
  status: OrderStatus; createdAt: string; expiresAt?: string; method?: string;
};
export type Notif = { id: number; category: 'Pesanan' | 'Pengingat' | 'Promo'; title: string; body: string; group: 'Hari ini' | 'Kemarin' | 'Sebelumnya'; read: boolean };

export const concerts: Concert[] = [
  { id: 1, title: 'Neon Nights Festival', artist: 'The Midnight Pulse', venue: 'Istora Senayan', city: 'Jakarta',
    date: '2026-12-20T19:00:00', genre: 'Pop', image: 'https://picsum.photos/seed/neon/800/500',
    description: 'Malam penuh cahaya neon dengan penampilan live terbaik dari The Midnight Pulse dan bintang tamu spesial.',
    tiers: [
      { id: 11, name: 'VIP', price: 1500000, quota: 100, sold: 80, perks: 'Area depan panggung, merchandise eksklusif, meet & greet' },
      { id: 12, name: 'Gold', price: 850000, quota: 300, sold: 150, perks: 'Area tengah, akses lounge' },
      { id: 13, name: 'Silver', price: 450000, quota: 600, sold: 590, perks: 'Area festival berdiri' } ] },
  { id: 2, title: 'Rock the City', artist: 'Iron Echo', venue: 'GBK Madya', city: 'Jakarta',
    date: '2027-01-15T18:30:00', genre: 'Rock', image: 'https://picsum.photos/seed/rock/800/500',
    description: 'Konser rock terbesar awal tahun bersama Iron Echo dan band-band lokal pilihan.',
    tiers: [
      { id: 21, name: 'VIP', price: 1200000, quota: 80, sold: 20, perks: 'Front row, early entry' },
      { id: 22, name: 'Gold', price: 700000, quota: 250, sold: 100, perks: 'Tribun premium' },
      { id: 23, name: 'Silver', price: 350000, quota: 500, sold: 200, perks: 'Tribun umum' } ] },
  { id: 3, title: 'Jazz di Bawah Bintang', artist: 'Sari Anindya Quartet', venue: 'Taman Ismail Marzuki', city: 'Jakarta',
    date: '2027-02-08T20:00:00', genre: 'Jazz', image: 'https://picsum.photos/seed/jazz/800/500',
    description: 'Malam jazz santai di bawah langit terbuka dengan suasana intim.',
    tiers: [
      { id: 31, name: 'VIP', price: 900000, quota: 50, sold: 50, perks: 'Meja privat & welcome drink' },
      { id: 32, name: 'Gold', price: 500000, quota: 150, sold: 60, perks: 'Kursi premium' },
      { id: 33, name: 'Silver', price: 250000, quota: 300, sold: 90, perks: 'Kursi reguler' } ] },
  { id: 4, title: 'EDM Colorsplash', artist: 'DJ Aurora', venue: 'Pantai Karnaval Ancol', city: 'Jakarta',
    date: '2027-03-21T16:00:00', genre: 'EDM', image: 'https://picsum.photos/seed/edm/800/500',
    description: 'Pesta EDM di tepi pantai dengan lineup DJ internasional.',
    tiers: [
      { id: 41, name: 'VIP', price: 1750000, quota: 120, sold: 30, perks: 'VIP deck, open bar' },
      { id: 42, name: 'Gold', price: 950000, quota: 400, sold: 120, perks: 'Area dekat panggung' },
      { id: 43, name: 'Silver', price: 500000, quota: 900, sold: 300, perks: 'General admission' } ] },
];

export const genres = ['Semua', 'Pop', 'Rock', 'Jazz', 'EDM'];

export const orders: Order[] = [
  { id: 'TKT-20261101-0001', concertId: 1, tier: 'VIP', qty: 2, unitPrice: 1500000, status: 'paid', createdAt: '2026-11-01T10:12:00', method: 'QRIS' },
  { id: 'TKT-20261112-0002', concertId: 2, tier: 'Gold', qty: 1, unitPrice: 700000, status: 'pending', createdAt: '2026-11-13T09:00:00', expiresAt: '2026-11-13T23:59:00' },
  { id: 'TKT-20261020-0003', concertId: 3, tier: 'Silver', qty: 3, unitPrice: 250000, status: 'expired', createdAt: '2026-10-20T14:00:00' },
  { id: 'TKT-20261005-0004', concertId: 4, tier: 'Gold', qty: 2, unitPrice: 950000, status: 'cancelled', createdAt: '2026-10-05T08:30:00' },
];

export const notifications: Notif[] = [
  { id: 1, category: 'Pesanan', title: 'Pembayaran berhasil', body: 'Tiket Neon Nights Festival sudah aktif. Cek di menu Tiket.', group: 'Hari ini', read: false },
  { id: 2, category: 'Pengingat', title: 'Selesaikan pembayaran', body: 'Pesanan Rock the City akan kedaluwarsa dalam 15 menit.', group: 'Hari ini', read: false },
  { id: 3, category: 'Promo', title: 'Diskon 20% tiket Jazz', body: 'Gunakan kode JAZZ20 untuk tiket Silver.', group: 'Kemarin', read: true },
  { id: 4, category: 'Pengingat', title: 'H-7 konser', body: 'Neon Nights Festival tinggal 7 hari lagi!', group: 'Sebelumnya', read: true },
];

export const dummyUser = { id: 1, name: 'Budi Santoso', email: 'budi@mail.com', phone: '081234567890', role: 'user' as const };

export const getConcert = (id: number) => concerts.find((c) => c.id === id)!;
export const ADMIN_FEE = 5000;
export const TAX_RATE = 0.11;
