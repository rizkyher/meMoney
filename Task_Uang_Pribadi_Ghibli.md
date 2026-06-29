# Task.md — Build Website Pencatatan Uang Pribadi

Kamu adalah senior fullstack engineer. Bangun aplikasi pencatatan uang pribadi dengan kualitas production-ready menggunakan SvelteKit, TypeScript, Tailwind CSS, Cloudflare Workers, Cloudflare D1, Cloudflare R2, dan PWA. Fokus utama: UX sangat nyaman, clean, rapi, mobile-first, desktop-friendly, dan visual cozy ghibli-inspired tanpa meniru aset/karakter/karya spesifik.

---

## 0. Output Akhir yang Wajib Dihasilkan

Aplikasi harus bisa:

1. Login single-user.
2. Mencatat pemasukan.
3. Mencatat pengeluaran.
4. Mengatur jatah harian, mingguan, dan bulanan.
5. Mengelola tabungan/goals.
6. Mengelola dana tak terduga/emergency fund.
7. Melihat dashboard ringkas.
8. Melihat rekap data harian/mingguan/bulanan/custom range.
9. Scan/upload/paste image atau screenshot untuk dibuat draft transaksi.
10. Review hasil scan sebelum disimpan.
11. Menyimpan lampiran gambar ke R2 jika user memilih.
12. Menyimpan data transaksi ke D1.
13. Export CSV.
14. Responsive mobile dan desktop.
15. PWA installable.
16. Deploy-ready ke Cloudflare Workers.

---

## 1. Tech Stack Wajib

Gunakan:

- SvelteKit latest stable
- TypeScript
- Tailwind CSS
- Cloudflare Workers
- `@sveltejs/adapter-cloudflare`
- Cloudflare D1
- Cloudflare R2
- Zod untuk validation
- lucide-svelte untuk icons
- Tesseract.js untuk OCR client-side
- Optional shadcn-svelte untuk komponen dasar jika cocok
- Vitest untuk unit test logic
- Playwright untuk e2e minimal

Prefer package manager:

- Bun jika project environment mendukung
- Jika tidak, gunakan pnpm/npm secara konsisten

Jangan gunakan:

- Backend terpisah Express/Laravel
- localStorage untuk session auth
- REST API Cloudflare dari Worker untuk D1/R2
- Auto-save hasil AI/OCR tanpa review user
- Hardcoded secret

---

## 2. Setup Project

### 2.1 Buat Project

Buat project SvelteKit dengan TypeScript.

Install dependencies minimal:

```bash
npm create svelte@latest uang-pribadi
cd uang-pribadi
npm install
npm install -D @sveltejs/adapter-cloudflare wrangler tailwindcss @tailwindcss/vite vite
npm install zod lucide-svelte tesseract.js
npm install -D vitest playwright @playwright/test
```

Jika template Svelte terbaru berbeda, sesuaikan dengan best practice terbaru, tetapi hasil akhir tetap SvelteKit + Cloudflare adapter.

### 2.2 Cloudflare Adapter

Update `svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  }
};

export default config;
```

### 2.3 Wrangler Config

Buat `wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "uang-pribadi",
  "compatibility_date": "2026-06-29",
  "compatibility_flags": ["nodejs_compat"],
  "main": ".svelte-kit/cloudflare/_worker.js",
  "assets": {
    "directory": ".svelte-kit/cloudflare",
    "binding": "ASSETS"
  },
  "observability": {
    "enabled": true
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "uang-pribadi-db",
      "database_id": "REPLACE_WITH_D1_DATABASE_ID"
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
  },
  "vars": {
    "APP_ENV": "production",
    "APP_TIMEZONE": "Asia/Jakarta"
  }
}
```

Catatan:

- Jika build config Cloudflare terbaru menghasilkan format berbeda, pakai format terbaru dari Wrangler.
- Jangan commit secret.
- Gunakan `wrangler secret put` untuk secret.

---

## 3. Struktur Folder

Buat struktur seperti ini:

