import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Import shared storage
let users: any[] = [];
let pendingVerifications: Map<string, any>;

// Dynamic import to avoid circular dependency
try {
  const registerModule = require('../register/route');
  users = registerModule.users;
  pendingVerifications = registerModule.pendingVerifications;
} catch (e) {
  console.error('Failed to import user storage:', e);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link' },
        { status: 400 }
      );
    }

    // Get pending user data
    const userData = pendingVerifications?.get(token);

    if (!userData) {
      return NextResponse.json(
        { error: 'Verification link has already been used or is invalid' },
        { status: 400 }
      );
    }

    // Check if user already exists (shouldn't happen, but safety check)
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'This email has already been verified' },
        { status: 400 }
      );
    }

    // Mark as verified and add to users
    userData.emailVerified = true;
    users.push(userData);

    // Remove from pending
    pendingVerifications?.delete(token);

    // Redirect to success page
    return NextResponse.redirect(new URL('/login?verified=true', request.url));

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Email verification failed' },
      { status: 500 }
    );
  }
}
