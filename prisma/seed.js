const { PrismaClient, UserRole, CustomerType } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@salesmanagement.local' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@salesmanagement.local',
      passwordHash,
      role: UserRole.admin,
      phone: '+84901234567',
    },
  });

  const customer = await prisma.customer.upsert({
    where: { code: 'CUS-000001' },
    update: {},
    create: {
      code: 'CUS-000001',
      name: 'Cong ty TNHH Minh An',
      type: CustomerType.company,
      taxCode: '0312345678',
      email: 'buyer@minhan.example',
      phone: '+84901234567',
      ownerId: admin.id,
      creditLimit: 50000000,
      paymentTermDays: 30,
    },
  });

  const product = await prisma.product.upsert({
    where: { sku: 'PRD-000001' },
    update: {},
    create: {
      sku: 'PRD-000001',
      name: 'Printer paper A4',
      unit: 'box',
      listPrice: 85000,
      costPrice: 65000,
      taxRate: 8,
    },
  });

  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-HCM' },
    update: {},
    create: {
      code: 'WH-HCM',
      name: 'Ho Chi Minh Warehouse',
      address: 'Ho Chi Minh City',
    },
  });

  console.log('Seed completed');
  console.log({
    adminEmail: admin.email,
    adminPassword: 'password123',
    customerId: customer.id,
    productId: product.id,
    warehouseId: warehouse.id,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
