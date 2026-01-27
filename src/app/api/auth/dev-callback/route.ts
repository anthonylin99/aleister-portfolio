import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development or when RESEND_API_KEY is not configured
  const isDevMode = process.env.NODE_ENV !== 'production' || !process.env.RESEND_API_KEY;
  
  if (!isDevMode) {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const url = (globalThis as Record<string, unknown>).__devMagicLinkUrl as
    | string
    | undefined;

  if (!url) {
    return NextResponse.json(
      { error: 'No magic link available. Submit the login form first.' },
      { status: 404 }
    );
  }

  // Clear after use
  (globalThis as Record<string, unknown>).__devMagicLinkUrl = undefined;

  return NextResponse.redirect(url);
}
