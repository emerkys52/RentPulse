import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { isActive } = body

    const user = await db.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await db.user.update({
      where: { id: params.id },
      data: { isActive },
    })

    // Create audit log entry
    await db.adminAuditLog.create({
      data: {
        adminId: session.id,
        action: isActive ? 'enable_user' : 'disable_user',
        targetType: 'user',
        targetId: params.id,
        details: JSON.stringify({
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`,
        }),
      },
    })

    return NextResponse.json({ message: `User ${isActive ? 'enabled' : 'disabled'} successfully` })
  } catch (error) {
    console.error('Update user status error:', error)
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
  }
}
