import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendLeaseExpirationReminder, sendMaintenanceReminder } from '@/lib/email'
import { addDays, differenceInDays, format } from 'date-fns'

// This endpoint should be called by a cron job (e.g., daily)
// Protect with a secret key in production
export async function POST(req: Request) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = {
      leaseReminders: 0,
      maintenanceReminders: 0,
      errors: [] as string[],
    }

    // Get users with premium access who have email reminders enabled
    const usersWithPremium = await db.user.findMany({
      where: {
        isActive: true,
        subscription: {
          status: { in: ['active', 'trialing', 'granted'] },
        },
      },
      include: {
        subscription: true,
      },
    })

    const premiumUserIds = usersWithPremium.map(u => u.id)

    // Send lease expiration reminders (30, 14, 7, 3, 1 days before)
    const reminderDays = [30, 14, 7, 3, 1]
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const days of reminderDays) {
      const targetDate = addDays(today, days)

      const expiringLeases = await db.lease.findMany({
        where: {
          status: 'active',
          endDate: {
            gte: targetDate,
            lt: addDays(targetDate, 1),
          },
        },
        include: {
          tenant: {
            include: {
              user: true,
              property: true,
            },
          },
        },
      })

      for (const lease of expiringLeases) {
        // Only send to premium users
        if (!premiumUserIds.includes(lease.tenant.userId)) continue

        try {
          await sendLeaseExpirationReminder(
            lease.tenant.user.email,
            `${lease.tenant.firstName} ${lease.tenant.lastName}`,
            lease.tenant.property.address,
            days,
            format(lease.endDate, 'MMMM d, yyyy')
          )
          results.leaseReminders++
        } catch (error) {
          results.errors.push(`Failed to send lease reminder for tenant ${lease.tenant.id}`)
        }
      }
    }

    // Send maintenance reminders (due today or overdue)
    const maintenanceItems = await db.maintenanceItem.findMany({
      where: {
        status: { in: ['pending', 'in_progress'] },
        nextDueDate: {
          lte: addDays(today, 3), // Due within 3 days
        },
        userId: { in: premiumUserIds },
      },
      include: {
        user: true,
        property: true,
      },
    })

    for (const item of maintenanceItems) {
      const daysUntilDue = differenceInDays(item.nextDueDate!, today)
      const isOverdue = daysUntilDue < 0

      try {
        await sendMaintenanceReminder(
          item.user.email,
          item.title,
          item.property.address,
          format(item.nextDueDate!, 'MMMM d, yyyy'),
          isOverdue
        )
        results.maintenanceReminders++
      } catch (error) {
        results.errors.push(`Failed to send maintenance reminder for item ${item.id}`)
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}
