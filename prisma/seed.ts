import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with default users and sample plans...');

  const passwordHash = await bcrypt.hash('Zylo@2026Secure!', 12);

  // 1. Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@brightloop.com' },
    update: {},
    create: {
      email: 'admin@brightloop.com',
      passwordHash,
      fullName: 'Vikram Mehta (Admin)',
      role: 'ADMIN',
      isActive: true,
      phone: '+91 98200 11223',
      companyName: 'Brightloop Technologies Pvt Ltd',
    },
  });
  console.log(`Created/Verified Admin: ${admin.email}`);

  // 2. Staff user
  const staff = await prisma.user.upsert({
    where: { email: 'staff@brightloop.com' },
    update: {},
    create: {
      email: 'staff@brightloop.com',
      passwordHash,
      fullName: 'Priya Sharma (Staff)',
      role: 'STAFF',
      isActive: true,
      phone: '+91 98200 44556',
      companyName: 'Brightloop Technologies Pvt Ltd',
    },
  });
  console.log(`Created/Verified Staff: ${staff.email}`);

  // 3. Customer user
  const customer = await prisma.user.upsert({
    where: { email: 'customer@kirana.in' },
    update: {},
    create: {
      email: 'customer@kirana.in',
      passwordHash,
      fullName: 'Ramesh Patel',
      role: 'CUSTOMER',
      isActive: true,
      phone: '+91 98200 77889',
      companyName: 'Patel Supermarket Retailers',
    },
  });
  console.log(`Created/Verified Customer: ${customer.email}`);

  // 4. Sample Plans
  const plans = [
    {
      name: 'Brightloop Starter Monthly',
      description: 'Essential billing and subscription tools for small retail shops and startups.',
      price: 1999.0,
      billingFrequency: 'MONTHLY' as const,
      taxPercent: 18.0,
      isActive: true,
    },
    {
      name: 'Brightloop Growth Monthly',
      description: 'Full automated recurring billing, customer rescue queue, and multi-staff management.',
      price: 4999.0,
      billingFrequency: 'MONTHLY' as const,
      taxPercent: 18.0,
      isActive: true,
    },
    {
      name: 'Brightloop Enterprise Annual',
      description: 'Annual corporate subscription with dedicated account manager and priority invoicing.',
      price: 49999.0,
      billingFrequency: 'YEARLY' as const,
      taxPercent: 18.0,
      isActive: true,
    },
  ];

  for (const p of plans) {
    const existing = await prisma.plan.findFirst({
      where: { name: p.name },
    });
    if (!existing) {
      await prisma.plan.create({ data: p });
      console.log(`Created Plan: ${p.name} (₹${p.price})`);
    } else {
      console.log(`Plan already exists: ${p.name}`);
    }
  }

  console.log('\nSeed completed successfully!');
  console.log('----------------------------------------------------');
  console.log('Default credentials (password for all: Zylo@2026Secure!):');
  console.log('Admin:    admin@brightloop.com');
  console.log('Staff:    staff@brightloop.com');
  console.log('Customer: customer@kirana.in');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