```text
src/
  app.css
  app.d.ts
  hooks.server.ts
  lib/
    components/
      app/
        AppShell.svelte
        BottomNav.svelte
        Sidebar.svelte
        TopBar.svelte
        MoneyCard.svelte
        ProgressCard.svelte
        TransactionForm.svelte
        TransactionList.svelte
        ScanUploader.svelte
        ScanReviewSheet.svelte
        BudgetProgress.svelte
        EmptyState.svelte
        ConfirmDialog.svelte
      ui/
        Button.svelte
        Card.svelte
        Input.svelte
        Select.svelte
        Dialog.svelte
        Sheet.svelte
        Badge.svelte
        Toast.svelte
    constants/
      categories.ts
      theme.ts
    server/
      auth.ts
      csrf.ts
      db.ts
      repositories/
        accounts.repo.ts
        budgets.repo.ts
        categories.repo.ts
        goals.repo.ts
        transactions.repo.ts
        reports.repo.ts
        settings.repo.ts
      services/
        dashboard.service.ts
        money.service.ts
        scan-parser.service.ts
        attachment.service.ts
        csv.service.ts
      validators/
        auth.schema.ts
        transaction.schema.ts
        budget.schema.ts
        goal.schema.ts
        scan.schema.ts
    stores/
      toast.ts
      offlineQueue.ts
    utils/
      date.ts
      money.ts
      ocr.ts
      image.ts
      csv.ts
  routes/
    +layout.svelte
    +layout.server.ts
    +page.svelte
    login/
      +page.svelte
      +page.server.ts
    app/
      +layout.svelte
      +layout.server.ts
      dashboard/+page.svelte
      transactions/+page.svelte
      scan/+page.svelte
      budgets/+page.svelte
      savings/+page.svelte
      emergency/+page.svelte
      reports/+page.svelte
      settings/+page.svelte
    api/
      auth/login/+server.ts
      auth/logout/+server.ts
      me/+server.ts
      dashboard/+server.ts
      transactions/+server.ts
      transactions/[id]/+server.ts
      categories/+server.ts
      budgets/+server.ts
      goals/+server.ts
      scan/parse/+server.ts
      attachments/+server.ts
      reports/summary/+server.ts
      reports/export.csv/+server.ts
static/
  icons/
  manifest.webmanifest
migrations/
  0001_initial.sql
  0002_seed_defaults.sql
```

---

## 4. Type Definitions

Update `src/app.d.ts`:

```ts
declare global {
  namespace App {
    interface Platform {
      env: Env;
      cf: CfProperties;
      ctx: ExecutionContext;
    }

    interface Locals {
      user: {
        id: string;
        email: string;
        name: string;
      } | null;
      csrfToken?: string;
    }
  }
}

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  AI?: Ai;
  APP_ENV: string;
  APP_TIMEZONE: string;
  SESSION_SECRET?: string;
}

export {};
```

---

## 5. Database Migration

Buat `migrations/0001_initial.sql`:

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  currency TEXT NOT NULL DEFAULT 'IDR',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash','bank','ewallet','saving','emergency','other')),
  initial_balance INTEGER NOT NULL DEFAULT 0,
  current_balance INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_categories_user_type ON categories(user_id, type);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  account_id TEXT,
  category_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('income','expense','transfer','savings_deposit','savings_withdrawal','emergency_deposit','emergency_withdrawal')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  title TEXT,
  merchant TEXT,
  note TEXT,
  transaction_date TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','scan','import','recurring')),
  receipt_image_key TEXT,
  ocr_text TEXT,
  confidence REAL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_deleted ON transactions(deleted_at);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily','weekly','monthly')),
  amount INTEGER NOT NULL CHECK (amount >= 0),
  category_id TEXT,
  start_date TEXT,
  end_date TEXT,
  mode TEXT NOT NULL DEFAULT 'manual' CHECK (mode IN ('manual','auto')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, period);

CREATE TABLE IF NOT EXISTS savings_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_amount INTEGER NOT NULL CHECK (target_amount >= 0),
  current_amount INTEGER NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date TEXT,
  type TEXT NOT NULL DEFAULT 'saving' CHECK (type IN ('saving','emergency')),
  icon TEXT,
  color TEXT,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_goals_user_type ON savings_goals(user_id, type);

