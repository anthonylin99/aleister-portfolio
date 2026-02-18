'use client';

interface ScrollBannerProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollBanner({ children, className = '' }: ScrollBannerProps) {
  return (
    <div className={`scroll-banner ${className}`}>
      {children}
    </div>
  );
}
