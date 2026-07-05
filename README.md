# meMoney

meMoney adalah aplikasi pencatatan uang pribadi mobile-first untuk mengelola transaksi, budget, tabungan, dana darurat, rekap, dan scan bukti transaksi. Aplikasi ini dibangun dengan SvelteKit dan siap dideploy ke Cloudflare Pages dengan D1, R2, dan Workers runtime.

Production: [https://memoney.pages.dev](https://memoney.pages.dev)

## Fitur

- Autentikasi email dan password dengan session cookie `HttpOnly`.
- Daftar user baru dan login.
- CRUD transaksi pemasukan dan pengeluaran.
- Budget harian, mingguan, dan bulanan dengan mode manual atau auto.
- Carry-over saldo bulan sebelumnya ke bulan berjalan.
- Tabungan dan dana tak terduga.
- Rekap transaksi, saldo awal, saldo akhir, dan export CSV.
- Scan OCR untuk gambar, PDF, TXT, dan CSV.
- PWA installable untuk Android dan iOS.
- Validasi input dengan Zod.
- Cloudflare D1 untuk database dan R2 untuk penyimpanan bukti transaksi.

## Tech Stack

- SvelteKit 2
- Svelte 5
- TypeScript
- Tailwind CSS
- Cloudflare Pages
- Cloudflare D1
- Cloudflare R2
- Cloudflare Workers AI binding
- Zod
- Tesseract.js
- PDF.js
- Vitest
- Playwright
- lucide-svelte

## Prasyarat

- Node.js
- npm
- Akun Cloudflare
- Wrangler login untuk deploy dan migrasi remote

## Setup Lokal

```bash
npm install
npm run cf:types
npm run db:migrate:local
npm run dev
```

Buka URL dev dari Vite, lalu buat user dari halaman login/register.

## Environment

Salin contoh konfigurasi:

```bash
cp .env.example .env
cp .dev.vars.example .dev.vars
```

Minimal konfigurasi penting:

```bash
APP_ENV="development"
SESSION_SECRET="ganti-dengan-random-string-panjang-minimal-32-karakter"
COOKIE_SECURE="false"
COOKIE_SAME_SITE="lax"
```

Untuk production, simpan secret melalui Wrangler:

```bash
npx wrangler pages secret put SESSION_SECRET --project-name=memoney
```

## Cloudflare Resources

Buat resource Cloudflare:

```bash
npx wrangler d1 create uang-pribadi-db
npx wrangler r2 bucket create uang-pribadi-receipts
```

Setelah D1 dibuat, masukkan `database_id` ke `wrangler.jsonc`.

Binding yang digunakan:

- `DB`: Cloudflare D1
- `BUCKET`: Cloudflare R2
- `AI`: Cloudflare Workers AI

## Migrasi Database

Lokal:

```bash
npm run db:migrate:local
```

Remote:

```bash
npm run db:migrate:remote
```

## Build dan Deploy

Build production:

```bash
npm run build
```

Deploy ke Cloudflare Pages:

```bash
npm run deploy
```

Atau manual:

```bash
npx wrangler pages deploy .svelte-kit/cloudflare --project-name=memoney --branch=main --commit-dirty=true
```

## Quality Check

```bash
npm run check
npm test
npm run build
```

E2E test:

```bash
npm run test:e2e
```

## PWA

meMoney sudah memiliki manifest, service worker, icon Android/iOS, Apple touch icon, shortcut PWA, dan fallback offline.

Install di Android:

1. Buka app di Chrome.
2. Pilih menu browser.
3. Pilih **Install app**.

Install di iOS:

1. Buka app di Safari.
2. Tap Share.
3. Pilih **Add to Home Screen**.

## Keamanan

- Password di-hash dengan PBKDF2 Web Crypto.
- Token session disimpan sebagai hash SHA-256 di D1.
- Cookie session memakai `HttpOnly`, `Secure` di production, dan `SameSite=Lax`.
- Mutation API dilindungi CSRF header.
- Semua payload penting divalidasi dengan Zod.
- Bukti transaksi disimpan di R2 jika user memilih upload/simpan bukti.

## Struktur Project

```text
src/
  lib/
    components/      UI components
    server/          auth, db, repositories, services, validators
    stores/          client stores
    utils/           helper client/server shared
  routes/            SvelteKit pages dan API endpoints
static/              manifest, icons, offline page
migrations/          Cloudflare D1 SQL migrations
tests/               unit tests
e2e/                 Playwright tests
```

## License

MIT License. Lihat [LICENSE](./LICENSE).
