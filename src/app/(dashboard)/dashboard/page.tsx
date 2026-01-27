import { Suspense } from 'react'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Home,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Wrench,
  FileText,
} from 'lucide-react'
import { formatCurrency, getDaysUntil, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function getDashboardStats(userId: string) {
  const [
    properties,
    units,
    tenants,
    payments,
    maintenanceItems,
    leases,
  ] = await Promise.all([
    db.property.count({ where: { userId } }),
    db.unit.findMany({
      where: { property: { userId } },
      select: { isOccupied: true, rentAmount: true },
    }),
    db.tenant.count({ where: { unit: { property: { userId } }, isActive: true } }),
    db.payment.findMany({
      where: {
        tenant: { unit: { property: { userId } } },
        paymentDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      select: { amount: true },
    }),
    db.maintenanceItem.count({
      where: {
        property: { userId },
        status: { in: ['pending', 'in_progress'] },
      },
    }),
    db.lease.findMany({
      where: {
        tenant: { unit: { property: { userId } } },
        status: 'active',
        endDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
      },
      include: {
        tenant: {
          include: {
            unit: {
              include: { property: true },
            },
          },
        },
      },
    }),
  ])

  const totalUnits = units.length
  const occupiedUnits = units.filter((u) => u.isOccupied).length
  const vacantUnits = totalUnits - occupiedUnits
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0
  const monthlyRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  const potentialRevenue = units.reduce((sum, u) => sum + u.rentAmount, 0)

  return {
    totalProperties: properties,
    totalUnits,
    occupiedUnits,
    vacantUnits,
    occupancyRate,
    totalTenants: tenants,
    monthlyRevenue,
    potentialRevenue,
    pendingMaintenance: maintenanceItems,
    expiringLeases: leases,
  }
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  trend?: { value: number; label: string }
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-success" />
            <span className="text-xs text-success">
              {trend.value > 0 ? '+' : ''}
              {trend.value}% {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function DashboardStats() {
  const session = await getSession()
  if (!session?.user?.id) return null

  const stats = await getDashboardStats(session.user.id)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Properties"
          value={stats.totalProperties}
          description={`${stats.totalUnits} total units`}
          icon={Home}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate.toFixed(1)}%`}
          description={`${stats.occupiedUnits} occupied, ${stats.vacantUnits} vacant`}
          icon={Users}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          description={`of ${formatCurrency(stats.potentialRevenue)} potential`}
          icon={DollarSign}
        />
        <StatCard
          title="Active Tenants"
          value={stats.totalTenants}
          icon={Users}
        />
      </div>

      {/* Alerts and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Expiring Leases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Expiring Leases
            </CardTitle>
            <CardDescription>Leases expiring in the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.expiringLeases.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leases expiring soon</p>
            ) : (
              <div className="space-y-3">
                {stats.expiringLeases.slice(0, 5).map((lease) => {
                  const daysLeft = getDaysUntil(lease.endDate)
                  let badgeVariant: 'destructive' | 'warning' | 'secondary' = 'secondary'
                  if (daysLeft <= 7) badgeVariant = 'destructive'
                  else if (daysLeft <= 14) badgeVariant = 'warning'

                  return (
                    <div
                      key={lease.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">
                          {lease.tenant.firstName} {lease.tenant.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lease.tenant.unit.property.name} - Unit {lease.tenant.unit.unitNumber}
                        </p>
                      </div>
                      <Badge variant={badgeVariant}>
                        {daysLeft <= 0 ? 'Expired' : `${daysLeft} days`}
                      </Badge>
                    </div>
                  )
                })}
                {stats.expiringLeases.length > 5 && (
                  <Link href="/leases">
                    <Button variant="ghost" size="sm" className="w-full">
                      View all {stats.expiringLeases.length} expiring leases
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance Overview
            </CardTitle>
            <CardDescription>Pending maintenance items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium">{stats.pendingMaintenance} Items</p>
                  <p className="text-sm text-muted-foreground">Require attention</p>
                </div>
              </div>
              <Link href="/maintenance">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/properties/new">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </Link>
            <Link href="/tenants/new">
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Add Tenant
              </Button>
            </Link>
            <Link href="/payments/new">
              <Button variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </Link>
            <Link href="/maintenance/new">
              <Button variant="outline">
                <Wrench className="mr-2 h-4 w-4" />
                Add Maintenance
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your properties.
        </p>
      </div>

      <Suspense fallback={<StatsGridSkeleton />}>
        <DashboardStats />
      </Suspense>
    </div>
  )
}
