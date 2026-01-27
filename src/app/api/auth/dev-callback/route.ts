import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development or when RESEND_API_KEY is not configured
  const isDevMode = process.env.NODE_ENV !== 'production' || !process.env.RESEND_API_KEY;
  
  if (!isDevMode) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  // Wait a bit for the magic link URL to be set (race condition fix)
  let url: string | undefined;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!url && attempts < maxAttempts) {
    url = (globalThis as Record<string, unknown>).__devMagicLinkUrl as string | undefined;
    if (!url) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
  }

  if (!url) {
    return NextResponse.json(
      { error: 'No magic link available. Submit the login form first.' },
      { status: 400 }
    );
  }

  // Clear after use
  (globalThis as Record<string, unknown>).__devMagicLinkUrl = undefined;

  return NextResponse.redirect(url);
}
