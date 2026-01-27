import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET() {
  try {
    const session = getAdminSession()

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json({
      id: session.id,
      email: session.email,
      name: session.name,
      role: session.role,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 })
  }
}
