# PRD — Website Pencatatan Uang Pribadi

**Nama sementara produk:** Dompet Pribadi / Dompet Ghibli  
**Target pengguna:** Pemilik pribadi, single-user, dipakai harian di mobile, desktop, iOS, dan macOS  
**Stack utama:** SvelteKit + TypeScript + Tailwind CSS + Cloudflare Workers + D1 + R2  
**Opsi app:** PWA terlebih dahulu, lalu Tauri v2 untuk macOS/iOS jika butuh app native  
**Prioritas:** Clean, rapi, nyaman, cepat, mudah dipakai, aman untuk data finansial pribadi

---

## 1. Latar Belakang

User ingin membuat aplikasi pribadi untuk mencatat keuangan harian tanpa ribet. Aplikasi harus bisa mencatat pemasukan, pengeluaran, jatah harian, jatah mingguan, jatah bulanan, tabungan, dana tak terduga, dan rekap data. Aplikasi juga harus bisa membaca image/screenshot seperti bukti transfer, struk, screenshot e-wallet, mutasi bank, atau catatan transaksi lalu mengubahnya menjadi draft pemasukan/pengeluaran yang bisa dikoreksi sebelum disimpan.

Karena dipakai pribadi, UI tidak perlu terlalu corporate. Nuansanya harus clean, cozy, hangat, lembut, rapi, dan terinspirasi dari dunia animasi watercolor/ghibli-like tanpa menyalin karakter, aset, nama, atau karya spesifik dari studio tertentu.

---

## 2. Tujuan Produk

1. Membantu user mencatat uang masuk dan keluar dengan sangat cepat.
2. Membuat user tahu sisa jatah harian, mingguan, dan bulanan.
3. Membantu user membangun tabungan dan dana tak terduga.
4. Mengurangi input manual dengan fitur scan screenshot/image.
5. Menyediakan rekap yang mudah dipahami, bukan hanya tabel angka.
6. Bisa dipakai nyaman di HP, desktop, iOS, dan macOS.
7. Bisa di-hosting di Cloudflare dengan database D1 dan file storage R2.
8. Data tetap privat, aman, dan tidak mudah bocor.

---

## 3. Prinsip Produk

### 3.1 Mudah Dipakai

Aplikasi harus bisa dipakai dalam kurang dari 5 detik untuk mencatat transaksi manual. Tombol utama harus jelas:

- Tambah pengeluaran
- Tambah pemasukan
- Scan bukti/screenshot
- Lihat rekap

### 3.2 Review Sebelum Simpan

Hasil scan tidak boleh langsung masuk ke database. Sistem wajib membuat draft transaksi, lalu user mengonfirmasi:

- Jenis transaksi
- Nominal
- Tanggal
- Kategori
- Akun/dompet
- Catatan
- Lampiran gambar

### 3.3 Mobile-first

Mayoritas pencatatan akan dilakukan dari HP. Desktop dipakai untuk rekap dan review bulanan.

### 3.4 Aman untuk Data Pribadi

Karena ini data keuangan pribadi, semua endpoint harus memakai autentikasi. Cookie harus `HttpOnly`, `Secure`, dan `SameSite=Lax/Strict`. Jangan simpan token login di localStorage.

### 3.5 Cloudflare-native

Gunakan binding Cloudflare untuk D1, R2, dan Workers AI. Jangan memanggil REST API Cloudflare dari dalam Worker untuk D1/R2 karena lebih lambat dan kompleks.

---

## 4. Target Platform

### 4.1 Web App

- SvelteKit full-stack
- Deploy ke Cloudflare Workers
- Tailwind CSS
- Responsive mobile/desktop

### 4.2 PWA

PWA menjadi fase app pertama karena paling cepat:

- Installable di iOS dari Safari Add to Home Screen
- Installable di macOS/desktop browser
- Manifest lengkap
- Icon lengkap
- Offline shell
- Cache asset dasar
- Queue transaksi offline sederhana menggunakan IndexedDB

### 4.3 Native App Optional

Setelah web stabil, buat wrapper Tauri v2:

- macOS app bundle
- iOS app via Xcode/App Store/TestFlight
- Tauri hanya menjadi shell native yang memakai UI SvelteKit
- API tetap ke Cloudflare Workers

---

## 5. Scope MVP

