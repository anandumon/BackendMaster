import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  getPdfs,
  getExtractedDomains,
  allTopicsMerged,
  getAllCompletenessReports,
  type UploadedPdf,
  type CompletenessReport,
} from "@/lib/curriculum-extra";
import { getQueue, syncQueueItem, type QueueItem, type LessonContent } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import { allTopics, DOMAINS } from "@/lib/curriculum";
import { saveSharedLesson } from "@/lib/lesson-db";
import { useAuth } from "@/lib/useAuth";
import {
  Upload,
  ListTree,
  PlayCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Users,
  BarChart3,
  Download,
  Loader2,
  Square,
  SkipForward,
  XCircle,
  Search,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

type GenerationStatus = "idle" | "running" | "paused" | "done" | "cancelled";
type LessonJob = {
  slug: string;
  title: string;
  domain: string;
  section: string;
  status: "pending" | "generating" | "done" | "error" | "skipped";
  error?: string;
};

function AdminOverview() {
  const auth = useAuth();
  const [pdfs, setPdfs] = useState<UploadedPdf[]>([]);
  const [extractedDomains, setExtractedDomains] = useState<number>(0);
  const [queue, setQueueState] = useState<QueueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [reports, setReports] = useState<CompletenessReport[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [sharedLessonCount, setSharedLessonCount] = useState(0);

  // ── Targeted topic search & selection state ──
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());

  // ── Bulk lesson generation state ──
  const [genStatus, setGenStatus] = useState<GenerationStatus>("idle");
  const [jobs, setJobs] = useState<LessonJob[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const cancelRef = useRef(false);
  const pauseRef = useRef(false);

  useEffect(() => {
    const syncAll = () => {
      try {
        setPdfs(getPdfs());
      } catch {
        /* ignore */
      }
      try {
        setExtractedDomains(getExtractedDomains().length);
      } catch {
        /* ignore */
      }
      try {
        setQueueState(getQueue());
      } catch {
        /* ignore */
      }
      try {
        setTotal(allTopicsMerged().length);
      } catch {
        /* ignore */
      }
      try {
        setReports(getAllCompletenessReports());
      } catch {
        /* ignore */
      }

      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .then(
          ({ count }) => setUserCount(Math.max(count ?? 0, auth.user ? 1 : 0)),
          () => {
            if (auth.user) setUserCount(1);
          },
        );

      supabase
        .from("user_completions")
        .select("slug", { count: "exact", head: true })
        .then(
          ({ count }) => setTotalCompletions(count ?? 0),
          () => {},
        );

      supabase
        .from("lessons")
        .select("slug", { count: "exact", head: true })
        .then(
          ({ count }) => setSharedLessonCount(count ?? 0),
          () => {},
        );
    };

    syncAll();
    window.addEventListener("storage", syncAll);
    window.addEventListener("backend_mastery:queue-updated", syncAll);
    window.addEventListener("backend_mastery:cache-updated", syncAll);

    return () => {
      window.removeEventListener("storage", syncAll);
      window.removeEventListener("backend_mastery:queue-updated", syncAll);
      window.removeEventListener("backend_mastery:cache-updated", syncAll);
    };
  }, [auth.user]);

  const parsing = pdfs.filter((p) => p.status === "parsing").length;
  const done = pdfs.filter((p) => p.status === "done").length;
  const errors = pdfs.filter((p) => p.status === "error").length;
  const running = queue.filter((q) => q.status === "running" || q.status === "pending").length;
  const qDone = queue.filter((q) => q.status === "done").length;
  const qErrors = queue.filter((q) => q.status === "error").length;

  // ── Bulk lesson generation ──
  async function startBulkGeneration() {
    cancelRef.current = false;
    pauseRef.current = false;

    // Get all topics (including extracted ones) and check which ones already have shared lessons
    const topics = allTopicsMerged();
    const { data: existingLessons } = await supabase.from("lessons").select("slug");
    const existingSlugs = new Set((existingLessons ?? []).map((l) => l.slug));

    const jobList: LessonJob[] = topics.map((t) => ({
      slug: t.topic.slug,
      title: t.topic.title,
      domain: t.domain.title,
      section: t.section.title,
      status: existingSlugs.has(t.topic.slug) ? "skipped" : "pending",
    }));

    setJobs(jobList);
    setGenStatus("running");

    // Find first pending job
    const firstPending = jobList.findIndex((j) => j.status === "pending");
    if (firstPending === -1) {
      setGenStatus("done");
      return;
    }

    setCurrentIdx(firstPending);
    await runJobs(jobList, firstPending);
  }

  async function startTargetedGeneration() {
    if (selectedSlugs.size === 0) return;
    cancelRef.current = false;
    pauseRef.current = false;

    const topics = allTopicsMerged().filter((t) => selectedSlugs.has(t.topic.slug));
    const jobList: LessonJob[] = topics.map((t) => ({
      slug: t.topic.slug,
      title: t.topic.title,
      domain: t.domain.title,
      section: t.section.title,
      status: "pending",
    }));

    setJobs(jobList);
    setGenStatus("running");
    setCurrentIdx(0);
    await runJobs(jobList, 0);
  }

  async function runJobs(jobList: LessonJob[], startFrom: number) {
    const updatedJobs = [...jobList];

    for (let i = startFrom; i < updatedJobs.length; i++) {
      if (cancelRef.current) {
        setGenStatus("cancelled");
        return;
      }

      // Handle pause
      while (pauseRef.current) {
        setGenStatus("paused");
        await new Promise((r) => setTimeout(r, 500));
        if (cancelRef.current) {
          setGenStatus("cancelled");
          return;
        }
      }
      setGenStatus("running");

      if (updatedJobs[i].status !== "pending") continue;
      setCurrentIdx(i);

      // Mark as generating
      updatedJobs[i] = { ...updatedJobs[i], status: "generating" };
      setJobs([...updatedJobs]);

      try {
        const res = await fetch("/api/lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: updatedJobs[i].slug,
            title: updatedJobs[i].title,
            domain: updatedJobs[i].domain,
            section: updatedJobs[i].section,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          updatedJobs[i] = { ...updatedJobs[i], status: "error", error: errText.slice(0, 150) };
          setJobs([...updatedJobs]);

          // If rate limited, pause for 30 seconds
          if (res.status === 429) {
            pauseRef.current = true;
            setGenStatus("paused");
            await new Promise((r) => setTimeout(r, 30000));
            pauseRef.current = false;
            // Retry this same index
            updatedJobs[i] = { ...updatedJobs[i], status: "pending", error: undefined };
            setJobs([...updatedJobs]);
            i--; // retry
          }
          continue;
        }

        const text = await res.text();
        const parsed = JSON.parse(text) as Omit<LessonContent, "generatedAt">;
        const content: LessonContent = { ...parsed, generatedAt: Date.now() };

        // Save to shared lessons DB
        await saveSharedLesson(
          updatedJobs[i].slug,
          updatedJobs[i].title,
          updatedJobs[i].domain,
          updatedJobs[i].section,
          content,
          auth.user?.id,
        );
        syncQueueItem({
          slug: updatedJobs[i].slug,
          title: updatedJobs[i].title,
          domain: updatedJobs[i].domain,
          section: updatedJobs[i].section,
          status: "done",
        });

        updatedJobs[i] = { ...updatedJobs[i], status: "done" };
        setJobs([...updatedJobs]);

        // Update shared lesson count
        setSharedLessonCount((prev) => prev + 1);

        // Small delay between requests to avoid rate limiting
        await new Promise((r) => setTimeout(r, 2000));
      } catch (e) {
        updatedJobs[i] = { ...updatedJobs[i], status: "error", error: (e as Error).message };
        setJobs([...updatedJobs]);
      }
    }

    setGenStatus("done");
  }

  function togglePause() {
    pauseRef.current = !pauseRef.current;
    if (!pauseRef.current) setGenStatus("running");
  }

  function cancelGeneration() {
    cancelRef.current = true;
    pauseRef.current = false;
  }

  const jobsDone = jobs.filter((j) => j.status === "done").length;
  const jobsSkipped = jobs.filter((j) => j.status === "skipped").length;
  const jobsError = jobs.filter((j) => j.status === "error").length;
  const jobsPending = jobs.filter(
    (j) => j.status === "pending" || j.status === "generating",
  ).length;
  const jobsTotal = jobs.length;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total users" value={userCount} icon={<Users className="h-4 w-4" />} />
        <Stat
          label="Shared lessons"
          value={sharedLessonCount}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <Stat
          label="Total completions"
          value={totalCompletions}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <Stat label="Queue backlog" value={running} icon={<PlayCircle className="h-4 w-4" />} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Uploaded PDFs" value={pdfs.length} icon={<FileText className="h-4 w-4" />} />
        <Stat
          label="Extracted roadmaps"
          value={extractedDomains}
          icon={<ListTree className="h-4 w-4" />}
        />
        <Stat label="Total lessons" value={total} icon={<CheckCircle2 className="h-4 w-4" />} />
        <Stat label="Queue errors" value={qErrors} icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      {/* Targeted Topic Search & Selection Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-base flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" /> Target Specific Topics for Regeneration
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Search and pick single or multiple topics to regenerate without running all lessons.
            </div>
          </div>
          {selectedSlugs.size > 0 && (
            <button
              onClick={startTargetedGeneration}
              disabled={genStatus === "running"}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-95 disabled:opacity-50"
            >
              <PlayCircle className="h-4 w-4" /> Regenerate Selected ({selectedSlugs.size})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search topics by title, section, or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={() => {
              const filtered = allTopicsMerged().filter(
                (t) =>
                  t.topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  t.section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  t.domain.title.toLowerCase().includes(searchTerm.toLowerCase()),
              );
              if (selectedSlugs.size === filtered.length) {
                setSelectedSlugs(new Set());
              } else {
                setSelectedSlugs(new Set(filtered.map((t) => t.topic.slug)));
              }
            }}
            className="text-xs px-3 py-2 border border-border rounded-xl hover:bg-muted font-medium shrink-0"
          >
            {selectedSlugs.size > 0 ? "Deselect All" : "Select Filtered"}
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto border border-border/60 rounded-xl divide-y divide-border/40 text-xs">
          {allTopicsMerged()
            .filter(
              (t) =>
                t.topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.domain.title.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .slice(0, 50)
            .map((t) => {
              const isChecked = selectedSlugs.has(t.topic.slug);
              return (
                <label
                  key={`${t.domain.slug}-${t.section.slug}-${t.topic.slug}`}
                  className={`flex items-center justify-between px-3 py-2 hover:bg-muted/50 cursor-pointer ${
                    isChecked ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const next = new Set(selectedSlugs);
                        if (e.target.checked) next.add(t.topic.slug);
                        else next.delete(t.topic.slug);
                        setSelectedSlugs(next);
                      }}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="font-medium truncate">{t.topic.title}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                    {t.domain.title} › {t.section.title}
                  </span>
                </label>
              );
            })}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          to="/admin/pdfs"
          className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
        >
          <Upload className="h-5 w-5 text-primary" />
          <div className="mt-2 font-semibold">Upload &amp; parse a PDF</div>
          <div className="text-sm text-muted-foreground mt-1">
            Send a roadmap PDF to the AI extractor. It returns every node, subtopic and keyword.
          </div>
          <div className="text-xs mt-3 text-muted-foreground">
            {parsing} parsing · {done} done · {errors} failed
          </div>
        </Link>
        <Link
          to="/admin/topics"
          className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
        >
          <ListTree className="h-5 w-5 text-primary" />
          <div className="mt-2 font-semibold">Review extracted topics</div>
          <div className="text-sm text-muted-foreground mt-1">
            Rename, delete, or regenerate the AI lesson for any topic in the curriculum.
          </div>
          <div className="text-xs mt-3 text-muted-foreground">
            Base: {DOMAINS.length} roadmaps · Extracted: {extractedDomains}
          </div>
        </Link>
        <Link
          to="/admin/users"
          className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
        >
          <Users className="h-5 w-5 text-primary" />
          <div className="mt-2 font-semibold">Manage Users</div>
          <div className="text-sm text-muted-foreground mt-1">
            View all registered users, promote/demote admins, and monitor individual progress.
          </div>
          <div className="text-xs mt-3 text-muted-foreground">
            {userCount} users · {totalCompletions} total completions
          </div>
        </Link>
      </div>

      {/* Queue Summary */}
      {queue.length > 0 && (
        <Link
          to="/admin/queue"
          className="block rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
        >
          <PlayCircle className="h-5 w-5 text-primary" />
          <div className="mt-2 font-semibold">Regeneration Queue</div>
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
            <span>{running} pending/running</span>
            <span className="text-green-600 dark:text-green-400">{qDone} done</span>
            {qErrors > 0 && <span className="text-destructive">{qErrors} failed</span>}
          </div>
          {queue.length > 0 && (
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.round((qDone / queue.length) * 100)}%` }}
              />
            </div>
          )}
        </Link>
      )}

      {/* Completeness Reports */}
      {reports.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Curriculum Completeness
          </div>
          <div className="divide-y divide-border">
            {reports.map((r) => (
              <div key={r.pdfId} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  {r.status === "complete" && <ShieldCheck className="h-4 w-4 text-green-600" />}
                  {r.status === "partial" && <ShieldAlert className="h-4 w-4 text-amber-600" />}
                  {r.status === "incomplete" && <ShieldX className="h-4 w-4 text-red-600" />}
                  <span className="text-sm font-medium">{r.domainTitle}</span>
                  <span className="text-xs text-muted-foreground">({r.pdfName})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(r.coveragePercent, 100)}%`,
                        background:
                          r.coveragePercent >= 95
                            ? "oklch(0.6 0.2 145)"
                            : r.coveragePercent >= 70
                              ? "oklch(0.7 0.18 80)"
                              : "oklch(0.6 0.22 27)",
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium tabular-nums w-14 text-right">
                    {r.coveragePercent}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {r.actualNodeCount} / {r.expectedNodeCount} nodes extracted
                  {r.missingNodes.length > 0 && (
                    <span className="text-amber-600 dark:text-amber-400 ml-2">
                      · {r.missingNodes.length} missing
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pdfs.some((p) => p.quality?.warnings?.length) && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            Some PDFs had parsing warnings
          </div>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {pdfs
              .filter((p) => p.quality?.warnings?.length)
              .map((p) => (
                <li key={p.id}>
                  <strong className="text-foreground">{p.name}</strong>:{" "}
                  {p.quality!.warnings!.join("; ")}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
