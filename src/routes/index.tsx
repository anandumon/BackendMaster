import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/useAuth";
import { useEffect, useState } from "react";
import {
  getCompletions,
  getBookmarksDB,
  getRecentActivity,
  getPinnedDB,
  unpinLessonDB,
} from "@/lib/lesson-db";
import { useGenerationState } from "@/lib/generation-state";
import { useAllDomains, allTopicsMerged, findLessonMerged } from "@/lib/curriculum-extra";
import { getPinnedLessons, getCachedUserDisplayName } from "@/lib/storage";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Target,
  Flame,
  Activity,
  Clock,
  Loader2,
  Pin,
  Layers,
  X,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}

function DashboardContent() {
  const auth = useAuth();
  const genState = useGenerationState();
  const domains = useAllDomains();
  const [completed, setCompleted] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [pinnedSlugs, setPinnedSlugs] = useState<string[]>([]);
  const [recentActivity, setRecentActivity] = useState<
    Array<{ id?: string; action: string; slug?: string | null; created_at: string }>
  >([]);

  const rawName = auth.user?.user_metadata?.display_name || auth.user?.email?.split("@")[0];
  const userName = rawName || getCachedUserDisplayName() || "learner";

  const allTopics = allTopicsMerged();
  const total = allTopics.length;
  const progressPct = total > 0 ? Math.round((completed.length / total) * 100) : 0;
  const nextUp = allTopics.find((x) => !completed.includes(x.topic.slug));

  useEffect(() => {
    const loadData = () => {
      setPinnedSlugs(getPinnedLessons());
      if (auth.user) {
        const uid = auth.user.id;
        getCompletions(uid).then(setCompleted);
        getBookmarksDB(uid).then(setBookmarks);
        getPinnedDB(uid).then(setPinnedSlugs);
        getRecentActivity(uid, 10).then(setRecentActivity);
      }
    };

    loadData();

    const handlePinsChanged = () => setPinnedSlugs(getPinnedLessons());
    window.addEventListener("backend_mastery:pins-updated", handlePinsChanged);
    return () => window.removeEventListener("backend_mastery:pins-updated", handlePinsChanged);
  }, [auth.user]);

  // Derive pinned lesson items
  const pinnedItems = pinnedSlugs
    .map((slug) => findLessonMerged(slug))
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const domainNamesSummary = domains
    .slice(0, 6)
    .map((d) => d.title)
    .join(", ");

  // Double domains for smooth marquee loop
  const marqueeDomains = domains.length > 0 ? [...domains, ...domains] : [];

  return (
    <AppShell>
      <style>{`
        @keyframes marquee-left-loop {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .marquee-container:hover .marquee-track {
          animation-play-state: paused !important;
        }
        @keyframes text-glow-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animated-heading-text {
          background: linear-gradient(135deg, #ffffff 0%, #a5f3fc 40%, #fef08a 80%, #ffffff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: text-glow-flow 6s ease infinite;
        }
      `}</style>
      <div className="max-w-6xl mx-auto px-5 lg:px-10 py-8 lg:py-12 space-y-10">
        {/* 1. Hero Banner */}
        <section
          className="rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden"
          style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}
        >
          <div
            className="absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--primary-glow)" }}
          />
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest bg-white/10 border border-white/20 backdrop-blur-md px-3 py-1 rounded-full opacity-95 mb-4 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>AI Learning Platform</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight max-w-3xl">
              <span className="animated-heading-text">Welcome back, {userName}</span>
              <span className="inline-block animate-bounce ml-2">😁</span>
              <span className="animated-heading-text">!</span>
            </h1>
            <p className="mt-4 text-white/90 max-w-2xl text-base lg:text-lg leading-relaxed font-normal">
              Learn at your own pace with structured roadmaps, detailed theory, practical examples,
              coding challenges, project-based learning, and personalized progress tracking.
            </p>
            {nextUp && (
              <Link
                to="/lesson/$slug"
                params={{ slug: nextUp.topic.slug }}
                className="mt-6 inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-full hover:bg-white/95 transition-all hover:scale-105 shadow-xl group"
              >
                <span>Resume Learning</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </section>

        {/* 2. Background Generation Status Card (if active) */}
        {genState.status === "generating" && (
          <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Active Roadmap Generation: {genState.activeRoadmapTitle}
              </div>
              <span className="text-xs font-semibold text-primary">
                {genState.progress.percent}%
              </span>
            </div>

            <div className="space-y-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${genState.progress.percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>
                  Topic {genState.progress.completed + 1}/{genState.progress.total}:{" "}
                  <strong className="text-foreground">{genState.currentTopicTitle}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-primary" /> Est. remaining: ~
                  {genState.estimatedSecondsRemaining}s
                </span>
              </div>
            </div>
          </section>
        )}

        {/* 3. Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<BookOpen className="h-4 w-4 text-blue-500" />}
            label="Total lessons"
            value={total.toString()}
          />
          <StatCard
            icon={<Target className="h-4 w-4 text-amber-500" />}
            label="Progress"
            value={`${progressPct}%`}
          />
          <StatCard
            icon={<Flame className="h-4 w-4 text-emerald-500" />}
            label="Completed"
            value={completed.length.toString()}
          />
          <StatCard
            icon={<Sparkles className="h-4 w-4 text-purple-500" />}
            label="Bookmarks"
            value={bookmarks.length.toString()}
          />
        </section>

        {/* 4. Learning Roadmaps (Infinite Moving Right-to-Left Loop Card Marquee) */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Learning Roadmaps</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Moving automatically right to left — hover over any card to pause and click to open
              </p>
            </div>
          </div>

          <div className="marquee-container relative overflow-hidden w-full py-2">
            <div
              className="marquee-track flex gap-5 w-max"
              style={{
                animation: "marquee-left-loop 35s linear infinite",
              }}
            >
              {marqueeDomains.map((d, index) => {
                const domainTopics = d.sections.reduce((s, sec) => s + sec.topics.length, 0);
                const done = d.sections
                  .flatMap((s) => s.topics)
                  .filter((t) => completed.includes(t.slug)).length;
                const pct = domainTopics ? Math.round((done / domainTopics) * 100) : 0;
                return (
                  <Link
                    key={`${d.slug}-${index}`}
                    to="/domain/$slug"
                    params={{ slug: d.slug }}
                    className="w-60 sm:w-64 shrink-0 group space-y-2.5 transition-all duration-300 cursor-pointer"
                  >
                    <div
                      className="relative h-36 sm:h-40 rounded-2xl overflow-hidden shadow-md group-hover:shadow-2xl group-hover:shadow-primary/25 transition-all duration-500 group-hover:-translate-y-2 p-5 flex flex-col justify-between text-white border border-white/15"
                      style={{
                        background: `linear-gradient(135deg, ${d.color || "oklch(0.6 0.2 250)"}, color-mix(in oklab, ${d.color || "oklch(0.6 0.2 250)"} 40%, black))`,
                      }}
                    >
                      {/* Shimmer Light Reflection Sweep Animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-3xl filter drop-shadow-md transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">
                          {d.icon}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-black/40 backdrop-blur px-2.5 py-0.5 rounded-full border border-white/10 group-hover:bg-white group-hover:text-black transition-colors">
                          {domainTopics} topics
                        </span>
                      </div>

                      <div className="relative z-10">
                        <div className="text-xs font-semibold text-white/90 flex items-center justify-between">
                          <span>{pct}% Completed</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase font-bold tracking-wider">
                            Explore →
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-black/35 overflow-hidden backdrop-blur border border-white/10">
                          <div
                            className="h-full rounded-full bg-white transition-all duration-500 shadow-sm"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="px-1">
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate flex items-center justify-between">
                        <span className="truncate">{d.title}</span>
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {d.tagline || `${domainTopics} structured lessons`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Pinned Lessons (Above Recent Activity) */}
        {pinnedItems.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pin className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                <h2 className="text-lg font-bold">Pinned Lessons Quick Switch</h2>
              </div>
              <span className="text-xs text-muted-foreground">{pinnedItems.length} pinned</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {pinnedItems.map(({ domain, section, topic }) => {
                const isDone = completed.includes(topic.slug);
                return (
                  <div
                    key={topic.slug}
                    className="group relative flex flex-col justify-between p-4 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground mb-1">
                        <span
                          className="px-2 py-0.5 rounded-full text-white"
                          style={{ background: domain.color }}
                        >
                          {domain.title}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isDone && <span className="text-emerald-500 font-bold">✓ Done</span>}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              unpinLessonDB(auth.user?.id, topic.slug);
                            }}
                            className="p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                            title={`Close / Unpin ${topic.title}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <Link
                        to="/lesson/$slug"
                        params={{ slug: topic.slug }}
                        className="block group-hover:text-primary transition-colors"
                      >
                        <h3 className="font-semibold text-sm line-clamp-1">{topic.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {section.title}
                        </p>
                      </Link>
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                      <Link
                        to="/lesson/$slug"
                        params={{ slug: topic.slug }}
                        className="text-xs font-medium text-primary inline-flex items-center gap-1 hover:underline"
                      >
                        Switch to lesson <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. Recent Activity (Moved to the very bottom) */}
        {recentActivity.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold">Recent Activity</h2>
            </div>
            <div className="rounded-2xl border border-border bg-card divide-y divide-border">
              {recentActivity.slice(0, 3).map((a, i) => (
                <div key={a.id || i} className="px-4 py-3 flex items-center gap-3">
                  <ActivityIcon action={a.action} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{a.slug || a.action}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.action.replace(/_/g, " ")}
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(a.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

function ActivityIcon({ action }: { action: string }) {
  if (action === "topic_completed") return <Flame className="h-4 w-4 text-green-500" />;
  if (action === "topic_bookmarked") return <Sparkles className="h-4 w-4 text-amber-500" />;
  if (action === "lesson_pinned") return <Pin className="h-4 w-4 text-amber-500" />;
  if (action === "lesson_viewed") return <BookOpen className="h-4 w-4 text-blue-500" />;
  if (action === "lesson_generated") return <Target className="h-4 w-4 text-purple-500" />;
  return <Activity className="h-4 w-4 text-muted-foreground" />;
}
