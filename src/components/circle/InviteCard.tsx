'use client';

import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';

interface InviteCardProps {
  inviteCode: string;
  circleName: string;
}

export function InviteCard({ inviteCode, circleName }: InviteCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <Share2 className="w-5 h-5 text-[var(--gb-gold)]" />
        <h2 className="text-lg font-bold text-[var(--gb-parchment)] font-cinzel">Summon Allies</h2>
      </div>

      <p className="text-[var(--text-muted)] text-sm mb-4">
        Share this code with friends to invite them to{' '}
        <span className="text-[var(--gb-parchment)] font-medium">{circleName}</span>
      </p>

      <div className="flex items-center gap-2">
        <div className="flex-1 px-4 py-3 bg-[var(--gb-azure-deep)]/50 border border-[var(--gb-gold-border)] rounded-xl text-center">
          <span className="text-[var(--gb-parchment)] font-mono font-bold tracking-[0.3em] text-lg">
            {inviteCode}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-3 bg-[var(--gb-gold)] hover:bg-[var(--gb-gold)]/80 text-[var(--gb-parchment)] rounded-xl transition-colors flex items-center gap-2"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {copied && (
        <p className="text-emerald-400 text-xs text-center mt-2">
          Copied to clipboard!
        </p>
      )}
    </div>
  );
}
