import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  allTopicsMerged,
  deleteTopic,
  renameTopic,
  subscribe,
  type FlatTopic,
} from "@/lib/curriculum-extra";
import { clearCachedLesson, getCachedLesson, getQueue, setQueue } from "@/lib/storage";
import { DOMAINS } from "@/lib/curriculum";
import { useGenerationState } from "@/lib/generation-state";
import { Search, Pencil, Trash2, RefreshCw, CheckCircle2, PlusSquare, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/topics")({
  component: TopicsPage,
});

function TopicsPage() {
  const [topics, setTopics] = useState<FlatTopic[]>([]);
  const [q, setQ] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [showExtractedOnly, setShowExtractedOnly] = useState(false);

  useEffect(() => {
    setTopics(allTopicsMerged());
    return subscribe(() => setTopics(allTopicsMerged()));
  }, []);

  const baseSlugs = useMemo(() => {
    const s = new Set<string>();
    for (const d of DOMAINS) for (const sec of d.sections) for (const t of sec.topics) s.add(t.slug);
    return s;
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return topics.filter((t) => {
      if (domainFilter !== "all" && t.domain.slug !== domainFilter) return false;
      if (showExtractedOnly && baseSlugs.has(t.topic.slug)) return false;
      if (!query) return true;
      return (
        t.topic.title.toLowerCase().includes(query) ||
        t.section.title.toLowerCase().includes(query) ||
        t.domain.title.toLowerCase().includes(query)
      );
    });
  }, [topics, q, domainFilter, showExtractedOnly, baseSlugs]);

  const domainOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of topics) map.set(t.domain.slug, t.domain.title);
    return Array.from(map, ([slug, title]) => ({ slug, title }));
  }, [topics]);

  function queueRegen(t: FlatTopic) {
    clearCachedLesson(t.topic.slug);
    const q = getQueue();
    if (q.some((x) => x.slug === t.topic.slug && (x.status === "pending" || x.status === "running"))) return;
    q.push({
      slug: t.topic.slug,
      title: t.topic.title,
      domain: t.domain.title,
      section: t.section.title,
      status: "pending",
    });
    setQueue(q);
    alert(`Queued "${t.topic.title}" for regeneration. Open the Regen queue tab to run it.`);
  }

  function queueAll() {
    const q = getQueue();
    const pending = new Set(q.filter((x) => x.status !== "done").map((x) => x.slug));
    let added = 0;
    for (const t of filtered) {
      if (pending.has(t.topic.slug)) continue;
      q.push({
        slug: t.topic.slug,
        title: t.topic.title,
        domain: t.domain.title,
        section: t.section.title,
        status: "pending",
      });
      pending.add(t.topic.slug);
      added++;
    }
    setQueue(q);
    alert(`Queued ${added} topics.`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search topics, sections, domains…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background"
          />
        </div>
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="text-sm rounded-lg border border-border bg-background px-3 py-2"
        >
          <option value="all">All roadmaps</option>
          {domainOptions.map((d) => (
            <option key={d.slug} value={d.slug}>{d.title}</option>
          ))}
        </select>
        <label className="text-xs inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border">
          <input
            type="checkbox"
            checked={showExtractedOnly}
            onChange={(e) => setShowExtractedOnly(e.target.checked)}
          />
          Extracted only
        </label>
        <button
          onClick={queueAll}
          className="text-xs font-medium inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
        >
          <PlusSquare className="h-3.5 w-3.5" />
          Queue all filtered ({filtered.length})
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
          Showing {filtered.length} of {topics.length} topics
        </div>
        <ul className="divide-y divide-border max-h-[70vh] overflow-y-auto">
          {filtered.map((t) => (
            <TopicRow
              key={`${t.domain.slug}-${t.section.slug}-${t.topic.slug}`}
              t={t}
              isExtracted={!baseSlugs.has(t.topic.slug)}
              onRename={(name) => renameTopic(t.topic.slug, name)}
              onDelete={() => deleteTopic(t.topic.slug)}
              onRegen={() => queueRegen(t)}
            />
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-10 text-sm text-muted-foreground text-center">No topics match.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function TopicRow({
  t,
  isExtracted,
  onRename,
  onDelete,
  onRegen,
}: {
  t: FlatTopic;
  isExtracted: boolean;
  onRename: (name: string) => boolean;
  onDelete: () => boolean;
  onRegen: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(t.topic.title);
  const genState = useGenerationState();
  const cached = typeof window !== "undefined" ? !!getCachedLesson(t.topic.slug) : false;
  const queueItem = typeof window !== "undefined" ? getQueue().find(q => q.slug === t.topic.slug) : undefined;
  const isRegenerating = genState.currentTopicSlug === t.topic.slug || queueItem?.status === "running" || queueItem?.status === "pending";

  return (
    <li className="px-4 py-2.5 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm rounded-md border border-border bg-background px-2 py-1 flex-1"
              autoFocus
            />
            <button
              onClick={() => {
                if (title.trim() && title !== t.topic.title) {
                  const ok = onRename(title.trim());
                  if (!ok) alert("This is a static (base) topic and cannot be renamed.");
                }
                setEditing(false);
              }}
              className="text-xs px-2 py-1 rounded-md bg-primary text-primary-foreground"
            >
              Save
            </button>
            <button
              onClick={() => { setTitle(t.topic.title); setEditing(false); }}
              className="text-xs px-2 py-1 rounded-md border border-border"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <Link
              to="/lesson/$slug"
              params={{ slug: t.topic.slug }}
              className="text-sm font-medium hover:underline"
            >
              {t.topic.title}
            </Link>
            <div className="text-xs text-muted-foreground truncate">
              {t.domain.title} · {t.section.title}
              {isExtracted && <span className="ml-2 text-primary">· extracted</span>}
              {isRegenerating ? (
                <span className="ml-2 inline-flex items-center gap-1 text-primary font-medium animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" /> Regenerating...
                </span>
              ) : cached ? (
                <span className="ml-2 inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" /> cached
                </span>
              ) : null}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onRegen}
          title="Clear cache and queue regeneration"
          className="p-1.5 rounded-md hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button
          onClick={() => setEditing(true)}
          disabled={!isExtracted}
          title={isExtracted ? "Rename topic" : "Static topics cannot be renamed"}
          className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            if (!isExtracted) { alert("Static topics cannot be deleted."); return; }
            if (confirm(`Delete topic "${t.topic.title}"?`)) onDelete();
          }}
          disabled={!isExtracted}
          className="p-1.5 rounded-md hover:bg-muted text-destructive disabled:opacity-30"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}