import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { propertySchema } from '@/lib/validations/property'
import { FREE_TIER_LIMITS, hasPremiumAccess, type SubscriptionStatus } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const properties = await db.property.findMany({
      where: { userId: session.user.id },
      include: {
        units: {
          include: {
            tenant: true,
          },
        },
        _count: {
          select: { units: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription limits
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true, _count: { select: { properties: true } } },
    })

    const status = (user?.subscription?.status || 'free') as SubscriptionStatus
    const isPremium = hasPremiumAccess(status)
    const propertyCount = user?._count.properties || 0

    if (!isPremium && propertyCount >= FREE_TIER_LIMITS.maxProperties) {
      return NextResponse.json(
        { error: `Free tier is limited to ${FREE_TIER_LIMITS.maxProperties} properties. Upgrade to Premium for unlimited properties.` },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = propertySchema.parse(body)

    const property = await db.property.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
      include: {
        units: true,
        _count: { select: { units: true } },
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
  }
}
