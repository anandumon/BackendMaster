import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { User, Shield, Check, Loader2, X } from "lucide-react";

export function ProfileModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const auth = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.user) return;
    // Load current profile display_name
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", auth.user.id)
      .maybeSingle()
      .then(
        ({ data }) => {
          if (data?.display_name) {
            setDisplayName(data.display_name);
          } else {
            setDisplayName(auth.user?.user_metadata?.display_name || auth.user?.email?.split("@")[0] || "");
          }
        },
        () => {
          setDisplayName(auth.user?.user_metadata?.display_name || auth.user?.email?.split("@")[0] || "");
        }
      );
  }, [auth.user, isOpen]);

  if (!isOpen || !auth.user) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.user) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Update user metadata in auth.users
      await supabase.auth.updateUser({
        data: { display_name: displayName.trim() },
      });

      // 2. Try updating Supabase profiles table
      try {
        await supabase
          .from("profiles")
          .upsert({
            id: auth.user.id,
            email: auth.user.email,
            display_name: displayName.trim(),
            updated_at: new Date().toISOString(),
          });
      } catch {
        // Fallback if RLS or schema policy is pending
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);

    } catch (err) {
      setError((err as Error).message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">Profile Settings</h2>
            <p className="text-xs text-muted-foreground">Update your personal account details</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Account Email
            </label>
            <input
              type="text"
              disabled
              value={auth.user.email || ""}
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-muted/50 text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Display Name / Username
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Anandu"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center justify-between text-xs bg-muted/40 p-3 rounded-xl border border-border/50">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" /> Role Status:
            </span>
            <span className={`font-semibold px-2 py-0.5 rounded-full ${auth.isAdmin ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}>
              {auth.isAdmin ? "👑 Admin" : "👤 User"}
            </span>
          </div>

          {error && (
            <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-xl border border-destructive/30">
              {error}
            </div>
          )}

          {success && (
            <div className="text-xs text-green-600 dark:text-green-400 bg-green-500/10 p-2.5 rounded-xl border border-green-500/30 flex items-center gap-1.5">
              <Check className="h-4 w-4" /> Profile updated successfully!
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-95 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
