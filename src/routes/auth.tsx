import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";

type Search = { next?: string; verified?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    next: typeof raw.next === "string" ? raw.next : undefined,
    verified: typeof raw.verified === "string" ? raw.verified : undefined,
  }),
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in · BackendMaster AI" },
      { name: "description", content: "Sign in or create your BackendMaster AI account." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function safeNextPath(next: string | undefined): string {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

type Mode = "signin" | "signup" | "verify" | "forgot" | "reset-sent";

function AuthPage() {
  const { next, verified } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const auth = useAuth();
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [mode, setMode] = useState<Mode>(verified ? "signin" : "signin");
  const [email, setEmail] = useState(verified ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(verified ? "Email verified! You can now sign in." : null);
  const [busy, setBusy] = useState(false);
  const verifyPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const target = safeNextPath(next);

  // Listen for auth state changes (e.g. hash token exchange from confirmation link)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
        setVerifiedSuccess(true);
        if (verifyPollRef.current) clearInterval(verifyPollRef.current);
        setTimeout(() => {
          navigate({ to: target || "/", replace: true });
        }, 1500);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, target]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!auth.loading && auth.session && !verifiedSuccess) {
      navigate({ to: target, replace: true });
    }
  }, [auth.loading, auth.session, navigate, target, verifiedSuccess]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (verifyPollRef.current) clearInterval(verifyPollRef.current);
    };
  }, []);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);

    // Supabase signUp returns a user even if unconfirmed. If user already
    // exists AND is confirmed, signUp returns an obfuscated "fake" user
    // with identities=[]. We detect that to show "already registered".
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth?verified=${encodeURIComponent(email)}`,
      },
    });

    setBusy(false);

    if (signUpError) {
      if ((signUpError as any).status === 401 || signUpError.message.toLowerCase().includes("apikey") || signUpError.message.toLowerCase().includes("jwt")) {
        setError("Supabase 401 Unauthorized: The SUPABASE_PUBLISHABLE_KEY in your .env file belongs to an old project. Please copy the new 'anon' key from your Supabase Dashboard (Settings > API) for project cupmcnyxfbqkoexspqif.");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    // Check for "already registered" — Supabase returns a user with empty identities array
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("This email is already registered. Please sign in instead.");
      return;
    }

    // If session is already created on signup (auto-confirmed)
    if (data.session) {
      navigate({ to: target || "/", replace: true });
      return;
    }

    // Move to verification waiting screen
    setMode("verify");
    startVerificationPolling();
  }

  function startVerificationPolling() {
    // Poll every 2.5s to check if user verified email
    if (verifyPollRef.current) clearInterval(verifyPollRef.current);
    verifyPollRef.current = setInterval(async () => {
      const { data } = await supabase.auth.signInWithPassword({ email, password });
      if (data?.session) {
        if (verifyPollRef.current) clearInterval(verifyPollRef.current);
        setVerifiedSuccess(true);
        setTimeout(() => {
          navigate({
            to: target || "/",
            replace: true,
          });
        }, 1800);
      }
    }, 2500);
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (signInError) {
      if ((signInError as any).status === 401 && !signInError.message.toLowerCase().includes("invalid login credentials")) {
        setError("Supabase 401 Unauthorized: The SUPABASE_PUBLISHABLE_KEY in your .env file belongs to an old project. Please copy the new 'anon' key from your Supabase Dashboard (Settings > API) for project cupmcnyxfbqkoexspqif.");
      } else if (signInError.message.toLowerCase().includes("email not confirmed")) {
        setError("Please verify your email first. Check your inbox for a confirmation link.");
      } else if (signInError.message.toLowerCase().includes("invalid login credentials")) {
        setError("Invalid email or password. If you haven't created an account in this database yet, please click 'Create Account' tab above first.");
      } else {
        setError(signInError.message);
      }
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setBusy(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setMode("reset-sent");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/auth" className="flex items-center gap-2 mb-8">
          <img src="/logo.svg" alt="Logo" className="h-9 w-9 rounded-lg" />
          <span className="font-bold">BackendMaster AI</span>
        </Link>

        {/* ── Verification waiting screen ── */}
        {mode === "verify" && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
            {verifiedSuccess ? (
              <div className="animate-in fade-in zoom-in-95 duration-200 py-2">
                <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 text-green-500">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h1 className="text-2xl font-extrabold text-foreground">Account Created Successfully! 🎉</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Your email has been verified. You can now close the extra browser tab and return to learning!
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-primary bg-primary/5 py-2.5 px-4 rounded-xl border border-primary/20">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Redirecting to your workspace…</span>
                </div>
              </div>
            ) : (
              <>
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Check your email</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  We sent a verification link to
                </p>
                <p className="text-sm font-semibold mt-1">{email}</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Click the link in your email to verify your account. If the link opens in a separate tab or port, return to this tab!
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  Waiting for verification…
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">Didn't receive the email?</p>
                  <button
                    onClick={async () => {
                      setBusy(true);
                      await supabase.auth.resend({ type: "signup", email });
                      setBusy(false);
                      setSuccess("Verification email resent!");
                      setTimeout(() => setSuccess(null), 4000);
                    }}
                    disabled={busy}
                    className="mt-1 text-xs text-primary underline underline-offset-2 disabled:opacity-50"
                  >
                    {busy ? "Sending…" : "Resend verification email"}
                  </button>
                  {success && (
                    <div className="mt-2 text-xs text-green-600 dark:text-green-400">{success}</div>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (verifyPollRef.current) clearInterval(verifyPollRef.current);
                    setMode("signin");
                    setError(null);
                    setSuccess(null);
                  }}
                  className="mt-4 text-xs text-muted-foreground underline underline-offset-2"
                >
                  ← Back to sign in
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Reset password email sent ── */}
        {mode === "reset-sent" && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-sm text-muted-foreground mt-2">
              We sent a password reset link to
            </p>
            <p className="text-sm font-semibold mt-1">{email}</p>
            <p className="text-xs text-muted-foreground mt-4">
              Click the link to set a new password. The link expires in 1 hour.
            </p>
            <button
              onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}
              className="mt-6 text-xs text-primary underline underline-offset-2"
            >
              ← Back to sign in
            </button>
          </div>
        )}

        {/* ── Sign in / Sign up / Forgot password form ── */}
        {(mode === "signin" || mode === "signup" || mode === "forgot") && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            {mode !== "forgot" && (
              <div className="flex border-b border-border mb-5">
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}
                  className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-colors ${
                    mode === "signin"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setError(null); setSuccess(null); }}
                  className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-colors ${
                    mode === "signup"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            <h1 className="text-2xl font-bold">
              {mode === "signin" && "Welcome back"}
              {mode === "signup" && "Create your account"}
              {mode === "forgot" && "Reset password"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "signin" && "Sign in to access your lessons and sync progress."}
              {mode === "signup" && "Create an account to start learning."}
              {mode === "forgot" && "Enter your email and we'll send you a reset link."}
            </p>

            {success && (
              <div className="mt-4 rounded-md border border-green-500/40 bg-green-500/5 text-green-700 dark:text-green-400 text-xs p-2 flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                {success}
              </div>
            )}

            <form
              onSubmit={
                mode === "signin" ? handleSignIn
                  : mode === "signup" ? handleSignUp
                  : handleForgotPassword
              }
              className="mt-6 space-y-4"
            >
              <div>
                <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              {mode !== "forgot" && (
                <div>
                  <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              )}

              {mode === "signup" && (
                <div>
                  <label htmlFor="confirm-password" className="text-xs font-medium text-muted-foreground">
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 text-destructive text-xs p-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy || auth.loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signin" && "Sign in"}
                {mode === "signup" && "Create account"}
                {mode === "forgot" && "Send reset link"}
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-4 space-y-2 text-xs text-center text-muted-foreground">
              {mode === "signin" && (
                <>
                  <div>
                    No account?{" "}
                    <button className="underline underline-offset-2 text-foreground" onClick={() => { setMode("signup"); setError(null); setSuccess(null); }}>
                      Create one
                    </button>
                  </div>
                  <div>
                    <button
                      className="underline underline-offset-2 text-muted-foreground hover:text-foreground"
                      onClick={() => { setMode("forgot"); setError(null); setSuccess(null); }}
                    >
                      Forgot password?
                    </button>
                  </div>
                </>
              )}
              {mode === "signup" && (
                <div>
                  Already have an account?{" "}
                  <button className="underline underline-offset-2 text-foreground" onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}>
                    Sign in
                  </button>
                </div>
              )}
              {mode === "forgot" && (
                <div>
                  <button className="inline-flex items-center gap-1 underline underline-offset-2 text-foreground" onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}>
                    <ArrowLeft className="h-3 w-3" /> Back to sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}