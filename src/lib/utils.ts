import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateLong(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getDaysUntil(date: Date | string): number {
  const target = new Date(date)
  const today = new Date()
  const diffTime = target.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export type SubscriptionStatus =
  | 'free'
  | 'trialing'
  | 'active'
  | 'granted'
  | 'past_due'
  | 'cancelled'

export function hasPremiumAccess(status: SubscriptionStatus): boolean {
  return ['trialing', 'active', 'granted'].includes(status)
}

export const FREE_TIER_LIMITS = {
  maxProperties: 2,
  maxTenants: 4,
  maxCalculatorProperties: 1,
} as const
