"use client";

import { motion } from "framer-motion";

import type { Mood } from "@/lib/moods";
import { cn } from "@/lib/utils";

interface SingleLanternProps {
  mood: Mood;
  selected?: boolean;
  previewText?: string;
  onClick?: () => void;
}

export function SingleLantern({
  mood,
  selected = false,
  previewText,
  onClick,
}: SingleLanternProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02 }}
      className={cn(
        "group relative flex h-56 w-full flex-col items-center justify-end rounded-3xl border border-white/10 bg-slate-900/40 p-4 transition",
        selected ? "ring-2 ring-amber-300/80" : "hover:border-white/25"
      )}
    >
      <svg className="lantern-string pointer-events-none absolute top-2 h-20 w-12" viewBox="0 0 48 80" aria-hidden>
        <path d="M24 0 C 22 20, 26 42, 24 80" />
      </svg>

      <motion.div
        animate={{ y: [0, -5, 0], rotate: [-1.2, 1.2, -1.2] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3.2, ease: "easeInOut" }}
        className={cn(
          "lantern-frame lantern-glass relative mt-10 w-full max-w-[170px] px-4 pb-5 pt-7",
          mood.glowClass
        )}
      >
        <div className="mb-2 text-center text-3xl">{mood.emoji}</div>
        <p className="text-center text-sm font-semibold text-slate-100">{mood.label}</p>
      </motion.div>

      {previewText ? (
        <div className="paper-tag absolute -bottom-5 left-1/2 w-[85%] -translate-x-1/2 px-3 py-2 text-left text-xs shadow">
          <p className="typewriter-text truncate">{previewText}</p>
        </div>
      ) : null}
    </motion.button>
  );
}
