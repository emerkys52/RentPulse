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
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { paymentSchema, type PaymentInput } from '@/lib/validations/payment'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

type Tenant = {
  id: string
  firstName: string
  lastName: string
  rentAmount: number
  unit: {
    unitNumber: string
    property: {
      name: string
    }
  }
}

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'other', label: 'Other' },
]

export default function NewPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedTenantId = searchParams.get('tenantId')

  const [isLoading, setIsLoading] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      tenantId: preselectedTenantId || '',
      paymentMethod: 'bank_transfer',
      paymentDate: new Date().toISOString().split('T')[0],
    },
  })

  const selectedTenantId = watch('tenantId')
  const selectedTenant = tenants.find((t) => t.id === selectedTenantId)

  useEffect(() => {
    fetchTenants()
  }, [])

  useEffect(() => {
    if (selectedTenant) {
      setValue('amount', selectedTenant.rentAmount)
    }
  }, [selectedTenant, setValue])

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTenants(data.filter((t: Tenant) => t.unit)) // Only tenants with units
    } catch (error) {
      toast.error('Failed to load tenants')
    }
  }

  const onSubmit = async (data: PaymentInput) => {
    setIsLoading(true)

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to record payment')
      }

      toast.success('Payment recorded successfully')
      router.push('/payments')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to record payment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/payments" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record Payment</CardTitle>
          <CardDescription>Record a rent payment from a tenant</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tenant</Label>
              <Select
                value={selectedTenantId}
                onValueChange={(value) => setValue('tenantId', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.firstName} {tenant.lastName} - {tenant.unit.property.name} Unit {tenant.unit.unitNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tenantId && (
                <p className="text-sm text-destructive">{errors.tenantId.message}</p>
              )}
              {selectedTenant && (
                <p className="text-sm text-muted-foreground">
                  Monthly rent: {formatCurrency(selectedTenant.rentAmount)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount')}
                  disabled={isLoading}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lateFee">Late Fee (if any)</Label>
                <Input
                  id="lateFee"
                  type="number"
                  step="0.01"
                  defaultValue="0"
                  {...register('lateFee')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  {...register('paymentDate')}
                  disabled={isLoading}
                />
                {errors.paymentDate && (
                  <p className="text-sm text-destructive">{errors.paymentDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date (optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...register('dueDate')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                defaultValue="bank_transfer"
                onValueChange={(value) => setValue('paymentMethod', value as PaymentInput['paymentMethod'])}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this payment"
                {...register('notes')}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <div className="flex justify-end gap-4 p-6 pt-0">
            <Link href="/payments">
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Payment
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
