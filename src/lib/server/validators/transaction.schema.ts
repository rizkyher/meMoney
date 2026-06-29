import { z } from 'zod';

export const transactionTypeSchema = z.enum([
  'income',
  'expense',
  'transfer',
  'savings_deposit',
  'savings_withdrawal',
  'emergency_deposit',
  'emergency_withdrawal'
]);

export const transactionSchema = z.object({
  type: transactionTypeSchema,
  amount: z.coerce.number().int().positive(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category_id: z.string().nullable().optional(),
  account_id: z.string().nullable().optional(),
  title: z.string().max(120).nullable().optional(),
  merchant: z.string().max(120).nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
  source: z.enum(['manual', 'scan', 'import', 'recurring']).default('manual'),
  receipt_image_key: z.string().nullable().optional(),
  ocr_text: z.string().max(20_000).nullable().optional(),
  confidence: z.number().min(0).max(1).nullable().optional()
});

export const transactionQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  type: transactionTypeSchema.optional(),
  category_id: z.string().optional(),
  q: z.string().max(80).optional()
});
