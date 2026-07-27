import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useAllDomains, allTopicsMerged, findLessonMerged } from "@/lib/curriculum-extra";
import { getCompleted, getTheme, setTheme, getPinnedLessons } from "@/lib/storage";
import { getPinnedDB, unpinLessonDB } from "@/lib/lesson-db";
import { useAuth } from "@/lib/useAuth";
import { ProfileModal } from "@/components/ProfileModal";
import {
  Moon,
  Sun,
  LayoutDashboard,
  GraduationCap,
  Shield,
  LogIn,
  LogOut,
  CloudDownload,
  User,
  Menu,
  X,
  Pin,
  ChevronRight,
} from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [completed, setCompleted] = useState<string[]>([]);
  const [pinnedSlugs, setPinnedSlugs] = useState<string[]>([]);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const domains = useAllDomains();
  const [total, setTotal] = useState(0);
  const auth = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setTotal(allTopicsMerged().length);
  }, [domains]);

  useEffect(() => {
    const t = getTheme();
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    setCompleted(getCompleted());
    setPinnedSlugs(getPinnedLessons());

    if (auth.user) {
      getPinnedDB(auth.user.id).then(setPinnedSlugs);
    }
  }, [auth.user]);

  useEffect(() => {
    setCompleted(getCompleted());
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handlePinsChanged = () => {
      setPinnedSlugs(getPinnedLessons());
    };
    window.addEventListener("backend_mastery:pins-updated", handlePinsChanged);
    return () => window.removeEventListener("backend_mastery:pins-updated", handlePinsChanged);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setThemeState(next);
    setTheme(next);
  };

  const progress = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  // Resolve pinned lesson items
  const pinnedLessons = pinnedSlugs
    .map((s) => findLessonMerged(s))
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background text-foreground">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar: Fixed height on desktop, Slide-over drawer on mobile */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground h-full transition-transform duration-300 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8 rounded-lg" />
            <div>
              <div className="font-bold text-base leading-tight">BackendMaster</div>
              <div className="text-[10px] text-muted-foreground">AI Learning Platform</div>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="px-3 py-3 space-y-1 text-sm shrink-0">
          <NavItem to="/" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
          <NavItem to="/offline" icon={<CloudDownload className="h-4 w-4" />} label="Offline library" />
          {auth.isAdmin && (
            <NavItem to="/admin" icon={<Shield className="h-4 w-4" />} label="Admin" />
          )}
        </nav>

        <div className="px-4 mt-1 mb-3 shrink-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Progress</div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: "var(--gradient-primary)" }}
            />
          </div>
          <div className="text-xs mt-1 text-muted-foreground">
            {completed.length} / {total} lessons
          </div>
        </div>

        {/* Pinned Lessons Section in Sidebar */}
        {pinnedLessons.length > 0 && (
          <div className="px-3 py-2 shrink-0 border-t border-sidebar-border/60">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-amber-500 font-bold px-2 mb-1">
              <span className="flex items-center gap-1.5">
                <Pin className="h-3 w-3 fill-amber-500 text-amber-500" /> Pinned Lessons
              </span>
              <span className="text-[10px] opacity-75 font-normal">{pinnedLessons.length}</span>
            </div>
            <div className="space-y-0.5 max-h-36 overflow-y-auto scrollbar-thin">
              {pinnedLessons.map(({ topic, domain }) => {
                const isActive = pathname === `/lesson/${topic.slug}`;
                return (
                  <div key={topic.slug} className="group relative flex items-center">
                    <Link
                      to="/lesson/$slug"
                      params={{ slug: topic.slug }}
                      className={`flex-1 flex items-center gap-2 rounded-md px-2 py-1 text-xs truncate transition-colors pr-6 ${
                        isActive
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                          : "hover:bg-sidebar-accent text-sidebar-foreground/90"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: domain.color || "var(--primary)" }} />
                      <span className="truncate flex-1">{topic.title}</span>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        unpinLessonDB(auth.user?.id, topic.slug);
                      }}
                      className="absolute right-1.5 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-70 group-hover:opacity-100"
                      title="Unpin this lesson"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="px-3 flex-1 overflow-y-auto min-h-0 pb-6 space-y-1 border-t border-sidebar-border/60 pt-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground px-2 mb-2 sticky top-0 bg-sidebar py-1">
            Roadmaps ({domains.length})
          </div>
          <div className="space-y-1">
            {domains.map((d) => (
              <Link
                key={d.slug}
                to="/domain/$slug"
                params={{ slug: d.slug }}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-sidebar-accent text-sm"
              >
                <span className="text-lg">{d.icon}</span>
                <span className="truncate">{d.title}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {d.sections.reduce((s, sec) => s + sec.topics.length, 0)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-sidebar-border shrink-0">
          {auth.session ? (
            <div className="px-4 py-2.5 text-xs text-muted-foreground flex items-center justify-between gap-2">
              <button
                onClick={() => setProfileOpen(true)}
                className="flex items-center gap-1.5 min-w-0 hover:text-foreground text-left"
                title="Profile settings"
              >
                <User className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{auth.user?.user_metadata?.display_name || auth.user?.email}</span>
              </button>
              <button
                onClick={() => auth.signOut()}
                className="inline-flex items-center gap-1 hover:text-foreground p-1 rounded hover:bg-sidebar-accent shrink-0"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-2 px-5 py-3 hover:bg-sidebar-accent text-sm"
            >
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 border-t border-sidebar-border px-5 py-3 hover:bg-sidebar-accent text-sm w-full"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
          </button>
        </div>
      </aside>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Main Content Area: Independent Vertical Scroll Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        <header className="lg:hidden sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-muted text-foreground"
            aria-label="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Logo" className="h-7 w-7 rounded-lg" />
            <div className="font-bold text-sm">BackendMaster</div>
          </Link>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </header>

        {/* Quick Pinned Lessons Switcher Bar on Desktop/Tablet if pinned lessons exist */}
        {pinnedLessons.length > 0 && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 lg:px-10 py-1.5 flex items-center gap-2 text-xs overflow-x-auto shrink-0 scrollbar-none">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider shrink-0 text-[10px]">
              <Pin className="h-3 w-3 fill-amber-500 text-amber-500" /> Pinned Quick Switch:
            </span>
            <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto">
              {pinnedLessons.map(({ topic, domain }) => {
                const active = pathname === `/lesson/${topic.slug}`;
                return (
                  <div
                    key={topic.slug}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                      active
                        ? "bg-amber-500 text-white shadow-sm"
                        : "bg-background border border-border hover:border-amber-500/40 text-foreground"
                    }`}
                  >
                    <Link
                      to="/lesson/$slug"
                      params={{ slug: topic.slug }}
                      className="inline-flex items-center gap-1 hover:opacity-90"
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? "#ffffff" : (domain.color || "var(--primary)") }} />
                      <span className="truncate max-w-[150px]">{topic.title}</span>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        unpinLessonDB(auth.user?.id, topic.slug);
                      }}
                      className={`ml-1 p-0.5 rounded-full transition-colors ${
                        active
                          ? "hover:bg-white/20 text-white/90"
                          : "hover:bg-muted text-muted-foreground hover:text-destructive"
                      }`}
                      title={`Close ${topic.title}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <main className="flex-1">{children}</main>

        <footer className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-1 shrink-0 border-t border-border/40 mt-8">
          <GraduationCap className="h-3 w-3" />
          BackendMaster AI · {total} lessons across {domains.length} roadmaps
        </footer>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-md px-3 py-2 ${
        active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/60"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}