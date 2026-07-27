import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-lesson text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-xl font-bold text-foreground mt-6 mb-3 flex items-center gap-2 border-b border-border/60 pb-2"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-lg font-bold text-foreground mt-5 mb-2.5 flex items-center gap-2 text-primary"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base font-semibold text-foreground mt-4 mb-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-sm font-semibold text-foreground/90 mt-3 mb-1.5" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-3 text-muted-foreground leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-inside space-y-1.5 mb-4 text-muted-foreground pl-2"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside space-y-1.5 mb-4 text-muted-foreground pl-2"
              {...props}
            />
          ),
          li: ({ node, ...props }) => <li className="leading-normal" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-primary/70 bg-primary/5 px-4 py-3 rounded-r-xl my-4 text-muted-foreground italic"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-border">
              <table className="w-full text-left text-xs border-collapse" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="bg-muted px-3.5 py-2.5 font-semibold text-foreground border-b border-border"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="px-3.5 py-2.5 border-b border-border/50 text-muted-foreground"
              {...props}
            />
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
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono font-medium text-primary border border-primary/10"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
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
    value.includes("+--") ||
    value.includes("|-->") ||
    (value.includes("[") && value.includes("]"));

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-border/80 bg-zinc-950 text-zinc-100 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400">
        <div className="flex items-center gap-2 font-mono">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span className="uppercase text-[11px] font-semibold text-zinc-300">
            {isAsciiDiagram ? "Architecture / Data Flow Diagram" : language || "code"}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded bg-zinc-800/60 hover:bg-zinc-800"
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
      <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-zinc-200">
        <code>{value}</code>
      </pre>
    </div>
  );
}
