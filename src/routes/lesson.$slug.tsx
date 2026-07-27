import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { AiTeacher } from "@/components/AiTeacher";
import { Markdown } from "@/components/Markdown";
import { VoiceReader } from "@/components/VoiceReader";
import { findLessonMerged, findAdjacentMerged } from "@/lib/curriculum-extra";
import { useAuth } from "@/lib/useAuth";
import {
  fetchLesson,
  saveSharedLesson,
  saveUserOverride,
  toggleCompletion,
  toggleBookmarkDB,
  getPinnedDB,
  togglePinDB,
  getCompletions,
  getBookmarksDB,
  logActivity,
} from "@/lib/lesson-db";
import {
  clearCachedLesson,
  getCachedLesson,
  setCachedLesson,
  syncQueueItem,
  getPinnedLessons,
  togglePinnedLesson,
  type LessonContent,
} from "@/lib/storage";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  CheckCircle2,
  Circle,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Pin,
} from "lucide-react";
import React from "react";

import { LessonContentSkeleton } from "@/components/LessonContentSkeleton";

export const Route = createFileRoute("/lesson/$slug")({
  component: LessonPage,
  head: ({ params }) => {
    const found = findLessonMerged(params.slug);
    return {
      meta: [
        { title: found ? `${found.topic.title} — BackendMaster AI` : "Lesson" },
        { name: "description", content: found?.topic.summary ?? "Backend lesson." },
      ],
    };
  },
});

const SECTIONS: Array<{ key: keyof LessonContent; label: string; emoji: string }> = [
  { key: "overview", label: "Overview", emoji: "📖" },
  { key: "whyExists", label: "Why This Exists", emoji: "🤔" },
  { key: "theory", label: "Detailed Theory", emoji: "📚" },
  { key: "internalWorking", label: "Internal Working", emoji: "⚙️" },
  { key: "realWorldExamples", label: "Real-World Examples", emoji: "🌍" },
  { key: "advantages", label: "Advantages", emoji: "✅" },
  { key: "disadvantages", label: "Disadvantages", emoji: "⚠️" },
  { key: "bestPractices", label: "Best Practices", emoji: "🏆" },
  { key: "commonMistakes", label: "Common Mistakes", emoji: "🚫" },
  { key: "practicalUsage", label: "Practical Usage", emoji: "🏭" },
  { key: "interviewQuestions", label: "Interview Questions", emoji: "💬" },
  { key: "cheatsheet", label: "Cheatsheet", emoji: "📝" },
  { key: "prerequisites", label: "Prerequisites", emoji: "🔗" },
  { key: "revisionNotes", label: "Revision Notes", emoji: "🔁" },
];

function LessonPage() {
  return (
    <RequireAuth>
      <LessonContent />
    </RequireAuth>
  );
}

