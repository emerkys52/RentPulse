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

    if (user.subscription?.status !== 'granted') {
      return NextResponse.json(
        { error: 'Can only revoke granted premium access' },
        { status: 400 }
      )
    }

    // Update subscription to free
    await db.subscription.update({
      where: { userId: params.id },
      data: {
        status: 'free',
        grantedBy: null,
        grantedAt: null,
        grantExpiresAt: null,
      },
    })

    // Create audit log entry
    await db.adminAuditLog.create({
      data: {
        adminId: session.id,
        action: 'revoke_premium',
        targetType: 'user',
        targetId: params.id,
        details: JSON.stringify({
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`,
        }),
      },
    })

    return NextResponse.json({ message: 'Premium revoked successfully' })
  } catch (error) {
    console.error('Revoke premium error:', error)
    return NextResponse.json({ error: 'Failed to revoke premium' }, { status: 500 })
  }
}
