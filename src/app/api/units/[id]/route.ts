import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { unitSchema } from '@/lib/validations/property'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const unit = await db.unit.findFirst({
      where: {
        id: params.id,
        property: { userId: session.user.id },
      },
      include: {
        property: true,
        tenant: {
          include: {
            payments: {
              take: 10,
              orderBy: { paymentDate: 'desc' },
            },
            lease: true,
          },
        },
        maintenanceItems: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    return NextResponse.json(unit)
  } catch (error) {
    console.error('Error fetching unit:', error)
    return NextResponse.json({ error: 'Failed to fetch unit' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingUnit = await db.unit.findFirst({
      where: {
        id: params.id,
        property: { userId: session.user.id },
      },
    })

    if (!existingUnit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = unitSchema.parse(body)

    // Check for duplicate unit number (excluding current unit)
    if (validatedData.unitNumber !== existingUnit.unitNumber) {
      const duplicateUnit = await db.unit.findFirst({
        where: {
          propertyId: existingUnit.propertyId,
          unitNumber: validatedData.unitNumber,
          id: { not: params.id },
        },
      })

      if (duplicateUnit) {
        return NextResponse.json(
          { error: 'A unit with this number already exists in this property' },
          { status: 400 }
        )
      }
    }

    const unit = await db.unit.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        property: true,
        tenant: true,
      },
    })

    return NextResponse.json(unit)
  } catch (error) {
    console.error('Error updating unit:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update unit' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingUnit = await db.unit.findFirst({
      where: {
        id: params.id,
        property: { userId: session.user.id },
      },
      include: { tenant: true },
    })

    if (!existingUnit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    if (existingUnit.tenant) {
      return NextResponse.json(
        { error: 'Cannot delete unit with active tenant. Remove tenant first.' },
        { status: 400 }
      )
    }

    await db.unit.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Unit deleted successfully' })
  } catch (error) {
    console.error('Error deleting unit:', error)
    return NextResponse.json({ error: 'Failed to delete unit' }, { status: 500 })
  }
}
