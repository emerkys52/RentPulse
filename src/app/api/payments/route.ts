import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { paymentSchema } from '@/lib/validations/payment'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get('tenantId')
    const status = searchParams.get('status')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const where: any = {
      tenant: {
        unit: { property: { userId: session.user.id } },
      },
    }

    if (tenantId) {
      where.tenantId = tenantId
    }

    if (status) {
      where.status = status
    }

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      where.paymentDate = {
        gte: startDate,
        lte: endDate,
      }
    }

    const payments = await db.payment.findMany({
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
      orderBy: { paymentDate: 'desc' },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = paymentSchema.parse(body)

    // Verify tenant ownership
    const tenant = await db.tenant.findFirst({
      where: {
        id: validatedData.tenantId,
        unit: { property: { userId: session.user.id } },
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const payment = await db.payment.create({
      data: {
        tenantId: validatedData.tenantId,
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

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
