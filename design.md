# MeMoney Design System

Dokumen ini menjadi pegangan desain untuk MeMoney: aplikasi pencatatan uang pribadi yang mobile-first, private, cepat, dan siap berjalan di Cloudflare Pages dengan D1/R2 bindings.

## Prinsip Produk

- **Mobile-first:** semua alur utama harus nyaman di layar 360-430px sebelum diperluas ke desktop.
- **Cepat dicatat:** transaksi, scan bukti, dan cek sisa uang harian harus bisa dicapai dari navigasi utama.
- **Private by default:** UI harus memberi rasa aman tanpa terlalu banyak teks penjelasan.
- **Profesional dan tenang:** visual harus bersih, tidak ramai, dan cocok untuk aplikasi finansial harian.
- **Tidak menggurui:** copy harus membantu pengguna mengambil keputusan kecil, bukan membuat pengguna merasa salah.

## Palette

Palette utama diambil dari referensi warna pengguna.

| Token | Hex | Penggunaan |
| --- | --- | --- |
| `ink` | `#001D39` | Teks utama, sidebar gelap, hero gelap |
| `moss` | `#0A4174` | Aksi utama, active state, heading aksen |
| `clay` / `muted` | `#49769F` | Teks sekunder, data negatif netral |
| `sage` | `#4E8EA2` | Progress, chart, detail informatif |
| `rose-soft` | `#6EA2B3` | Status lembut dan variasi visual |
| `sky-soft` / `amber-soft` | `#7BBDE8` | Highlight, active nav, focus ring |
| `cream` / `stone-soft` | `#BDD8E9` | Background app dan surface ringan |
| `paper` | `#F6FBFE` | Card, form, panel, foreground terang |

Aturan palette:
- Gunakan `ink` dan `moss` sebagai warna dominan, bukan banyak hue baru.
- Gunakan `paper` untuk surface konten agar aplikasi tetap clean.
- Hindari gradient berlebihan; gradient hanya untuk hero atau sidebar.
- Jangan menambah warna merah/hijau terang kecuali benar-benar untuk validasi/error.

## Typography

- Font stack: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Base size: `15px`.
- Heading dashboard harus tebal dan ringkas.
- Label data memakai uppercase kecil dengan weight tinggi.
- Angka finansial boleh besar, tetapi harus responsif dan tidak overflow.

Ukuran yang dianjurkan:
- Page title: `clamp(1.55rem, 2vw, 2.1rem)`.
- Hero amount: `.money-hero-number` dengan `clamp(2.45rem, 14vw, 4.25rem)`.
- Card amount: `text-2xl` sampai `text-3xl`.
- Compact UI labels: `text-xs` atau `text-sm`.

## Layout

### App Shell

- Root memakai `.app-root`.
- Konten utama memakai `.content-wrap` dengan `max-width: 1180px`.
- Mobile padding: `px-4 py-4`.
- Desktop padding: `md:px-6 lg:px-8`.
- Jangan membuat page section sebagai floating card besar; gunakan unframed layout dan kartu hanya untuk item/data.

### Desktop

- Sidebar gelap memakai `.nav-shell`.
- Sidebar aktif memakai `.nav-link-active`.
- Topbar harus ringan dan tidak mendominasi layar.
- Dashboard desktop memakai hero lebar di atas, lalu metric grid.

### Mobile

- Bottom nav wajib berisi akses cepat:
  - Home
  - Transaksi
  - Scan
  - Rekap
  - Menu
- Menu membuka bottom sheet berisi semua fitur:
  - Dashboard
  - Transaksi
  - Scan OCR
  - Budget
  - Tabungan
  - Dana Tak Terduga
  - Rekap
  - Settings
- Hindari horizontal scroll. Setiap grid/kartu harus punya `min-width: 0` bila berisi teks atau angka panjang.
- Bottom sheet tidak boleh menutup seluruh konteks layar kecuali nanti dibuat mode full-screen menu.

## Komponen

### Buttons

Gunakan:
- `.btn-primary` untuk aksi utama.
- `.btn-secondary` untuk aksi pendukung.
- Icon dari `@lucide/svelte` di tombol bila ada command yang jelas.

Aturan:
- Minimum height tombol: `42px`.
- Hero action: minimum `48px`.
- Radius tombol: 8-10px.
- Jangan pakai tombol berbentuk pill untuk semua hal; pill hanya untuk chip/status kecil.

### Cards

Gunakan:
- `.metric-card` untuk ringkasan uang, progress, dan transaksi terbaru.
- `.summary-tile` untuk tile di hero.
- `.card` untuk form atau panel standar.

