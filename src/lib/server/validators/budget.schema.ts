import { z } from 'zod';

export const budgetSchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']),
  amount: z.coerce.number().int().min(0),
  category_id: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  mode: z.enum(['manual', 'auto']).default('manual')
});

export const budgetsSchema = z.object({
  budgets: z.array(budgetSchema).min(1).max(24)
});