### 5.1 Wajib Ada di MVP

1. Auth single-user
2. Dashboard ringkas
3. CRUD pemasukan
4. CRUD pengeluaran
5. Kategori transaksi
6. Jatah harian, mingguan, bulanan
7. Tabungan
8. Dana tak terduga
9. Rekap data harian/mingguan/bulanan
10. Upload/scan gambar transaksi
11. OCR dasar dan parsing nominal/tanggal
12. Review hasil scan sebelum simpan
13. R2 untuk menyimpan lampiran gambar jika user memilih simpan bukti
14. D1 untuk data transaksi
15. PWA installable
16. Export CSV
17. Dark/light/auto mode
18. UI mobile-first

### 5.2 Tidak Masuk MVP

1. Sinkronisasi otomatis rekening bank
2. Integrasi Open Banking
3. Multi-user keluarga
4. Budget sharing
5. Reminder WhatsApp
6. Subscription/public SaaS
7. AI financial advisor kompleks
8. Auto-send data gambar ke AI tanpa persetujuan user

---

## 6. Persona

### Persona Utama: Pemilik Pribadi

- Ingin mencatat uang pribadi tanpa spreadsheet ribet.
- Sering transaksi kecil harian.
- Kadang malas input manual.
- Butuh tahu sisa jatah hari ini.
- Ingin mulai menabung walau nominal kecil.
- Ingin lihat rekap bulanan yang mudah dipahami.

---

## 7. User Stories

### 7.1 Transaksi Manual

Sebagai user, saya ingin menambahkan pengeluaran hanya dengan nominal, kategori, dan catatan agar pencatatan cepat.

Acceptance criteria:

- User bisa klik tombol `+ Pengeluaran`.
- Form muncul sebagai bottom sheet di mobile dan modal/dialog di desktop.
- Field minimal: nominal, kategori, tanggal, akun, catatan opsional.
- Setelah simpan, dashboard langsung update.

### 7.2 Pemasukan

Sebagai user, saya ingin mencatat pemasukan agar saldo dan rekap saya akurat.

Acceptance criteria:

- User bisa pilih tipe transaksi `Pemasukan`.
- User bisa memilih kategori seperti Gaji, Freelance, Hadiah, Refund, Lainnya.
- Pemasukan masuk ke rekap bulan berjalan.

### 7.3 Jatah Harian

Sebagai user, saya ingin melihat sisa jatah hari ini agar tidak boros.

Acceptance criteria:

- Dashboard menampilkan `Jatah Hari Ini`, `Terpakai`, dan `Sisa`.
- Jika sisa negatif, tampilkan warning lembut, bukan menyalahkan.
- Sistem bisa memakai nilai manual atau auto-calculated dari budget bulanan.

### 7.4 Jatah Mingguan

Sebagai user, saya ingin tahu pengeluaran minggu ini dibanding jatah mingguan.

Acceptance criteria:

- Rekap mingguan memakai rentang Senin–Minggu atau setting user.
- Tampilkan progress bar.
- Tampilkan kategori paling besar minggu ini.

### 7.5 Jatah Bulanan

Sebagai user, saya ingin mengatur budget bulanan agar punya kontrol besar terhadap cashflow.

Acceptance criteria:

- User bisa set budget bulanan.
- Sistem menghitung persentase terpakai.
- Sistem menampilkan sisa budget dan estimasi aman/tidak sampai akhir bulan.

### 7.6 Tabungan

Sebagai user, saya ingin punya target tabungan dan mencatat setoran tabungan.

Acceptance criteria:

- User bisa membuat goal tabungan.
- User bisa set target nominal dan target tanggal.
- User bisa menambah/mengurangi saldo tabungan.
- Dashboard menampilkan progress tabungan.

### 7.7 Dana Tak Terduga

Sebagai user, saya ingin memisahkan dana darurat/tak terduga dari tabungan biasa.

Acceptance criteria:

- Ada modul khusus `Dana Tak Terduga`.
- User bisa set target, misalnya Rp3.000.000.
- User bisa tambah/cairkan dana.
- Pencairan tercatat sebagai movement.

### 7.8 Scan Image/Screenshot

Sebagai user, saya ingin upload screenshot/struk agar sistem membantu mengisi transaksi.

Acceptance criteria:

