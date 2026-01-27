import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const expiringDays = searchParams.get('expiringDays')

    const where: any = {
      tenant: {
        unit: { property: { userId: session.user.id } },
      },
    }

    if (status) {
      where.status = status
    }

    if (expiringDays) {
      const days = parseInt(expiringDays)
      where.endDate = {
        lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        gte: new Date(),
      }
      where.status = 'active'
    }

    const leases = await db.lease.findMany({
      where,
      include: {
        tenant: {
          include: {
            unit: {
              include: { property: true },
            },
          },
        },
      },
      orderBy: { endDate: 'asc' },
    })

    return NextResponse.json(leases)
  } catch (error) {
    console.error('Error fetching leases:', error)
    return NextResponse.json({ error: 'Failed to fetch leases' }, { status: 500 })
  }
}
