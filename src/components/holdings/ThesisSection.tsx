'use client';

import Image from 'next/image';
import { FileText, Target, Zap, AlertTriangle, BookOpen } from 'lucide-react';
import { userThesisData } from '@/data/user-thesis';

interface ThesisSectionProps {
  ticker: string;
}

export function ThesisSection({ ticker }: ThesisSectionProps) {
  const data = userThesisData[ticker.toUpperCase()];
  if (!data) return null;

  const items = [
    { icon: FileText, label: 'Investment Thesis', value: data.thesis },
    { icon: Target, label: 'Price Target', value: data.priceTarget },
    { icon: Zap, label: '2026 Catalysts', value: data.catalysts },
    { icon: AlertTriangle, label: 'Risk Factors', value: data.risks },
    { icon: BookOpen, label: 'Lessons Learned', value: data.lessons },
  ] as const;

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--gb-gold-border)] flex-shrink-0">
          <Image
            src="/profile.png"
            alt="Anthony"
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--gb-parchment)]">Anthony&apos;s Thesis</h2>
          <p className="text-sm text-[var(--text-muted)]">Personal investment reasoning and analysis</p>
        </div>
      </div>
      <div className="space-y-4">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-[var(--gb-azure-deep)]/50 rounded-xl p-4 border border-[var(--gb-gold-border)]">
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm mb-2">
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </div>
            <p className="text-[var(--gb-parchment)] leading-relaxed">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
