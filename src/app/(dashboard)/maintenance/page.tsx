'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Wrench, MoreVertical, Pencil, Trash2, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { formatDate, formatCurrency } from '@/lib/utils'

type MaintenanceItem = {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: string | null
  cost: number | null
  isRecurring: boolean
  recurringInterval: string | null
  property: {
    id: string
    name: string
  }
  unit: {
    unitNumber: string
  } | null
}

const priorityVariants: Record<string, 'destructive' | 'warning' | 'secondary' | 'default'> = {
  urgent: 'destructive',
  high: 'warning',
  medium: 'secondary',
  low: 'default',
}

const statusVariants: Record<string, 'destructive' | 'warning' | 'success' | 'secondary'> = {
  pending: 'warning',
  in_progress: 'secondary',
  completed: 'success',
  cancelled: 'destructive',
}

function MaintenanceCard({ item, onDelete, onStatusChange }: {
  item: MaintenanceItem
  onDelete: () => void
  onStatusChange: (id: string, status: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <CardDescription>
              <Link href={`/properties/${item.property.id}`} className="hover:underline">
                {item.property.name}
              </Link>
              {item.unit && ` - Unit ${item.unit.unitNumber}`}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {item.status === 'pending' && (
                <DropdownMenuItem onClick={() => onStatusChange(item.id, 'in_progress')}>
                  <Clock className="mr-2 h-4 w-4" />
                  Mark In Progress
                </DropdownMenuItem>
              )}
              {(item.status === 'pending' || item.status === 'in_progress') && (
                <DropdownMenuItem onClick={() => onStatusChange(item.id, 'completed')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Completed
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href={`/maintenance/${item.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {item.description && (
          <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={priorityVariants[item.priority] || 'default'}>
            {item.priority}
          </Badge>
          <Badge variant={statusVariants[item.status] || 'secondary'}>
            {item.status.replace('_', ' ')}
          </Badge>
          {item.isRecurring && (
            <Badge variant="outline">
              Recurring ({item.recurringInterval})
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {item.dueDate && (
            <div>
              <p className="text-muted-foreground">Due Date</p>
              <p className="font-medium">{formatDate(item.dueDate)}</p>
            </div>
          )}
          {item.cost && (
            <div>
              <p className="text-muted-foreground">Estimated Cost</p>
              <p className="font-medium">{formatCurrency(item.cost)}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function MaintenancePage() {
  const [items, setItems] = useState<MaintenanceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/maintenance')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setItems(data)
    } catch (error) {
      toast.error('Failed to load maintenance items')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const res = await fetch(`/api/maintenance/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setItems(items.filter((i) => i.id !== deleteId))
      toast.success('Maintenance item deleted')
    } catch (error) {
      toast.error('Failed to delete maintenance item')
    } finally {
      setDeleteId(null)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const item = items.find((i) => i.id === id)
      if (!item) return

      const res = await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          status,
          propertyId: item.property.id,
          unitId: item.unit?.unitNumber,
        }),
      })

      if (!res.ok) throw new Error('Failed to update')

      setItems(items.map((i) => i.id === id ? { ...i, status } : i))
      toast.success(`Marked as ${status.replace('_', ' ')}`)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const pendingItems = items.filter((i) => i.status === 'pending')
  const inProgressItems = items.filter((i) => i.status === 'in_progress')
  const completedItems = items.filter((i) => i.status === 'completed')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground">Track and schedule maintenance tasks</p>
        </div>
        <Link href="/maintenance/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Maintenance
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completedItems.length}</div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Wrench className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No maintenance items</h3>
              <p className="text-muted-foreground">Track maintenance tasks for your properties.</p>
            </div>
            <Link href="/maintenance/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Maintenance
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingItems.length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({inProgressItems.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedItems.length})</TabsTrigger>
            <TabsTrigger value="all">All ({items.length})</TabsTrigger>
          </TabsList>

          {['pending', 'in_progress', 'completed', 'all'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(tab === 'all' ? items : items.filter((i) => i.status === tab)).map((item) => (
                  <MaintenanceCard
                    key={item.id}
                    item={item}
                    onDelete={() => setDeleteId(item.id)}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Maintenance Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this maintenance item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
