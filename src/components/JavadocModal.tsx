import React from "react";
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
  Layers,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { useState } from "react";

export function JavadocModal({
  entry,
  onClose,
}: {
  entry: JavadocEntry | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!entry) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(entry.codeExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-blue-200 dark:border-blue-900/80 bg-card p-6 shadow-2xl text-foreground scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Stable Close Button */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-md pb-4 mb-4 border-b border-blue-100 dark:border-blue-900/60 -mx-6 px-6 -mt-6 pt-6 flex items-start justify-between">
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
            <h2 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1.5 font-mono flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0" />
              {entry.name}
            </h2>
            {entry.package && (
              <p className="text-xs text-blue-600/90 dark:text-blue-300/90 font-mono mt-0.5">
                Package:{" "}
                <span className="font-bold text-blue-700 dark:text-blue-200">{entry.package}</span>
              </p>
            )}
          </div>

          {/* Stable Fixed Close Button */}
          <button
            onClick={onClose}
            className="rounded-full p-2 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950 border border-blue-200 dark:border-blue-800/80 transition-colors shrink-0 shadow-xs cursor-pointer"
            title="Close Javadoc (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Signature */}
        {entry.signature && (
          <div className="mb-4 rounded-xl bg-slate-950 p-3.5 border border-blue-900 text-xs font-mono text-blue-300 overflow-x-auto shadow-inner">
            <code>{entry.signature}</code>
          </div>
        )}

        {/* Javadoc Specification & Deep-Dive Explanation */}
        <div className="space-y-4 text-sm">
          {/* Official Javadoc Specification */}
          <div className="rounded-xl bg-blue-50/80 dark:bg-blue-950/40 p-4 border border-blue-200 dark:border-blue-800/80">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Official Javadoc Specification
            </h3>
            <p className="text-blue-950 dark:text-blue-100 leading-relaxed font-medium mb-2">
              {entry.summary}
            </p>
            {entry.detailedExplanation && (
              <p className="text-xs text-blue-900/90 dark:text-blue-200/90 leading-relaxed border-t border-blue-200/60 dark:border-blue-800/60 pt-2 mt-2">
                {entry.detailedExplanation}
              </p>
            )}
          </div>

          {/* Feynman Simple Explanation */}
          <div className="rounded-xl bg-sky-50/80 dark:bg-sky-950/40 p-4 border border-sky-200 dark:border-sky-800/80">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-1.5 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              Feynman Simple Explanation
            </h3>
            <p className="text-sky-950 dark:text-sky-100 leading-relaxed italic font-medium">
              "{entry.feynman}"
            </p>
          </div>

          {/* When to Use vs When to Avoid */}
          {entry.whenToUse && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 border border-emerald-200 dark:border-emerald-800/60">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  When to Use
                </h4>
                <ul className="space-y-1 text-xs text-emerald-950 dark:text-emerald-100">
                  {entry.whenToUse.use.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-rose-50/60 dark:bg-rose-950/30 p-3.5 border border-rose-200 dark:border-rose-800/60">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  When NOT to Use
                </h4>
                <ul className="space-y-1 text-xs text-rose-950 dark:text-rose-100">
                  {entry.whenToUse.avoid.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Key Methods Table */}
          {entry.methods && entry.methods.length > 0 && (
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Key Methods & Specifications
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

          {/* Practical Code Example */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Javadoc Practical Code Example
              </h3>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 cursor-pointer"
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

            {/* Dark Code Container with High-Contrast Text */}
            <div className="rounded-xl overflow-hidden border border-blue-900/80 bg-slate-950 text-slate-100 shadow-md">
              <pre className="!bg-slate-950 !text-slate-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed border-0 m-0">
                <code className="!bg-transparent !text-blue-200 !border-0 !p-0 font-mono text-xs shadow-none">
                  {entry.codeExample}
                </code>
              </pre>
            </div>
          </div>

          {/* Best Practices */}
          {entry.bestPractices && entry.bestPractices.length > 0 && (
            <div className="rounded-xl bg-blue-50/80 dark:bg-blue-950/40 p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Production Best Practices
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
          )}
        </div>
      </div>
    </div>
  );
}
