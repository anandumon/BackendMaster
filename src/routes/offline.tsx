import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useMemo, useRef, useState } from "react";
import { LessonContentSkeleton } from "@/components/LessonContentSkeleton";
import {
  allTopicsMerged,
  addExtractedDomain,
  getPdfs,
  upsertPdf,
  type ExtractedDomain,
  type UploadedPdf,
} from "@/lib/curriculum-extra";
import { getCachedLesson, setCachedLesson, type LessonContent } from "@/lib/storage";
import { useAuth } from "@/lib/useAuth";
import {
  startRoadmapGeneration,
  useGenerationState,
  cancelRoadmapGeneration,
} from "@/lib/generation-state";
import {
  CloudDownload,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Trash2,
  Wifi,
  WifiOff,
  Upload,
  FileText,
  Loader2,
  Clock,
  Sparkles,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/offline")({
  component: OfflinePage,
  head: () => ({
    meta: [
      { title: "Offline Library · BackendMaster AI" },
      {
        name: "description",
        content:
          "Pre-download every lesson to your device so BackendMaster works without an internet connection.",
      },
    ],
  }),
});

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

import { useOfflineDownloader } from "@/lib/offline-downloader";

function OfflinePage() {
  const auth = useAuth();
  const downloader = useOfflineDownloader();
  const [online, setOnline] = useState(true);

  // PDF upload & AI generation states
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfHint, setPdfHint] = useState("");
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const genState = useGenerationState();

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const total = downloader.total;
  const cached = downloader.cachedCount;
  const pct = total > 0 ? Math.round((cached / total) * 100) : 0;

  async function handlePdfUpload(file: File) {
    if (file.size > 18 * 1024 * 1024) {
      setPdfError("PDF file exceeds 18 MB size limit.");
      return;
    }
    setUploadingPdf(true);
    setPdfError(null);

    const pdfId = crypto.randomUUID();
    const pdfRec: UploadedPdf = {
      id: pdfId,
      name: file.name,
      size: file.size,
      uploadedAt: Date.now(),
      status: "parsing",
    };
    upsertPdf(pdfRec);

    try {
      console.log(`[Generation] Uploading and extracting PDF: "${file.name}"`);
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
          hint: pdfHint || undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        const err =
          res.status === 429
            ? "AI Rate Limit — retry in a few moments."
            : text.slice(0, 200) || "Extraction failed.";
        upsertPdf({ ...pdfRec, status: "error", error: err });
        setPdfError(err);
        setUploadingPdf(false);
        return;
      }

      const json = await res.json();
      if (!json?.sections?.length) {
        setPdfError("No sections or topics found in the PDF.");
        setUploadingPdf(false);
        return;
      }

      const existingCount = getPdfs().length;
      const domain: ExtractedDomain = {
        slug: json.domainSlug,
        title: json.domainTitle,
        icon: json.icon || "🗺️",
        color: palette(existingCount),
        tagline: json.tagline || "Custom Roadmap extracted from uploaded PDF.",
        sections: json.sections.map(
          (s: {
            slug: string;
            title: string;
            topics: Array<{ slug: string; title: string; summary?: string }>;
          }) => ({
            slug: s.slug,
            title: s.title,
            topics: s.topics.map((t: { slug: string; title: string; summary?: string }) => ({
              slug: t.slug,
              title: t.title,
              summary: t.summary || "",
            })),
          }),
        ),
        extractedFromPdfId: pdfId,
        extractedAt: Date.now(),
      };

      addExtractedDomain(domain);
      upsertPdf({ ...pdfRec, status: "done", domainSlugs: [domain.slug] });

      console.log(
        `[Generation] Roadmap extracted successfully: "${domain.title}" with ${domain.sections.length} sections.`,
      );

      // Flatten topics into sequential order
      const orderedTopics: Array<{ slug: string; title: string; section: string }> = [];
      for (const sec of domain.sections) {
        for (const top of sec.topics) {
          orderedTopics.push({ slug: top.slug, title: top.title, section: sec.title });
        }
      }

      setUploadingPdf(false);

      // Start ordered lesson generation
      await startRoadmapGeneration({
        domainSlug: domain.slug,
        domainTitle: domain.title,
        topics: orderedTopics,
        userId: auth.user?.id,
      });
    } catch (e) {
      console.error("[Generation] PDF upload error:", e);
      setPdfError((e as Error).message || "Failed to process PDF.");
      setUploadingPdf(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-5 lg:px-10 py-8 space-y-8">
        <header>
          <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <CloudDownload className="h-3.5 w-3.5 text-primary" /> Offline library
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold mt-1">Read lessons without internet</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Pre-download topics for offline access. Lessons stored on this device can be read
            anytime.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            {online ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-green-500" /> Online — sync and downloads active
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-destructive" /> Offline — reading local cache
              </>
            )}
          </div>
        </header>

        {/* Offline Cache Control Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">
                {cached} / {total} lessons downloaded
              </div>
              <div className="text-xs text-muted-foreground">{pct}% of full library stored</div>
            </div>
            {cached === total && total > 0 && (
              <div className="inline-flex items-center gap-1 text-xs text-green-500 font-medium">
                <CheckCircle2 className="h-4 w-4" /> Ready for offline work
              </div>
            )}
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {!downloader.running ? (
              <button
                onClick={downloader.startDownload}
                disabled={!online || cached === total}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-95 disabled:opacity-50 transition-opacity"
              >
                <PlayCircle className="h-4 w-4" />
                {cached === total ? "All lessons cached" : "Download all lessons"}
              </button>
            ) : (
              <button
                onClick={downloader.stopDownload}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border border-border hover:bg-muted"
              >
                <PauseCircle className="h-4 w-4" /> Pause background download
              </button>
            )}
            <button
              onClick={() => {
                if (confirm("Delete all downloaded lessons from this device?")) {
                  downloader.clearDownloads();
                }
              }}
              disabled={cached === 0}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border border-border hover:bg-muted disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> Clear cached files
            </button>
          </div>

          {downloader.running && (
            <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              Downloading background lesson {downloader.currentIdx + 1} / {total}:{" "}
              <span className="text-foreground font-medium">{downloader.currentTopicTitle}</span>
            </div>
          )}
          {downloader.errorSlug && (
            <div className="mt-3 text-xs text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Some lessons failed (last: {downloader.errorSlug}). Click download all to retry.
            </div>
          )}
        </div>

        {/* ── ADMIN ONLY: PDF Roadmap Uploader & Automated Generator ── */}
        {auth.isAdmin && (
          <section className="rounded-2xl border-2 border-primary/20 bg-card/60 p-6 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <h2 className="text-lg font-bold">
                    Admin Roadmap PDF Upload &amp; Lesson Generator
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a PDF roadmap to extract sections/topics and generate all lessons
                  sequentially into the DB.
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                Admin Exclusive
              </span>
            </div>

            {/* Active generation status card if running */}
            {genState.status === "generating" && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Generating Roadmap:{" "}
                    <span className="text-primary">{genState.activeRoadmapTitle}</span>
                  </div>
                  <button
                    onClick={cancelRoadmapGeneration}
                    className="text-xs px-2.5 py-1 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    Cancel Generation
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Topic {genState.progress.completed + 1} of {genState.progress.total}:{" "}
                      <strong className="text-foreground">{genState.currentTopicTitle}</strong>
                    </span>
                    <span className="font-semibold text-primary">{genState.progress.percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${genState.progress.percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    Estimated time remaining: ~{genState.estimatedSecondsRemaining} seconds
                  </div>
                  <div className="text-[11px]">
                    Current section: <em>{genState.currentSectionTitle}</em>
                  </div>
                </div>

                {/* Background Skeleton Loader Preview */}
                <div className="pt-2">
                  <LessonContentSkeleton
                    topicTitle={genState.currentTopicTitle ?? undefined}
                    estimatedSeconds={genState.estimatedSecondsRemaining}
                  />
                </div>
              </div>
            )}

            {/* PDF Upload Dropzone */}
            <div
              onClick={() => pdfInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                uploadingPdf
                  ? "border-primary bg-primary/5 opacity-70"
                  : "border-border hover:border-primary/50 bg-background"
              }`}
            >
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePdfUpload(f);
                }}
              />
              <Upload className="h-8 w-8 mx-auto text-primary" />
              <h3 className="mt-2 font-semibold text-sm">Select or drop a Roadmap PDF</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                AI will parse the roadmap tree and automatically generate every topic's lesson
                content in order.
              </p>
              {uploadingPdf && (
                <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" /> Parsing PDF and extracting roadmap
                  structure...
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                value={pdfHint}
                onChange={(e) => setPdfHint(e.target.value)}
                placeholder="Optional extraction hint (e.g., 'Target senior backend engineers')"
                className="flex-1 text-xs rounded-xl border border-border bg-background px-3 py-2"
              />
              <button
                onClick={() => pdfInputRef.current?.click()}
                disabled={uploadingPdf || genState.status === "generating"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-95 disabled:opacity-50"
              >
                <FileText className="h-3.5 w-3.5" /> Select PDF File
              </button>
            </div>

            {pdfError && (
              <div className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {pdfError}
              </div>
            )}
          </section>
        )}

        <footer className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Pre-generated lessons are automatically cached in Supabase DB for all users.
        </footer>
      </div>
    </AppShell>
  );
}
