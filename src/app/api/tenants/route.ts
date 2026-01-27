import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { tenantSchema } from '@/lib/validations/tenant'
import { FREE_TIER_LIMITS, hasPremiumAccess, type SubscriptionStatus } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenants = await db.tenant.findMany({
      where: {
        unit: {
          property: { userId: session.user.id },
        },
      },
      include: {
        unit: {
          include: { property: true },
        },
        lease: true,
        payments: {
          take: 1,
          orderBy: { paymentDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tenants)
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 })
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
      include: { subscription: true },
    })

    const tenantCount = await db.tenant.count({
      where: {
        isActive: true,
        unit: { property: { userId: session.user.id } },
      },
    })

    const status = (user?.subscription?.status || 'free') as SubscriptionStatus
    const isPremium = hasPremiumAccess(status)

    if (!isPremium && tenantCount >= FREE_TIER_LIMITS.maxTenants) {
      return NextResponse.json(
        { error: `Free tier is limited to ${FREE_TIER_LIMITS.maxTenants} tenants. Upgrade to Premium for unlimited tenants.` },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = tenantSchema.parse(body)

    // Verify unit ownership and availability
    const unit = await db.unit.findFirst({
      where: {
        id: validatedData.unitId,
        property: { userId: session.user.id },
      },
      include: { tenant: true },
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    if (unit.tenant) {
      return NextResponse.json(
        { error: 'This unit already has a tenant. Remove the existing tenant first.' },
        { status: 400 }
      )
    }

    // Create tenant and update unit
    const tenant = await db.tenant.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        unitId: validatedData.unitId,
        leaseStart: new Date(validatedData.leaseStart),
        leaseEnd: new Date(validatedData.leaseEnd),
        rentAmount: validatedData.rentAmount,
        securityDeposit: validatedData.securityDeposit,
        lease: {
          create: {
            startDate: new Date(validatedData.leaseStart),
            endDate: new Date(validatedData.leaseEnd),
            rentAmount: validatedData.rentAmount,
            securityDeposit: validatedData.securityDeposit,
          },
        },
      },
      include: {
        unit: { include: { property: true } },
        lease: true,
      },
    })

    // Update unit occupancy
    await db.unit.update({
      where: { id: validatedData.unitId },
      data: { isOccupied: true },
    })

    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    console.error('Error creating tenant:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 })
  }
}
