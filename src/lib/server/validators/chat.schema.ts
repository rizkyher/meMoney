import { z } from 'zod';

export const transactionChatSchema = z.object({
  message: z.string().trim().min(3).max(300),
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});