Aturan:
- Radius kartu 8-12px.
- Jangan nested card di dalam card.
- Card harus punya border lembut dan shadow kecil.

### Hero Dashboard

Hero dashboard adalah pusat aplikasi.

Konten wajib:
- Chip konteks: Dashboard.
- Headline: "Sisa jatah hari ini".
- Greeting singkat.
- Sisa budget harian.
- Progress pemakaian.
- Status hari ini.
- Bulan masuk/keluar.
- Aksi cepat: Catat cepat dan Scan bukti.

Aturan:
- Mobile hero harus 1 kolom.
- Desktop hero boleh 2 kolom.
- Angka negatif besar harus tetap terbaca dan tidak memotong layout.
- Jangan taruh semua data di hero; sisakan detail untuk metric cards di bawahnya.

### Forms

Gunakan:
- `.field-label`
- `.input`
- Validasi server/client memakai Zod.

Aturan UX:
- Error harus dekat field.
- Placeholder tidak menggantikan label.
- Form transaksi harus cepat diisi di mobile.
- Upload/scan bukti harus tetap opsional.

## Navigasi

Struktur route utama:

- `/app/dashboard`
- `/app/transactions`
- `/app/scan`
- `/app/budgets`
- `/app/savings`
- `/app/emergency`
- `/app/reports`
- `/app/settings`

Aturan:
- Desktop: semua route ada di sidebar.
- Mobile: route prioritas ada di bottom nav, route lainnya di menu sheet.
- Active state harus jelas secara visual, bukan hanya warna teks.

## Copywriting

Tone:
- Ringkas.
- Manusiawi.
- Tidak menghakimi.
- Fokus pada keputusan finansial kecil.

Contoh baik:
- "Perlu rem kecil"
- "Aman sampai malam"
- "Pantau yang kecil sebelum jadi besar."
- "Ritme hari ini masih terkendali."

Hindari:
- Teks instruksi panjang di layar utama.
- Istilah teknis seperti D1, R2, OCR, binding di UI pengguna akhir.
- Copy yang membuat pengguna merasa gagal.

## Accessibility

- Semua link/button harus punya focus ring.
- Icon-only button wajib punya `aria-label`.
- Kontras teks harus aman di hero gelap dan card terang.
- Bottom sheet harus bisa ditutup dengan tombol eksplisit.
- Jangan bergantung pada warna saja untuk status penting.

## Data Privacy UX

Karena aplikasi menyimpan data finansial pribadi:

- Jangan tampilkan data sensitif di halaman publik sebelum login.
- Cookie auth harus `Secure` dan `SameSite=Lax`.
- Upload bukti transaksi masuk ke R2 melalui binding server, bukan langsung dari client tanpa validasi.
- UI tidak perlu memamerkan detail infrastruktur, cukup beri rasa aman lewat desain yang tenang dan predictable.

## Cloudflare Pages Deployment

Target deploy saat ini adalah Cloudflare Pages.

Config utama:

```jsonc
{
  "name": "memoney",
  "pages_build_output_dir": ".svelte-kit/cloudflare",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "uang-pribadi-db",
      "database_id": "0e335aec-16ab-4bc9-96b1-ace427800d5c",
      "remote": true
    }
  ],
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "uang-pribadi-receipts"
    }
  ],
  "ai": {
    "binding": "AI"
  }
}
```

Deploy command:

```bash
npm run deploy
```

Production URL:

```text
https://memoney.pages.dev
```

## Checklist UI Sebelum Deploy

- `npm run check`
- `npm run build`
- Cek mobile 390px:
  - Tidak ada horizontal scroll.
  - Hero tidak memotong angka.
  - Bottom nav dan menu lengkap tampil.
- Cek desktop 1440px:
  - Sidebar tidak terlalu besar.
  - Metric cards rapi dalam grid.
  - Hero tidak terasa kosong atau terlalu ramai.
- Cek route auth:
  - `/login` harus `200`.
  - `/app/dashboard` tanpa session harus redirect ke `/login`.

## Do Not

- Jangan mengganti palette tanpa memperbarui token di `src/app.css`.
- Jangan memakai `lucide-svelte`; gunakan `@lucide/svelte`.
- Jangan menghapus requirement D1/R2/Zod/OCR/PWA.
- Jangan membuat mobile menu hanya sebagian; semua fitur harus tetap bisa dicapai.
- Jangan membuat UI marketing page sebagai layar utama aplikasi.
