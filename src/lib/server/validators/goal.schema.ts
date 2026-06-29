import { z } from 'zod';

export const goalSchema = z.object({
  name: z.string().min(2).max(120),
  target_amount: z.coerce.number().int().min(0),
  current_amount: z.coerce.number().int().min(0).default(0),
  target_date: z.string().nullable().optional(),
  type: z.enum(['saving', 'emergency']).default('saving'),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional()
});

export const movementSchema = z.object({
  goal_id: z.string(),
  type: z.enum(['deposit', 'withdrawal', 'adjustment']),
  amount: z.coerce.number().int().positive(),
  note: z.string().max(500).nullable().optional(),
  movement_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});