function LessonContent() {
  const { slug } = Route.useParams();
  const found = findLessonMerged(slug);
  const auth = useAuth();
  const userId = auth.user?.id;
  const [content, setContent] = useState<LessonContent | null>(() => getCachedLesson(slug));
  const [loading, setLoading] = useState(() => !getCachedLesson(slug));
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [pins, setPins] = useState<string[]>([]);
  const [activeVoiceSection, setActiveVoiceSection] = useState<number>(-1);
  const [isUserOverride, setIsUserOverride] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const mainEl = document.querySelector("main")?.parentElement;
    const target = mainEl || window;

    function handleScroll() {
      const scrollTop = mainEl ? mainEl.scrollTop : window.scrollY;
      setAtBottom(scrollTop > 250);
    }

    target.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => target.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const mainEl = document.querySelector("main")?.parentElement;
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    const mainEl = document.querySelector("main")?.parentElement;
    if (mainEl) mainEl.scrollTo({ top: mainEl.scrollHeight, behavior: "smooth" });
    else window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    const instantLocal = getCachedLesson(slug);
    if (instantLocal) {
      setContent(instantLocal);
      setLoading(false);
    } else {
      setContent(null);
      setLoading(true);
    }
    setError(null);
    setPins(getPinnedLessons());

    if (userId) {
      getCompletions(userId).then(setCompleted);
      getBookmarksDB(userId).then(setBookmarks);
      getPinnedDB(userId).then(setPins);
    }

    const handlePinsChanged = () => setPins(getPinnedLessons());
    window.addEventListener("backend_mastery:pins-updated", handlePinsChanged);

    fetchLesson(slug, userId)
      .then((cached) => {
        if (cached) {
          setContent(cached);
          setLoading(false);
          if (userId) logActivity(userId, "lesson_viewed", slug);
        } else {
          void generate(false);
        }
      })
      .catch(() => {
        if (!instantLocal) void generate(false);
      });

    return () => window.removeEventListener("backend_mastery:pins-updated", handlePinsChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, userId]);

  // Voice highlight listeners
  useEffect(() => {
    function handleChunk(e: Event) {
      const { index } = (e as CustomEvent).detail;
      if (!content) return;
      const sectionMap = buildChunkToSectionMap(content);
      const sectionIdx = sectionMap[index] ?? -1;
      setActiveVoiceSection(sectionIdx);
      if (sectionIdx >= 0 && sectionRefs.current[sectionIdx]) {
        sectionRefs.current[sectionIdx]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    function handleStop() {
      setActiveVoiceSection(-1);
    }
    window.addEventListener("voice-reader:chunk", handleChunk);
    window.addEventListener("voice-reader:stop", handleStop);
    return () => {
      window.removeEventListener("voice-reader:chunk", handleChunk);
      window.removeEventListener("voice-reader:stop", handleStop);
    };
  }, [content]);

  if (!found) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Lesson Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            The topic "{slug}" was not found in the curriculum catalog.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }
  const { domain, section, topic } = found;
  const adj = findAdjacentMerged(slug);
  const isDone = completed.includes(slug);
  const isBookmarked = bookmarks.includes(slug);
  const isPinned = pins.includes(slug);

  async function generate(isRegenerate: boolean) {
    setContent(null);
    setLoading(true);
    setError(null);
    if (isRegenerate) {
      clearCachedLesson(slug);
    }

    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title: topic.title,
          domain: domain.title,
          section: section.title,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        let displayError = errText;
        try {
          const parsedErr = JSON.parse(errText);
          displayError =
            parsedErr.message ||
            parsedErr.error ||
            "Regeneration is not possible today because todays limit reached";
          if (parsedErr.logs && Array.isArray(parsedErr.logs)) {
            const localLogs = JSON.parse(
              localStorage.getItem("backend_mastery:system_logs") || "[]",
            );
            localLogs.unshift({
              id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              created_at: new Date().toISOString(),
              slug,
              action: "generation_failed",
              metadata: {
                topicTitle: topic.title,
                error: displayError,
                message: displayError,
                details: parsedErr.details,
                logs: parsedErr.logs,
              },
            });
            localStorage.setItem(
              "backend_mastery:system_logs",
              JSON.stringify(localLogs.slice(0, 100)),
            );
          }
        } catch {
          displayError =
            errText || "Regeneration is not possible today because todays limit reached";
        }
        throw new Error(displayError);
      }
      const text = await res.text();
      const parsed = JSON.parse(text) as Omit<LessonContent, "generatedAt">;
      const full: LessonContent = { ...parsed, generatedAt: Date.now() };
      setContent(full);
      setCachedLesson(slug, full);
      if (isRegenerate && userId) {
        await saveUserOverride(userId, slug, full);
        setIsUserOverride(true);
        logActivity(userId, "lesson_regenerated", slug);
      } else {
        await saveSharedLesson(slug, topic.title, domain.title, section.title, full, userId);
        if (userId) logActivity(userId, "lesson_generated", slug);
      }
      syncQueueItem({
        slug,
        title: topic.title,
        domain: domain.title,
        section: section.title,
        status: "done",
      });
    } catch (e) {
      setError((e as Error).message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const visibleSections = content
    ? SECTIONS.filter((s) => {
        const v = content[s.key];
        return v && typeof v === "string";
      })
    : [];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-5 lg:px-10 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-4 flex items-center gap-1 flex-wrap">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/domain/$slug" params={{ slug: domain.slug }} className="hover:text-foreground">
            {domain.title}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate">{section.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="px-2 py-0.5 rounded-full text-white text-[10px] font-medium"
              style={{ background: domain.color }}
            >
              {domain.title}
            </span>
            <span>{section.title}</span>
          </div>
          <h1 className="mt-3 text-3xl lg:text-4xl font-bold leading-tight">{topic.title}</h1>
          <p className="mt-3 text-muted-foreground text-base">{topic.summary}</p>

          {isUserOverride && (
            <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10">
              ✏️ Your personal regeneration
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={async () => {
                if (userId) setCompleted(await toggleCompletion(userId, slug));
              }}
              className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${isDone ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
            >
              {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              {isDone ? "Completed" : "Mark complete"}
            </button>
            <button
              onClick={async () => {
                if (userId) setPins(await togglePinDB(userId, slug));
                else setPins(togglePinnedLesson(slug));
              }}
              className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-all ${
                isPinned
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40 font-semibold shadow-sm"
                  : "border-border hover:bg-muted"
              }`}
            >
              <Pin className={`h-4 w-4 ${isPinned ? "fill-amber-500 text-amber-500" : ""}`} />
              {isPinned ? "Pinned" : "Pin lesson"}
            </button>
            <button
              onClick={async () => {
                if (userId) setBookmarks(await toggleBookmarkDB(userId, slug));
              }}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-border hover:bg-muted"
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </button>
            {auth.isAdmin && (
              <button
                onClick={() => generate(true)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-border hover:bg-muted disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Regenerate lesson
              </button>
            )}
          </div>

          <div className="mt-4">
            <VoiceReader
              getText={() => buildReadableText(topic.title, content)}
              onTranscript={(t) =>
                window.dispatchEvent(new CustomEvent("ai-teacher:ask", { detail: t }))
              }
              lessonSlug={slug}
            />
          </div>
        </header>

        {/* Floating Scroll Controls */}
        <div className="fixed bottom-20 right-5 z-40 flex flex-col gap-2 items-center">
          <button
            onClick={scrollToTop}
            className="p-3 rounded-full bg-card/90 backdrop-blur-md border border-border shadow-xl hover:bg-muted text-foreground transition-all duration-200 hover:scale-110 active:scale-95 group"
            title="Scroll to Top"
          >
            <ArrowUp className="h-4 w-4 text-primary group-hover:-translate-y-0.5 transition-transform" />
          </button>
          <button
            onClick={scrollToBottom}
            className="p-3 rounded-full bg-card/90 backdrop-blur-md border border-border shadow-xl hover:bg-muted text-foreground transition-all duration-200 hover:scale-110 active:scale-95 group"
            title="Scroll to Bottom"
          >
            <ArrowDown className="h-4 w-4 text-primary group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        {loading && !content && <LoadingState topicTitle={topic.title} />}
        {error && !content && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 text-destructive text-sm p-4">
            {error}
            <button onClick={() => generate(false)} className="ml-3 underline underline-offset-2">
              Try again
            </button>
          </div>
        )}

        {content && (
          <>
            {visibleSections.map((s, idx) => {
              const value = content[s.key] as string;
              return (
                <SectionCard
                  key={s.key}
                  title={s.label}
                  emoji={s.emoji}
                  isActive={activeVoiceSection === idx}
                  ref={(el) => {
                    sectionRefs.current[idx] = el;
                  }}
                >
                  <Markdown>{value}</Markdown>
                </SectionCard>
              );
            })}
            {content.mcqs?.length > 0 && (
              <SectionCard title="MCQs" emoji="🧠" isActive={false}>
                <McqList items={content.mcqs} />
              </SectionCard>
            )}
            {content.flashcards?.length > 0 && (
              <SectionCard title="Flashcards" emoji="🃏" isActive={false}>
                <Flashcards items={content.flashcards} />
              </SectionCard>
            )}
            {content.relatedTopics?.length > 0 && (
              <SectionCard title="Related Topics" emoji="🔗" isActive={false}>
                <ul className="flex flex-wrap gap-2">
                  {content.relatedTopics.map((r, i) => (
                    <li
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}
          </>
        )}

        {/* Prev/next */}
        <div className="mt-10 grid grid-cols-2 gap-3">
          {adj.prev ? (
            <Link
              to="/lesson/$slug"
              params={{ slug: adj.prev.topic.slug }}
              className="rounded-xl border border-border p-4 hover:border-primary/30 hover:shadow-sm"
            >
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                Previous
              </div>
              <div className="text-sm font-medium mt-1 truncate">{adj.prev.topic.title}</div>
            </Link>
          ) : (
            <div />
          )}
          {adj.next ? (
            <Link
              to="/lesson/$slug"
              params={{ slug: adj.next.topic.slug }}
              className="rounded-xl border border-border p-4 hover:border-primary/30 hover:shadow-sm text-right"
            >
              <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                Next
                <ArrowRight className="h-3 w-3" />
              </div>
              <div className="text-sm font-medium mt-1 truncate">{adj.next.topic.title}</div>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
      <AiTeacher topicTitle={topic.title} />
    </AppShell>
  );
}

const SectionCard = React.forwardRef<
  HTMLElement,
  { title: string; emoji: string; isActive: boolean; children: React.ReactNode }
>(function SectionCard({ title, emoji, isActive, children }, ref) {
  return (
    <section
      ref={ref}
      data-voice-active={isActive ? "true" : undefined}
      className={`mb-5 rounded-2xl border bg-card p-5 lg:p-6 transition-all duration-500 ${isActive ? "voice-active-section border-primary/60 shadow-[0_0_20px_oklch(0.72_0.18_270_/_0.25)]" : "border-border"}`}
    >
      <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
        <span>{emoji}</span>
        {title}
      </h2>
      {children}
    </section>
  );
});

function buildChunkToSectionMap(content: LessonContent): number[] {
  const map: number[] = [];
  let sectionIdx = 0;
  for (const s of SECTIONS) {
    const v = content[s.key];
    if (typeof v !== "string" || !v.trim()) continue;
    const cleaned = `${s.label}. ${v.replace(/[#*_`>[\]()]/g, " ")}`;
    const chunks = cleaned.match(/[^.!?\n]+[.!?\n]?/g) ?? [cleaned];
    for (let i = 0; i < chunks.length; i++) map.push(sectionIdx);
    sectionIdx++;
  }
  return map;
}

function buildReadableText(title: string, content: LessonContent | null): string {
  if (!content) return title;
  const parts: string[] = [title];
  for (const s of SECTIONS) {
    const v = content[s.key];
    if (typeof v === "string" && v.trim())
      parts.push(`${s.label}. ${v.replace(/[#*_`>[\]()]/g, " ")}`);
  }
  return parts.join(". \n");
}

function LoadingState({ topicTitle }: { topicTitle?: string }) {
  return <LessonContentSkeleton topicTitle={topicTitle} />;
}

function McqList({
  items,
}: {
  items: Array<{ q: string; options: string[]; answer: number; explanation: string }>;
}) {
  return (
    <div className="space-y-4">
      {items.map((m, i) => (
        <Mcq key={i} item={m} index={i} />
      ))}
    </div>
  );
}

function Mcq({
  item,
  index,
}: {
  item: { q: string; options: string[]; answer: number; explanation: string };
  index: number;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="text-sm font-medium mb-2">
        <span className="text-muted-foreground">Q{index + 1}.</span> {item.q}
      </div>
      <div className="grid gap-2">
        {item.options.map((o, i) => {
          const isCorrect = i === item.answer;
          const isPicked = picked === i;
          const showResult = picked !== null;
          return (
            <button
              key={i}
              onClick={() => picked === null && setPicked(i)}
              className={`text-left text-sm px-3 py-2 rounded-lg border transition-colors ${showResult && isCorrect ? "border-green-500 bg-green-500/10" : showResult && isPicked && !isCorrect ? "border-destructive bg-destructive/10" : "border-border hover:bg-muted"}`}
            >
              <span className="font-medium mr-1">{String.fromCharCode(65 + i)}.</span>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Explanation: </strong>
          {item.explanation}
        </div>
      )}
    </div>
  );
}

function Flashcards({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((f, i) => (
        <Flashcard key={i} f={f} />
      ))}
    </div>
  );
}

function Flashcard({ f }: { f: { q: string; a: string } }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      onClick={() => setFlipped((v) => !v)}
      className="text-left rounded-xl border border-border p-4 min-h-[110px] hover:border-primary/40 transition-colors bg-card"
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {flipped ? "Answer" : "Question"}
      </div>
      <div className="text-sm mt-1">{flipped ? f.a : f.q}</div>
    </button>
  );
}
