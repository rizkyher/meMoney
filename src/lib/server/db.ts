export function getDb(platform: App.Platform | undefined): D1Database {
  if (!platform?.env.DB) throw new Error('Cloudflare D1 binding DB belum tersedia.');
  return platform.env.DB;
}

export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}
