import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React, { useState, useMemo } from "react";
import { Copy, Check, Terminal, BookOpen } from "lucide-react";
import { lookupJavadoc, type JavadocEntry } from "@/lib/javadoc-db";
import { JavadocModal } from "@/components/JavadocModal";

// Core Master Set of Java Technical Terms
const ALL_JAVA_KEYWORDS = [
  "PriorityQueue",
  "HashMap",
  "HashSet",
  "ArrayList",
  "LinkedList",
  "TreeMap",
  "TreeSet",
  "ConcurrentHashMap",
  "BlockingQueue",
  "ArrayDeque",
  "Vector",
  "Hashtable",
  "Map",
  "Set",
  "List",
  "Queue",
  "Deque",
  "Collection",
  "Iterable",
  "Comparable",
  "Comparator",
  "Stream",
  "Collectors",
  "Optional",
  "Predicate",
  "Consumer",
  "Function",
  "Supplier",
  "Thread",
  "ExecutorService",
  "ForkJoinPool",
  "CompletableFuture",
  "ReentrantLock",
  "Semaphore",
  "CountDownLatch",
  "Exception",
  "RuntimeException",
  "IOException",
  "NullPointerException",
  "IllegalArgumentException",
  "JVM",
  "JIT",
  "GC",
  "ClassLoader",
  "@Override",
  "@Component",
  "@Service",
  "@Repository",
  "@RestController",
  "@Entity",
  "@Autowired",
  "@Bean",
  "@Transactional",
  "if",
  "else",
  "switch",
  "case",
  "for",
  "while",
  "do",
  "break",
  "continue",
  "return",
  "class",
  "interface",
  "enum",
  "record",
  "sealed",
  "permits",
  "extends",
  "implements",
  "try",
  "catch",
  "finally",
  "throw",
  "throws",
  "synchronized",
  "volatile",
  "transient",
  "this",
  "super",
  "instanceof",
  "static",
  "final",
  "public",
  "private",
  "protected",
];

// Helper to determine topic-relevant keywords (STEP 1, STEP 2 & STEP 8)
function getTopicKeywords(topicTitle?: string): Set<string> {
  const normalized = (topicTitle || "").toLowerCase();
  const relevant = new Set<string>();

  // If topic is PriorityQueue / Queues
  if (
    normalized.includes("priorityqueue") ||
    normalized.includes("queue") ||
    normalized.includes("heap")
  ) {
    [
      "PriorityQueue",
      "Queue",
      "Deque",
      "Comparator",
      "Comparable",
      "offer",
      "poll",
      "peek",
      "AbstractQueue",
    ].forEach((k) => relevant.add(k));
  }
  // If topic is Collections / Maps / Sets
  else if (
    normalized.includes("collection") ||
    normalized.includes("hashmap") ||
    normalized.includes("map") ||
    normalized.includes("list")
  ) {
    [
      "HashMap",
      "HashSet",
      "ArrayList",
      "LinkedList",
      "TreeMap",
      "TreeSet",
      "Map",
      "Set",
      "List",
      "Collection",
      "Comparator",
      "equals",
      "hashCode",
    ].forEach((k) => relevant.add(k));
  }
  // If topic is Streams / Functional
  else if (
    normalized.includes("stream") ||
    normalized.includes("lambda") ||
    normalized.includes("functional")
  ) {
    [
      "Stream",
      "Collectors",
      "Optional",
      "Predicate",
      "Consumer",
      "Function",
      "Supplier",
      "@FunctionalInterface",
      "map",
      "filter",
      "reduce",
      "collect",
    ].forEach((k) => relevant.add(k));
  }
  // If topic is Concurrency / Multithreading
  else if (
    normalized.includes("thread") ||
    normalized.includes("concurrent") ||
    normalized.includes("lock") ||
    normalized.includes("executor")
  ) {
    [
      "Thread",
      "ExecutorService",
      "ForkJoinPool",
      "CompletableFuture",
      "synchronized",
      "volatile",
      "ReentrantLock",
      "AtomicInteger",
      "Runnable",
      "Callable",
    ].forEach((k) => relevant.add(k));
  }
  // If topic is Control Flow / Loops
  else if (
    normalized.includes("control") ||
    normalized.includes("flow") ||
    normalized.includes("loop") ||
    normalized.includes("conditional")
  ) {
    [
      "if",
      "else",
      "switch",
      "case",
      "for",
      "while",
      "do",
      "break",
      "continue",
      "return",
      "yield",
    ].forEach((k) => relevant.add(k));
  }
  // Default fallback: Include major classes and annotations
  else {
    [
      "PriorityQueue",
      "HashMap",
      "HashSet",
      "ArrayList",
      "Stream",
      "Optional",
      "Thread",
      "ExecutorService",
      "CompletableFuture",
      "Comparator",
      "Map",
      "List",
      "Set",
      "synchronized",
      "volatile",
      "@Override",
      "@RestController",
    ].forEach((k) => relevant.add(k));
  }

  return relevant;
}

