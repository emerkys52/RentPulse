'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Users, DollarSign, Wrench, Building, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

type Unit = {
  id: string
  unitNumber: string
  bedrooms: number
  bathrooms: number
  squareFeet: number | null
  rentAmount: number
  isOccupied: boolean
  tenant: {
    id: string
    firstName: string
    lastName: string
    email: string
    payments: { amount: number; paymentDate: string }[]
  } | null
}

type MaintenanceItem = {
  id: string
  title: string
  priority: string
  status: string
  dueDate: string | null
}

type Property = {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  type: string
  units: Unit[]
  maintenanceItems: MaintenanceItem[]
  _count: { units: number }
}

const propertyTypeLabels: Record<string, string> = {
  single_family: 'Single Family',
  multi_family: 'Multi Family',
  apartment: 'Apartment',
  condo: 'Condo',
  townhouse: 'Townhouse',
  commercial: 'Commercial',
}

function AddUnitDialog({ propertyId, onSuccess }: { propertyId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    unitNumber: '',
    bedrooms: '1',
    bathrooms: '1',
    squareFeet: '',
    rentAmount: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch(`/api/properties/${propertyId}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitNumber: formData.unitNumber,
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseFloat(formData.bathrooms),
          squareFeet: formData.squareFeet ? parseInt(formData.squareFeet) : null,
          rentAmount: parseFloat(formData.rentAmount),
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to create unit')
      }

      toast.success('Unit added successfully')
      setOpen(false)
      setFormData({ unitNumber: '', bedrooms: '1', bathrooms: '1', squareFeet: '', rentAmount: '' })
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add unit')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Unit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Unit</DialogTitle>
          <DialogDescription>Add a unit to this property</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unitNumber">Unit Number</Label>
            <Input
              id="unitNumber"
              placeholder="e.g., 1A or 101"
              value={formData.unitNumber}
              onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="squareFeet">Square Feet (optional)</Label>
              <Input
                id="squareFeet"
                type="number"
                min="0"
                value={formData.squareFeet}
                onChange={(e) => setFormData({ ...formData, squareFeet: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rentAmount">Monthly Rent</Label>
              <Input
                id="rentAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.rentAmount}
                onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Unit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function UnitCard({ unit }: { unit: Unit }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Unit {unit.unitNumber}</CardTitle>
              <CardDescription>
                {unit.bedrooms} bed / {unit.bathrooms} bath
                {unit.squareFeet && ` / ${unit.squareFeet} sqft`}
              </CardDescription>
            </div>
          </div>
          <Badge variant={unit.isOccupied ? 'success' : 'secondary'}>
            {unit.isOccupied ? 'Occupied' : 'Vacant'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly Rent</span>
            <span className="font-semibold">{formatCurrency(unit.rentAmount)}</span>
          </div>
          {unit.tenant && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tenant</span>
              <Link href={`/tenants/${unit.tenant.id}`} className="font-semibold hover:underline">
                {unit.tenant.firstName} {unit.tenant.lastName}
              </Link>
            </div>
          )}
          {!unit.tenant && (
            <Link href={`/tenants/new?unitId=${unit.id}`}>
              <Button variant="outline" size="sm" className="w-full mt-2">
                <Users className="mr-2 h-4 w-4" />
                Add Tenant
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function PropertyDetailPage() {
  const params = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProperty = async () => {
    try {
      const res = await fetch(`/api/properties/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProperty(data)
    } catch (error) {
      toast.error('Failed to load property')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProperty()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Property not found</p>
        <Link href="/properties">
          <Button variant="link">Back to Properties</Button>
        </Link>
      </div>
    )
  }

  const occupiedUnits = property.units.filter((u) => u.isOccupied).length
  const totalRent = property.units.reduce((sum, u) => sum + u.rentAmount, 0)
  const collectedRent = property.units
    .filter((u) => u.tenant)
    .reduce((sum, u) => sum + u.rentAmount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/properties" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{property.name}</h1>
          <p className="text-muted-foreground">
            {property.address}, {property.city}, {property.state} {property.zipCode}
          </p>
        </div>
        <Link href={`/properties/${property.id}/edit`}>
          <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Property
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary">{propertyTypeLabels[property.type] || property.type}</Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property._count.units}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {occupiedUnits}/{property._count.units}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Potential Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRent)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(collectedRent)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="units">
        <TabsList>
          <TabsTrigger value="units">Units ({property._count.units})</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance ({property.maintenanceItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="space-y-4">
          <div className="flex justify-end">
            <AddUnitDialog propertyId={property.id} onSuccess={fetchProperty} />
          </div>

          {property.units.length === 0 ? (
            <Card className="p-8 text-center">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No units yet</h3>
              <p className="text-muted-foreground mb-4">Add your first unit to this property</p>
              <AddUnitDialog propertyId={property.id} onSuccess={fetchProperty} />
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {property.units.map((unit) => (
                <UnitCard key={unit.id} unit={unit} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-end">
            <Link href={`/maintenance/new?propertyId=${property.id}`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Maintenance
              </Button>
            </Link>
          </div>

          {property.maintenanceItems.length === 0 ? (
            <Card className="p-8 text-center">
              <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No maintenance items</h3>
              <p className="text-muted-foreground mb-4">Track maintenance tasks for this property</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {property.maintenanceItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={
                          item.priority === 'urgent' ? 'destructive' :
                          item.priority === 'high' ? 'warning' :
                          'secondary'
                        }>
                          {item.priority}
                        </Badge>
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                    </div>
                    <Link href={`/maintenance/${item.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
