import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { maintenanceSchema } from '@/lib/validations/maintenance'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const maintenanceItem = await db.maintenanceItem.findFirst({
      where: {
        id: params.id,
        property: { userId: session.user.id },
      },
      include: {
        property: true,
        unit: true,
      },
    })

    if (!maintenanceItem) {
      return NextResponse.json({ error: 'Maintenance item not found' }, { status: 404 })
    }

    return NextResponse.json(maintenanceItem)
  } catch (error) {
    console.error('Error fetching maintenance item:', error)
    return NextResponse.json({ error: 'Failed to fetch maintenance item' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingItem = await db.maintenanceItem.findFirst({
      where: {
        id: params.id,
        property: { userId: session.user.id },
      },
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Maintenance item not found' }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = maintenanceSchema.parse(body)

    const maintenanceItem = await db.maintenanceItem.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        propertyId: validatedData.propertyId,
        unitId: validatedData.unitId,
        priority: validatedData.priority,
        status: validatedData.status,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        cost: validatedData.cost,
        vendorName: validatedData.vendorName,
        vendorContact: validatedData.vendorContact,
        isRecurring: validatedData.isRecurring,
        recurringInterval: validatedData.recurringInterval,
        completedDate: validatedData.status === 'completed' ? new Date() : null,
      },
      include: {
        property: true,
        unit: true,
      },
    })

    return NextResponse.json(maintenanceItem)
  } catch (error) {
    console.error('Error updating maintenance item:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update maintenance item' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingItem = await db.maintenanceItem.findFirst({
      where: {
        id: params.id,
        property: { userId: session.user.id },
      },
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Maintenance item not found' }, { status: 404 })
    }

    await db.maintenanceItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Maintenance item deleted successfully' })
  } catch (error) {
    console.error('Error deleting maintenance item:', error)
    return NextResponse.json({ error: 'Failed to delete maintenance item' }, { status: 500 })
  }
}
