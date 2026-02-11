"use client";

import { useEffect, useMemo, useState } from "react";

import { moods } from "@/lib/moods";
import { getAllLanterns } from "@/lib/supabase";

import { SingleLantern } from "./SingleLantern";

interface LanternClusterProps {
  selectedMoodId: string | null;
  draftText: string;
  onSelectMood: (moodId: string) => void;
}

export function LanternCluster({
  selectedMoodId,
  draftText,
  onSelectMood,
}: LanternClusterProps) {
  const [releasedCount, setReleasedCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    getAllLanterns().then((items) => {
      if (mounted) setReleasedCount(items.length);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const helperText = useMemo(() => {
    if (!selectedMoodId) return "Choose a lantern mood to begin.";
    return "Now type on the tag and release it.";
  }, [selectedMoodId]);

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-4 flex items-end justify-between gap-4">
        <p className="text-sm text-slate-300">{helperText}</p>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{releasedCount} in sky</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {moods.map((mood) => (
          <SingleLantern
            key={mood.id}
            mood={mood}
            selected={selectedMoodId === mood.id}
            previewText={selectedMoodId === mood.id ? draftText : ""}
            onClick={() => onSelectMood(mood.id)}
          />
        ))}
      </div>
    </section>
  );
}
