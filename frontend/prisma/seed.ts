import 'dotenv/config';
import { PrismaClient, UserRole, AircraftStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Create test users
  const users = [
    {
      email: 'admin@stelfly.co.za',
      password: await bcrypt.hash('Admin123!', 10),
      firstName: 'Admin',
      lastName: 'User',
      phone: '+27 21 555 0001',
      role: UserRole.ADMIN,
      emailVerified: true
    },
    {
      email: 'pilot@stelfly.co.za',
      password: await bcrypt.hash('Pilot123!', 10),
      firstName: 'Test',
      lastName: 'Pilot',
      phone: '+27 21 555 0002',
      role: UserRole.STUDENT,
      emailVerified: true
    },
    {
      email: 'instructor@stelfly.co.za',
      password: await bcrypt.hash('Instructor123!', 10),
      firstName: 'John',
      lastName: 'Smith',
      phone: '+27 21 555 0003',
      role: UserRole.INSTRUCTOR,
      emailVerified: true
    }
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    });
    console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${user.email})`);
  }

  // Create instructors
  const instructors = [
    { firstName: 'Peter', lastName: 'Erasmus', email: 'peter@stelfly.co.za', phone: '+27 21 555 0101', qualifications: ['PPL', 'CPL', 'FI'] },
    { firstName: 'Jondré', lastName: 'Kallis', email: 'jondre@stelfly.co.za', phone: '+27 21 555 0102', qualifications: ['PPL', 'CPL', 'FI'] },
    { firstName: 'Tristan', lastName: 'Storkey', email: 'tristan@stelfly.co.za', phone: '+27 21 555 0103', qualifications: ['PPL', 'CPL', 'FI'] },
    { firstName: 'Jason', lastName: 'Rossouw', email: 'jason@stelfly.co.za', phone: '+27 21 555 0104', qualifications: ['PPL', 'CPL', 'FI'] },
    { firstName: 'Sarah', lastName: 'Smit', email: 'sarah@stelfly.co.za', phone: '+27 21 555 0105', qualifications: ['PPL', 'CPL', 'FI'] },
    { firstName: 'Christo', lastName: 'Smit', email: 'christo@stelfly.co.za', phone: '+27 21 555 0106', qualifications: ['PPL', 'FI'] },
  ];

  for (const instructorData of instructors) {
    const instructor = await prisma.instructor.upsert({
      where: { email: instructorData.email },
      update: {},
      create: instructorData
    });
    console.log(`✅ Created instructor: ${instructor.firstName} ${instructor.lastName}`);
  }

  // Create aircraft
  const aircraft = [
    { registration: 'ZS-OHH', model: 'C172 N', type: 'C172', totalHours: 4523.5, maintenanceHours: 4350, nextMaintenance: 4600, status: AircraftStatus.AVAILABLE },
    { registration: 'ZS-OHI', model: 'C172 N', type: 'C172', totalHours: 3812.2, maintenanceHours: 3700, nextMaintenance: 3900, status: AircraftStatus.AVAILABLE },
    { registration: 'ZS-SLM', model: 'C172 P', type: 'C172', totalHours: 2156.8, maintenanceHours: 2050, nextMaintenance: 2250, status: AircraftStatus.AVAILABLE },
    { registration: 'ZS-SMS', model: 'C172 R', type: 'C172', totalHours: 1892.4, maintenanceHours: 1800, nextMaintenance: 2000, status: AircraftStatus.AVAILABLE },
    { registration: 'ZS-KUI', model: 'C172RG Cutlass', type: 'C172RG', totalHours: 5234.1, maintenanceHours: 5100, nextMaintenance: 5300, status: AircraftStatus.MAINTENANCE },
  ];

  for (const aircraftData of aircraft) {
    const plane = await prisma.aircraft.upsert({
      where: { registration: aircraftData.registration },
      update: {},
      create: aircraftData
    });
    console.log(`✅ Created aircraft: ${plane.registration} (${plane.model})`);
  }

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('Test user credentials:');
  console.log('1. admin@stelfly.co.za / Admin123!');
  console.log('2. pilot@stelfly.co.za / Pilot123!');
  console.log('3. instructor@stelfly.co.za / Instructor123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
