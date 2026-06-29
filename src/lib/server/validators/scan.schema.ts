import { z } from 'zod';

export const scanParseSchema = z.object({
  ocr_text: z.string().min(1).max(20_000),
  use_ai: z.boolean().default(false),
  image_base64: z.string().nullable().optional()
});
