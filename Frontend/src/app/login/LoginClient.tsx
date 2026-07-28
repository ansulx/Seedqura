"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { createClient } from "@/lib/supabase/client";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";
  const isReset = searchParams.get("reset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(
    isReset
      ? "Use the link from your email to set a password, then sign in here."
      : ""
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signError) {
        setError(signError.message);
        return;
      }

      const userId = data.user?.id;
      let role = "student";
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();
        role = profile?.role || "student";
      }

      if (next) {
        router.replace(next);
      } else if (role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/student");
      }
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function sendReset() {
    setError("");
    setMessage("");
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${origin}/login?reset=1` }
      );
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setMessage("Password reset email sent. Check your inbox.");
    } catch {
      setError("Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="px-4 pt-6 sm:px-6">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Logo href="/" variant="header" />
          <Link href="/apply" className="text-sm text-muted hover:text-text">
            Apply
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-3xl font-medium tracking-tight text-text">Sign in</h1>
        <p className="mt-3 text-muted">
          Students and admins use the same login. New students get access after
          paying for a course.
        </p>

        <form onSubmit={onSubmit} className="glass-card mt-10 space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted">
              Email
            </label>
            <input
              type="email"
              className="input-premium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted">
              Password
            </label>
            <input
              type="password"
              className="input-premium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-accent">{message}</p>}

          <MagneticButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </MagneticButton>

          <button
            type="button"
            onClick={sendReset}
            className="w-full text-sm text-muted hover:text-text"
            disabled={loading}
          >
            Forgot password / set password
          </button>
        </form>
      </main>
    </div>
  );
}
