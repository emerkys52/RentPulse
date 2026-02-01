'use client'

import { useState, useEffect } from 'react'
import { Search, Crown, Ban, Gift, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { formatDate, getInitials } from '@/lib/utils'

type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  createdAt: string
  subscription: {
    status: string
    trialEndsAt: string | null
    currentPeriodEnd: string | null
  } | null
  _count: {
    properties: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [grantPremiumUser, setGrantPremiumUser] = useState<User | null>(null)
  const [isGranting, setIsGranting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGrantPremium = async () => {
    if (!grantPremiumUser) return
    setIsGranting(true)

    try {
      const res = await fetch(`/api/admin/users/${grantPremiumUser.id}/grant-premium`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to grant premium')
      }

      toast.success(`Premium granted to ${grantPremiumUser.firstName} ${grantPremiumUser.lastName}`)
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to grant premium')
    } finally {
      setIsGranting(false)
      setGrantPremiumUser(null)
    }
  }

  const handleRevokePremium = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/revoke-premium`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to revoke premium')
      }

      toast.success('Premium revoked')
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to revoke premium')
    }
  }

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update status')
      }

      toast.success(`User ${isActive ? 'disabled' : 'enabled'}`)
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (subscription: User['subscription']) => {
    if (!subscription) return <Badge variant="secondary">Free</Badge>
    switch (subscription.status) {
      case 'active':
        return <Badge variant="success">Premium</Badge>
      case 'trialing':
        return <Badge variant="warning">Trial</Badge>
      case 'granted':
        return <Badge className="bg-purple-500">Granted</Badge>
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>
      default:
        return <Badge variant="secondary">Free</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        {isLoading ? (
          <CardContent className="p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4">
                <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2 bg-slate-700" />
                  <Skeleton className="h-3 w-48 bg-slate-700" />
                </div>
              </div>
            ))}
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">User</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Subscription</TableHead>
                <TableHead className="text-slate-300">Properties</TableHead>
                <TableHead className="text-slate-300">Joined</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-slate-700">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-slate-700 text-white">
                          {getInitials(`${user.firstName} ${user.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'success' : 'destructive'}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.subscription)}</TableCell>
                  <TableCell className="text-slate-300">{user._count.properties}</TableCell>
                  <TableCell className="text-slate-300">{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        {user.subscription?.status !== 'granted' && (
                          <DropdownMenuItem
                            onClick={() => setGrantPremiumUser(user)}
                            className="text-slate-300 focus:text-white focus:bg-slate-700"
                          >
                            <Gift className="mr-2 h-4 w-4" />
                            Grant Premium
                          </DropdownMenuItem>
                        )}
                        {user.subscription?.status === 'granted' && (
                          <DropdownMenuItem
                            onClick={() => handleRevokePremium(user.id)}
                            className="text-slate-300 focus:text-white focus:bg-slate-700"
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            Revoke Premium
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          className="text-slate-300 focus:text-white focus:bg-slate-700"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          {user.isActive ? 'Disable Account' : 'Enable Account'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!grantPremiumUser} onOpenChange={() => setGrantPremiumUser(null)}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Grant Premium Access</DialogTitle>
            <DialogDescription className="text-slate-400">
              This will grant complimentary premium access to{' '}
              <strong className="text-white">
                {grantPremiumUser?.firstName} {grantPremiumUser?.lastName}
              </strong>
              . No payment will be required.
              {grantPremiumUser?.subscription?.status &&
               ['active', 'trialing'].includes(grantPremiumUser.subscription.status) && (
                <span className="block mt-2 text-yellow-400">
                  This user has an existing {grantPremiumUser.subscription.status === 'trialing' ? 'trial' : 'paid'} subscription.
                  Their Stripe subscription will be cancelled immediately and they will not be charged again.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantPremiumUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleGrantPremium} disabled={isGranting}>
              {isGranting ? 'Granting...' : 'Grant Premium'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
