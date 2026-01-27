import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { maintenanceSchema } from '@/lib/validations/maintenance'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const propertyId = searchParams.get('propertyId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const where: any = {
      property: { userId: session.user.id },
    }

    if (propertyId) {
      where.propertyId = propertyId
    }

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
    }

    const maintenanceItems = await db.maintenanceItem.findMany({
      where,
      include: {
        property: true,
        unit: true,
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(maintenanceItems)
  } catch (error) {
    console.error('Error fetching maintenance items:', error)
    return NextResponse.json({ error: 'Failed to fetch maintenance items' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = maintenanceSchema.parse(body)

    // Verify property ownership
    const property = await db.property.findFirst({
      where: {
        id: validatedData.propertyId,
        userId: session.user.id,
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // If unitId provided, verify it belongs to the property
    if (validatedData.unitId) {
      const unit = await db.unit.findFirst({
        where: {
          id: validatedData.unitId,
          propertyId: validatedData.propertyId,
        },
      })

      if (!unit) {
        return NextResponse.json({ error: 'Unit not found in this property' }, { status: 404 })
      }
    }

    const maintenanceItem = await db.maintenanceItem.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        propertyId: validatedData.propertyId,
        unitId: validatedData.unitId,
        priority: validatedData.priority,
        status: validatedData.status || 'pending',
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        cost: validatedData.cost,
        vendorName: validatedData.vendorName,
        vendorContact: validatedData.vendorContact,
        isRecurring: validatedData.isRecurring || false,
        recurringInterval: validatedData.recurringInterval,
      },
      include: {
        property: true,
        unit: true,
      },
    })

    return NextResponse.json(maintenanceItem, { status: 201 })
  } catch (error) {
    console.error('Error creating maintenance item:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create maintenance item' }, { status: 500 })
  }
}
