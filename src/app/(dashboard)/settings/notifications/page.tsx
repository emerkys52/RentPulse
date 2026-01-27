'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Bell, Mail, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'

export default function NotificationSettingsPage() {
  const { data: session } = useSession()
  const isPremium = session?.user?.subscriptionStatus && ['trialing', 'active', 'granted'].includes(session.user.subscriptionStatus)

  const [notifications, setNotifications] = useState({
    leaseExpiring: true,
    paymentDue: true,
    paymentReceived: true,
    maintenanceDue: false,
    marketingEmails: false,
  })

  const handleToggle = (key: keyof typeof notifications) => {
    if (!isPremium && ['leaseExpiring', 'paymentDue', 'maintenanceDue'].includes(key)) {
      toast.error('Email notifications require a Premium subscription')
      return
    }

    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))

    toast.success('Notification preference updated')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Choose which emails you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isPremium && (
            <div className="p-4 rounded-lg bg-muted flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">
                  Email reminders are a Premium feature
                </span>
              </div>
              <Link href="/settings/subscription">
                <Button size="sm">Upgrade</Button>
              </Link>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="leaseExpiring">Lease Expiration Reminders</Label>
                  {!isPremium && <Badge variant="secondary">Premium</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Get notified when leases are about to expire
                </p>
              </div>
              <Switch
                id="leaseExpiring"
                checked={notifications.leaseExpiring}
                onCheckedChange={() => handleToggle('leaseExpiring')}
                disabled={!isPremium}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="paymentDue">Payment Due Reminders</Label>
                  {!isPremium && <Badge variant="secondary">Premium</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Get notified when rent payments are due
                </p>
              </div>
              <Switch
                id="paymentDue"
                checked={notifications.paymentDue}
                onCheckedChange={() => handleToggle('paymentDue')}
                disabled={!isPremium}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="paymentReceived">Payment Received</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when payments are recorded
                </p>
              </div>
              <Switch
                id="paymentReceived"
                checked={notifications.paymentReceived}
                onCheckedChange={() => handleToggle('paymentReceived')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="maintenanceDue">Maintenance Reminders</Label>
                  {!isPremium && <Badge variant="secondary">Premium</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Get notified when maintenance tasks are due
                </p>
              </div>
              <Switch
                id="maintenanceDue"
                checked={notifications.maintenanceDue}
                onCheckedChange={() => handleToggle('maintenanceDue')}
                disabled={!isPremium}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Other Communications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketingEmails">Product Updates & Tips</Label>
              <p className="text-sm text-muted-foreground">
                Receive occasional emails about new features and tips
              </p>
            </div>
            <Switch
              id="marketingEmails"
              checked={notifications.marketingEmails}
              onCheckedChange={() => handleToggle('marketingEmails')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
