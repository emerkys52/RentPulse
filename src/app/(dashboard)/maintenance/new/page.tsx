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
import { Switch } from '@/components/ui/switch'
import { maintenanceSchema, type MaintenanceInput } from '@/lib/validations/maintenance'
import { toast } from 'sonner'

type Property = {
  id: string
  name: string
  units: {
    id: string
    unitNumber: string
  }[]
}

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const recurringIntervals = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

export default function NewMaintenancePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedPropertyId = searchParams.get('propertyId')

  const [isLoading, setIsLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(preselectedPropertyId || '')
  const [isRecurring, setIsRecurring] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MaintenanceInput>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      propertyId: preselectedPropertyId || '',
      priority: 'medium',
      isRecurring: false,
    },
  })

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId)

  useEffect(() => {
    fetchProperties()
  }, [])

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

  const onSubmit = async (data: MaintenanceInput) => {
    setIsLoading(true)

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          isRecurring,
          recurringInterval: isRecurring ? data.recurringInterval : null,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to create maintenance item')
      }

      toast.success('Maintenance item created')
      router.push('/maintenance')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create maintenance item')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/maintenance" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Maintenance
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Maintenance Item</CardTitle>
          <CardDescription>Schedule a maintenance task for a property</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., HVAC Filter Replacement"
                {...register('title')}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add details about the maintenance task"
                {...register('description')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Property</Label>
              <Select
                value={selectedPropertyId}
                onValueChange={(value) => {
                  setSelectedPropertyId(value)
                  setValue('propertyId', value)
                  setValue('unitId', null)
                }}
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
              {errors.propertyId && (
                <p className="text-sm text-destructive">{errors.propertyId.message}</p>
              )}
            </div>

            {selectedProperty && selectedProperty.units.length > 0 && (
              <div className="space-y-2">
                <Label>Unit (optional)</Label>
                <Select
                  onValueChange={(value) => setValue('unitId', value === 'none' ? null : value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All units / Property-wide" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All units / Property-wide</SelectItem>
                    {selectedProperty.units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        Unit {unit.unitNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  defaultValue="medium"
                  onValueChange={(value) => setValue('priority', value as MaintenanceInput['priority'])}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Estimated Cost (optional)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('cost')}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendorName">Vendor Name (optional)</Label>
                <Input
                  id="vendorName"
                  placeholder="Vendor or contractor"
                  {...register('vendorName')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="isRecurring" className="cursor-pointer">Recurring Task</Label>
                <p className="text-sm text-muted-foreground">
                  Schedule this task to repeat automatically
                </p>
              </div>
              <Switch
                id="isRecurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
                disabled={isLoading}
              />
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <Label>Recurring Interval</Label>
                <Select
                  onValueChange={(value) => setValue('recurringInterval', value as MaintenanceInput['recurringInterval'])}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    {recurringIntervals.map((interval) => (
                      <SelectItem key={interval.value} value={interval.value}>
                        {interval.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
          <div className="flex justify-end gap-4 p-6 pt-0">
            <Link href="/maintenance">
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Maintenance Item
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
