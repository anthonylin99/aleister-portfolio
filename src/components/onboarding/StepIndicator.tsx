'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <div key={i} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                  isCompleted
                    ? 'bg-emerald-500 text-[var(--gb-parchment)]'
                    : isCurrent
                      ? 'bg-[var(--gb-gold)] text-[var(--gb-parchment)] shadow-lg shadow-[var(--gb-gold)]/30'
                      : 'bg-[var(--gb-azure-deep)] text-[var(--text-subtle)] border border-[var(--gb-gold-border)]'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isCurrent ? 'text-[var(--gb-parchment)]' : isCompleted ? 'text-emerald-400' : 'text-[var(--text-subtle)]'
                )}
              >
                {labels[i]}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div
                className={cn(
                  'w-12 h-0.5 rounded-full mb-5',
                  isCompleted ? 'bg-emerald-500' : 'bg-[var(--gb-azure)]'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
