'use client';

interface OrnateDividerProps {
  className?: string;
}

export function OrnateDivider({ className = '' }: OrnateDividerProps) {
  return (
    <div className={`ornate-divider ${className}`}>
      <div className="ornate-divider-diamond" />
    </div>
  );
}
