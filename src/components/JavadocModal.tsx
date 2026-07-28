import React, { useState, useEffect, useMemo } from "react";
import { type JavadocEntry } from "@/lib/javadoc-db";
import {
  X,
  BookOpen,
  Sparkles,
  CheckCircle,
  Code,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  AlertOctagon,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const TAB_STORAGE_KEY = "javadoc_modal_active_tab";

type ModalTab = "overview" | "syntax" | "best_practices" | "interview" | "javadocs";

export function JavadocModal({
  entry,
  onClose,
}: {
  entry: JavadocEntry | null;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<ModalTab>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(TAB_STORAGE_KEY) : null;
    return (saved as ModalTab) || "overview";
  });

  const [copied, setCopied] = useState(false);
  const [expandedInterviewIdx, setExpandedInterviewIdx] = useState<number | null>(0);

  const isStandardLib = Boolean(entry?.officialDocUrl || entry?.hierarchy);

  const availableTabs: ModalTab[] = useMemo(() => {
    const tabs: ModalTab[] = ["overview", "syntax", "best_practices", "interview"];
    if (isStandardLib) tabs.push("javadocs");
    return tabs;
  }, [isStandardLib]);

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem(TAB_STORAGE_KEY, activeTab);
    }
  }, [activeTab]);

  // STEP 9: Keyboard Navigation (Esc to close, Arrow keys to cycle tabs)
  useEffect(() => {
    if (!entry) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        const currentIdx = availableTabs.indexOf(activeTab);
        const nextIdx = (currentIdx + 1) % availableTabs.length;
        setActiveTab(availableTabs[nextIdx]);
      } else if (e.key === "ArrowLeft") {
        const currentIdx = availableTabs.indexOf(activeTab);
        const prevIdx = (currentIdx - 1 + availableTabs.length) % availableTabs.length;
        setActiveTab(availableTabs[prevIdx]);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [entry, activeTab, availableTabs, onClose]);

  if (!entry) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(entry.codeExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl border border-blue-200 dark:border-blue-900/80 bg-card shadow-2xl text-foreground overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* FIXED HEADER (STEP 9) */}
        <div className="flex items-start justify-between border-b border-blue-100 dark:border-blue-900/60 p-5 bg-card shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                {entry.category}
              </span>
              {entry.since && (
                <span className="text-xs text-blue-600/80 dark:text-blue-400/80 font-mono font-semibold">
                  {entry.since}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2 font-mono flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0" />
              {entry.name}
            </h2>
            {entry.package && (
              <p className="text-xs text-blue-600/90 dark:text-blue-300/90 font-mono mt-1">
                Package:{" "}
                <span className="font-bold text-blue-700 dark:text-blue-200">{entry.package}</span>
              </p>
            )}
          </div>

          {/* FIXED CLOSE BUTTON (STEP 9) */}
          <button
            onClick={onClose}
            className="rounded-full p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
            title="Close Documentation (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* PERSISTENT TABS NAVIGATION (STEP 9) */}
        <div className="flex items-center gap-1 px-4 border-b border-blue-100 dark:border-blue-900/60 bg-muted/40 overflow-x-auto text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-2.5 border-b-2 font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Overview & Purpose
          </button>

          <button
            onClick={() => setActiveTab("syntax")}
            className={`px-3 py-2.5 border-b-2 font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "syntax"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            Syntax & Example
          </button>

          <button
            onClick={() => setActiveTab("best_practices")}
            className={`px-3 py-2.5 border-b-2 font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "best_practices"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Best Practices & Errors
          </button>

          <button
            onClick={() => setActiveTab("interview")}
            className={`px-3 py-2.5 border-b-2 font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "interview"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Interview Q&A ({entry.interviewQuestions?.length || 0})
          </button>

          {isStandardLib && (
            <button
              onClick={() => setActiveTab("javadocs")}
              className={`px-3 py-2.5 border-b-2 font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "javadocs"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Official Oracle JavaDocs
            </button>
          )}
        </div>

        {/* SCROLLABLE POPUP BODY ONLY (STEP 9) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: OVERVIEW & PURPOSE */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Overview */}
              <div className="rounded-xl bg-blue-50/80 dark:bg-blue-950/40 p-4 border border-blue-200 dark:border-blue-800/80">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Overview
                </h3>
                <p className="text-blue-950 dark:text-blue-100 leading-relaxed font-medium">
                  {entry.overview}
                </p>
              </div>

              {/* Purpose */}
              <div className="rounded-xl bg-sky-50/80 dark:bg-sky-950/40 p-4 border border-sky-200 dark:border-sky-800/80">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-1.5 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  Purpose & Why It Exists
                </h3>
                <p className="text-sky-950 dark:text-sky-100 leading-relaxed font-medium">
                  {entry.purpose}
                </p>
              </div>

              {/* Use Cases */}
              {entry.useCases && entry.useCases.length > 0 && (
                <div className="rounded-xl bg-muted/40 p-4 border border-border">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                    <Code className="h-4 w-4 text-blue-600" />
                    Real-World Use Cases
                  </h3>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {entry.useCases.map((uc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{uc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Topics */}
              {entry.relatedTopics && entry.relatedTopics.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                    Related Lessons & Topics
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.relatedTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100/60 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SYNTAX & EXAMPLE */}
          {activeTab === "syntax" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Syntax */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-1.5 flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Construct Syntax
                </h3>
                <div className="rounded-xl bg-slate-950 p-3.5 border border-blue-900 text-xs font-mono text-blue-300 shadow-inner overflow-x-auto">
                  <code>{entry.syntax}</code>
                </div>
              </div>

              {/* ONE Practical Example */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Practical Example
                  </h3>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span className="font-semibold">Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden border border-blue-900/80 bg-slate-950 text-slate-100 shadow-md">
                  <pre className="!bg-slate-950 !text-slate-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed border-0 m-0">
                    <code className="!bg-transparent !text-blue-200 !border-0 !p-0 font-mono text-xs shadow-none">
                      {entry.codeExample}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BEST PRACTICES & COMMON MISTAKES */}
          {activeTab === "best_practices" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Best Practices */}
              <div className="rounded-xl bg-blue-50/80 dark:bg-blue-950/40 p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Industry Best Practices
                </h3>
                <ul className="space-y-1.5 text-xs text-blue-950 dark:text-blue-100 font-medium">
                  {entry.bestPractices.map((bp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-600 font-extrabold">•</span>
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Mistakes */}
              {entry.commonMistakes && entry.commonMistakes.length > 0 && (
                <div className="rounded-xl bg-rose-50/80 dark:bg-rose-950/40 p-4 border border-rose-200 dark:border-rose-800">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2 flex items-center gap-1.5">
                    <AlertOctagon className="h-4 w-4 text-rose-600" />
                    Common Beginner Errors & Pitfalls
                  </h3>
                  <ul className="space-y-1.5 text-xs text-rose-950 dark:text-rose-100 font-medium">
                    {entry.commonMistakes.map((cm, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-600 font-extrabold">•</span>
                        <span>{cm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INTERVIEW QUESTIONS */}
          {activeTab === "interview" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5 mb-2">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                Frequently Asked Interview Questions
              </h3>

              {entry.interviewQuestions && entry.interviewQuestions.length > 0 ? (
                entry.interviewQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-blue-100 dark:border-blue-900 bg-muted/30 overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedInterviewIdx(expandedInterviewIdx === idx ? null : idx)
                      }
                      className="w-full text-left p-3.5 flex items-center justify-between font-semibold text-xs text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-blue-600 font-bold">Q{idx + 1}.</span>
                        <span>{q.question}</span>
                      </span>
                      {expandedInterviewIdx === idx ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </button>

                    {expandedInterviewIdx === idx && (
                      <div className="px-3.5 pb-3.5 text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-2.5 bg-card">
                        <span className="font-bold text-blue-600 block mb-1">
                          Answer / Explanation:
                        </span>
                        {q.answer}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No explicit interview questions indexed for this construct.
                </p>
              )}
            </div>
          )}

          {/* TAB 5: OFFICIAL ORACLE JAVADOCS (STEP 4 & STEP 5) */}
          {activeTab === "javadocs" && isStandardLib && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Oracle Documentation Link */}
              {entry.officialDocUrl && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                  <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                    Official Oracle Java Standard Library Specification
                  </span>
                  <a
                    href={entry.officialDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>View on Oracle Docs</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              {/* Class Hierarchy */}
              {entry.hierarchy && entry.hierarchy.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Class Hierarchy
                  </h4>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border font-mono text-xs text-blue-600 dark:text-blue-400 space-y-1">
                    {entry.hierarchy.map((cls, i) => (
                      <div
                        key={i}
                        style={{ paddingLeft: `${i * 12}px` }}
                        className="flex items-center gap-1.5"
                      >
                        <span className="text-muted-foreground">└─</span>
                        <span
                          className={
                            i === entry.hierarchy!.length - 1
                              ? "font-bold text-blue-700 dark:text-blue-300"
                              : ""
                          }
                        >
                          {cls}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Methods Table */}
              {entry.methods && entry.methods.length > 0 && (
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                    <Code className="h-4 w-4 text-blue-600" />
                    Standard Library Methods
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-blue-200 dark:border-blue-900">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-blue-100/70 dark:bg-blue-950/80 text-blue-900 dark:text-blue-100 font-extrabold border-b border-blue-200 dark:border-blue-800">
                          <th className="p-2.5 font-mono">Method</th>
                          <th className="p-2.5 font-mono">Signature</th>
                          <th className="p-2.5">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entry.methods.map((m, i) => (
                          <tr
                            key={i}
                            className="border-b border-blue-100 dark:border-blue-900/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/50"
                          >
                            <td className="p-2.5 font-extrabold font-mono text-blue-700 dark:text-blue-300">
                              {m.name}
                            </td>
                            <td className="p-2.5 font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">
                              {m.signature}
                            </td>
                            <td className="p-2.5 text-blue-950 dark:text-blue-100">{m.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
