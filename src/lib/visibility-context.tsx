'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface VisibilityContextType {
  isVisible: boolean;
  toggleVisibility: () => void;
  maskValue: (value: string | number) => string;
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(undefined);

export function VisibilityProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const maskValue = useCallback((value: string | number): string => {
    if (isVisible) {
      return typeof value === 'number' ? value.toString() : value;
    }
    // Return masked value (dots or asterisks)
    const str = typeof value === 'number' ? value.toString() : value;
    // Keep currency symbol and format, replace numbers with bullets
    return str.replace(/[\d,.]+/g, '••••••');
  }, [isVisible]);

  return (
    <VisibilityContext.Provider value={{ isVisible, toggleVisibility, maskValue }}>
      {children}
    </VisibilityContext.Provider>
  );
}

export function useVisibility() {
  const context = useContext(VisibilityContext);
  if (context === undefined) {
    throw new Error('useVisibility must be used within a VisibilityProvider');
  }
  return context;
}
