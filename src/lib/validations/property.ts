import { z } from 'zod'

export const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'Valid ZIP code is required'),
  type: z.enum(['single_family', 'multi_family', 'apartment', 'condo', 'townhouse', 'commercial']),
})

export const unitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required'),
  bedrooms: z.coerce.number().min(0, 'Bedrooms must be 0 or more'),
  bathrooms: z.coerce.number().min(0, 'Bathrooms must be 0 or more'),
  squareFeet: z.coerce.number().optional().nullable(),
  rentAmount: z.coerce.number().min(0, 'Rent amount must be positive'),
})

export type PropertyInput = z.infer<typeof propertySchema>
export type UnitInput = z.infer<typeof unitSchema>
