'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Building2,
  LayoutDashboard,
  Home,
  Users,
  CreditCard,
  FileText,
  Wrench,
  Calculator,
  Settings,
  Crown,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Properties',
    href: '/properties',
    icon: Home,
  },
  {
    title: 'Tenants',
    href: '/tenants',
    icon: Users,
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: CreditCard,
  },
  {
    title: 'Leases',
    href: '/leases',
    icon: FileText,
  },
  {
    title: 'Maintenance',
    href: '/maintenance',
    icon: Wrench,
  },
  {
    title: 'Calculators',
    href: '/calculators',
    icon: Calculator,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  subscriptionStatus?: string
}

export function Sidebar({ isOpen, onClose, subscriptionStatus = 'free' }: SidebarProps) {
  const pathname = usePathname()
  const isPremium = ['trialing', 'active', 'granted'].includes(subscriptionStatus)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">RentalPulse</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Premium CTA */}
          {!isPremium && (
            <div className="p-4 border-t">
              <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5" />
                  <span className="font-semibold">Upgrade to Premium</span>
                </div>
                <p className="text-sm text-blue-100 mb-3">
                  Unlock unlimited properties, tenants, and advanced features.
                </p>
                <Link href="/settings/subscription">
                  <Button size="sm" variant="secondary" className="w-full">
                    View Plans
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {isPremium && (
            <div className="p-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span>Premium Active</span>
                <Badge variant="secondary" className="ml-auto">
                  {subscriptionStatus === 'trialing' ? 'Trial' : 'Pro'}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
