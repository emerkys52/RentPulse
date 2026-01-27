import { z } from 'zod'

export const maintenanceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  dueDate: z.string().optional().nullable(),
  cost: z.coerce.number().optional().nullable(),
  vendorName: z.string().optional().nullable(),
  vendorContact: z.string().optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']).optional().nullable(),
})

export type MaintenanceInput = z.infer<typeof maintenanceSchema>
