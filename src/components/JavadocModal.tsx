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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/80 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {entry.category}
              </span>
              {entry.since && (
                <span className="text-xs text-muted-foreground font-mono font-medium">
                  {entry.since}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mt-2 font-mono flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary shrink-0" />
              {entry.name}
            </h2>
            {entry.package && (
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Package: <span className="text-foreground font-semibold">{entry.package}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Signature */}
        {entry.signature && (
          <div className="mb-4 rounded-xl bg-zinc-950 p-3.5 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto shadow-inner">
            <code>{entry.signature}</code>
          </div>
        )}

        {/* Javadoc Specification & Summary */}
        <div className="space-y-4 text-sm">
          <div className="rounded-xl bg-muted/40 p-4 border border-border/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-1 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Official Javadoc Specification
            </h3>
            <p className="text-muted-foreground leading-relaxed">{entry.summary}</p>
          </div>

          <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-1 flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              Feynman Simple Explanation
            </h3>
            <p className="text-foreground/90 leading-relaxed italic">{entry.feynman}</p>
          </div>

          {/* Key Methods Table */}
          {entry.methods && entry.methods.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                <Code className="h-4 w-4 text-primary" />
                Key Methods & Specifications
              </h3>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/80 text-foreground font-semibold border-b border-border">
                      <th className="p-2.5 font-mono">Method</th>
                      <th className="p-2.5 font-mono">Signature</th>
                      <th className="p-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.methods.map((m, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-2.5 font-bold font-mono text-primary">{m.name}</td>
                        <td className="p-2.5 font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">
                          {m.signature}
                        </td>
                        <td className="p-2.5 text-muted-foreground">{m.desc}</td>
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-primary" />
                Javadoc Code Example
              </h3>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded bg-muted"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed shadow-inner">
              <pre>
                <code>{entry.codeExample}</code>
              </pre>
            </div>
          </div>

          {/* Best Practices */}
          {entry.bestPractices && entry.bestPractices.length > 0 && (
            <div className="rounded-xl bg-muted/40 p-4 border border-border/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Production Best Practices
              </h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {entry.bestPractices.map((bp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
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
