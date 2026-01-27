import { z } from 'zod'

export const paymentSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  dueDate: z.string().optional().nullable(),
  paymentMethod: z.enum(['cash', 'check', 'bank_transfer', 'credit_card', 'other']),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  lateFee: z.coerce.number().optional(),
  notes: z.string().optional().nullable(),
})

export type PaymentInput = z.infer<typeof paymentSchema>
