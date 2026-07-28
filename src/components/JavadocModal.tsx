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
  Cpu,
  Zap,
  Activity,
  ShieldCheck,
  Clock,
  Building2,
  ListOrdered,
  Maximize2,
} from "lucide-react";

const TAB_STORAGE_KEY = "javadoc_modal_active_tab";

type ModalTab =
  | "overview"
  | "under_hood"
  | "syntax_execution"
  | "when_to_use"
  | "best_practices"
  | "interview"
  | "javadocs";

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
    const tabs: ModalTab[] = [
      "overview",
      "under_hood",
      "syntax_execution",
      "when_to_use",
      "best_practices",
      "interview",
    ];
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
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-blue-200 dark:border-blue-900/80 bg-card shadow-2xl text-foreground overflow-hidden"
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

        {/* PERSISTENT TABS NAVIGATION (30-Point Schema Tabs) */}
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
            1. Overview & Design
          </button>

          <button
            onClick={() => setActiveTab("under_hood")}
            className={`px-3 py-2.5 border-b-2 font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "under_hood"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            2. Under the Hood
          </button>

          <button
            onClick={() => setActiveTab("syntax_execution")}
            className={`px-3 py-2.5 border-b-2 font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "syntax_execution"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            3. Syntax & Code
          </button>

          <button
            onClick={() => setActiveTab("when_to_use")}
            className={`px-3 py-2.5 border-b-2 font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "when_to_use"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            4. Use Cases & Tradeoffs
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
            5. Best Practices
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
            6. Interview Q&A
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
              7. Oracle JavaDocs
            </button>
          )}
        </div>

        {/* SCROLLABLE POPUP BODY (STEP 9) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: OVERVIEW & DESIGN (Points 1-6, 30) */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* 1. What is it? */}
              <div className="rounded-xl bg-blue-50/80 dark:bg-blue-950/40 p-4 border border-blue-200 dark:border-blue-800/80">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  1. What is it?
                </h3>
                <p className="text-blue-950 dark:text-blue-100 leading-relaxed font-medium">
                  {entry.whatIsIt}
                </p>
              </div>

              {/* 2. Why was it introduced? */}
              {entry.whyIntroduced && (
                <div className="rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 p-4 border border-indigo-200 dark:border-indigo-800/80">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1.5 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    2. Why was it introduced?
                  </h3>
                  <p className="text-indigo-950 dark:text-indigo-100 leading-relaxed font-medium">
                    {entry.whyIntroduced}
                  </p>
                </div>
              )}

              {/* 3. What problem does it solve? */}
              <div className="rounded-xl bg-sky-50/80 dark:bg-sky-950/40 p-4 border border-sky-200 dark:border-sky-800/80">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-1.5 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  3. What problem does it solve?
                </h3>
                <p className="text-sky-950 dark:text-sky-100 leading-relaxed font-medium">
                  {entry.problemSolved}
                </p>
              </div>

              {/* 4. What does it provide? */}
              {entry.whatItProvides && entry.whatItProvides.length > 0 && (
                <div className="rounded-xl bg-muted/40 p-4 border border-border">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-blue-600" />
                    4. What does it provide?
                  </h3>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {entry.whatItProvides.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 5. Why should developers use it? */}
              <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800/80">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  5. Why should developers use it?
                </h3>
                <p className="text-emerald-950 dark:text-emerald-100 leading-relaxed font-medium">
                  {entry.whyUseIt}
                </p>
              </div>

              {/* 30. Summary (Key Takeaways) */}
              {entry.summaryTakeaways && entry.summaryTakeaways.length > 0 && (
                <div className="rounded-xl bg-blue-100/60 dark:bg-blue-950/60 p-4 border border-blue-300 dark:border-blue-800">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    30. Summary & Key Takeaways
                  </h3>
                  <ul className="space-y-1.5 text-xs text-blue-950 dark:text-blue-100 font-semibold">
                    {entry.summaryTakeaways.map((takeaway, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">✓</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UNDER THE HOOD (Points 9-12, 16-17, 22-23) */}
          {activeTab === "under_hood" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* 9. Internal Working */}
              {entry.internalWorking && (
                <div className="rounded-xl bg-purple-50/80 dark:bg-purple-950/40 p-4 border border-purple-200 dark:border-purple-800">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-1.5 flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    9. Internal Working & Execution Engine
                  </h3>
                  <p className="text-purple-950 dark:text-purple-100 leading-relaxed text-xs font-medium">
                    {entry.internalWorking}
                  </p>
                </div>
              )}

              {/* 11 & 12. Architecture & Memory Representation */}
              {(entry.architecture || entry.memoryRepresentation) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {entry.architecture && (
                    <div className="rounded-xl bg-muted/40 p-3.5 border border-border">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground mb-1">
                        11. Architecture
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {entry.architecture}
                      </p>
                    </div>
                  )}
                  {entry.memoryRepresentation && (
                    <div className="rounded-xl bg-muted/40 p-3.5 border border-border">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground mb-1">
                        12. Memory Representation
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {entry.memoryRepresentation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 10. Lifecycle */}
              {entry.lifecycle && (
                <div className="rounded-xl bg-cyan-50/80 dark:bg-cyan-950/40 p-4 border border-cyan-200 dark:border-cyan-800">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 mb-1.5 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    10. Lifecycle Stages
                  </h3>
                  <p className="text-cyan-950 dark:text-cyan-100 leading-relaxed text-xs font-medium">
                    {entry.lifecycle}
                  </p>
                </div>
              )}

              {/* 16 & 17. Time & Space Complexity */}
              {(entry.timeComplexity || entry.spaceComplexity) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {entry.timeComplexity && (
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-950/60 p-3.5 border border-blue-200 dark:border-blue-800">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-1">
                        16. Time Complexity
                      </h4>
                      <span className="font-mono text-xs font-bold text-blue-900 dark:text-blue-100">
                        {entry.timeComplexity}
                      </span>
                    </div>
                  )}
                  {entry.spaceComplexity && (
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-950/60 p-3.5 border border-blue-200 dark:border-blue-800">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-1">
                        17. Space Complexity
                      </h4>
                      <span className="font-mono text-xs font-bold text-blue-900 dark:text-blue-100">
                        {entry.spaceComplexity}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* 23. Thread Safety & 22. Performance Considerations */}
              {(entry.threadSafety || entry.performanceConsiderations) && (
                <div className="space-y-3">
                  {entry.threadSafety && (
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3.5 border border-emerald-200 dark:border-emerald-800">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-1">
                        23. Thread Safety Guarantees
                      </h4>
                      <p className="text-xs text-emerald-950 dark:text-emerald-100 font-medium">
                        {entry.threadSafety}
                      </p>
                    </div>
                  )}
                  {entry.performanceConsiderations && (
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3.5 border border-amber-200 dark:border-amber-800">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-1">
                        22. Performance Considerations
                      </h4>
                      <p className="text-xs text-amber-950 dark:text-amber-100 font-medium">
                        {entry.performanceConsiderations}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SYNTAX & CODE EXECUTION (Points 13-15) */}
          {activeTab === "syntax_execution" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* 13. Syntax */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-1.5 flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  13. Construct Syntax
                </h3>
                <div className="rounded-xl bg-slate-950 p-3.5 border border-blue-900 text-xs font-mono text-blue-300 shadow-inner overflow-x-auto">
                  <code>{entry.syntax}</code>
                </div>
              </div>

              {/* 14. Code Example */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    14. Practical Code Example
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

              {/* 15. Step-by-Step Execution */}
              {entry.stepByStepExecution && entry.stepByStepExecution.length > 0 && (
                <div className="rounded-xl bg-slate-900 p-4 border border-blue-900/60 text-slate-200">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1.5">
                    <ListOrdered className="h-4 w-4 text-blue-400" />
                    15. Step-by-Step Execution Trace
                  </h3>
                  <ol className="space-y-2 text-xs font-mono">
                    {entry.stepByStepExecution.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-blue-400 font-bold">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WHEN TO USE & TRADEOFFS (Points 6, 7-8, 18-19, 28-29) */}
          {activeTab === "when_to_use" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* 7. When to Use vs 8. When NOT to Use */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    7. When to Use
                  </h3>
                  <ul className="space-y-1.5 text-xs text-emerald-950 dark:text-emerald-100 font-medium">
                    {entry.whenToUse.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-rose-50/80 dark:bg-rose-950/40 p-4 border border-rose-200 dark:border-rose-800">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2 flex items-center gap-1.5">
                    <AlertOctagon className="h-4 w-4 text-rose-600" />
                    8. When NOT to Use
                  </h3>
                  <ul className="space-y-1.5 text-xs text-rose-950 dark:text-rose-100 font-medium">
                    {entry.whenNotToUse.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 18. Advantages & 19. Disadvantages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-blue-50/80 dark:bg-blue-950/40 p-4 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2">
                    18. Key Advantages
                  </h3>
                  <ul className="space-y-1.5 text-xs text-blue-950 dark:text-blue-100 font-medium">
                    {entry.advantages.map((adv, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {entry.disadvantages && entry.disadvantages.length > 0 && (
                  <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-800">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">
                      19. Disadvantages & Tradeoffs
                    </h3>
                    <ul className="space-y-1.5 text-xs text-amber-950 dark:text-amber-100 font-medium">
                      {entry.disadvantages.map((dis, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{dis}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 28. Real-world use cases & 29. Industry Examples (Spring, Kafka, Hibernate) */}
              {(entry.useCases.length > 0 || entry.industryExamples) && (
                <div className="rounded-xl bg-muted/40 p-4 border border-border">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    28 & 29. Real-World & Framework Integration Examples
                  </h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-bold text-foreground block mb-1">
                        Production Use Cases:
                      </span>
                      <ul className="space-y-1 pl-2">
                        {entry.useCases.map((uc, i) => (
                          <li key={i}>• {uc}</li>
                        ))}
                      </ul>
                    </div>
                    {entry.industryExamples && (
                      <div className="pt-2 border-t border-border/50">
                        <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">
                          Industry Examples (Spring, Kafka, Hibernate):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.industryExamples.map((ex, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
                            >
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: BEST PRACTICES & COMMON MISTAKES (Points 20-21) */}
          {activeTab === "best_practices" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* 20. Best Practices */}
              <div className="rounded-xl bg-blue-50/80 dark:bg-blue-950/40 p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  20. Industry Best Practices
                </h3>
                <ul className="space-y-2 text-xs text-blue-950 dark:text-blue-100 font-medium">
                  {entry.bestPractices.map((bp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-600 font-extrabold">•</span>
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 21. Common Mistakes */}
              {entry.commonMistakes && entry.commonMistakes.length > 0 && (
                <div className="rounded-xl bg-rose-50/80 dark:bg-rose-950/40 p-4 border border-rose-200 dark:border-rose-800">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2 flex items-center gap-1.5">
                    <AlertOctagon className="h-4 w-4 text-rose-600" />
                    21. Common Beginner Errors & Pitfalls
                  </h3>
                  <ul className="space-y-2 text-xs text-rose-950 dark:text-rose-100 font-medium">
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

          {/* TAB 6: INTERVIEW Q&A (Point 27) */}
          {activeTab === "interview" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5 mb-2">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                27. Curated Technical Interview Questions
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
                  No interview questions indexed for this construct.
                </p>
              )}
            </div>
          )}

          {/* TAB 7: OFFICIAL ORACLE JAVADOCS (Points 24-26) */}
          {activeTab === "javadocs" && isStandardLib && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* 25. Official JavaDocs Link & Summary */}
              {entry.officialDocUrl && (
                <div className="space-y-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-900 dark:text-blue-200">
                      25. Official Oracle Java Standard Library Specification
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
                  {entry.officialDocSummary && (
                    <p className="text-xs text-blue-950 dark:text-blue-100 italic leading-relaxed">
                      "{entry.officialDocSummary}"
                    </p>
                  )}
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

              {/* Standard Library Methods */}
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

              {/* 26. Related Java Concepts */}
              {entry.relatedTopics && entry.relatedTopics.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                    26. Related Java Concepts & Lessons
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
        </div>
      </div>
    </div>
  );
}
