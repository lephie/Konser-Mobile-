# Ticket.COM Mobile (Expo + TypeScript)

Desain mobile untuk pembeli tiket. **Hanya UI + data dummy**, belum terhubung ke backend.

## Menjalankan
```bash
npm install        # .npmrc sudah berisi legacy-peer-deps=true
npx expo start     # scan QR dengan Expo Go
```

## Struktur
- `app/(auth)` login & daftar
- `app/(tabs)` Beranda, Pesanan, Tiket, Notifikasi, Profil
- `app/concert/[id]` detail konser, `app/concert/tiers/[id]` pilih tier VIP/Gold/Silver (maks 4 tiket)
- `app/checkout/[id]` pembayaran (timer 15 menit), `app/checkout/success` sukses
- `app/order/[id]` detail pesanan + QR tiket
- `data/index.ts` SEMUA data dummy (ganti dengan API nanti)
- `lib/auth.tsx` auth dummy, `constants/theme.ts` warna/font sama seperti web

## Aturan peran di mobile
Hanya role `user` yang boleh masuk. Jika login dengan akun `superadmin`/`event_organizer`
(di demo: email berisi "admin" atau "eo"), muncul pesan untuk memakai dashboard web
atau mendaftar akun user baru dengan email berbeda (email UNIQUE di database).

## Panduan Pembayaran (Midtrans)

Prinsip utama: **aplikasi mobile tidak pernah memproses uang atau menentukan status bayar.
Backend yang memutuskan.** Mobile hanya menampilkan halaman bayar dan menunggu hasilnya.

Alur yang benar:
1. User pilih tier + jumlah, tekan **Bayar**.
2. Mobile `POST /orders { ticket_tier_id, qty }` ke backend.
3. Backend: cek kuota, buat `order_ticket` status `pending` dengan `expires_at = now + 15 menit`
   (kuota ditahan), hitung total (subtotal + biaya admin + pajak) **di server**, lalu minta
   **Snap token** ke Midtrans (`order_id`, `gross_amount`, data customer). Kembalikan `snap_token`/`redirect_url`.
4. Mobile membuka `redirect_url` di **WebView** (`react-native-webview`). User memilih QRIS / VA / e-wallet
   di halaman Midtrans, jadi kamu tidak perlu membuat form kartu sendiri.
5. Midtrans memanggil **webhook** backend (`POST /payments/notification`). Backend **verifikasi
   signature_key** (SHA512 dari order_id + status_code + gross_amount + server_key), lalu ubah
   order menjadi `paid`, terbitkan tiket + kode QR.
6. Mobile polling `GET /orders/:id` (atau cek saat WebView selesai) sampai status `paid` -> layar sukses.
7. Job terjadwal di backend mengubah order `pending` yang lewat `expires_at` menjadi `expired`
   dan mengembalikan kuota.

Kenapa begini: harga dari client bisa dimanipulasi, redirect "sukses" dari WebView bisa dipalsukan;
hanya webhook yang terverifikasi yang boleh mengubah status menjadi `paid`.

Di desain ini: pemilih metode bayar + timer sudah ada (`app/checkout/[id].tsx`), tombol Bayar
saat ini langsung ke layar sukses (ada komentar TODO di titik integrasi).
Gunakan **Midtrans Sandbox** untuk testing.
