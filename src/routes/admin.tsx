import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/useAuth";
import { useEffect } from "react";
import {
  Shield,
  Upload,
  ListTree,
  PlayCircle,
  LayoutDashboard,
  Loader2,
  Lock,
  Users,
  FileText,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Admin · BackendMaster AI" },
      {
        name: "description",
        content: "Curriculum admin: manage PDFs, extracted topics, and lesson regeneration.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function AdminLayout() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.loading && !auth.session) {
      navigate({ to: "/auth", search: { next: "/admin" }, replace: true });
    }
  }, [auth.loading, auth.session, navigate]);

  if (auth.loading || !auth.session) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground text-sm gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking access…
        </div>
      </AppShell>
    );
  }

  if (!auth.isAdmin) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto mt-24 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-xl font-bold">Admins only</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your account is signed in as{" "}
            <span className="font-medium text-foreground">{auth.user?.email}</span>, but doesn't
            have admin access. The first person to sign up on this deployment becomes the admin.
          </p>
          <button
            onClick={() => auth.signOut()}
            className="mt-6 text-xs underline underline-offset-2 text-muted-foreground"
          >
            Sign out
          </button>
        </div>
      </AppShell>
    );
  }

  return <AdminShell />;
}

import { syncRegenQueueWithDB } from "@/lib/lesson-db";

function AdminShell() {
  useEffect(() => {
    syncRegenQueueWithDB();
  }, []);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tabs = [
    { to: "/admin", icon: <LayoutDashboard className="h-4 w-4" />, label: "Overview" },
    { to: "/admin/pdfs", icon: <Upload className="h-4 w-4" />, label: "PDFs" },
    { to: "/admin/topics", icon: <ListTree className="h-4 w-4" />, label: "Topics" },
    { to: "/admin/queue", icon: <PlayCircle className="h-4 w-4" />, label: "Regen queue" },
    { to: "/admin/users", icon: <Users className="h-4 w-4" />, label: "Users" },
    { to: "/admin/logs", icon: <FileText className="h-4 w-4" />, label: "System logs" },
  ] as const;
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-5 lg:px-10 py-8 space-y-6 animate-in fade-in duration-300">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary font-semibold flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Admin Control Center
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold mt-1 tracking-tight">
              Curriculum &amp; System Settings
            </h1>
          </div>
        </header>

        {/* Sleek Horizontal Animated Navigation Bar */}
        <nav className="flex flex-wrap items-center gap-1.5 bg-card/70 backdrop-blur-md border border-border/80 p-1.5 rounded-2xl shadow-sm">
          {tabs.map((t) => {
            const active = pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`relative text-xs lg:text-sm font-medium inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  active
                    ? "text-primary-foreground font-semibold shadow-md scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
                style={active ? { background: "var(--gradient-primary)" } : undefined}
              >
                {t.icon}
                <span>{t.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-2">
          <Outlet />
        </div>
      </div>
    </AppShell>
  );
}
