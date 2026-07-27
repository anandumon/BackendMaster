import { Sparkles, Loader2 } from "lucide-react";

export function LessonContentSkeleton({
  topicTitle,
  estimatedSeconds,
}: {
  topicTitle?: string;
  estimatedSeconds?: number;
}) {
  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="rounded-2xl border border-primary/30 bg-card p-6 lg:p-8 text-center relative overflow-hidden shadow-sm">
        <div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-semibold shadow-md animate-pulse"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Sparkles className="h-4 w-4 animate-spin" />
          {topicTitle ? `Generating: ${topicTitle}...` : "Generating your lesson..."}
        </div>

        <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
          Building overview, theory, code examples, MCQs, and flashcards. This takes ~10–20s the
          first time. Once generated, all users can view it instantly.
        </p>

        {estimatedSeconds && estimatedSeconds > 0 && (
          <div className="mt-3 text-xs font-semibold text-primary inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Estimated time remaining: ~{estimatedSeconds}s
          </div>
        )}
      </div>

      {/* Detailed Skeleton Layout of Contents Generating */}
      <div className="space-y-6 animate-pulse">
        {/* Section 1: Overview & Why Exists */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <div className="h-5 w-36 bg-muted rounded-md" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-4 w-full bg-muted/80 rounded-md" />
            <div className="h-4 w-11/12 bg-muted/70 rounded-md" />
            <div className="h-4 w-4/5 bg-muted/60 rounded-md" />
          </div>
        </div>

        {/* Section 2: Detailed Theory & Internal Working */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <div className="h-5 w-48 bg-muted rounded-md" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted/80 rounded-md" />
            <div className="h-4 w-5/6 bg-muted/70 rounded-md" />
            <div className="h-4 w-3/4 bg-muted/60 rounded-md" />
          </div>

          {/* Subheading skeleton */}
          <div className="h-4 w-40 bg-muted/90 rounded-md pt-2" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted/75 rounded-md" />
            <div className="h-4 w-9/12 bg-muted/65 rounded-md" />
          </div>
        </div>

        {/* Section 3: Practical Code & Internal Architecture */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <div className="h-5 w-44 bg-muted rounded-md" />
          </div>
          {/* Skeleton Code Snippet Container */}
          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2 font-mono">
            <div className="h-3 w-1/3 bg-muted-foreground/30 rounded" />
            <div className="h-3 w-3/4 bg-muted-foreground/25 rounded" />
            <div className="h-3 w-1/2 bg-muted-foreground/20 rounded" />
            <div className="h-3 w-2/3 bg-muted-foreground/25 rounded" />
          </div>
        </div>

        {/* Section 4: Interview MCQs & Flashcards */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <div className="h-5 w-52 bg-muted rounded-md" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-4 space-y-2">
              <div className="h-3 w-1/3 bg-muted/80 rounded" />
              <div className="h-3.5 w-full bg-muted/60 rounded" />
              <div className="h-3.5 w-4/5 bg-muted/50 rounded" />
            </div>
            <div className="rounded-xl border border-border p-4 space-y-2">
              <div className="h-3 w-1/3 bg-muted/80 rounded" />
              <div className="h-3.5 w-full bg-muted/60 rounded" />
              <div className="h-3.5 w-4/5 bg-muted/50 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
