import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Check rate limit for auth actions (login/signup)
 * Based on requester IP
 */
export async function POST(request) {
  try {
    const { action } = await request.json();

    if (!action || !['login', 'signup'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';

    // Rate limit: 10 attempts per 5 minutes per IP
    const { isRateLimited, remaining, resetTime } = await rateLimit({
      uniqueToken: `auth-${action}-${ip}`,
      interval: 5 * 60 * 1000,
      limit: 10,
    });

    if (isRateLimited) {
      return NextResponse.json({
        error: 'Too many attempts. Please try again later.',
        resetTime
      }, { status: 429 });
    }

    return NextResponse.json({ success: true, remaining }, { status: 200 });
  } catch (error) {
    console.error('Rate limit API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
