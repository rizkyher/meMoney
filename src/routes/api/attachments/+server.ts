import { getDb } from '$lib/server/db';
import { createId, nowIso } from '$lib/server/db';
import { ok, fail, requireUser } from '$lib/server/api';

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxSize = 5 * 1024 * 1024;

export async function POST(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  const form = await event.request.formData();
  const file = form.get('file');
  const transactionId = form.get('transaction_id');
  if (!(file instanceof File)) return fail('NO_FILE', 'Pilih gambar dulu.', 422);
  if (!allowed.has(file.type)) return fail('INVALID_FILE', 'Format gambar harus JPEG, PNG, atau WebP.', 422);
  if (file.size > maxSize) return fail('FILE_TOO_LARGE', 'Ukuran gambar maksimal 5 MB.', 422);

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/jpeg' ? 'jpg' : 'webp';
  const date = new Date();
  const key = `receipts/${user.id}/${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.${ext}`;
  await event.platform?.env.BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type }
  });
  await getDb(event.platform)
    .prepare('INSERT INTO attachments (id, user_id, transaction_id, r2_key, file_name, mime_type, size_bytes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(createId('att'), user.id, typeof transactionId === 'string' ? transactionId : null, key, file.name, file.type, file.size, nowIso())
    .run();
  return ok({ key });
}