- User bisa upload image dari kamera, galeri, drag-drop, paste clipboard di desktop.
- Sistem menjalankan OCR client-side untuk privasi.
- Sistem menampilkan teks OCR.
- Sistem mencoba mendeteksi nominal, tanggal, merchant, tipe transaksi, dan kategori.
- Sistem membuat draft transaksi dengan confidence score.
- User wajib review dan klik simpan.
- Gambar disimpan ke R2 hanya jika user mencentang `Simpan bukti gambar`.

### 7.9 Rekap Data

Sebagai user, saya ingin melihat rekap pengeluaran dan pemasukan agar tahu pola keuangan.

Acceptance criteria:

- Ada filter tanggal: hari ini, minggu ini, bulan ini, custom range.
- Ada summary: total pemasukan, total pengeluaran, net cashflow, tabungan, dana tak terduga.
- Ada breakdown kategori.
- Ada list transaksi.
- Bisa export CSV.

---

## 8. Fitur Detail

## 8.1 Dashboard

Dashboard harus langsung menjawab pertanyaan:

1. Hari ini sudah keluar berapa?
2. Sisa jatah hari ini berapa?
3. Bulan ini aman atau boros?
4. Tabungan bertambah atau tidak?
5. Dana tak terduga sudah berapa?

Komponen dashboard:

- Greeting card: `Selamat pagi, Rizky 🌿`
- Quick balance card
- Sisa jatah hari ini
- Pengeluaran hari ini
- Pemasukan bulan ini
- Pengeluaran bulan ini
- Net cashflow bulan ini
- Progress tabungan
- Progress dana tak terduga
- Quick action buttons
- Recent transactions
- Insight lembut, contoh: `Pengeluaran makan minggu ini naik 18% dari minggu lalu.`

## 8.2 Transaksi

Jenis transaksi:

- income
- expense
- transfer
- savings_deposit
- savings_withdrawal
- emergency_deposit
- emergency_withdrawal

Field transaksi:

- id
- type
- amount
- date
- category
- account/wallet
- title
- merchant
- note
- source: manual / scan / import / recurring
- receipt image key
- OCR text
- confidence
- created_at
- updated_at
- deleted_at

## 8.3 Kategori

Kategori awal pengeluaran:

- Makan & Minum
- Transportasi
- Belanja
- Tagihan
- Internet
- Kesehatan
- Pendidikan
- Hiburan
- Sedekah
- Cicilan/Hutang
- Keluarga
- Lainnya

Kategori awal pemasukan:

- Gaji
- Freelance
- Bonus
- Hadiah
- Refund
- Jual Barang
- Lainnya

Kategori bisa diedit user.

## 8.4 Jatah/Budget

Ada 3 level:

1. Jatah Harian
2. Jatah Mingguan
3. Jatah Bulanan

Mode perhitungan:

### Manual

User menentukan nominal tetap:

- Harian: Rp50.000/hari
- Mingguan: Rp350.000/minggu
- Bulanan: Rp1.500.000/bulan

### Otomatis

Sistem menghitung:

```text
sisa_budget_bulanan = budget_bulanan - pengeluaran_bulan_ini
sisa_hari_bulan_ini = jumlah_hari_sisa_termasuk_hari_ini
jatah_harian_otomatis = sisa_budget_bulanan / sisa_hari_bulan_ini
```

Untuk jatah mingguan:

```text
sisa_budget_mingguan = budget_mingguan - pengeluaran_minggu_ini
sisa_hari_minggu_ini = jumlah_hari_sisa_termasuk_hari_ini
jatah_harian_minggu_ini = sisa_budget_mingguan / sisa_hari_minggu_ini
```

## 8.5 Tabungan

Tabungan bisa berupa banyak goal:

- MacBook
- Dana nikah
- Modal usaha
- Investasi
- Lainnya

Field goal:

- name
- target_amount
- current_amount
- target_date
- icon
- color
- archived

## 8.6 Dana Tak Terduga

Dana tak terduga diperlakukan sebagai goal khusus dengan perlakuan lebih serius.

Dashboard harus memberi status:

- Belum aman: < 25%
- Mulai terbentuk: 25–49%
- Cukup baik: 50–79%
- Hampir aman: 80–99%
- Aman: >= 100%

## 8.7 Scan/OCR

### Alur Scan

