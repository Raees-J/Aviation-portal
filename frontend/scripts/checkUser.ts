/**
 * Quick script to check users in database and create a test user
 * Run: npx tsx scripts/checkUser.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking database...\n');

  // List all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      emailVerified: true,
    }
  });

  console.log(`Found ${users.length} users in database:`);
  users.forEach(user => {
    console.log(`  - ${user.email} (${user.firstName} ${user.lastName}) - Role: ${user.role}`);
  });

  console.log('\n---\n');

  // Create test user with proper hashed password
  const testEmail = 'test@stellenbosch.com';
  const testPassword = 'password123';

  const existingUser = await prisma.user.findUnique({
    where: { email: testEmail }
  });

  if (existingUser) {
    console.log(`✅ Test user already exists: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
  } else {
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const newUser = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        phone: '+27123456789',
        role: 'STUDENT',
        emailVerified: true,
      }
    });

    console.log(`✅ Created test user: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   User ID: ${newUser.id}`);
  }

  console.log('\n📝 You can now login with:');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${testPassword}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
