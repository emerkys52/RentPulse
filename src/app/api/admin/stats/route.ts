import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      totalUsers,
      activeUsers,
      premiumSubscriptions,
      trialSubscriptions,
      totalProperties,
      totalTenants,
      recentSignups,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.subscription.count({ where: { status: 'active' } }),
      db.subscription.count({ where: { status: 'trialing' } }),
      db.property.count(),
      db.tenant.count({ where: { isActive: true } }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    return NextResponse.json({
      totalUsers,
      activeUsers,
      premiumUsers: premiumSubscriptions,
      trialUsers: trialSubscriptions,
      totalProperties,
      totalTenants,
      recentSignups,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
