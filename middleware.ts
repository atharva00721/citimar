import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT = 3; // Max submissions per 24 hours
const COOKIE_NAME = 'submission_count';
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== '/api/submit') {
    return NextResponse.next();
  }

  // Get submission count from cookies
  const cookieHeader = request.cookies.get(COOKIE_NAME)?.value;
  const submissionCount = parseInt(cookieHeader || '0', 10);

  if (submissionCount >= RATE_LIMIT) {
    return NextResponse.json(
      { error: 'Too many submissions (max 3 per day)' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': '86400' // 24 hours
        },
      }
    );
  }

  return NextResponse.next();
}

// Apply middleware only to the `/api/submit` route
export const config = {
  matcher: '/api/submit',
};
