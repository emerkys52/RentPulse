import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { unitSchema } from '@/lib/validations/property'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify property ownership
    const property = await db.property.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = unitSchema.parse(body)

    // Check for duplicate unit number
    const existingUnit = await db.unit.findFirst({
      where: {
        propertyId: params.id,
        unitNumber: validatedData.unitNumber,
      },
    })

    if (existingUnit) {
      return NextResponse.json(
        { error: 'A unit with this number already exists in this property' },
        { status: 400 }
      )
    }

    const unit = await db.unit.create({
      data: {
        ...validatedData,
        propertyId: params.id,
      },
      include: {
        tenant: true,
      },
    })

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error('Error creating unit:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 })
  }
}
