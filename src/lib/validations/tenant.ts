import { z } from 'zod'

export const tenantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  unitId: z.string().min(1, 'Unit is required'),
  leaseStart: z.string().min(1, 'Lease start date is required'),
  leaseEnd: z.string().min(1, 'Lease end date is required'),
  rentAmount: z.coerce.number().min(0, 'Rent amount must be positive'),
  securityDeposit: z.coerce.number().optional().nullable(),
})

export const tenantNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
})

export type TenantInput = z.infer<typeof tenantSchema>
export type TenantNoteInput = z.infer<typeof tenantNoteSchema>
