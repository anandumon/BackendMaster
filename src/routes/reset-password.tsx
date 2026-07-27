import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Set new password · BackendMaster AI" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase handles the token exchange automatically when the recovery link
    // redirects here — it sets the session via the URL hash fragment.
    // We just need to wait for the session to be available.
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    // Also check if we already have a session (in case event fired before mount)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
      // Sign out so they can sign in with the new password
      await supabase.auth.signOut();
      setTimeout(() => navigate({ to: "/auth", replace: true }), 2500);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/auth" className="flex items-center gap-2 mb-8">
          <img src="/logo.svg" alt="Logo" className="h-9 w-9 rounded-lg" />
          <span className="font-bold">BackendMaster AI</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {done ? (
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold">Password updated!</h1>
              <p className="text-sm text-muted-foreground mt-2">Redirecting to sign in…</p>
            </div>
          ) : !ready ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-3">Verifying reset token…</p>
              <p className="text-xs text-muted-foreground mt-1">
                If this takes too long, the link may have expired.
              </p>
              <Link
                to="/auth"
                className="mt-4 text-xs text-primary underline underline-offset-2 inline-block"
              >
                Request a new reset link
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-bold">Set new password</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a new password for your account.
              </p>

              <form onSubmit={handleReset} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="new-password"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm-new-password"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Confirm new password
                  </label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                {error && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/5 text-destructive text-xs p-2">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95 disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update password
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
