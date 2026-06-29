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
