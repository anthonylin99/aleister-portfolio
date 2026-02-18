'use client';

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { Loader2, ChevronRight } from 'lucide-react';

interface CommandInputProps {
  onSubmit: (command: string) => void;
  disabled?: boolean;
}

export function CommandInput({ onSubmit, disabled }: CommandInputProps) {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    setHistory((prev) => [trimmed, ...prev].slice(0, 50));
    setHistoryIndex(-1);
    onSubmit(trimmed);
    setValue('');
  }, [value, disabled, onSubmit]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        setValue(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setValue(history[newIndex]);
      } else {
        setHistoryIndex(-1);
        setValue('');
      }
    }
  };

  return (
    <div className="border-t border-[var(--gb-gold-border)] bg-[#0a0a0f]/90 backdrop-blur-sm px-4 py-3">
      <div className="flex items-center gap-3 max-w-full">
        {disabled ? (
          <Loader2 className="w-4 h-4 text-[var(--gb-gold)] animate-spin flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[var(--gb-gold)] flex-shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? 'Executing...' : 'Type a command... (try "help")'}
          className="flex-1 bg-transparent text-[var(--gb-parchment)] placeholder-[var(--text-subtle)] focus:outline-none font-mono text-sm"
          autoFocus
        />
      </div>
    </div>
  );
}
