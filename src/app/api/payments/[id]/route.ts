import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { paymentSchema } from '@/lib/validations/payment'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payment = await db.payment.findFirst({
      where: {
        id: params.id,
        tenant: {
          unit: { property: { userId: session.user.id } },
        },
      },
      include: {
        tenant: {
          include: {
            unit: { include: { property: true } },
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingPayment = await db.payment.findFirst({
      where: {
        id: params.id,
        tenant: {
          unit: { property: { userId: session.user.id } },
        },
      },
    })

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = paymentSchema.parse(body)

    const payment = await db.payment.update({
      where: { id: params.id },
      data: {
        amount: validatedData.amount,
        paymentDate: new Date(validatedData.paymentDate),
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        paymentMethod: validatedData.paymentMethod,
        status: validatedData.status || 'completed',
        lateFee: validatedData.lateFee || 0,
        notes: validatedData.notes,
      },
      include: {
        tenant: {
          include: {
            unit: { include: { property: true } },
          },
        },
      },
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error updating payment:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingPayment = await db.payment.findFirst({
      where: {
        id: params.id,
        tenant: {
          unit: { property: { userId: session.user.id } },
        },
      },
    })

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    await db.payment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Payment deleted successfully' })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
  }
}
