// app/api/salt/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic'; // Prevent static behavior

export async function GET() {
  try {
    const salt = crypto.randomBytes(16).toString('hex');
    
    return new NextResponse(
      JSON.stringify({ salt }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}