import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: params.id },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create or update subscription with granted status
    await db.subscription.upsert({
      where: { userId: params.id },
      create: {
        userId: params.id,
        status: 'granted',
        grantedBy: session.id,
        grantedAt: new Date(),
      },
      update: {
        status: 'granted',
        grantedBy: session.id,
        grantedAt: new Date(),
      },
    })

    // Create audit log entry
    await db.adminAuditLog.create({
      data: {
        adminId: session.id,
        action: 'grant_premium',
        targetType: 'user',
        targetId: params.id,
        details: JSON.stringify({
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`,
        }),
      },
    })

    return NextResponse.json({ message: 'Premium granted successfully' })
  } catch (error) {
    console.error('Grant premium error:', error)
    return NextResponse.json({ error: 'Failed to grant premium' }, { status: 500 })
  }
}
