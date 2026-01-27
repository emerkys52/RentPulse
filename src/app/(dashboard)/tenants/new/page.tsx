'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { tenantSchema, type TenantInput } from '@/lib/validations/tenant'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

type Property = {
  id: string
  name: string
  units: {
    id: string
    unitNumber: string
    rentAmount: number
    isOccupied: boolean
  }[]
}

export default function NewTenantPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedUnitId = searchParams.get('unitId')

  const [isLoading, setIsLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [availableUnits, setAvailableUnits] = useState<Property['units']>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TenantInput>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      unitId: preselectedUnitId || '',
    },
  })

  const selectedUnitId = watch('unitId')

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    if (selectedPropertyId) {
      const property = properties.find((p) => p.id === selectedPropertyId)
      setAvailableUnits(property?.units.filter((u) => !u.isOccupied) || [])
    }
  }, [selectedPropertyId, properties])

  useEffect(() => {
    // Auto-select property if unit is preselected
    if (preselectedUnitId && properties.length > 0) {
      for (const property of properties) {
        const unit = property.units.find((u) => u.id === preselectedUnitId)
        if (unit) {
          setSelectedPropertyId(property.id)
          setValue('unitId', preselectedUnitId)
          setValue('rentAmount', unit.rentAmount)
          break
        }
      }
    }
  }, [preselectedUnitId, properties, setValue])

  useEffect(() => {
    // Auto-fill rent amount when unit is selected
    if (selectedUnitId) {
      const unit = availableUnits.find((u) => u.id === selectedUnitId)
      if (unit) {
        setValue('rentAmount', unit.rentAmount)
      }
    }
  }, [selectedUnitId, availableUnits, setValue])

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProperties(data)
    } catch (error) {
      toast.error('Failed to load properties')
    }
  }

  const onSubmit = async (data: TenantInput) => {
    setIsLoading(true)

    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to create tenant')
      }

      toast.success('Tenant added successfully')
      router.push(`/tenants/${result.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add tenant')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/tenants" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tenants
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Tenant</CardTitle>
          <CardDescription>Add a tenant to an available unit</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Property</Label>
              <Select
                value={selectedPropertyId}
                onValueChange={setSelectedPropertyId}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Unit</Label>
              <Select
                value={selectedUnitId}
                onValueChange={(value) => setValue('unitId', value)}
                disabled={isLoading || !selectedPropertyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedPropertyId ? 'Select a unit' : 'Select a property first'} />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No vacant units available
                    </SelectItem>
                  ) : (
                    availableUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        Unit {unit.unitNumber} - {formatCurrency(unit.rentAmount)}/mo
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.unitId && (
                <p className="text-sm text-destructive">{errors.unitId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leaseStart">Lease Start Date</Label>
                <Input
                  id="leaseStart"
                  type="date"
                  {...register('leaseStart')}
                  disabled={isLoading}
                />
                {errors.leaseStart && (
                  <p className="text-sm text-destructive">{errors.leaseStart.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaseEnd">Lease End Date</Label>
                <Input
                  id="leaseEnd"
                  type="date"
                  {...register('leaseEnd')}
                  disabled={isLoading}
                />
                {errors.leaseEnd && (
                  <p className="text-sm text-destructive">{errors.leaseEnd.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rentAmount">Monthly Rent</Label>
                <Input
                  id="rentAmount"
                  type="number"
                  step="0.01"
                  {...register('rentAmount')}
                  disabled={isLoading}
                />
                {errors.rentAmount && (
                  <p className="text-sm text-destructive">{errors.rentAmount.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityDeposit">Security Deposit (optional)</Label>
                <Input
                  id="securityDeposit"
                  type="number"
                  step="0.01"
                  {...register('securityDeposit')}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <div className="flex justify-end gap-4 p-6 pt-0">
            <Link href="/tenants">
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Tenant
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
