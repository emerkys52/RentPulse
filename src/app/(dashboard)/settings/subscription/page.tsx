'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Crown, Check, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

type SubscriptionData = {
  status: string
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  stripeCustomerId: string | null
  grantedBy: string | null
}

const features = {
  free: [
    'Up to 2 properties',
    'Up to 4 tenants',
    'Basic payment tracking',
    'Lease management',
    'Basic maintenance tracking',
    'Late fee calculator (basic)',
  ],
  premium: [
    'Unlimited properties',
    'Unlimited tenants',
    'Advanced payment tracking',
    'Lease management with reminders',
    'Advanced maintenance scheduling',
    'All calculators with advanced features',
    'Email notifications',
    'Document storage',
    'Data export',
    'Priority support',
  ],
}

export default function SubscriptionSettingsPage() {
  const { data: session, update } = useSession()
  const searchParams = useSearchParams()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [isPortalLoading, setIsPortalLoading] = useState(false)

  const isPremium = subscription?.status && ['trialing', 'active', 'granted'].includes(subscription.status)

  useEffect(() => {
    fetchSubscription()
  }, [])

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Welcome to Premium! Your subscription is now active.')
      fetchSubscription()
      update()
    } else if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout canceled')
    }
  }, [searchParams])

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/user/subscription')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setSubscription(data)
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckout = async () => {
    setIsCheckoutLoading(true)

    try {
      const res = await fetch('/api/subscription/checkout', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start checkout')
      }

      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout')
      setIsCheckoutLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setIsPortalLoading(true)

    try {
      const res = await fetch('/api/subscription/portal', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to open portal')
      }

      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to open portal')
      setIsPortalLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading subscription details...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  {isPremium ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <Crown className="h-5 w-5 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted-foreground/20">
                      <Crown className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{isPremium ? 'Premium' : 'Free'} Plan</p>
                    <div className="flex items-center gap-2">
                      {subscription?.status === 'trialing' && (
                        <Badge variant="secondary">Trial</Badge>
                      )}
                      {subscription?.status === 'granted' && (
                        <Badge variant="secondary">Complimentary</Badge>
                      )}
                      {subscription?.cancelAtPeriodEnd && (
                        <Badge variant="destructive">Cancels at period end</Badge>
                      )}
                    </div>
                  </div>
                </div>
                {isPremium && subscription?.stripeCustomerId && (
                  <Button variant="outline" onClick={handleManageSubscription} disabled={isPortalLoading}>
                    {isPortalLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    Manage Billing
                  </Button>
                )}
              </div>

              {isPremium && subscription?.status === 'trialing' && subscription.trialEndsAt && (
                <div className="p-4 rounded-lg border border-warning bg-warning/10">
                  <p className="text-sm">
                    Your trial ends on <strong>{formatDate(subscription.trialEndsAt)}</strong>.
                    Add a payment method to continue using Premium features.
                  </p>
                </div>
              )}

              {isPremium && subscription?.currentPeriodEnd && !subscription.cancelAtPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  Next billing date: {formatDate(subscription.currentPeriodEnd)}
                </p>
              )}

              {subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className={!isPremium ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Free
              {!isPremium && <Badge>Current</Badge>}
            </CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {features.free.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className={isPremium ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Premium
              {isPremium && <Badge>Current</Badge>}
            </CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold">$12</span>
              <span className="text-muted-foreground">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.premium.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success" />
                  {feature}
                </li>
              ))}
            </ul>

            {!isPremium && (
              <Button onClick={handleCheckout} className="w-full" disabled={isCheckoutLoading}>
                {isCheckoutLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Crown className="mr-2 h-4 w-4" />
                )}
                Start 7-Day Free Trial
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
