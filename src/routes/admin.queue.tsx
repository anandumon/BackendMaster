import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  clearCachedLesson,
  getQueue,
  setCachedLesson,
  setQueue,
  type QueueItem,
  type QueueStep,
  QUEUE_STEPS,
} from "@/lib/storage";
import {
  filterQueue,
  getFailedItems,
  encodeShareableLink,
  decodeShareableLink,
  exportJSON,
  exportCSV,
  type QueueFilter,
} from "@/lib/queue-utils";
import { saveSharedLesson } from "@/lib/lesson-db";
import {
  Play,
  Pause,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Clock,
  Zap,
  Download,
  Link2,
  Filter,
  X,
  Ban,
} from "lucide-react";

export const Route = createFileRoute("/admin/queue")({
  component: QueuePage,
});

const STEP_LABELS: Record<QueueStep, string> = {
  parse: "Parse",
  extract: "Extract",
  generate: "Generate",
  finalize: "Finalize",
};
const STEP_COLORS: Record<QueueStep, string> = {
  parse: "bg-blue-500",
  extract: "bg-amber-500",
  generate: "bg-purple-500",
  finalize: "bg-green-500",
};

function QueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const cancelledRef = useRef(new Set<string>());
  const [, forceUpdate] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<QueueFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setItems(getQueue());
    refresh();
    const shared = decodeShareableLink();
    if (shared.length > 0) setSelected(new Set(shared));
    const interval = setInterval(() => forceUpdate((n) => n + 1), 1000);
    window.addEventListener("storage", refresh);
    window.addEventListener("backend_mastery:queue-updated", refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("backend_mastery:queue-updated", refresh);
    };
  }, []);

  function persist(next: QueueItem[]) {
    setQueue(next);
    setItems([...next]);
  }

  async function runOne(item: QueueItem): Promise<void> {
    const list = getQueue();
    const i = list.findIndex((x) => x.slug === item.slug);
    if (i < 0) return;
    if (cancelledRef.current.has(item.slug)) {
      list[i] = { ...item, status: "cancelled" };
      cancelledRef.current.delete(item.slug);
      persist(list);
      return;
    }
    const startedAt = Date.now();
    const steps: QueueStep[] = ["parse", "extract", "generate", "finalize"];
    list[i] = {
      ...item,
      status: "running",
      error: undefined,
      startedAt,
      currentStep: "parse",
      completedSteps: [],
    };
    persist(list);
    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: item.slug,
          title: item.title,
          domain: item.domain,
          section: item.section,
        }),
      });
      // Simulate step progression
      for (const step of steps.slice(0, 3)) {
        if (cancelledRef.current.has(item.slug)) {
          const cur = getQueue();
          const idx = cur.findIndex((x) => x.slug === item.slug);
          if (idx >= 0) cur[idx] = { ...cur[idx], status: "cancelled" };
          cancelledRef.current.delete(item.slug);
          persist(cur);
          return;
        }
        const cur = getQueue();
        const idx = cur.findIndex((x) => x.slug === item.slug);
        if (idx >= 0) {
          cur[idx] = {
            ...cur[idx],
            currentStep: step,
            completedSteps: steps.slice(0, steps.indexOf(step)),
          };
          persist(cur);
        }
      }
      if (!res.ok) {
        const text = await res.text();
        let displayError = "Regeneration is not possible today because todays limit reached";
        try {
          const parsed = JSON.parse(text);
          displayError = parsed.message || parsed.error || displayError;
          if (parsed.logs && Array.isArray(parsed.logs)) {
            const localLogs = JSON.parse(
              localStorage.getItem("backend_mastery:system_logs") || "[]",
            );
            localLogs.unshift({
              id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              created_at: new Date().toISOString(),
              slug: item.slug,
              action: "generation_failed",
              metadata: {
                topicTitle: item.title,
                error: displayError,
                message: displayError,
                details: parsed.details,
                logs: parsed.logs,
              },
            });
            localStorage.setItem(
              "backend_mastery:system_logs",
              JSON.stringify(localLogs.slice(0, 100)),
            );
          }
        } catch {
          displayError = text.slice(0, 200) || displayError;
        }
        throw Object.assign(new Error(displayError), {
          httpStatus: res.status,
          responseBody: text,
          failedStep: "generate" as QueueStep,
        });
      }
      const json = await res.json();
      clearCachedLesson(item.slug);
      const fullContent = { ...json, generatedAt: Date.now() };
      setCachedLesson(item.slug, fullContent);
      void saveSharedLesson(item.slug, item.title, item.domain, item.section, fullContent);

      const cur = getQueue();
      const idx = cur.findIndex((x) => x.slug === item.slug);
      const completedAt = Date.now();
      if (idx >= 0)
        cur[idx] = {
          ...cur[idx],
          status: "done",
          completedAt,
          duration: completedAt - startedAt,
          currentStep: undefined,
          completedSteps: steps,
        };
      persist(cur);
    } catch (e: unknown) {
      const err = e as Error & {
        failedStep?: QueueStep;
        httpStatus?: number;
        responseBody?: string;
      };
      const cur = getQueue();
      const idx = cur.findIndex((x) => x.slug === item.slug);
      if (idx >= 0)
        cur[idx] = {
          ...cur[idx],
          status: "error",
          error: err.message || "Unknown error",
          retryCount: (cur[idx].retryCount ?? 0) + 1,
          failedStep: err.failedStep ?? "generate",
          httpStatus: err.httpStatus,
          stackTrace: err.stack,
          responseBody: err.responseBody,
          currentStep: undefined,
        };
      persist(cur);
    }
  }

  async function runAll() {
    if (runningRef.current) return;
    runningRef.current = true;
    setRunning(true);
    try {
      while (runningRef.current) {
        const next = getQueue().find((x) => x.status === "pending");
        if (!next) break;
        await runOne(next);
        await new Promise((r) => setTimeout(r, 500));
      }
    } finally {
      runningRef.current = false;
      setRunning(false);
    }
  }

  function pause() {
    runningRef.current = false;
    setRunning(false);
  }

  function cancelItem(slug: string) {
    cancelledRef.current.add(slug);
    const list = getQueue().map((x) =>
      x.slug === slug && x.status === "pending" ? { ...x, status: "cancelled" as const } : x,
    );
    persist(list);
  }

  function retry(item: QueueItem) {
    const list = getQueue().map((x) =>
      x.slug === item.slug
        ? {
            ...x,
            status: "pending" as const,
            error: undefined,
            failedStep: undefined,
            httpStatus: undefined,
            stackTrace: undefined,
            responseBody: undefined,
            currentStep: undefined,
            completedSteps: undefined,
          }
        : x,
    );
    persist(list);
  }

  function retryAllFailed() {
    const list = getQueue().map((x) =>
      x.status === "error"
        ? {
            ...x,
            status: "pending" as const,
            error: undefined,
            failedStep: undefined,
            httpStatus: undefined,
            stackTrace: undefined,
            responseBody: undefined,
            currentStep: undefined,
            completedSteps: undefined,
          }
        : x,
    );
    persist(list);
  }

  function retrySelected() {
    const list = getQueue().map((x) =>
      selected.has(x.slug) && x.status === "error"
        ? {
            ...x,
            status: "pending" as const,
            error: undefined,
            failedStep: undefined,
            httpStatus: undefined,
            stackTrace: undefined,
            responseBody: undefined,
            currentStep: undefined,
            completedSteps: undefined,
          }
        : x,
    );
    persist(list);
    setSelected(new Set());
  }

  function remove(slug: string) {
    persist(getQueue().filter((x) => x.slug !== slug));
  }
  function clearDone() {
    persist(getQueue().filter((x) => x.status !== "done"));
  }

  function toggleSelect(slug: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(slug)) n.delete(slug);
      else n.add(slug);
      return n;
    });
  }

  function copyShareableLink() {
    const slugs = Array.from(selected);
    if (slugs.length === 0) {
      alert("Select failed items first.");
      return;
    }
    const url = encodeShareableLink(slugs);
    navigator.clipboard
      .writeText(url)
      .then(() => alert("Link copied!"))
      .catch(() => {
        prompt("Copy this link:", url);
      });
  }

  const filtered = filterQueue(items, filter);
  const stats = {
    pending: items.filter((x) => x.status === "pending").length,
    running: items.filter((x) => x.status === "running").length,
    done: items.filter((x) => x.status === "done").length,
    error: items.filter((x) => x.status === "error").length,
  };
  const completedItems = items.filter((x) => x.status === "done" && x.duration);
  const avgDuration =
    completedItems.length > 0
      ? completedItems.reduce((sum, x) => sum + (x.duration ?? 0), 0) / completedItems.length
      : 0;
  const remaining = stats.pending + stats.running;
  const etaMs = avgDuration > 0 ? remaining * avgDuration : 0;
  const failedItems = getFailedItems(items);
  const uniqueHttpStatuses = [
    ...new Set(failedItems.map((x) => x.httpStatus).filter(Boolean)),
  ] as number[];
  const uniquePdfIds = [...new Set(items.map((x) => x.pdfId).filter(Boolean))] as string[];

  const pdfGroups = new Map<string, QueueItem[]>();
  const ungrouped: QueueItem[] = [];
  for (const it of filtered) {
    if (it.pdfId) {
      if (!pdfGroups.has(it.pdfId)) pdfGroups.set(it.pdfId, []);
      pdfGroups.get(it.pdfId)!.push(it);
    } else ungrouped.push(it);
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {running ? (
          <button
            onClick={pause}
            className="text-sm font-medium inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 text-white"
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>
        ) : (
          <button
            onClick={runAll}
            disabled={stats.pending === 0}
            className="text-sm font-medium inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            Run {stats.pending} pending
          </button>
        )}
        {stats.error > 0 && (
          <button
            onClick={retryAllFailed}
            className="text-sm inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/5"
          >
            <RotateCcw className="h-4 w-4" />
            Retry all failed ({stats.error})
          </button>
        )}
        {selected.size > 0 && failedItems.some((x) => selected.has(x.slug)) && (
          <button
            onClick={retrySelected}
            className="text-sm inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary/5"
          >
            <RotateCcw className="h-4 w-4" />
            Re-run selected (
            {[...selected].filter((s) => failedItems.some((f) => f.slug === s)).length})
          </button>
        )}
        <button
          onClick={clearDone}
          disabled={stats.done === 0}
          className="text-sm inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Clear completed
        </button>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`text-sm inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border ${showFilters || Object.values(filter).some(Boolean) ? "border-primary text-primary bg-primary/5" : "border-border"}`}
        >
          <Filter className="h-4 w-4" />
          Filters{Object.values(filter).some(Boolean) ? " ●" : ""}
        </button>

        {/* Export & Share */}
        <div className="relative">
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="text-sm inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            Export errors
          </button>
          {exportMenuOpen && (
            <div className="absolute top-full mt-1 right-0 z-20 bg-card border border-border rounded-xl shadow-lg p-1 min-w-[180px]">
              <button
                onClick={() => {
                  exportJSON(failedItems, "queue-failures");
                  setExportMenuOpen(false);
                }}
                className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-muted"
              >
                All failures (JSON)
              </button>
              <button
                onClick={() => {
                  exportCSV(failedItems, "queue-failures");
                  setExportMenuOpen(false);
                }}
                className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-muted"
              >
                All failures (CSV)
              </button>
              {uniquePdfIds.map((pid) => (
                <button
                  key={pid}
                  onClick={() => {
                    exportJSON(
                      failedItems.filter((x) => x.pdfId === pid),
                      `failures-pdf-${pid.slice(0, 8)}`,
                    );
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-muted truncate"
                >
                  PDF batch {pid.slice(0, 8)}… (JSON)
                </button>
              ))}
              {selected.size > 0 && (
                <button
                  onClick={() => {
                    exportJSON(
                      items.filter((x) => selected.has(x.slug)),
                      "selected-failures",
                    );
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-muted"
                >
                  Selected ({selected.size}) JSON
                </button>
              )}
            </div>
          )}
        </div>
        {selected.size > 0 && (
          <button
            onClick={copyShareableLink}
            className="text-sm inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-muted"
          >
            <Link2 className="h-4 w-4" />
            Copy link ({selected.size})
          </button>
        )}
        <div className="ml-auto text-xs text-muted-foreground">
          {stats.pending} pending · {stats.running} running · {stats.done} done · {stats.error}{" "}
          errors
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-border bg-card">
          <span className="text-xs font-medium text-muted-foreground">Step:</span>
          {QUEUE_STEPS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter((f) => ({ ...f, step: f.step === s ? undefined : s }))}
              className={`text-xs px-2 py-1 rounded-full border ${filter.step === s ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
            >
              {STEP_LABELS[s]}
            </button>
          ))}
          <span className="text-xs font-medium text-muted-foreground ml-2">HTTP:</span>
          {uniqueHttpStatuses.map((code) => (
            <button
              key={code}
              onClick={() =>
                setFilter((f) => ({ ...f, httpStatus: f.httpStatus === code ? undefined : code }))
              }
              className={`text-xs px-2 py-1 rounded-full border ${filter.httpStatus === code ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
            >
              {code}
            </button>
          ))}
          <span className="text-xs font-medium text-muted-foreground ml-2">Status:</span>
          {(["error", "pending", "done", "cancelled"] as const).map((st) => (
            <button
              key={st}
              onClick={() =>
                setFilter((f) => ({ ...f, statusFilter: f.statusFilter === st ? undefined : st }))
              }
              className={`text-xs px-2 py-1 rounded-full border ${filter.statusFilter === st ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
            >
              {st}
            </button>
          ))}
          {Object.values(filter).some(Boolean) && (
            <button
              onClick={() => setFilter({})}
              className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full border border-border text-destructive"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      )}

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span className="font-medium text-foreground">
              Progress: {stats.done} / {items.length}
            </span>
            {etaMs > 0 && remaining > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />~{formatDuration(etaMs)} remaining
              </span>
            )}
            {avgDuration > 0 && (
              <span className="inline-flex items-center gap-1">
                <Zap className="h-3 w-3" />~{formatDuration(avgDuration)} / lesson
              </span>
            )}
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${items.length > 0 ? Math.round((stats.done / items.length) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Grouped by PDF */}
      {Array.from(pdfGroups).map(([pdfId, group]) => {
        const groupDone = group.filter((x) => x.status === "done").length;
        return (
          <div key={pdfId} className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                PDF: {group[0]?.domain || "Unknown"} ({groupDone}/{group.length})
              </span>
              <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round((groupDone / group.length) * 100)}%` }}
                />
              </div>
            </div>
            <ul className="divide-y divide-border">
              {group.map((it) => (
                <QueueRow
                  key={it.slug}
                  item={it}
                  isSelected={selected.has(it.slug)}
                  onToggleSelect={() => toggleSelect(it.slug)}
                  onRetry={() => retry(it)}
                  onRemove={() => remove(it.slug)}
                  onCancel={() => cancelItem(it.slug)}
                />
              ))}
            </ul>
          </div>
        );
      })}

      {/* Ungrouped */}
      {ungrouped.length > 0 && (
        <div className="rounded-2xl border border-border bg-card">
          {ungrouped.length > 0 && pdfGroups.size > 0 && (
            <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground">
              Individual topics
            </div>
          )}
          <ul className="divide-y divide-border">
            {ungrouped.map((it) => (
              <QueueRow
                key={it.slug}
                item={it}
                isSelected={selected.has(it.slug)}
                onToggleSelect={() => toggleSelect(it.slug)}
                onRetry={() => retry(it)}
                onRemove={() => remove(it.slug)}
                onCancel={() => cancelItem(it.slug)}
              />
            ))}
          </ul>
        </div>
      )}

      {items.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground text-center">
          Queue is empty. Add topics from the Topics tab or use "Regenerate all" on a PDF.
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Regeneration runs one lesson at a time in this browser tab. Keep the tab open while running.
        Cached lessons are stored per-topic in localStorage.
      </p>
    </div>
  );
}