1. User klik `Scan Bukti`.
2. User pilih kamera, upload, paste screenshot, atau drag-drop.
3. Preview gambar tampil.
4. User bisa crop/rotate ringan.
5. Sistem OCR client-side dengan Tesseract.js.
6. Sistem menampilkan loading progress.
7. Hasil OCR dikirim ke parser lokal berbasis regex/rule.
8. Jika user mengaktifkan `AI bantu rapikan`, OCR text dan/atau image dikirim ke Workers AI vision/text model.
9. Sistem membuat draft transaksi.
10. User review.
11. User simpan.
12. Jika `Simpan gambar` aktif, upload original/optimized image ke R2.
13. Simpan transaksi ke D1.

### Data yang dideteksi

- Nominal utama
- Tanggal transaksi
- Merchant/penerima
- Tipe: pemasukan/pengeluaran
- Metode pembayaran
- Kategori
- Catatan dari OCR

### Confidence Score

Setiap hasil scan punya confidence:

- amount_confidence
- date_confidence
- category_confidence
- overall_confidence

Jika confidence rendah, UI harus menampilkan warning:

> Hasil scan belum yakin. Tolong cek nominal dan tanggal sebelum simpan.

### Privacy Mode

Default:

- OCR berjalan di browser.
- Image tidak dikirim ke server kecuali user menyimpan lampiran.
- AI cloud parsing harus opt-in.

---

## 9. UX & UI Direction

## 9.1 Visual Style

Style: clean, cozy, soft, nyaman, personal, ghibli-inspired.

Karakter visual:

- Background warm cream
- Accent sage green, moss green, sky blue lembut, clay brown
- Card putih/translucent lembut
- Border tipis dan rounded besar
- Shadow lembut, bukan shadow keras
- Ilustrasi kecil: daun, awan, bukit, lampu, kertas catatan
- Micro-interaction halus
- Tidak terlalu ramai
- Banyak whitespace

Hindari:

- Warna terlalu neon
- Gradient terlalu tajam
- UI dashboard finansial yang terlalu corporate
- Animasi berlebihan
- Meniru karakter/studio/karya tertentu

## 9.2 Tone Copywriting

Bahasa UI harus lembut dan mendukung:

- `Sisa jatah hari ini`
- `Aman sampai malam 🌿`
- `Sedikit lewat budget, gapapa. Kita atur lagi besok.`
- `Uang masuk bulan ini`
- `Tabungan mulai tumbuh`
- `Dana tak terduga makin aman`

## 9.3 Mobile Layout

Mobile utama 360–430px:

- Bottom navigation
- Floating action button tengah/bawah
- Bottom sheet untuk input
- Swipeable cards
- Quick amount button: 10k, 20k, 50k, 100k
- Numeric keypad nyaman
- Form satu kolom

## 9.4 Desktop Layout

Desktop:

- Sidebar kiri
- Header atas
- Dashboard grid
- Tabel transaksi lebar
- Chart lebih detail
- Panel kanan untuk insight dan goals

## 9.5 Navigasi

Menu utama:

1. Dashboard
2. Transaksi
3. Scan
4. Budget/Jatah
5. Tabungan
6. Dana Tak Terduga
7. Rekap
8. Settings

Mobile bottom nav cukup 5 item:

1. Home
2. Transaksi
3. Tambah/Scan
4. Rekap
5. Settings

---

## 10. Arsitektur Teknis

## 10.1 Frontend

- SvelteKit
- TypeScript
- Tailwind CSS
- Optional: shadcn-svelte untuk base component
- lucide-svelte untuk icon
- Layered components
- Mobile-first responsive

## 10.2 Backend

- SvelteKit server routes
- Deployed to Cloudflare Workers
- D1 binding untuk database
- R2 binding untuk lampiran gambar
- Workers AI binding optional untuk AI parsing

## 10.3 Database

Gunakan Cloudflare D1. Semua query harus pakai prepared statements.

## 10.4 File Storage

Gunakan Cloudflare R2 untuk:

- receipt images
- optimized attachments
- optional backup export

File key pattern:

```text
receipts/{user_id}/{yyyy}/{mm}/{transaction_id}.webp
exports/{user_id}/{yyyy-mm}/transactions.csv
```

## 10.5 API