function renderTextWithKeywords(
  text: string,
  onWordClick: (word: string) => void,
  topicKeywords: Set<string>,
): React.ReactNode[] {
  if (!text || typeof text !== "string") return [text];

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let highlightCount = 0;

  // Build regex dynamically for relevant keywords
  const regexPattern = Array.from(topicKeywords)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  if (!regexPattern) return [text];
  const regex = new RegExp(`\\b(${regexPattern})\\b`, "g");

  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // STEP 7 Density Cap: Max 8 highlights per text block
    if (highlightCount >= 8) break;

    const matchText = match[0];
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }

    parts.push(
      <span
        key={`${matchText}-${matchIndex}`}
        onClick={(e) => {
          e.stopPropagation();
          onWordClick(matchText);
        }}
        className="font-mono text-[12px] font-bold px-1 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900 transition-all cursor-pointer inline-flex items-center gap-0.5 mx-0.5 shadow-2xs group"
        title={`Click for Javadoc & Specification: ${matchText}`}
      >
        <span>{matchText}</span>
        <BookOpen className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100 shrink-0 text-blue-600 dark:text-blue-400" />
      </span>,
    );

    highlightCount++;
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
  topicKeywords: Set<string>,
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      return renderTextWithKeywords(child, onWordClick, topicKeywords);
    }
    return child;
  });
}

export function Markdown({ children, topicTitle }: { children: string; topicTitle?: string }) {
  const [selectedEntry, setSelectedEntry] = useState<JavadocEntry | null>(null);

  const topicKeywords = useMemo(() => getTopicKeywords(topicTitle), [topicTitle]);

  const handleWordClick = (word: string) => {
    const entry = lookupJavadoc(word, topicTitle);
    if (entry) {
      setSelectedEntry(entry);
    }
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
              {processChildren(children, handleWordClick, topicKeywords)}
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2
              className="text-lg font-bold text-foreground mt-5 mb-2.5 flex items-center gap-2 text-primary"
              {...props}
            >
              {processChildren(children, handleWordClick, topicKeywords)}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 className="text-base font-semibold text-foreground mt-4 mb-2" {...props}>
              {processChildren(children, handleWordClick, topicKeywords)}
            </h3>
          ),
          h4: ({ node, children, ...props }) => (
            <h4 className="text-sm font-semibold text-foreground/90 mt-3 mb-1.5" {...props}>
              {processChildren(children, handleWordClick, topicKeywords)}
            </h4>
          ),
          p: ({ node, children, ...props }) => (
            <p
              className="mb-3 text-foreground/90 dark:text-muted-foreground leading-relaxed"
              {...props}
            >
              {processChildren(children, handleWordClick, topicKeywords)}
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
              {processChildren(children, handleWordClick, topicKeywords)}
            </li>
          ),
          blockquote: ({ node, children, ...props }) => (
            <blockquote
              className="border-l-4 border-primary/70 bg-primary/5 px-4 py-3 rounded-r-xl my-4 text-foreground/90 dark:text-muted-foreground italic"
              {...props}
            >
              {processChildren(children, handleWordClick, topicKeywords)}
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
              {processChildren(children, handleWordClick, topicKeywords)}
            </th>
          ),
          td: ({ node, children, ...props }) => (
            <td
              className="px-3.5 py-2.5 border-b border-border/50 text-foreground/90 dark:text-muted-foreground"
              {...props}
            >
              {processChildren(children, handleWordClick, topicKeywords)}
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

            // Inline code chip: Clickable Javadoc trigger
            return (
              <button
                type="button"
                onClick={() => handleWordClick(codeString)}
                className="inline-flex items-center gap-1 font-mono text-[12px] font-semibold px-2 py-0.5 my-0.5 rounded-md border border-blue-300 dark:border-blue-800 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all cursor-pointer group shadow-2xs"
                title="Click to view Javadoc & Specification"
              >
                <span>{children}</span>
                <BookOpen className="h-3 w-3 opacity-60 group-hover:opacity-100 shrink-0 text-blue-600 dark:text-blue-400" />
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
          <Terminal className="h-3.5 w-3.5 text-blue-400" />
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
        <code className="!bg-transparent !text-blue-200 !border-0 !p-0 font-mono text-xs shadow-none">
          {value}
        </code>
      </pre>
    </div>
  );
}
