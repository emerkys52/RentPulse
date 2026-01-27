import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@rentpulse.app' },
    update: {},
    create: {
      email: 'admin@rentpulse.app',
      name: 'Admin User',
      passwordHash: adminPassword,
    },
  })
  console.log('Created admin user:', admin.email)

  // Create test user
  const userPassword = await hash('password123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      passwordHash: userPassword,
      emailVerified: new Date(),
      isActive: true,
    },
  })
  console.log('Created test user:', user.email)

  // Create subscription for test user
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      status: 'free',
    },
  })

  // Create sample properties
  const property1 = await prisma.property.upsert({
    where: { id: 'property-1' },
    update: {},
    create: {
      id: 'property-1',
      userId: user.id,
      name: 'Sunset Apartments',
      address: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      propertyType: 'apartment',
      yearBuilt: 2010,
      purchasePrice: 500000,
      currentValue: 650000,
    },
  })
  console.log('Created property:', property1.name)

  const property2 = await prisma.property.upsert({
    where: { id: 'property-2' },
    update: {},
    create: {
      id: 'property-2',
      userId: user.id,
      name: 'Oak Street House',
      address: '456 Oak Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      propertyType: 'single_family',
      yearBuilt: 1985,
      purchasePrice: 800000,
      currentValue: 1200000,
    },
  })
  console.log('Created property:', property2.name)

  // Create units for property 1
  const unit1 = await prisma.unit.upsert({
    where: { id: 'unit-1' },
    update: {},
    create: {
      id: 'unit-1',
      propertyId: property1.id,
      unitNumber: '101',
      bedrooms: 2,
      bathrooms: 1,
      squareFeet: 850,
      rentAmount: 1500,
      status: 'occupied',
    },
  })

  const unit2 = await prisma.unit.upsert({
    where: { id: 'unit-2' },
    update: {},
    create: {
      id: 'unit-2',
      propertyId: property1.id,
      unitNumber: '102',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 650,
      rentAmount: 1200,
      status: 'vacant',
    },
  })

  const unit3 = await prisma.unit.upsert({
    where: { id: 'unit-3' },
    update: {},
    create: {
      id: 'unit-3',
      propertyId: property2.id,
      unitNumber: 'Main',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      rentAmount: 3500,
      status: 'occupied',
    },
  })
  console.log('Created units')

  // Create tenants
  const tenant1 = await prisma.tenant.upsert({
    where: { id: 'tenant-1' },
    update: {},
    create: {
      id: 'tenant-1',
      userId: user.id,
      propertyId: property1.id,
      unitId: unit1.id,
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      phone: '555-0101',
      leaseStart: new Date('2024-01-01'),
      leaseEnd: new Date('2025-01-01'),
      rentAmount: 1500,
      securityDeposit: 1500,
      status: 'active',
    },
  })
  console.log('Created tenant:', tenant1.firstName, tenant1.lastName)

  const tenant2 = await prisma.tenant.upsert({
    where: { id: 'tenant-2' },
    update: {},
    create: {
      id: 'tenant-2',
      userId: user.id,
      propertyId: property2.id,
      unitId: unit3.id,
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@example.com',
      phone: '555-0102',
      leaseStart: new Date('2024-06-01'),
      leaseEnd: new Date('2025-06-01'),
      rentAmount: 3500,
      securityDeposit: 3500,
      status: 'active',
    },
  })
  console.log('Created tenant:', tenant2.firstName, tenant2.lastName)

  // Create payments
  const payments = [
    { tenantId: tenant1.id, amount: 1500, dueDate: new Date('2024-01-01'), paidDate: new Date('2024-01-01'), status: 'paid' as const },
    { tenantId: tenant1.id, amount: 1500, dueDate: new Date('2024-02-01'), paidDate: new Date('2024-02-03'), status: 'paid' as const },
    { tenantId: tenant1.id, amount: 1500, dueDate: new Date('2024-03-01'), paidDate: new Date('2024-03-01'), status: 'paid' as const },
    { tenantId: tenant1.id, amount: 1500, dueDate: new Date('2024-04-01'), status: 'pending' as const },
    { tenantId: tenant2.id, amount: 3500, dueDate: new Date('2024-06-01'), paidDate: new Date('2024-06-01'), status: 'paid' as const },
    { tenantId: tenant2.id, amount: 3500, dueDate: new Date('2024-07-01'), paidDate: new Date('2024-07-02'), status: 'paid' as const },
  ]

  for (const payment of payments) {
    await prisma.payment.create({
      data: {
        tenantId: payment.tenantId,
        amount: payment.amount,
        dueDate: payment.dueDate,
        paidDate: payment.paidDate,
        status: payment.status,
        paymentMethod: payment.paidDate ? 'bank_transfer' : undefined,
      },
    })
  }
  console.log('Created payments')

  // Create maintenance items
  await prisma.maintenanceItem.create({
    data: {
      userId: user.id,
      propertyId: property1.id,
      title: 'HVAC Filter Replacement',
      description: 'Replace all HVAC filters in building',
      priority: 'medium',
      status: 'pending',
      isRecurring: true,
      recurringInterval: 90,
      nextDueDate: new Date('2024-04-15'),
    },
  })

  await prisma.maintenanceItem.create({
    data: {
      userId: user.id,
      propertyId: property1.id,
      title: 'Smoke Detector Check',
      description: 'Annual smoke detector battery and function check',
      priority: 'high',
      status: 'pending',
      isRecurring: true,
      recurringInterval: 365,
      nextDueDate: new Date('2024-05-01'),
    },
  })

  await prisma.maintenanceItem.create({
    data: {
      userId: user.id,
      propertyId: property2.id,
      title: 'Gutter Cleaning',
      description: 'Clean gutters and check for damage',
      priority: 'low',
      status: 'pending',
      isRecurring: true,
      recurringInterval: 180,
      nextDueDate: new Date('2024-04-01'),
    },
  })
  console.log('Created maintenance items')

  // Create late fee rules
  await prisma.lateFeeRule.create({
    data: {
      userId: user.id,
      propertyId: property1.id,
      name: 'Standard Late Fee',
      gracePeriodDays: 5,
      feeType: 'percentage',
      feeAmount: 5,
      maxFee: 100,
      isActive: true,
    },
  })

  await prisma.lateFeeRule.create({
    data: {
      userId: user.id,
      propertyId: property2.id,
      name: 'Flat Late Fee',
      gracePeriodDays: 3,
      feeType: 'flat',
      feeAmount: 50,
      isActive: true,
    },
  })
  console.log('Created late fee rules')

  // Create leases
  await prisma.lease.create({
    data: {
      tenantId: tenant1.id,
      propertyId: property1.id,
      unitId: unit1.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      rentAmount: 1500,
      securityDeposit: 1500,
      status: 'active',
    },
  })

  await prisma.lease.create({
    data: {
      tenantId: tenant2.id,
      propertyId: property2.id,
      unitId: unit3.id,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-06-01'),
      rentAmount: 3500,
      securityDeposit: 3500,
      status: 'active',
    },
  })
  console.log('Created leases')

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