Gunakan endpoint SvelteKit:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /api/dashboard`
- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/transactions/:id`
- `PATCH /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/budgets`
- `PUT /api/budgets`
- `GET /api/savings-goals`
- `POST /api/savings-goals`
- `PATCH /api/savings-goals/:id`
- `POST /api/scan/parse`
- `POST /api/attachments/upload-url`
- `GET /api/reports/summary`
- `GET /api/reports/export.csv`
- `GET /api/settings`
- `PUT /api/settings`

---

## 11. Data Model Ringkas

### users

- id TEXT PRIMARY KEY
- email TEXT UNIQUE NOT NULL
- name TEXT NOT NULL
- password_hash TEXT NOT NULL
- password_salt TEXT NOT NULL
- timezone TEXT DEFAULT 'Asia/Jakarta'
- currency TEXT DEFAULT 'IDR'
- created_at TEXT NOT NULL
- updated_at TEXT NOT NULL

### sessions

- id TEXT PRIMARY KEY
- user_id TEXT NOT NULL
- token_hash TEXT NOT NULL
- expires_at TEXT NOT NULL
- created_at TEXT NOT NULL

### accounts

- id TEXT PRIMARY KEY
- user_id TEXT NOT NULL
- name TEXT NOT NULL
- type TEXT NOT NULL
- initial_balance INTEGER DEFAULT 0
- current_balance INTEGER DEFAULT 0
- icon TEXT
- archived INTEGER DEFAULT 0
- created_at TEXT NOT NULL
- updated_at TEXT NOT NULL

### categories

- id TEXT PRIMARY KEY
- user_id TEXT
- type TEXT NOT NULL
- name TEXT NOT NULL
- icon TEXT
- color TEXT
- is_default INTEGER DEFAULT 0
- archived INTEGER DEFAULT 0
- created_at TEXT NOT NULL

### transactions

- id TEXT PRIMARY KEY
- user_id TEXT NOT NULL
- account_id TEXT
- category_id TEXT
- type TEXT NOT NULL
- amount INTEGER NOT NULL
- title TEXT
- merchant TEXT
- note TEXT
- transaction_date TEXT NOT NULL
- source TEXT DEFAULT 'manual'
- receipt_image_key TEXT
- ocr_text TEXT
- confidence REAL
- created_at TEXT NOT NULL
- updated_at TEXT NOT NULL
- deleted_at TEXT

### budgets

- id TEXT PRIMARY KEY
- user_id TEXT NOT NULL
- period TEXT NOT NULL
- amount INTEGER NOT NULL
- category_id TEXT
- start_date TEXT
- end_date TEXT
- mode TEXT DEFAULT 'manual'
- created_at TEXT NOT NULL
- updated_at TEXT NOT NULL

### savings_goals

- id TEXT PRIMARY KEY
- user_id TEXT NOT NULL
- name TEXT NOT NULL
- target_amount INTEGER NOT NULL
- current_amount INTEGER DEFAULT 0
- target_date TEXT
- type TEXT DEFAULT 'saving'
- icon TEXT
- color TEXT
- archived INTEGER DEFAULT 0
- created_at TEXT NOT NULL
- updated_at TEXT NOT NULL

### fund_movements

- id TEXT PRIMARY KEY
- user_id TEXT NOT NULL
- goal_id TEXT NOT NULL
- transaction_id TEXT
- type TEXT NOT NULL
- amount INTEGER NOT NULL
- note TEXT
- movement_date TEXT NOT NULL
- created_at TEXT NOT NULL

### attachments

- id TEXT PRIMARY KEY
- user_id TEXT NOT NULL
- transaction_id TEXT
- r2_key TEXT NOT NULL
- file_name TEXT
- mime_type TEXT
- size_bytes INTEGER
- created_at TEXT NOT NULL

### app_settings

- user_id TEXT PRIMARY KEY
- daily_budget_mode TEXT DEFAULT 'auto'
- week_starts_on TEXT DEFAULT 'monday'
- theme TEXT DEFAULT 'system'
- ai_scan_enabled INTEGER DEFAULT 0
- save_receipt_default INTEGER DEFAULT 0
- created_at TEXT NOT NULL
- updated_at TEXT NOT NULL

---

## 12. Security Requirements

