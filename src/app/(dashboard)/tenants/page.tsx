'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Users, MoreVertical, Pencil, Trash2, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { formatCurrency, formatDate, getInitials, getDaysUntil } from '@/lib/utils'

type Tenant = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  isActive: boolean
  leaseEnd: string
  rentAmount: number
  unit: {
    unitNumber: string
    property: {
      id: string
      name: string
    }
  }
  lease: {
    status: string
    endDate: string
  } | null
}

function TenantRow({ tenant, onDelete }: { tenant: Tenant; onDelete: () => void }) {
  const daysUntilExpiry = getDaysUntil(tenant.leaseEnd)
  let leaseStatus: 'success' | 'warning' | 'destructive' | 'secondary' = 'success'
  if (daysUntilExpiry <= 0) leaseStatus = 'destructive'
  else if (daysUntilExpiry <= 30) leaseStatus = 'warning'

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{getInitials(`${tenant.firstName} ${tenant.lastName}`)}</AvatarFallback>
          </Avatar>
          <div>
            <Link href={`/tenants/${tenant.id}`} className="font-medium hover:underline">
              {tenant.firstName} {tenant.lastName}
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              {tenant.email}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Link href={`/properties/${tenant.unit.property.id}`} className="hover:underline">
          {tenant.unit.property.name}
        </Link>
        <span className="text-muted-foreground"> - Unit {tenant.unit.unitNumber}</span>
      </TableCell>
      <TableCell>{formatCurrency(tenant.rentAmount)}</TableCell>
      <TableCell>
        <Badge variant={leaseStatus}>
          {daysUntilExpiry <= 0 ? 'Expired' : `${daysUntilExpiry} days`}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={tenant.isActive ? 'success' : 'secondary'}>
          {tenant.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/tenants/${tenant.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/tenants/${tenant.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/payments/new?tenantId=${tenant.id}`}>Record Payment</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTenants(data)
    } catch (error) {
      toast.error('Failed to load tenants')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const res = await fetch(`/api/tenants/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }
      setTenants(tenants.filter((t) => t.id !== deleteId))
      toast.success('Tenant removed successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete tenant')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">Manage your tenants</p>
        </div>
        <Link href="/tenants/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Tenant
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : tenants.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No tenants yet</h3>
              <p className="text-muted-foreground">Add your first tenant to a property unit.</p>
            </div>
            <Link href="/tenants/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Tenant
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Property / Unit</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Lease Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TenantRow
                  key={tenant.id}
                  tenant={tenant}
                  onDelete={() => setDeleteId(tenant.id)}
                />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Tenant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this tenant? This will also delete their payment history and lease records. The unit will be marked as vacant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove Tenant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
