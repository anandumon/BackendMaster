import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  addExtractedDomain,
  checkCompleteness,
  deletePdf,
  getPdfs,
  upsertPdf,
  getExtractedDomains,
  type CompletenessReport,
  type ExtractedDomain,
  type SkippedNode,
  type TopicConfidence,
  type UploadedPdf,
} from "@/lib/curriculum-extra";
import { getQueue, setQueue } from "@/lib/storage";
import {
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronRight,
  BarChart3,
  TreePine,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  PlayCircle,
} from "lucide-react";

export const Route = createFileRoute("/admin/pdfs")({
  component: PdfsPage,
});

type ExtractResponse = {
  domainSlug: string;
  domainTitle: string;
  icon?: string;
  tagline?: string;
  sections: Array<{
    slug: string;
    title: string;
    topics: Array<{ slug: string; title: string; summary: string; confidence?: number }>;
  }>;
  hierarchyDepth?: number;
  expectedNodeCount?: number;
  skippedNodes?: Array<{ title: string; reason: string }>;
  parseNotes?: string;
  warnings?: string[];
};

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Failed to read file"));
    r.onload = () => {
      const s = r.result as string;
      const comma = s.indexOf(",");
      resolve(comma >= 0 ? s.slice(comma + 1) : s);
    };
    r.readAsDataURL(file);
  });
}

function palette(index: number) {
  const hues = [40, 140, 220, 300, 20, 180, 260, 100, 340, 60];
  const h = hues[index % hues.length];
  return `oklch(0.7 0.18 ${h})`;
}

