import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { UpstashRedisAdapter } from '@auth/upstash-redis-adapter';
import { getRequiredRedis } from './redis';
import { OWNER_EMAIL } from '@/data/etf-config';

// Check if email is the owner
function isOwner(email: string | null | undefined): boolean {
  return email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: UpstashRedisAdapter(getRequiredRedis(), {
    baseKeyPrefix: 'auth:',
  }),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY || 'fake-key-for-dev',
      from: process.env.AUTH_RESEND_FROM || 'noreply@localhost',
      ...(process.env.RESEND_API_KEY
        ? {}
        : {
            sendVerificationRequest: async ({ identifier, url }) => {
              console.log('\n========================================');
              console.log('  DEV MODE — Magic Link');
              console.log(`  Email: ${identifier}`);
              console.log(`  URL:   ${url}`);
              console.log('========================================\n');
              // Store for auto-redirect via /api/auth/dev-callback
              (globalThis as Record<string, unknown>).__devMagicLinkUrl = url;
            },
          }),
    }),
  ],
  pages: {
    signIn: '/login',
    // Owner skips onboarding
    newUser: '/onboarding',
  },
  callbacks: {
    session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        // Add isOwner flag to session
        (session.user as { isOwner?: boolean }).isOwner = isOwner(user.email);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Check if this is a new user sign-in
      // The owner should skip onboarding and go directly to dashboard
      if (url.includes('/onboarding')) {
        // We can't easily check the user here, but the onboarding page itself
        // will redirect owners to dashboard
        return url;
      }
      // Ensure redirects stay on the same site
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: 'database',
  },
});
