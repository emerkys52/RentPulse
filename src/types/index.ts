import type { User, Property, Unit, Tenant, Payment, MaintenanceItem, Lease, Subscription } from '@prisma/client'

// Re-export Prisma types
export type { User, Property, Unit, Tenant, Payment, MaintenanceItem, Lease, Subscription }

// Extended types with relations
export type PropertyWithUnits = Property & {
  units: Unit[]
}

export type PropertyWithDetails = Property & {
  units: (Unit & {
    tenant: Tenant | null
  })[]
  _count: {
    units: number
  }
}

export type TenantWithDetails = Tenant & {
  unit: Unit & {
    property: Property
  }
  payments: Payment[]
  lease: Lease | null
}

export type UnitWithTenant = Unit & {
  tenant: Tenant | null
  property: Property
}

export type PaymentWithDetails = Payment & {
  tenant: Tenant & {
    unit: Unit & {
      property: Property
    }
  }
}

export type MaintenanceWithProperty = MaintenanceItem & {
  property: Property
  unit: Unit | null
}

export type LeaseWithDetails = Lease & {
  tenant: Tenant & {
    unit: Unit & {
      property: Property
    }
  }
}

// Dashboard stats
export type DashboardStats = {
  totalProperties: number
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  totalTenants: number
  monthlyRevenue: number
  pendingPayments: number
  upcomingMaintenance: number
  expiringLeases: number
}

// Form types
export type PropertyFormData = {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  type: 'single_family' | 'multi_family' | 'apartment' | 'condo' | 'townhouse' | 'commercial'
}

export type UnitFormData = {
  unitNumber: string
  bedrooms: number
  bathrooms: number
  squareFeet: number | null
  rentAmount: number
}

export type TenantFormData = {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  unitId: string
  leaseStart: string
  leaseEnd: string
  rentAmount: number
  securityDeposit: number | null
}

export type PaymentFormData = {
  tenantId: string
  amount: number
  paymentDate: string
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'other'
  notes: string | null
}

export type MaintenanceFormData = {
  title: string
  description: string | null
  propertyId: string
  unitId: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string | null
  isRecurring: boolean
  recurringInterval: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null
}

// API response types
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
