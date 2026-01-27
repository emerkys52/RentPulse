'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils'

type Lease = {
  id: string
  startDate: string
  endDate: string
  rentAmount: number
  status: string
  tenant: {
    id: string
    firstName: string
    lastName: string
    unit: {
      unitNumber: string
      property: {
        id: string
        name: string
      }
    }
  }
}

function LeaseCard({ lease }: { lease: Lease }) {
  const daysUntilExpiry = getDaysUntil(lease.endDate)

  let urgencyColor = 'bg-success'
  let urgencyText = 'On Track'
  let badgeVariant: 'success' | 'warning' | 'destructive' | 'secondary' = 'success'

  if (daysUntilExpiry <= 0) {
    urgencyColor = 'bg-destructive'
    urgencyText = 'Expired'
    badgeVariant = 'destructive'
  } else if (daysUntilExpiry <= 7) {
    urgencyColor = 'bg-destructive'
    urgencyText = 'Critical'
    badgeVariant = 'destructive'
  } else if (daysUntilExpiry <= 30) {
    urgencyColor = 'bg-warning'
    urgencyText = 'Expiring Soon'
    badgeVariant = 'warning'
  } else if (daysUntilExpiry <= 60) {
    urgencyColor = 'bg-yellow-400'
    urgencyText = 'Review Soon'
    badgeVariant = 'warning'
  }

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${urgencyColor}`} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              <Link href={`/tenants/${lease.tenant.id}`} className="hover:underline">
                {lease.tenant.firstName} {lease.tenant.lastName}
              </Link>
            </CardTitle>
            <CardDescription>
              <Link href={`/properties/${lease.tenant.unit.property.id}`} className="hover:underline">
                {lease.tenant.unit.property.name}
              </Link>
              {' '}- Unit {lease.tenant.unit.unitNumber}
            </CardDescription>
          </div>
          <Badge variant={badgeVariant}>{urgencyText}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Lease Period</p>
            <p className="font-medium">
              {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Days Remaining</p>
            <p className="font-medium">
              {daysUntilExpiry <= 0 ? (
                <span className="text-destructive">Expired {Math.abs(daysUntilExpiry)} days ago</span>
              ) : (
                `${daysUntilExpiry} days`
              )}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Monthly Rent</p>
            <p className="font-medium">{formatCurrency(lease.rentAmount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <Badge variant="outline" className="mt-1">{lease.status}</Badge>
          </div>
        </div>
        {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline">
              Send Renewal Reminder
            </Button>
            <Button size="sm">
              Renew Lease
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLeases()
  }, [])

  const fetchLeases = async () => {
    try {
      const res = await fetch('/api/leases')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setLeases(data)
    } catch (error) {
      toast.error('Failed to load leases')
    } finally {
      setIsLoading(false)
    }
  }

  const expiredLeases = leases.filter((l) => getDaysUntil(l.endDate) <= 0)
  const criticalLeases = leases.filter((l) => {
    const days = getDaysUntil(l.endDate)
    return days > 0 && days <= 7
  })
  const expiringSoonLeases = leases.filter((l) => {
    const days = getDaysUntil(l.endDate)
    return days > 7 && days <= 30
  })
  const activeLeases = leases.filter((l) => getDaysUntil(l.endDate) > 30)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leases</h1>
        <p className="text-muted-foreground">Track lease expirations and renewals</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leases.length}</div>
          </CardContent>
        </Card>
        <Card className="border-destructive/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{expiredLeases.length}</div>
          </CardContent>
        </Card>
        <Card className="border-warning/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-warning">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{criticalLeases.length + expiringSoonLeases.length}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeLeases.length}</div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : leases.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No leases found</h3>
              <p className="text-muted-foreground">Leases are automatically created when you add tenants.</p>
            </div>
            <Link href="/tenants/new">
              <Button>Add Tenant</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({leases.length})</TabsTrigger>
            {expiredLeases.length > 0 && (
              <TabsTrigger value="expired" className="text-destructive">
                Expired ({expiredLeases.length})
              </TabsTrigger>
            )}
            {(criticalLeases.length > 0 || expiringSoonLeases.length > 0) && (
              <TabsTrigger value="expiring" className="text-warning">
                Expiring ({criticalLeases.length + expiringSoonLeases.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="active">Active ({activeLeases.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {leases.map((lease) => (
                <LeaseCard key={lease.id} lease={lease} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expired" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {expiredLeases.map((lease) => (
                <LeaseCard key={lease.id} lease={lease} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expiring" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[...criticalLeases, ...expiringSoonLeases].map((lease) => (
                <LeaseCard key={lease.id} lease={lease} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {activeLeases.map((lease) => (
                <LeaseCard key={lease.id} lease={lease} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
