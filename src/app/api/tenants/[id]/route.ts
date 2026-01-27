import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { tenantSchema } from '@/lib/validations/tenant'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenant = await db.tenant.findFirst({
      where: {
        id: params.id,
        unit: { property: { userId: session.user.id } },
      },
      include: {
        unit: { include: { property: true } },
        lease: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error('Error fetching tenant:', error)
    return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingTenant = await db.tenant.findFirst({
      where: {
        id: params.id,
        unit: { property: { userId: session.user.id } },
      },
    })

    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = tenantSchema.parse(body)

    // If changing unit, verify new unit is available
    if (validatedData.unitId !== existingTenant.unitId) {
      const newUnit = await db.unit.findFirst({
        where: {
          id: validatedData.unitId,
          property: { userId: session.user.id },
        },
        include: { tenant: true },
      })

      if (!newUnit) {
        return NextResponse.json({ error: 'New unit not found' }, { status: 404 })
      }

      if (newUnit.tenant) {
        return NextResponse.json(
          { error: 'New unit already has a tenant' },
          { status: 400 }
        )
      }

      // Update old unit to vacant
      await db.unit.update({
        where: { id: existingTenant.unitId },
        data: { isOccupied: false },
      })

      // Update new unit to occupied
      await db.unit.update({
        where: { id: validatedData.unitId },
        data: { isOccupied: true },
      })
    }

    const tenant = await db.tenant.update({
      where: { id: params.id },
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
      },
      include: {
        unit: { include: { property: true } },
        lease: true,
      },
    })

    // Update lease if exists
    if (tenant.lease) {
      await db.lease.update({
        where: { id: tenant.lease.id },
        data: {
          startDate: new Date(validatedData.leaseStart),
          endDate: new Date(validatedData.leaseEnd),
          rentAmount: validatedData.rentAmount,
          securityDeposit: validatedData.securityDeposit,
        },
      })
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error('Error updating tenant:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenant = await db.tenant.findFirst({
      where: {
        id: params.id,
        unit: { property: { userId: session.user.id } },
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Mark unit as vacant
    await db.unit.update({
      where: { id: tenant.unitId },
      data: { isOccupied: false },
    })

    // Delete tenant (cascades to lease, payments, notes)
    await db.tenant.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Tenant deleted successfully' })
  } catch (error) {
    console.error('Error deleting tenant:', error)
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 })
  }
}
