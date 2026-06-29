# Dompet Pribadi

Aplikasi pencatatan uang pribadi mobile-first dengan SvelteKit, TypeScript, Tailwind CSS, Cloudflare Workers, D1, R2, Zod, Tesseract.js OCR, dan PWA.

## Local Setup

```bash
npm install
npm run cf:types
npm run db:migrate:local
npm run dev
```

Buka app, lalu buat user pertama dari `/login`. Form setup hanya aktif saat tabel `users` masih kosong.

## Cloudflare Resources

```bash
npx wrangler d1 create uang-pribadi-db
npx wrangler r2 bucket create uang-pribadi-receipts
npx wrangler secret put SESSION_SECRET
```

Ganti `database_id` di `wrangler.jsonc` dengan ID D1 hasil create.

## Deploy

```bash
npm run build
npx wrangler d1 migrations apply uang-pribadi-db --remote
npx wrangler deploy
```

## Security Notes

- Session disimpan di cookie `HttpOnly`, `Secure`, `SameSite=Lax`.
- Token session disimpan sebagai SHA-256 hash di D1.
- Password memakai PBKDF2 Web Crypto.
- Mutation API divalidasi Zod dan dilindungi CSRF header.
- OCR default berjalan client-side; gambar hanya dikirim ke R2 jika user memilih simpan bukti.

## MVP Gaps

Fondasi production-ready sudah dibuat, tetapi polish berikutnya masih disarankan: edit goal/movement UI lengkap, pagination transaksi, chart visual rekap, Playwright login flow dengan seed fixture, dan deploy remote setelah resource Cloudflare asli tersedia.
