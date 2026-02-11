"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export default function SignupPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const hasSupabase = Boolean(supabase);
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!supabase) {
      setError("Missing Supabase environment variables.");
      return;
    }

    setIsLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/profile`,
      },
    });

    if (signupError) {
      setIsLoading(false);
      setError(signupError.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          name: name.trim() || email.split("@")[0],
          email,
          avatar_url: data.user.user_metadata?.avatar_url ?? null,
        },
        { onConflict: "id" },
      );
    }

    setIsLoading(false);

    if (!data.session) {
      setMessage("Account created. Check your email to confirm your account, then log in.");
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  async function handleGoogleSignup() {
    setError(null);
    setMessage(null);
    setIsLoading(true);

    if (!supabase) {
      setIsLoading(false);
      setError("Missing Supabase environment variables.");
      return;
    }

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/profile` },
    });

    if (googleError) {
      setIsLoading(false);
      setError(googleError.message);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 pb-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700/80">Account</p>
        <h1 className="text-4xl font-semibold text-slate-900">Sign Up</h1>
        <p className="text-lg text-slate-600">Create your account with email/password or Google.</p>
      </header>

      <div className="rounded-3xl border-2 border-sky-900/80 bg-gradient-to-b from-sky-100 to-sky-50 p-6 shadow-[8px_10px_0px_0px_rgba(30,58,138,0.8)]">
        {!hasSupabase ? (
          <p className="mb-4 text-sm font-medium text-amber-700">
            Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable signup.
          </p>
        ) : null}

        <form className="space-y-4" onSubmit={handleEmailSignup}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
              placeholder="Sarah Chen"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Confirm password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
              placeholder="Re-enter your password"
            />
          </div>

          {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
          {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : "Sign up with Email"}
          </button>
        </form>

        <div className="my-4 border-t border-sky-200" />

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isLoading}
          className="w-full rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-sky-50 disabled:opacity-60"
        >
          Continue with Google
        </button>

        <p className="mt-5 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-sky-700 hover:text-sky-800">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}
