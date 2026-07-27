import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { DOMAINS } from "@/lib/curriculum";
import { getExtractedDomains } from "@/lib/curriculum-extra";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { getCompletions } from "@/lib/lesson-db";
import { useGenerationState } from "@/lib/generation-state";
import { ChevronRight, CheckCircle2, Circle, Loader2, Clock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/domain/$slug")({
  component: DomainPage,
  head: ({ params }) => {
    const allDomains = [...DOMAINS, ...getExtractedDomains()];
    const d = allDomains.find((x) => x.slug === params.slug);
    return {
      meta: [
        { title: d ? `${d.title} Roadmap — BackendMaster AI` : "Roadmap" },
        { name: "description", content: d?.tagline ?? "Backend developer roadmap." },
      ],
    };
  },
});

function DomainPage() {
  return (
    <RequireAuth>
      <DomainContent />
    </RequireAuth>
  );
}

function DomainContent() {
  const { slug } = Route.useParams();
  const allDomains = [...DOMAINS, ...getExtractedDomains()];
  const domain = allDomains.find((d) => d.slug === slug);

  const auth = useAuth();
  const genState = useGenerationState();
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    if (auth.user) getCompletions(auth.user.id).then(setCompleted);
  }, [auth.user]);

  if (!domain) throw notFound();

  const totalTopics = domain.sections.reduce((s, sec) => s + sec.topics.length, 0);
  const doneCount = domain.sections
    .flatMap((s) => s.topics)
    .filter((t) => completed.includes(t.slug)).length;
  const pct = totalTopics ? Math.round((doneCount / totalTopics) * 100) : 0;

  const isCurrentDomainGenerating =
    genState.activeRoadmapSlug === domain.slug && genState.status === "generating";

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-5 lg:px-10 py-8 lg:py-12">
        <nav className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>{domain.title}</span>
        </nav>

        <div
          className="rounded-3xl p-6 lg:p-8 mb-8 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${domain.color || "oklch(0.6 0.2 250)"}, oklch(0.5 0.2 280))`,
          }}
        >
          <div className="text-4xl">{domain.icon}</div>
          <h1 className="mt-2 text-3xl lg:text-4xl font-bold">{domain.title} Roadmap</h1>
          <p className="mt-2 text-white/90 max-w-2xl">{domain.tagline}</p>
          <div className="mt-4 flex items-center gap-3 text-sm flex-wrap">
            <span className="bg-white/20 px-3 py-1 rounded-full">{totalTopics} lessons</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">{pct}% complete</span>
            {isCurrentDomainGenerating && (
              <span className="bg-white/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating topics... (~
                {genState.estimatedSecondsRemaining}s left)
              </span>
            )}
          </div>
        </div>

        {/* Live Generation Header Banner if active for this roadmap */}
        {isCurrentDomainGenerating && (
          <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-primary">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> Live AI Topic Generation in Progress
              </span>
              <span>{genState.progress.percent}% overall</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${genState.progress.percent}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Currently generating:{" "}
              <strong className="text-foreground">{genState.currentTopicTitle}</strong> (
              {genState.currentSectionTitle})
            </div>
          </div>
        )}

        <div className="space-y-8">
          {domain.sections.map((section) => (
            <section key={section.slug}>
              <h2 className="text-lg font-bold mb-3">{section.title}</h2>
              <div className="grid md:grid-cols-2 gap-2">
                {section.topics.map((topic) => {
                  const done = completed.includes(topic.slug);
                  const isGenerating = genState.currentTopicSlug === topic.slug;
                  const topicGenStatus = genState.topicStatuses[topic.slug];

                  if (isGenerating) {
                    return (
                      <div
                        key={topic.slug}
                        className="rounded-xl border-2 border-primary/40 bg-primary/5 px-4 py-3 space-y-2 animate-pulse"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                            <div className="text-sm font-semibold text-primary">{topic.title}</div>
                          </div>
                          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                            Generating
                          </span>
                        </div>
                        <div className="h-2.5 w-3/4 bg-muted rounded-md" />
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3 text-primary" /> Estimated time: ~12s
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={topic.slug}
                      to="/lesson/$slug"
                      params={{ slug: topic.slug }}
                      className="group flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:shadow-md hover:border-primary/30 transition-all"
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      ) : topicGenStatus === "done" ? (
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="text-sm font-medium truncate">{topic.title}</div>
                          {topicGenStatus === "done" && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">
                              Generated
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {topic.summary}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
