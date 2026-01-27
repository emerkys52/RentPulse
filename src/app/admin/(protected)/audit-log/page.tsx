'use client'

import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

type AuditLog = {
  id: string
  action: string
  targetType: string
  targetId: string
  details: string | null
  createdAt: string
  admin: {
    name: string
    email: string
  }
}

const actionLabels: Record<string, string> = {
  grant_premium: 'Grant Premium',
  revoke_premium: 'Revoke Premium',
  enable_user: 'Enable User',
  disable_user: 'Disable User',
  extend_trial: 'Extend Trial',
}

const actionVariants: Record<string, 'default' | 'success' | 'destructive' | 'warning'> = {
  grant_premium: 'success',
  revoke_premium: 'warning',
  enable_user: 'success',
  disable_user: 'destructive',
  extend_trial: 'default',
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-log')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setLogs(data)
    } catch (error) {
      toast.error('Failed to load audit log')
    } finally {
      setIsLoading(false)
    }
  }

  const parseDetails = (details: string | null) => {
    if (!details) return null
    try {
      return JSON.parse(details)
    } catch {
      return null
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Audit Log</h1>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Administrative Actions
          </CardTitle>
          <CardDescription className="text-slate-400">
            A record of all administrative actions performed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-6 w-24 bg-slate-700" />
                  <Skeleton className="h-4 w-48 bg-slate-700" />
                  <Skeleton className="h-4 w-32 bg-slate-700" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">No audit logs yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Timestamp</TableHead>
                  <TableHead className="text-slate-300">Admin</TableHead>
                  <TableHead className="text-slate-300">Action</TableHead>
                  <TableHead className="text-slate-300">Target</TableHead>
                  <TableHead className="text-slate-300">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const details = parseDetails(log.details)
                  return (
                    <TableRow key={log.id} className="border-slate-700">
                      <TableCell className="text-slate-300">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">{log.admin.name}</p>
                          <p className="text-sm text-slate-400">{log.admin.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={actionVariants[log.action] || 'default'}>
                          {actionLabels[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {log.targetType}: {log.targetId.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="text-slate-400 max-w-xs truncate">
                        {details?.userEmail || details?.userName || '-'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
