import { useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { setCachedUserDisplayName } from "@/lib/storage";

export type AuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
};

export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    loading: true,
    session: null,
    user: null,
    isAdmin: false,
  });

  const refreshRole = useCallback(async (user: User | null) => {
    if (!user) return false;
    const name = user.user_metadata?.display_name || user.email?.split("@")[0];
    if (name) setCachedUserDisplayName(name);

    // Hardcode immediate admin check for anandu2109@gmail...
    if (user.email && user.email.toLowerCase().includes("anandu2109@gmail")) {
      return true;
    }
    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!error && data) return true;

      // Fallback query to user_roles table directly
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      return Boolean(roles && roles.length > 0);
    } catch (e) {
      console.warn("has_role check error:", e);
      return user.email?.toLowerCase().includes("anandu2109@gmail") ?? false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const isAdmin = data.session ? await refreshRole(data.session.user) : false;
      if (!mounted) return;
      if (data.session?.user) {
        const name =
          data.session.user.user_metadata?.display_name || data.session.user.email?.split("@")[0];
        if (name) setCachedUserDisplayName(name);
      }
      setState({
        loading: false,
        session: data.session,
        user: data.session?.user ?? null,
        isAdmin,
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") {
        return;
      }
      const isAdmin = session ? await refreshRole(session.user) : false;
      if (!mounted) return;
      if (session?.user) {
        const name = session.user.user_metadata?.display_name || session.user.email?.split("@")[0];
        if (name) setCachedUserDisplayName(name);
      }
      setState({
        loading: false,
        session,
        user: session?.user ?? null,
        isAdmin,
      });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [refreshRole]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, signIn, signUp, signOut };
}
