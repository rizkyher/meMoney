import { ok, fail, readJson, requireUser } from '$lib/server/api';
import { scanParseSchema } from '$lib/server/validators/scan.schema';
import { parseScanText } from '$lib/server/services/scan-parser.service';

export async function POST(event) {
  const user = requireUser(event);
  if (!user) return fail('UNAUTHORIZED', 'Silakan login dulu.', 401);
  const parsed = await readJson(event, scanParseSchema);
  if (parsed.error) return parsed.error;
  return ok(parseScanText(parsed.value.ocr_text));
}
