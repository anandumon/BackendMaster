import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React, { useState } from "react";
import { Copy, Check, Terminal, BookOpen } from "lucide-react";
import { lookupJavadoc, type JavadocEntry } from "@/lib/javadoc-db";
import { JavadocModal } from "@/components/JavadocModal";

const JAVA_KEYWORD_REGEX =
  /\b(Predicate|Consumer|Function|Supplier|BiFunction|UnaryOperator|BinaryOperator|Runnable|Callable|Comparator|Stream|Optional|List|ArrayList|Map|HashMap|Set|HashSet|Queue|Deque|AutoCloseable|Closeable|Thread|ExecutorService|Future|CompletableFuture|ReentrantLock|AtomicInteger|if|else|switch|case|for|while|do|break|continue|return|try|catch|finally|throw|throws|class|interface|enum|record|extends|implements|super|this|instanceof|public|private|protected|static|final|synchronized|volatile|transient|var|void|int|long|boolean|double|float|yield|sealed|permits|@FunctionalInterface)\b/g;

function renderTextWithKeywords(
  text: string,
  onWordClick: (word: string) => void,
): React.ReactNode[] {
  if (!text || typeof text !== "string") return [text];

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex index
  JAVA_KEYWORD_REGEX.lastIndex = 0;

  while ((match = JAVA_KEYWORD_REGEX.exec(text)) !== null) {
    const matchText = match[0];
    const matchIndex = match.index;

    // Append preceding plain text
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }

    // Append clickable keyword span
    parts.push(
      <span
        key={`${matchText}-${matchIndex}`}
        onClick={(e) => {
          e.stopPropagation();
          onWordClick(matchText);
        }}
        className="font-mono text-[12px] font-bold px-1 py-0.5 rounded bg-primary/10 text-primary dark:bg-primary/25 dark:text-primary-foreground border border-primary/20 hover:bg-primary/20 hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-0.5 mx-0.5 shadow-2xs group"
        title={`Click for Javadoc: ${matchText}`}
      >
        <span>{matchText}</span>
        <BookOpen className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100 shrink-0 text-primary" />
      </span>,
    );

    lastIndex = matchIndex + matchText.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

function processChildren(
  children: React.ReactNode,
  onWordClick: (word: string) => void,
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      return renderTextWithKeywords(child, onWordClick);
    }
    return child;
  });
}

export function Markdown({ children }: { children: string }) {
  const [selectedEntry, setSelectedEntry] = useState<JavadocEntry | null>(null);

  const handleWordClick = (word: string) => {
    const entry = lookupJavadoc(word);
    setSelectedEntry(entry);
  };

  return (
    <div className="prose-lesson text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, children, ...props }) => (
            <h1
              className="text-xl font-bold text-foreground mt-6 mb-3 flex items-center gap-2 border-b border-border/60 pb-2"
              {...props}
            >
              {processChildren(children, handleWordClick)}
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2
              className="text-lg font-bold text-foreground mt-5 mb-2.5 flex items-center gap-2 text-primary"
              {...props}
            >
              {processChildren(children, handleWordClick)}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 className="text-base font-semibold text-foreground mt-4 mb-2" {...props}>
              {processChildren(children, handleWordClick)}
            </h3>
          ),
          h4: ({ node, children, ...props }) => (
            <h4 className="text-sm font-semibold text-foreground/90 mt-3 mb-1.5" {...props}>
              {processChildren(children, handleWordClick)}
            </h4>
          ),
          p: ({ node, children, ...props }) => (
            <p
              className="mb-3 text-foreground/90 dark:text-muted-foreground leading-relaxed"
              {...props}
            >
              {processChildren(children, handleWordClick)}
            </p>
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-inside space-y-1.5 mb-4 text-foreground/90 dark:text-muted-foreground pl-2"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside space-y-1.5 mb-4 text-foreground/90 dark:text-muted-foreground pl-2"
              {...props}
            />
          ),
          li: ({ node, children, ...props }) => (
            <li className="leading-normal" {...props}>
              {processChildren(children, handleWordClick)}
            </li>
          ),
          blockquote: ({ node, children, ...props }) => (
            <blockquote
              className="border-l-4 border-primary/70 bg-primary/5 px-4 py-3 rounded-r-xl my-4 text-foreground/90 dark:text-muted-foreground italic"
              {...props}
            >
              {processChildren(children, handleWordClick)}
            </blockquote>
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-border/80 shadow-xs bg-card">
              <table className="w-full text-left text-xs border-collapse" {...props} />
            </div>
          ),
          th: ({ node, children, ...props }) => (
            <th
              className="bg-muted/80 px-3.5 py-2.5 font-bold text-foreground border-b border-border"
              {...props}
            >
              {processChildren(children, handleWordClick)}
            </th>
          ),
          td: ({ node, children, ...props }) => (
            <td
              className="px-3.5 py-2.5 border-b border-border/50 text-foreground/90 dark:text-muted-foreground"
              {...props}
            >
              {processChildren(children, handleWordClick)}
            </td>
          ),
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            if (
              !inline &&
              (match ||
                codeString.includes("\n") ||
                codeString.includes("+--") ||
                codeString.includes("|"))
            ) {
              return <CodeBlock language={match?.[1] || "text"} value={codeString} />;
            }

            return (
              <button
                type="button"
                onClick={() => handleWordClick(codeString)}
                className="inline-flex items-center gap-1 font-mono text-[12px] font-semibold px-2 py-0.5 my-0.5 rounded-md border border-primary/30 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground hover:bg-primary/20 hover:scale-[1.03] transition-all cursor-pointer group shadow-2xs"
                title="Click to view Javadoc & Keyword specification"
              >
                <span>{children}</span>
                <BookOpen className="h-3 w-3 opacity-60 group-hover:opacity-100 shrink-0 text-primary" />
              </button>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>

      <JavadocModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </div>
  );
}

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAsciiDiagram =
    value.includes("+--") || value.includes("|-->") || (value.includes("[") && value.includes("]"));

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400">
        <div className="flex items-center gap-2 font-mono">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span className="uppercase text-[11px] font-semibold text-zinc-300">
            {isAsciiDiagram ? "Architecture / Data Flow Diagram" : language || "code"}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-800"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="!bg-zinc-950 !text-zinc-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed border-0 m-0">
        <code className="!bg-transparent !text-zinc-100 !border-0 !p-0 font-mono text-xs shadow-none">
          {value}
        </code>
      </pre>
    </div>
  );
}