CREATE TABLE IF NOT EXISTS fund_movements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  goal_id TEXT NOT NULL,
  transaction_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('deposit','withdrawal','adjustment')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  note TEXT,
  movement_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (goal_id) REFERENCES savings_goals(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_fund_movements_goal ON fund_movements(goal_id);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  transaction_id TEXT,
  r2_key TEXT NOT NULL UNIQUE,
  file_name TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_attachments_transaction_id ON attachments(transaction_id);

CREATE TABLE IF NOT EXISTS app_settings (
  user_id TEXT PRIMARY KEY,
  daily_budget_mode TEXT NOT NULL DEFAULT 'auto',
  week_starts_on TEXT NOT NULL DEFAULT 'monday',
  theme TEXT NOT NULL DEFAULT 'system',
  ai_scan_enabled INTEGER NOT NULL DEFAULT 0,
  save_receipt_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Buat `migrations/0002_seed_defaults.sql` untuk default categories global:

```sql
INSERT INTO categories (id, user_id, type, name, icon, color, is_default, archived, created_at)
VALUES
('cat-exp-food', NULL, 'expense', 'Makan & Minum', 'utensils', 'sage', 1, 0, datetime('now')),
('cat-exp-transport', NULL, 'expense', 'Transportasi', 'bus', 'sky', 1, 0, datetime('now')),
('cat-exp-shopping', NULL, 'expense', 'Belanja', 'shopping-bag', 'clay', 1, 0, datetime('now')),
('cat-exp-bills', NULL, 'expense', 'Tagihan', 'receipt', 'moss', 1, 0, datetime('now')),
('cat-exp-internet', NULL, 'expense', 'Internet', 'wifi', 'sky', 1, 0, datetime('now')),
('cat-exp-health', NULL, 'expense', 'Kesehatan', 'heart-pulse', 'rose', 1, 0, datetime('now')),
('cat-exp-education', NULL, 'expense', 'Pendidikan', 'book-open', 'moss', 1, 0, datetime('now')),
('cat-exp-fun', NULL, 'expense', 'Hiburan', 'sparkles', 'amber', 1, 0, datetime('now')),
('cat-exp-donation', NULL, 'expense', 'Sedekah', 'hand-heart', 'sage', 1, 0, datetime('now')),
('cat-exp-debt', NULL, 'expense', 'Cicilan/Hutang', 'credit-card', 'clay', 1, 0, datetime('now')),
('cat-exp-other', NULL, 'expense', 'Lainnya', 'circle-dot', 'stone', 1, 0, datetime('now')),
('cat-inc-salary', NULL, 'income', 'Gaji', 'wallet', 'sage', 1, 0, datetime('now')),
('cat-inc-freelance', NULL, 'income', 'Freelance', 'laptop', 'moss', 1, 0, datetime('now')),
('cat-inc-bonus', NULL, 'income', 'Bonus', 'gift', 'amber', 1, 0, datetime('now')),
('cat-inc-refund', NULL, 'income', 'Refund', 'rotate-ccw', 'sky', 1, 0, datetime('now')),
('cat-inc-sale', NULL, 'income', 'Jual Barang', 'package', 'clay', 1, 0, datetime('now')),
('cat-inc-other', NULL, 'income', 'Lainnya', 'circle-dot', 'stone', 1, 0, datetime('now'));
```

---

## 6. Auth Single-user

Implement auth sederhana tapi aman:

1. Login email + password.
2. Password hashing pakai PBKDF2 via Web Crypto atau library yang kompatibel Workers.
3. Session token random minimal 32 bytes.
4. Simpan `token_hash` di D1.
5. Cookie session:
   - `HttpOnly`
   - `Secure`
   - `SameSite=Lax` atau `Strict`
   - max age 30 hari
6. Middleware di `hooks.server.ts` membaca session dan mengisi `locals.user`.
7. Semua route `/app/*` wajib login.
8. Semua route `/api/*` selain login/logout wajib login.

Tambahkan command/script seed user pertama:

- Bisa via migration manual SQL
- Atau endpoint setup yang hanya aktif saat belum ada user
- Jangan biarkan endpoint setup terbuka setelah user dibuat

Acceptance criteria:

- Login berhasil membuat session cookie.
- Logout menghapus session di DB dan cookie.
- User tanpa session diarahkan ke `/login`.
- Mutation API tanpa session return 401.

---

## 7. Styling dan Design System

Buat design token di Tailwind.

Warna:

```text
cream: #F7F0DF
paper: #FFFDF6
sage: #8FAF8C
moss: #526B4E
clay: #B9815A
sky-soft: #BFD7D9
ink: #2F332D
muted: #7B7A70
rose-soft: #E8B7A7
amber-soft: #E9C46A
stone-soft: #E8E2D1
```

UI direction:

- rounded-2xl / rounded-3xl
- card dengan border lembut
- background subtle radial gradient
- ilustrasi decorative CSS seperti daun/awan/bukit abstrak, bukan gambar copyrighted
- motion halus 150–250ms
- hover/focus states jelas
- dark mode tetap nyaman

Komponen wajib:

- Button
- Input
- MoneyInput
- Select
- Card
- Badge
- Sheet/Drawer
- Dialog
- Toast
- EmptyState
- ProgressBar
- DateRangePicker sederhana

Acceptance criteria:

- Mobile 360px tidak overflow.
- Desktop 1440px layout nyaman.
- Semua form punya label dan error message.
- Focus ring terlihat.

---

## 8. Routes UI

## 8.1 `/login`

Buat halaman login cozy:

- Card tengah
- Background cream + ilustrasi bukit/daun CSS
- Email/password
- Remember me opsional
- Error state lembut

## 8.2 `/app/dashboard`

Tampilkan:

- Greeting
- Sisa jatah hari ini
- Pengeluaran hari ini
- Pemasukan bulan ini
- Pengeluaran bulan ini
- Net cashflow bulan ini
- Progress budget bulanan
- Progress tabungan
- Progress dana tak terduga
- Recent transactions
- Quick action: tambah pengeluaran, tambah pemasukan, scan

## 8.3 `/app/transactions`

Tampilkan:

- Filter tanggal
- Filter type
- Filter category
- Search merchant/note/title
- List card di mobile
- Table di desktop
- Edit/delete transaction

## 8.4 `/app/scan`

Tampilkan:

- Upload area
- Camera input mobile
- Paste screenshot desktop
- Preview image
- OCR progress
- OCR raw text collapsible
- Draft transaction review
- Checkbox `Simpan bukti gambar ke cloud`
- Button simpan

## 8.5 `/app/budgets`

Tampilkan:

- Daily budget setting
- Weekly budget setting
- Monthly budget setting
- Manual/auto mode
- Progress each period
- Category budget optional

## 8.6 `/app/savings`

Tampilkan:

- List goals
- Create/edit goal
- Add deposit/withdrawal
- Progress target

## 8.7 `/app/emergency`

Tampilkan:

- Emergency fund card
- Target amount
- Current amount
- Status keamanan
- Movement history

## 8.8 `/app/reports`

Tampilkan:

- Date range filter
- Summary cards
- Category breakdown
- Daily trend
- Income vs expense
- CSV export

## 8.9 `/app/settings`

Tampilkan:

- Profile
- Currency/timezone
- Theme
- Scan privacy setting
- Save receipt default
- Export all data
- Danger zone: delete all local draft/offline queue

---

## 9. API Contract

Semua response JSON format:

```ts
type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiError = {
  ok: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};
```

### Transactions

`GET /api/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD&type=expense&category_id=...&q=...`

`POST /api/transactions`

Body:

```json
{
  "type": "expense",
  "amount": 25000,
  "transaction_date": "2026-06-29",
  "category_id": "cat-exp-food",
  "account_id": "acc-cash",
  "title": "Makan siang",
  "merchant": "Warung Nasi",
  "note": "Ayam bakar",
  "source": "manual",
  "receipt_image_key": null,
  "ocr_text": null,
  "confidence": null
}
```

Rules:

- `amount` integer rupiah, tidak boleh minus.
- Untuk pengeluaran/pemasukan normal, type hanya `income` atau `expense`.
- Jangan percaya user_id dari body; ambil dari session.

### Scan Parse

`POST /api/scan/parse`

Body:

```json
{
  "ocr_text": "string",
  "use_ai": false,
  "image_base64": null
}
```

Response:

```json
{
  "ok": true,
  "data": {
    "type": "expense",
    "amount": 45000,
    "transaction_date": "2026-06-29",
    "merchant": "TOKO ABC",
    "category_hint": "Belanja",
    "note": "Parsed from screenshot",
    "confidence": 0.82,
    "raw": {
      "amount_candidates": [45000, 50000],
      "date_candidates": ["2026-06-29"]
    }
  }
}
```

### Attachment

`POST /api/attachments`

Gunakan multipart/form-data atau upload via endpoint langsung ke R2.

Rules:

- Max 5 MB.
- Accept `image/jpeg`, `image/png`, `image/webp`.
- Generate safe R2 key.
- Jangan gunakan nama file asli sebagai key utama.

---

## 10. OCR dan Scan Implementation

## 10.1 Client-side OCR

Buat `src/lib/utils/ocr.ts`:

- Load Tesseract worker lazy saat user masuk halaman scan.
- Gunakan language `ind+eng` jika tersedia; fallback `eng` jika gagal.
- Reuse worker untuk multiple scan.
- Return text + confidence.
- Terminate worker saat halaman ditutup.

Pseudo:

```ts
import { createWorker } from 'tesseract.js';

export async function runOcr(file: File, onProgress?: (progress: number) => void) {
  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') onProgress?.(m.progress);
    }
  });

  const result = await worker.recognize(file);
  await worker.terminate();

  return {
    text: result.data.text,
    confidence: result.data.confidence / 100
  };
}
```

Sesuaikan dengan API Tesseract.js terbaru yang terinstall.

## 10.2 Image Preprocessing

Tambahkan helper:

- Resize image max width 1600px.
- Convert ke grayscale/contrast ringan via canvas jika perlu.
- Rotate manual 90 derajat.
- Compress ke WebP sebelum R2 upload jika browser mendukung.

## 10.3 Parser Rule-based

Buat `scan-parser.service.ts`:

Deteksi nominal:

- `Rp25.000`
- `Rp 25.000`
- `IDR 25,000`
- `25.000,00`
- `TOTAL 25.000`
- `Jumlah 25.000`
- `Nominal 25.000`

Prioritas kata kunci nominal:

1. total
2. jumlah
3. nominal
4. grand total
5. pembayaran
6. transfer
7. amount

Deteksi tanggal:

- `29/06/2026`
- `2026-06-29`
- `29 Jun 2026`
- `29 Juni 2026`
- fallback hari ini jika tidak ditemukan

Deteksi tipe:

- Jika ada kata `terima`, `masuk`, `credited`, `received`, kemungkinan income.
- Jika ada kata `bayar`, `payment`, `debit`, `pembelian`, `transfer ke`, kemungkinan expense.
- Default expense.

Deteksi kategori:

- merchant atau keyword makanan -> Makan & Minum
- transport/gojek/grab/bensin/parkir -> Transportasi
- pulsa/internet/wifi/data -> Internet
- tagihan/listrik/pdam -> Tagihan
- apotek/klinik/obat -> Kesehatan
- buku/course/kursus -> Pendidikan
- cicilan/paylater/hutang -> Cicilan/Hutang
- fallback Lainnya

## 10.4 AI Optional

Jika `use_ai = true` dan binding `AI` tersedia:

- Kirim OCR text terlebih dahulu, bukan image, untuk hemat biaya dan privasi.
- Jika user mengizinkan image parse, kirim image ke vision model.
- Prompt AI harus meminta output JSON strict.
- Tetap validate hasil AI dengan Zod.
- Jangan simpan hasil AI tanpa review user.

Contoh prompt:

```text
Kamu membantu ekstraksi transaksi keuangan pribadi dari OCR text/screenshot.
Kembalikan JSON valid saja tanpa markdown.
Schema:
{
  "type": "income" | "expense",
  "amount": number,
  "transaction_date": "YYYY-MM-DD",
  "merchant": string | null,
  "category_hint": string | null,
  "note": string | null,
  "confidence": number
}
Jika tidak yakin, set confidence rendah. Jangan mengarang nominal.
OCR text:
{{ocr_text}}
```

---

## 11. Business Logic Money

Buat `money.service.ts`:

Functions:

- `getTodayRange(timezone)`
- `getWeekRange(date, weekStartsOn)`
- `getMonthRange(date)`
- `sumTransactions(userId, range, type?)`
- `calculateDailyBudgetStatus(userId)`
- `calculateWeeklyBudgetStatus(userId)`
- `calculateMonthlyBudgetStatus(userId)`
- `calculateGoalProgress(goal)`
- `formatIDR(amount)`

Budget status return:

```ts
type BudgetStatus = {
  period: 'daily' | 'weekly' | 'monthly';
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'over';
};
```

Rules:

- Pengeluaran saja yang mengurangi budget.
- Pemasukan tidak mengurangi budget.
- Savings deposit bisa dihitung terpisah, jangan campur pengeluaran konsumtif kecuali setting user memilih begitu.
- Deleted transaction tidak masuk hitungan.

---

## 12. Components Detail

## 12.1 MoneyInput

Requirements:

- Input angka besar.
- Format IDR saat blur/typing.
- Quick chips: 10k, 20k, 50k, 100k, 500k.
- Mobile numeric keyboard.
- Tidak boleh menyimpan string `Rp`; kirim integer.

## 12.2 TransactionForm

Mode:

- create expense
- create income
- edit
- scan draft

Fields:

- type toggle
- amount
- date
- category
- account
- merchant/title
- note
- source hidden

## 12.3 ScanUploader

Support:

- file input
- drag-drop
- paste clipboard
- camera capture on mobile

States:

- idle
- preview
- preprocessing
- ocr_running
- parsed
- error

## 12.4 Dashboard Cards

Cards harus punya:

- label
- amount
- small insight
- icon
- progress optional

---

## 13. PWA

Implement:

1. `static/manifest.webmanifest`
2. App icons 192, 512, maskable
3. Theme color
4. Service worker via SvelteKit compatible solution
5. Cache app shell
6. Offline fallback page
7. IndexedDB offline queue untuk draft transaksi

Manifest contoh:

```json
{
  "name": "Dompet Pribadi",
  "short_name": "Dompet",
  "description": "Pencatatan uang pribadi yang clean dan nyaman.",
  "start_url": "/app/dashboard",
  "display": "standalone",
  "background_color": "#F7F0DF",
  "theme_color": "#8FAF8C",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

---

## 14. Tauri Optional Phase

Jangan implement Tauri sebelum web MVP stabil. Siapkan arsitektur agar bisa dipakai oleh Tauri nanti:

- Pisahkan API client ke `src/lib/api/client.ts`.
- Gunakan `PUBLIC_API_BASE_URL`.
- Web PWA bisa pakai relative `/api`.
- Tauri bisa pakai remote API Cloudflare.
- Jangan bergantung pada browser-only API tanpa fallback.

Nanti fase Tauri:

```bash
npm install -D @tauri-apps/cli
npm run tauri init
npm run tauri dev
npm run tauri build
```

Untuk iOS/macOS, perlu Xcode, code signing, dan Apple Developer Program jika distribusi App Store/TestFlight.

---

## 15. Testing

## 15.1 Unit Test

Test wajib:

- format money
- parse IDR amount
- parse date Indonesia
- calculate daily budget
- calculate weekly budget
- calculate monthly budget
- scan parser amount candidates
- category hint logic

## 15.2 E2E Test

Playwright minimal:

1. Login.
2. Tambah pengeluaran.
3. Tambah pemasukan.
4. Lihat dashboard update.
5. Filter transaksi.
6. Buat savings goal.
7. Export CSV.

## 15.3 Manual QA

Cek di:

- Mobile width 360px
- Mobile width 430px
- Tablet width 768px
- Desktop width 1440px
- Light mode
- Dark mode
- Offline mode

---

## 16. Deployment

Commands:

```bash
npm run build
npx wrangler d1 migrations apply uang-pribadi-db --remote
npx wrangler deploy
```

Local dev:

```bash
npx wrangler dev
```

D1 local:

```bash
npx wrangler d1 migrations apply uang-pribadi-db --local
```

Create resources:

```bash
npx wrangler d1 create uang-pribadi-db
npx wrangler r2 bucket create uang-pribadi-receipts
```

Secrets:

```bash
npx wrangler secret put SESSION_SECRET
```

---

## 17. Acceptance Criteria Global

Selesai jika semua checklist ini terpenuhi:

- [ ] `npm run check` atau equivalent Svelte check pass.
- [ ] `npm run build` pass.
- [ ] Tidak ada TypeScript error.
- [ ] Migration D1 berhasil local dan remote.
- [ ] Login/logout berhasil.
- [ ] Route app terlindungi auth.
- [ ] CRUD transaksi berhasil.
- [ ] Dashboard angka sesuai transaksi.
- [ ] Budget harian/mingguan/bulanan berjalan.
- [ ] Tabungan bisa dibuat dan diupdate.
- [ ] Dana tak terduga bisa dibuat dan diupdate.
- [ ] OCR image menghasilkan draft transaksi.
- [ ] User bisa edit hasil scan sebelum simpan.
- [ ] Gambar bisa disimpan ke R2 jika dipilih.
- [ ] Rekap bisa filter tanggal.
- [ ] CSV export berhasil.
- [ ] UI responsive mobile dan desktop.
- [ ] PWA manifest valid.
- [ ] Tidak ada token/session di localStorage.
- [ ] Semua mutation API validasi Zod.
- [ ] Data user tidak bisa diakses tanpa login.
- [ ] Deploy Cloudflare berhasil.

---

## 18. UX Copy yang Harus Dipakai

Gunakan copy lembut:

- `Sisa jatah hari ini`
- `Aman sampai malam 🌿`
- `Sedikit lewat budget. Gapapa, kita rapikan lagi besok.`
- `Tabungan mulai tumbuh`
- `Dana tak terduga makin aman`
- `Scan dulu, nanti kamu cek sebelum disimpan.`
- `Hasil scan belum yakin. Cek nominalnya dulu ya.`
- `Catat cepat`
- `Uang masuk`
- `Uang keluar`

---

## 19. Important Implementation Notes

1. Selalu ambil `user_id` dari session, bukan dari request body.
2. Semua amount disimpan integer rupiah.
3. Jangan simpan file OCR/image jika user tidak memilih simpan bukti.
4. AI scan default off.
5. OCR client-side default on.
6. Gunakan prepared statements D1.
7. Gunakan R2 binding langsung.
8. Handle error dengan toast yang jelas.
9. Jangan membuat UI terlalu ramai.
10. Prioritaskan flow tercepat untuk tambah pengeluaran.
11. Build mobile-first dahulu, lalu desktop.
12. Pastikan scanner punya fallback input manual.

---

## 20. Suggested Build Order untuk Codex

Kerjakan berurutan:

1. Setup project + Tailwind + Cloudflare adapter.
2. Buat design system dan app shell.
3. Buat D1 migrations.
4. Implement server DB helper dan validators.
5. Implement auth.
6. Implement categories/accounts seed.
7. Implement CRUD transactions API.
8. Implement dashboard service.
9. Implement UI dashboard.
10. Implement transaction form/list.
11. Implement budgets.
12. Implement savings goals.
13. Implement emergency fund.
14. Implement reports + CSV.
15. Implement scan uploader.
16. Implement OCR client-side.
17. Implement rule-based parser.
18. Implement optional AI parser behind setting.
19. Implement R2 attachment upload.
20. Implement PWA.
21. Add tests.
22. Polish UI responsive.
23. Final build and deploy docs.

---

## 21. Final Deliverable

Berikan hasil akhir berupa:

- Source code lengkap.
- Migration SQL.
- README setup local.
- README deploy Cloudflare.
- Seed user instruction.
- Screenshots mobile dan desktop jika memungkinkan.
- Catatan fitur yang belum masuk MVP.
