import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory user storage (replace with database in production)
const users: any[] = [];
const pendingVerifications = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password } = await request.json();

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create verification token
    const verificationToken = sign(
      { email, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Store pending user data
    const userId = `user-${Date.now()}`;
    const userData = {
      id: userId,
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      emailVerified: false,
      createdAt: new Date().toISOString()
    };

    pendingVerifications.set(verificationToken, userData);

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    try {
      await resend.emails.send({
        from: 'Stellenbosch Flying Club <onboarding@stelfly.co.za>',
        to: email,
        subject: 'Verify your email - Stellenbosch Flying Club',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #002D5B; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #C5A059; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to Stellenbosch Flying Club!</h1>
                </div>
                <div class="content">
                  <h2>Hi ${firstName},</h2>
                  <p>Thank you for requesting to join Stellenbosch Flying Club. We're excited to have you on board!</p>
                  <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
                  <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                  </div>
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="background: white; padding: 10px; border-radius: 4px; word-break: break-all;">${verificationUrl}</p>
                  <p><strong>This link will expire in 24 hours.</strong></p>
                  <p>If you didn't request this, please ignore this email.</p>
                  <p>Blue skies,<br>The Stellenbosch Flying Club Team</p>
                </div>
                <div class="footer">
                  <p>&copy; 2026 Stellenbosch Flying Club. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Continue anyway - in development, email might not be configured
      console.log('Verification URL (for development):', verificationUrl);
    }

    return NextResponse.json({
      message: 'Verification email sent. Please check your inbox.',
      email
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

export { users, pendingVerifications };
