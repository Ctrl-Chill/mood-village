"use client";

import type { KeyboardEvent } from "react";

interface PaperTagProps {
  value: string;
  onChange: (next: string) => void;
  maxLength?: number;
}

const BLOCKED_KEYS = new Set(["Backspace", "Delete"]);

export function PaperTag({ value, onChange, maxLength = 80 }: PaperTagProps) {
  const remaining = maxLength - value.length;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (BLOCKED_KEYS.has(event.key)) {
      event.preventDefault();
      return;
    }

    if (event.key.length === 1 && value.length >= maxLength) {
      event.preventDefault();
    }
  };

  return (
    <div className="paper-tag w-full rounded-md shadow-lg">
      <div className="mb-2 flex items-center justify-between text-xs text-amber-950/80">
        <span>Mood tag</span>
        <span>{remaining} left</span>
      </div>

      <textarea
        aria-label="Mood text"
        value={value}
        placeholder="write your feeling..."
        onKeyDown={handleKeyDown}
        onChange={(event) => {
          const next = event.target.value;
          if (next.length < value.length) return;
          onChange(next.slice(0, maxLength));
        }}
        className="typewriter-text h-28 w-full resize-none bg-transparent text-sm leading-relaxed text-amber-950 placeholder:text-amber-950/60 focus:outline-none"
      />

      <p className="mt-2 text-[11px] text-amber-950/80">No erasing on paper tags once typed.</p>
    </div>
  );
}