function PdfsPage() {
  const [pdfs, setPdfs] = useState<UploadedPdf[]>([]);
  const [dragging, setDragging] = useState(false);
  const [hint, setHint] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setPdfs(getPdfs()), []);

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    for (const file of arr) {
      await parseOne(file, hint);
      setPdfs(getPdfs());
    }
  }

  async function parseOne(file: File, hintText: string) {
    if (file.size > 18 * 1024 * 1024) {
      const rec: UploadedPdf = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        uploadedAt: Date.now(),
        status: "error",
        error: "PDF exceeds 18 MB upload limit.",
      };
      upsertPdf(rec);
      setPdfs(getPdfs());
      return;
    }
    const id = crypto.randomUUID();
    const rec: UploadedPdf = {
      id,
      name: file.name,
      size: file.size,
      uploadedAt: Date.now(),
      status: "parsing",
    };
    upsertPdf(rec);
    setPdfs(getPdfs());

    try {
      const base64 = await toBase64(file);
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "application/pdf",
          base64,
          hint: hintText || undefined,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        upsertPdf({
          ...rec,
          status: "error",
          error:
            res.status === 429
              ? "Rate limit — wait and retry."
              : res.status === 402
                ? "AI credits exhausted."
                : (text.slice(0, 250) || "Extraction failed."),
        });
        return;
      }
      const json = (await res.json()) as ExtractResponse;
      if (!json?.sections?.length) {
        upsertPdf({ ...rec, status: "error", error: "Empty extraction — no sections returned." });
        return;
      }
      const existing = getPdfs();
      const idx = existing.length;

      // Gather per-topic confidence scores
      const topicConfidences: TopicConfidence[] = [];
      for (const s of json.sections) {
        for (const t of s.topics) {
          topicConfidences.push({
            slug: t.slug,
            title: t.title,
            confidence: t.confidence ?? 1.0,
          });
        }
      }

      const domain: ExtractedDomain = {
        slug: json.domainSlug,
        title: json.domainTitle,
        icon: json.icon || "📘",
        color: palette(idx),
        tagline: json.tagline || "Extracted from an uploaded roadmap PDF.",
        sections: json.sections.map((s) => ({
          slug: s.slug,
          title: s.title,
          topics: s.topics.map((t) => ({ slug: t.slug, title: t.title, summary: t.summary || "" })),
        })),
        extractedFromPdfId: id,
        extractedAt: Date.now(),
      };
      addExtractedDomain(domain);
      const topicCount = domain.sections.reduce((s, sec) => s + sec.topics.length, 0);

      // Compute branching stats
      const branchCounts = domain.sections.map((s) => s.topics.length);
      const maxBranching = Math.max(...branchCounts, 0);
      const avgBranching = branchCounts.length > 0
        ? Math.round((branchCounts.reduce((a, b) => a + b, 0) / branchCounts.length) * 10) / 10
        : 0;

      upsertPdf({
        ...rec,
        status: "done",
        parseNotes: json.parseNotes,
        quality: {
          domains: 1,
          sections: domain.sections.length,
          topics: topicCount,
          warnings: json.warnings ?? [],
          hierarchyDepth: json.hierarchyDepth ?? 2,
          maxBranching,
          avgBranching,
          topicConfidences,
          skippedNodes: (json.skippedNodes ?? []) as SkippedNode[],
          expectedNodeCount: json.expectedNodeCount ?? topicCount,
        },
        domainSlugs: [domain.slug],
      });
    } catch (e) {
      upsertPdf({ ...rec, status: "error", error: (e as Error).message || "Unknown error" });
    }
  }

  function regenAllForPdf(pdf: UploadedPdf) {
    if (!pdf.domainSlugs?.length) return;
    const domains = getExtractedDomains().filter((d) => pdf.domainSlugs!.includes(d.slug));
    const q = getQueue();
    const pending = new Set(q.filter((x) => x.status !== "done").map((x) => x.slug));
    let added = 0;
    for (const domain of domains) {
      for (const section of domain.sections) {
        for (const topic of section.topics) {
          if (pending.has(topic.slug)) continue;
          q.push({
            slug: topic.slug,
            title: topic.title,
            domain: domain.title,
            section: section.title,
            status: "pending",
            pdfId: pdf.id,
          });
          pending.add(topic.slug);
          added++;
        }
      }
    }
    setQueue(q);
    alert(`Queued ${added} topics from "${pdf.name}" for lesson regeneration. Open the Regen queue tab to run.`);
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border bg-card"
        }`}
      >
        <Upload className="h-8 w-8 mx-auto text-primary" />
        <h2 className="mt-3 font-semibold">Upload a roadmap PDF</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drop a PDF here or click below. The AI extractor will pull every node, subtopic, and keyword into a new roadmap.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="mt-4 flex flex-col sm:flex-row gap-2 items-center justify-center">
          <input
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="Optional hint (e.g. 'Focus on advanced Java topics')"
            className="w-full sm:w-80 text-sm rounded-lg border border-border bg-background px-3 py-2"
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground"
          >
            Choose PDF
          </button>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">Max 18 MB per file · PDFs are parsed by AI multimodal extraction.</div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="px-4 py-3 border-b border-border text-sm font-semibold">
          Uploaded PDFs ({pdfs.length})
        </div>
        {pdfs.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground text-center">No PDFs uploaded yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {pdfs.map((p) => (
              <PdfRow
                key={p.id}
                pdf={p}
                onDelete={() => {
                  if (confirm(`Delete "${p.name}" and its extracted roadmap?`)) {
                    deletePdf(p.id);
                    setPdfs(getPdfs());
                  }
                }}
                onRegenAll={() => regenAllForPdf(p)}
                onReparse={() => inputRef.current?.click()}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PdfRow({
  pdf,
  onDelete,
  onRegenAll,
  onReparse,
}: {
  pdf: UploadedPdf;
  onDelete: () => void;
  onRegenAll: () => void;
  onReparse: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const report = pdf.status === "done" ? checkCompleteness(pdf) : null;

  return (
    <li className="px-4 py-3">
      <div className="flex items-start gap-3">
        <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-sm font-medium truncate">{pdf.name}</div>
            <StatusPill status={pdf.status} />
            {report && <CompletenessBadge report={report} />}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {(pdf.size / 1024 / 1024).toFixed(2)} MB · {new Date(pdf.uploadedAt).toLocaleString()}
          </div>
          {pdf.quality && (
            <div className="mt-1 text-xs text-muted-foreground">
              {pdf.quality.sections} sections · {pdf.quality.topics} topics
              {" · depth "}{pdf.quality.hierarchyDepth}
              {pdf.quality.warnings.length > 0 && (
                <span className="ml-2 text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {pdf.quality.warnings.length} warning
                  {pdf.quality.warnings.length === 1 ? "" : "s"}
                </span>
              )}
              {pdf.quality.skippedNodes.length > 0 && (
                <span className="ml-2 text-orange-600 dark:text-orange-400">
                  · {pdf.quality.skippedNodes.length} skipped
                </span>
              )}
            </div>
          )}
          {pdf.error && (
            <div className="mt-1 text-xs text-destructive">{pdf.error}</div>
          )}

          {/* Expand/collapse parsing report */}
          {pdf.status === "done" && pdf.quality && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs text-primary inline-flex items-center gap-1 hover:underline"
            >
              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              <BarChart3 className="h-3 w-3" />
              Parsing Report
            </button>
          )}
          {expanded && pdf.quality && <ParsingReport quality={pdf.quality} report={report} parseNotes={pdf.parseNotes} />}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {pdf.status === "done" && (
            <button
              onClick={onRegenAll}
              title="Queue all topics for lesson regeneration"
              className="p-1.5 rounded-md hover:bg-muted text-primary"
            >
              <PlayCircle className="h-4 w-4" />
            </button>
          )}
          {pdf.status === "error" && (
            <button
              onClick={onReparse}
              title="Re-upload to retry"
              className="p-1.5 rounded-md hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-muted text-destructive"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}

// ─── Parsing Report Panel ─────────────────────────────────────────────────

function ParsingReport({
  quality,
  report,
  parseNotes,
}: {
  quality: NonNullable<UploadedPdf["quality"]>;
  report: CompletenessReport | null;
  parseNotes?: string;
}) {
  return (
    <div className="mt-3 space-y-3 rounded-xl border border-border bg-background p-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MiniStat label="Sections" value={quality.sections} />
        <MiniStat label="Topics" value={quality.topics} />
        <MiniStat label="Tree Depth" value={quality.hierarchyDepth} />
        <MiniStat label="Avg Branching" value={quality.avgBranching} />
      </div>

      {/* Completeness */}
      {report && (
        <div>
          <div className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
            {report.status === "complete" && <ShieldCheck className="h-3.5 w-3.5 text-green-600" />}
            {report.status === "partial" && <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />}
            {report.status === "incomplete" && <ShieldX className="h-3.5 w-3.5 text-red-600" />}
            Completeness: {report.coveragePercent}%
            <span className="text-muted-foreground font-normal">
              ({report.actualNodeCount} / {report.expectedNodeCount} nodes)
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(report.coveragePercent, 100)}%`,
                background:
                  report.coveragePercent >= 95
                    ? "oklch(0.6 0.2 145)"
                    : report.coveragePercent >= 70
                      ? "oklch(0.7 0.18 80)"
                      : "oklch(0.6 0.22 27)",
              }}
            />
          </div>
          {report.missingNodes.length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-amber-600 dark:text-amber-400 cursor-pointer">
                {report.missingNodes.length} missing/skipped node{report.missingNodes.length === 1 ? "" : "s"}
              </summary>
              <ul className="mt-1 space-y-0.5">
                {report.missingNodes.map((mn, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1">
                    <span className="text-foreground font-medium">·</span>
                    <span>{mn.title}</span>
                    <span className="text-muted-foreground">— {mn.reason}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* Hierarchy Tree */}
      {quality.topicConfidences.length > 0 && (
        <details>
          <summary className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
            <TreePine className="h-3.5 w-3.5" />
            Topic Confidence ({quality.topicConfidences.length} topics)
          </summary>
          <div className="mt-2 max-h-48 overflow-y-auto space-y-0.5">
            {quality.topicConfidences.map((tc) => (
              <div key={tc.slug} className="flex items-center gap-2 text-xs">
                <ConfidenceDot confidence={tc.confidence} />
                <span className="truncate flex-1">{tc.title}</span>
                <span className="tabular-nums text-muted-foreground">{(tc.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Skipped Nodes */}
      {quality.skippedNodes.length > 0 && (
        <details>
          <summary className="text-xs font-medium text-orange-600 dark:text-orange-400 cursor-pointer">
            ⚠️ Skipped Nodes ({quality.skippedNodes.length})
          </summary>
          <ul className="mt-1 space-y-1">
            {quality.skippedNodes.map((sn, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">{sn.title}</span>
                {" — "}{sn.reason}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Warnings */}
      {quality.warnings.length > 0 && (
        <details>
          <summary className="text-xs text-amber-600 dark:text-amber-400 cursor-pointer">
            ⚠️ Warnings ({quality.warnings.length})
          </summary>
          <ul className="mt-1 list-disc pl-4 text-xs text-amber-700 dark:text-amber-400">
            {quality.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </details>
      )}

      {/* Parse Notes */}
      {parseNotes && (
        <details>
          <summary className="text-xs text-muted-foreground cursor-pointer">Parse notes</summary>
          <div className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{parseNotes}</div>
        </details>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2 text-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-lg font-bold mt-0.5">{value}</div>
    </div>
  );
}

function ConfidenceDot({ confidence }: { confidence: number }) {
  const color =
    confidence >= 0.9
      ? "bg-green-500"
      : confidence >= 0.7
        ? "bg-amber-500"
        : confidence >= 0.4
          ? "bg-orange-500"
          : "bg-red-500";
  return <span className={`h-2 w-2 rounded-full shrink-0 ${color}`} />;
}

function CompletenessBadge({ report }: { report: CompletenessReport }) {
  const map = {
    complete: { cls: "bg-green-500/10 text-green-700 dark:text-green-400", icon: <ShieldCheck className="h-3 w-3" />, label: `${report.coveragePercent}% complete` },
    partial: { cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400", icon: <ShieldAlert className="h-3 w-3" />, label: `${report.coveragePercent}% coverage` },
    incomplete: { cls: "bg-red-500/10 text-red-700 dark:text-red-400", icon: <ShieldX className="h-3 w-3" />, label: `${report.coveragePercent}% coverage` },
  };
  const s = map[report.status];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${s.cls}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

function StatusPill({ status }: { status: UploadedPdf["status"] }) {
  const map = {
    pending: { label: "Pending", cls: "bg-muted text-muted-foreground", icon: null },
    parsing: { label: "Parsing", cls: "bg-primary/10 text-primary", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    done: { label: "Parsed", cls: "bg-green-500/10 text-green-700 dark:text-green-400", icon: <CheckCircle2 className="h-3 w-3" /> },
    error: { label: "Failed", cls: "bg-destructive/10 text-destructive", icon: <AlertTriangle className="h-3 w-3" /> },
  } as const;
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${s.cls}`}>
      {s.icon}
      {s.label}
    </span>
  );
}