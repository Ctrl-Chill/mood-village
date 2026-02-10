"use client";

import { useState } from "react";

export default function Home() {
  const [moodLevel, setMoodLevel] = useState(3);

  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xl font-semibold text-slate-900 sm:text-2xl">
          Hi how are you today?
        </p>
        <p className="mt-2 text-sm text-slate-500">
          1 is super sad and 5 is super happy.
        </p>
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
            <span>Mood level</span>
            <span>{moodLevel} / 5</span>
          </div>
          <input
            aria-label="Mood level"
            className="mt-4 w-full"
            type="range"
            min={1}
            max={5}
            step={1}
            value={moodLevel}
            onChange={(event) => setMoodLevel(Number(event.target.value))}
          />
          <div className="mt-2 flex justify-between text-[11px] text-slate-400">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>
      </div>
    </section>
  );
}
