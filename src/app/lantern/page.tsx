'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { getMoodById, moods } from '@/lib/moods';
import {
  createLantern,
  createReply,
  getAllLanterns,
  getConversationCount,
  getRepliesForLantern,
  type Lantern,
  type Reply,
} from '@/lib/supabase';

import { SingleLantern } from './SingleLantern';

const MAX_TAG_CHARACTERS = 80;
const MAX_REPLY_CHARACTERS = 80;

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';
  return date.toLocaleString();
}

export default function LanternPage() {
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');
  const [floatingMoodId, setFloatingMoodId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [allLanterns, setAllLanterns] = useState<Lantern[]>([]);
  const [conversationCount, setConversationCount] = useState(getConversationCount());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [releaseError, setReleaseError] = useState<string | null>(null);

  const [selectedLanternId, setSelectedLanternId] = useState<string | null>(null);
  const [repliesByLantern, setRepliesByLantern] = useState<Record<string, Reply[]>>({});
  const [loadingRepliesFor, setLoadingRepliesFor] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getAllLanterns()
      .then((items) => {
        if (!mounted) return;
        setAllLanterns(items);
        setConversationCount(Math.max(getConversationCount(), items.length));
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : 'Unable to load lantern sky.';
        setLoadError(message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const selectedMood = useMemo(() => {
    if (!selectedMoodId) return null;
    return getMoodById(selectedMoodId) ?? null;
  }, [selectedMoodId]);

  const selectedLantern = useMemo(() => {
    if (!selectedLanternId) return null;
    return allLanterns.find((item) => item.id === selectedLanternId) ?? null;
  }, [allLanterns, selectedLanternId]);

  async function releaseLantern() {
    if (!selectedMoodId || !draftText.trim() || isSaving) return;
    setReleaseError(null);
    setIsSaving(true);
    setFloatingMoodId(selectedMoodId);

    try {
      const created = await createLantern({
        mood_id: selectedMoodId,
        content: draftText.trim(),
        author: 'You',
      });
      setAllLanterns((prev) => [created, ...prev].slice(0, 30));
      setConversationCount((value) => value + 1);
      setDraftText('');
      setSelectedMoodId(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to release lantern.';
      setReleaseError(message);
    } finally {
      window.setTimeout(() => {
        setFloatingMoodId(null);
        setIsSaving(false);
      }, 900);
    }
  }

  async function openLanternThread(lanternId: string) {
    setReplyError(null);
    setReplyDraft('');
    setSelectedLanternId((current) => (current === lanternId ? null : lanternId));
    if (selectedLanternId === lanternId) return;
    if (repliesByLantern[lanternId]) return;

    setLoadingRepliesFor(lanternId);
    try {
      const replies = await getRepliesForLantern(lanternId);
      setRepliesByLantern((current) => ({ ...current, [lanternId]: replies }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to load replies.';
      setReplyError(message);
    } finally {
      setLoadingRepliesFor(null);
    }
  }

  async function submitReply() {
    if (!selectedLanternId || !replyDraft.trim() || isPostingReply) return;
    setIsPostingReply(true);
    setReplyError(null);

    try {
      const created = await createReply({
        lantern_id: selectedLanternId,
        content: replyDraft.trim(),
      });
      setRepliesByLantern((current) => ({
        ...current,
        [selectedLanternId]: [...(current[selectedLanternId] ?? []), created],
      }));
      setConversationCount((value) => value + 1);
      setReplyDraft('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to post reply.';
      setReplyError(message);
    } finally {
      setIsPostingReply(false);
    }
  }

  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border-2 border-[#314966] bg-[#dce9f8] p-5 shadow-[0_10px_24px_rgba(39,64,92,0.2)] dark:border-slate-600 dark:bg-slate-900/90 dark:shadow-[0_10px_24px_rgba(2,6,23,0.55)] sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-[#b9cfea] dark:bg-slate-800/80" />

      <div className="relative z-10">
        <header className="mt-2 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#4f5942] dark:text-slate-300">
            <span className="rounded-md border border-[#8ea8c8] bg-[#c4d9f1] px-2 py-1 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100">
              Lantern String
            </span>
            <span className="rounded-md border border-[#8ea8c8] bg-[#e2edf9] px-2 py-1 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200">
              {allLanterns.length} in sky
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#222620] dark:text-slate-100 sm:text-4xl">
            Lantern String
          </h1>
          <p className="max-w-2xl text-sm text-[#4f5942] dark:text-slate-300 sm:text-base">
            Choose a lantern mood, release a short note, then open any lantern card below to reply.
          </p>
        </header>

        <div className="mt-6 rounded-xl border-[2px] border-[#25364d] bg-[radial-gradient(circle_at_top,_#274a74_0%,_#0d2545_70%,_#08172e_100%)] px-4 pb-12 pt-8 dark:border-slate-600 dark:bg-[radial-gradient(circle_at_top,_#1f2f46_0%,_#0f172a_70%,_#020617_100%)]">
          <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-slate-200/95">
            <p>{selectedMood ? `Now writing on ${selectedMood.label}` : 'Tap a lantern to set your mood'}</p>
            <p>{conversationCount} conversations</p>
          </div>

          <div className="grid grid-cols-2 gap-6 pb-24 pt-3 sm:grid-cols-3 lg:grid-cols-5">
            {moods.map((mood, index) => (
              <SingleLantern
                key={mood.id}
                mood={mood}
                index={index}
                isActive={selectedMoodId === mood.id}
                isFloating={floatingMoodId === mood.id}
                onActivate={() => setSelectedMoodId(mood.id)}
              />
            ))}
          </div>
        </div>

        {selectedMood && (
          <motion.section
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-6 w-full max-w-xl rounded-xl border-[2px] border-[#25364d] bg-[#e2edf9] p-4 shadow-[4px_4px_0_#25364d] dark:border-slate-600 dark:bg-slate-800 dark:shadow-[4px_4px_0_#0f172a]"
            aria-label={`${selectedMood.label} reflection tag`}
          >
            <p className="mb-2 text-xs uppercase tracking-[0.12em] text-[#355072] dark:text-slate-300">
              {selectedMood.label} note
            </p>
            <textarea
              value={draftText}
              onChange={(event) => setDraftText(event.target.value.slice(0, MAX_TAG_CHARACTERS))}
              maxLength={MAX_TAG_CHARACTERS}
              rows={2}
              className="h-16 w-full resize-none rounded-md border border-[#25364d]/30 bg-[#f3f8ff] px-3 py-2 text-sm text-[#1f2a1a] outline-none focus:ring-2 focus:ring-[#88a9d4] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-500"
              placeholder="Type and release..."
              aria-label="Reflection tag input"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-xs text-[#4f5942] dark:text-slate-400">
                {draftText.length}/{MAX_TAG_CHARACTERS}
              </span>
              <Button
                type="button"
                onClick={releaseLantern}
                disabled={!draftText.trim() || isSaving}
                className="border-[2px] border-[#25364d] bg-[#88a9d4] text-[#15263d] hover:bg-[#789ac8] dark:border-slate-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
              >
                {isSaving ? 'Tying...' : 'Tie Up'}
              </Button>
            </div>
            {releaseError && <p className="mt-2 text-xs text-[#7a2626] dark:text-rose-300">{releaseError}</p>}
          </motion.section>
        )}

        <section className="mt-8 rounded-xl border-[2px] border-[#25364d] bg-[#e2edf9] p-5 shadow-[4px_4px_0_#25364d] dark:border-slate-600 dark:bg-slate-800 dark:shadow-[4px_4px_0_#0f172a]">
          <p className="text-sm text-[#2b3424] dark:text-slate-200">Tap any lantern note to open its reply thread.</p>
          <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#4f5942] dark:text-slate-400">
            {conversationCount} conversations released
          </p>
          {loadError && <p className="mt-2 text-xs text-[#7a2626] dark:text-rose-300">{loadError}</p>}

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allLanterns.slice(0, 15).map((lantern) => {
              const mood = getMoodById(lantern.mood_id);
              const isOpen = selectedLanternId === lantern.id;
              const repliesCount = repliesByLantern[lantern.id]?.length ?? 0;
              return (
                <button
                  key={lantern.id}
                  type="button"
                  onClick={() => void openLanternThread(lantern.id)}
                  className={`rounded-lg border-[2px] p-3 text-left transition ${
                    isOpen
                      ? 'border-[#25364d] bg-[#d2e3f7] dark:border-slate-500 dark:bg-slate-700'
                      : 'border-[#25364d]/40 bg-[#dbe9f8] hover:bg-[#d2e3f7] dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#355072] dark:text-slate-300">
                      {mood?.label ?? lantern.mood_id}
                    </p>
                    <p className="text-[11px] text-[#4f5942] dark:text-slate-400">{formatRelativeTime(lantern.created_at)}</p>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-[#1f2a1a] dark:text-slate-100">{lantern.content}</p>
                  <p className="mt-2 text-xs text-[#4f5942] dark:text-slate-400">
                    {isOpen ? 'Thread open' : 'Open thread'} · {repliesCount} replies
                  </p>
                </button>
              );
            })}
          </div>

          {selectedLantern ? (
            <div className="mt-5 rounded-lg border-[2px] border-[#25364d] bg-[#dbe9f8] p-4 dark:border-slate-500 dark:bg-slate-900">
              <p className="text-xs uppercase tracking-wide text-[#355072] dark:text-slate-300">
                Thread for {getMoodById(selectedLantern.mood_id)?.label ?? selectedLantern.mood_id}
              </p>
              <p className="mt-2 text-sm text-[#1f2a1a] dark:text-slate-100">{selectedLantern.content}</p>

              <div className="mt-4 space-y-2">
                {loadingRepliesFor === selectedLantern.id ? (
                  <p className="text-xs text-[#4f5942] dark:text-slate-400">Loading replies...</p>
                ) : (repliesByLantern[selectedLantern.id] ?? []).length ? (
                  (repliesByLantern[selectedLantern.id] ?? []).map((reply) => (
                    <div
                      key={reply.id}
                      className="rounded-md border border-[#25364d]/30 bg-[#edf5ff] px-3 py-2 text-xs text-[#2b3424] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <p>{reply.content}</p>
                      <p className="mt-1 text-[11px] text-[#4f5942] dark:text-slate-400">{formatRelativeTime(reply.created_at)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#4f5942] dark:text-slate-400">No replies yet. Start the thread.</p>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={replyDraft}
                  onChange={(event) => setReplyDraft(event.target.value.slice(0, MAX_REPLY_CHARACTERS))}
                  placeholder="Write a reply..."
                  className="h-10 flex-1 rounded-md border border-[#25364d]/40 bg-[#f3f8ff] px-3 text-sm text-[#1f2a1a] outline-none focus:ring-2 focus:ring-[#88a9d4] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-slate-500"
                />
                <Button
                  type="button"
                  onClick={() => void submitReply()}
                  disabled={!replyDraft.trim() || isPostingReply}
                  className="border-[2px] border-[#25364d] bg-[#88a9d4] text-[#15263d] hover:bg-[#789ac8] dark:border-slate-500 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                >
                  {isPostingReply ? 'Posting...' : 'Reply'}
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-[#4f5942] dark:text-slate-400">
                {replyDraft.length}/{MAX_REPLY_CHARACTERS}
              </p>
              {replyError ? <p className="mt-2 text-xs text-[#7a2626] dark:text-rose-300">{replyError}</p> : null}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
