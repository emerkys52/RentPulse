import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { propertySchema } from '@/lib/validations/property'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const property = await db.property.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        units: {
          include: {
            tenant: {
              include: {
                payments: {
                  take: 5,
                  orderBy: { paymentDate: 'desc' },
                },
              },
            },
          },
        },
        maintenanceItems: {
          where: { status: { in: ['pending', 'in_progress'] } },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { units: true },
        },
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existingProperty = await db.property.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = propertySchema.parse(body)

    const property = await db.property.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        units: true,
        _count: { select: { units: true } },
      },
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error updating property:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existingProperty = await db.property.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    await db.property.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 })
  }
}
