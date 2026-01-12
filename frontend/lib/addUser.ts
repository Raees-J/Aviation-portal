// Simple script to add users to the authentication system
// Run this in Node.js or add to your backend

import bcrypt from 'bcryptjs';

// In-memory user storage (same as used in login/route.ts)
// In production, this would be a database
export const users: any[] = [];

/**
 * Add a new user manually
 * Usage: await addUser('john@example.com', 'password123', 'John', 'Doe')
 */
export async function addUser(
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string,
  phone?: string
) {
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    console.error(`User with email ${email} already exists`);
    return null;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user object
  const newUser = {
    id: `user-${Date.now()}`,
    email,
    password: hashedPassword,
    firstName,
    lastName,
    phone: phone || '',
    emailVerified: true,
    createdAt: new Date().toISOString()
  };

  // Add to users array
  users.push(newUser);

  console.log(`✅ User created: ${firstName} ${lastName} (${email})`);
  return newUser;
}

/**
 * Example: Add some test users
 */
export function seedTestUsers() {
  // Use immediate async execution
  (async () => {
    if (users.length > 0) {
      console.log('Users already seeded');
      return;
    }
    
    await addUser('admin@stelfly.co.za', 'Admin123!', 'Admin', 'User', '+27 123 456 789');
    await addUser('pilot@stelfly.co.za', 'Pilot123!', 'Test', 'Pilot', '+27 987 654 321');
    await addUser('instructor@stelfly.co.za', 'Instructor123!', 'John', 'Smith', '+27 555 123 456');
    
    console.log(`\n✅ ${users.length} test users created\n`);
    console.log('Login credentials:');
    console.log('1. admin@stelfly.co.za / Admin123!');
    console.log('2. pilot@stelfly.co.za / Pilot123!');
    console.log('3. instructor@stelfly.co.za / Instructor123!\n');
  })();
}

// Auto-seed when this file is imported
seedTestUsers();
