'use client'

import { useState, useEffect } from 'react'
import { Users, Building, CreditCard, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

type AdminStats = {
  totalUsers: number
  activeUsers: number
  premiumUsers: number
  trialUsers: number
  totalProperties: number
  totalTenants: number
  recentSignups: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      toast.error('Failed to load statistics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Skeleton className="h-4 w-24 bg-slate-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 bg-slate-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-slate-400">
              {stats?.recentSignups || 0} new this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Premium Users</CardTitle>
            <CreditCard className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.premiumUsers || 0}</div>
            <p className="text-xs text-slate-400">
              {stats?.trialUsers || 0} in trial
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalProperties || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-slate-400">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-slate-400">Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/admin/users" className="block p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
              <p className="font-medium text-white">Manage Users</p>
              <p className="text-sm text-slate-400">View, edit, and manage user accounts</p>
            </a>
            <a href="/admin/audit-log" className="block p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
              <p className="font-medium text-white">View Audit Log</p>
              <p className="text-sm text-slate-400">Review administrative actions</p>
            </a>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
            <CardDescription className="text-slate-400">Current system health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Database</span>
              <span className="flex items-center gap-2 text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-400"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Stripe Integration</span>
              <span className="flex items-center gap-2 text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-400"></span>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Email Service</span>
              <span className="flex items-center gap-2 text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-400"></span>
                Active
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