function QueueRow({
  item,
  isSelected,
  onToggleSelect,
  onRetry,
  onRemove,
  onCancel,
}: {
  item: QueueItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onRetry: () => void;
  onRemove: () => void;
  onCancel: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const elapsed =
    item.status === "running" && item.startedAt
      ? Date.now() - item.startedAt
      : (item.duration ?? 0);

  return (
    <li className={`px-4 py-3 ${isSelected ? "bg-primary/5" : ""}`}>
      <div className="flex items-center gap-3">
        {item.status === "error" && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-4 w-4 rounded border-border accent-primary"
          />
        )}
        <StatusIcon status={item.status} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{item.title}</div>
          <div className="text-xs text-muted-foreground truncate">
            {item.domain} · {item.section}
            {elapsed > 0 && (
              <span className="ml-2 inline-flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {formatDuration(elapsed)}
              </span>
            )}
            {item.retryCount && item.retryCount > 0 && (
              <span className="ml-2 text-amber-600">· retry #{item.retryCount}</span>
            )}
          </div>
          {/* Step progress */}
          {(item.status === "running" || item.completedSteps?.length) && (
            <div className="flex items-center gap-1 mt-1">
              {QUEUE_STEPS.map((step) => {
                const done = item.completedSteps?.includes(step);
                const active = item.currentStep === step;
                const failed = item.failedStep === step;
                return (
                  <span
                    key={step}
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${failed ? "bg-destructive/15 text-destructive" : done ? "bg-green-500/15 text-green-700 dark:text-green-400" : active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    {STEP_LABELS[step]}
                    {active && <Loader2 className="h-2.5 w-2.5 inline ml-0.5 animate-spin" />}
                  </span>
                );
              })}
            </div>
          )}
          {item.error && (
            <div className="mt-1">
              <div className="text-xs text-destructive">{item.error}</div>
              {item.httpStatus && (
                <span className="text-[10px] text-muted-foreground">HTTP {item.httpStatus}</span>
              )}
              {(item.stackTrace || item.responseBody) && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="ml-2 text-[10px] text-primary hover:underline"
                >
                  {expanded ? "Hide details" : "Show details"}
                </button>
              )}
            </div>
          )}
          {expanded && (
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {item.stackTrace && (
                <div className="text-[10px] font-mono bg-muted p-2 rounded-lg whitespace-pre-wrap break-all">
                  {item.stackTrace}
                </div>
              )}
              {item.responseBody && (
                <div className="text-[10px] font-mono bg-muted p-2 rounded-lg whitespace-pre-wrap break-all">
                  <span className="text-muted-foreground">Response: </span>
                  {item.responseBody.slice(0, 2000)}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {(item.status === "pending" || item.status === "running") && (
            <button
              onClick={onCancel}
              title="Cancel"
              className="p-1.5 rounded-md hover:bg-muted text-amber-600"
            >
              <Ban className="h-4 w-4" />
            </button>
          )}
          {(item.status === "error" || item.status === "done" || item.status === "cancelled") && (
            <button onClick={onRetry} title="Requeue" className="p-1.5 rounded-md hover:bg-muted">
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button onClick={onRemove} className="p-1.5 rounded-md hover:bg-muted text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}

function StatusIcon({ status }: { status: QueueItem["status"] }) {
  if (status === "running") return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
  if (status === "done")
    return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
  if (status === "error") return <AlertTriangle className="h-4 w-4 text-destructive" />;
  if (status === "cancelled") return <Ban className="h-4 w-4 text-amber-600" />;
  return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40" />;
}

function formatDuration(ms: number): string {
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  if (mins < 60) return `${mins}m ${rem}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}
