'use client';

import { usePathname } from 'next/navigation';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  if (!isLanding) {
    return <>{children}</>;
  }

  // Landing page gets clean layout without background effects
  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}