1. Semua endpoint selain login harus authenticated.
2. Session pakai random token, simpan hash token di D1.
3. Cookie harus `HttpOnly`, `Secure`, `SameSite=Lax` atau `Strict`.
4. Password hash minimal PBKDF2 via Web Crypto atau library hashing yang compatible dengan Workers.
5. Validasi semua input pakai Zod.
6. Nominal harus integer positif.
7. Soft delete transaksi.
8. Batasi ukuran upload image, misalnya 5 MB.
9. Convert/compress image sebelum upload jika memungkinkan.
10. Jangan log data OCR penuh di production.
11. Endpoint upload harus memastikan user hanya bisa akses file miliknya.
12. Export CSV hanya boleh untuk user yang login.
13. Tambahkan CSRF protection untuk mutation jika memakai cookie auth.

---

## 13. Non-functional Requirements

### Performance

- Dashboard load < 1.5 detik setelah warm cache.
- Input transaksi terasa instan.
- OCR boleh lebih lama, tapi progress harus jelas.
- List transaksi harus pagination/infinite scroll.

### Accessibility

- Semua tombol punya label.
- Kontras teks cukup.
- Bisa navigasi keyboard di desktop.
- Form error jelas.
- Tidak mengandalkan warna saja.

### Reliability

- Transaksi tidak boleh hilang ketika offline.
- Jika submit gagal, draft tetap tersimpan lokal.
- R2 upload gagal tidak boleh menggagalkan transaksi jika user setuju simpan tanpa bukti.

### Maintainability

- Pisahkan business logic dari UI.
- Gunakan repository/service layer untuk D1.
- Gunakan reusable components.
- Tulis acceptance test untuk fitur utama.

---

## 14. Analytics Pribadi

Karena ini app pribadi, tidak perlu analytics pihak ketiga. Gunakan rekap internal saja:

- total transaksi
- rata-rata pengeluaran harian
- kategori terbesar
- tren bulanan
- progress tabungan
- emergency fund ratio

---

## 15. Milestone

### Milestone 1 — Foundation

- Setup SvelteKit + Tailwind + Cloudflare adapter
- Wrangler config
- D1 migrations
- R2 bucket binding
- Auth single-user
- Layout utama

### Milestone 2 — Core Finance

- CRUD transaksi
- Kategori
- Dashboard
- Budget harian/mingguan/bulanan

### Milestone 3 — Goals

- Tabungan
- Dana tak terduga
- Fund movement
- Dashboard progress

### Milestone 4 — Scan

- Upload/paste image
- OCR client-side
- Parser nominal/tanggal
- Review draft
- Optional R2 attachment
- Optional Workers AI parse

### Milestone 5 — Rekap & Export

- Rekap harian/mingguan/bulanan
- Filter tanggal
- CSV export
- Chart

### Milestone 6 — PWA/App

- Manifest
- Service worker
- Installable icons
- Offline queue
- Tauri optional exploration

---

## 16. Definition of Done

Produk dianggap MVP selesai jika:

1. User bisa login.
2. User bisa mencatat pemasukan dan pengeluaran manual.
3. Dashboard menampilkan sisa jatah dan ringkasan bulan ini.
4. User bisa mengatur budget harian/mingguan/bulanan.
5. User bisa membuat tabungan dan dana tak terduga.
6. User bisa scan/upload screenshot lalu menyimpan hasil sebagai transaksi setelah review.
7. Data tersimpan di D1.
8. Bukti gambar bisa tersimpan di R2.
9. Rekap bulanan bisa dilihat dan diexport CSV.
10. App responsive di mobile dan desktop.
11. PWA bisa diinstall.
12. Tidak ada error TypeScript, lint, dan build.
13. Deploy Cloudflare berhasil.

---

## 17. Referensi Teknis

- Cloudflare Workers SvelteKit guide: https://developers.cloudflare.com/workers/framework-guides/web-apps/sveltekit/
- Cloudflare D1 + SvelteKit: https://developers.cloudflare.com/d1/examples/d1-and-sveltekit/
- Cloudflare Workers best practices: https://developers.cloudflare.com/workers/best-practices/workers-best-practices/
- Cloudflare R2 docs: https://developers.cloudflare.com/r2/
- Cloudflare Workers AI models: https://developers.cloudflare.com/workers-ai/models/
- Tauri v2 docs: https://v2.tauri.app/start/
- Tesseract.js: https://tesseract.projectnaptha.com/
