import { useState, useRef, useEffect } from "react";
import { Markdown } from "./Markdown";
import { Sparkles, Send, X } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export function AiTeacher({ topicTitle }: { topicTitle?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const handler = (e: Event) => {
      const q = (e as CustomEvent<string>).detail;
      if (typeof q !== "string" || !q.trim()) return;
      setOpen(true);
      void send(q);
    };
    window.addEventListener("ai-teacher:ask", handler as EventListener);
    return () => window.removeEventListener("ai-teacher:ask", handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, topicTitle]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, topicTitle }),
      });
      if (!res.ok) {
        const err = await res.text();
        setMessages([
          ...next,
          { role: "assistant", content: `⚠️ ${err.slice(0, 200) || "Request failed"}` },
        ]);
      } else {
        const data = (await res.json()) as { content: string };
        setMessages([...next, { role: "assistant", content: data.content }]);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "⚠️ Network error" }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  const quickPrompts = [
    "Explain like I'm five",
    "Give a real-world analogy",
    "Compare with alternatives",
    "Generate a quick quiz",
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full text-white font-medium shadow-lg hover:opacity-90 transition-opacity"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-elegant)" }}
      >
        <Sparkles className="h-4 w-4" />
        AI Teacher
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full sm:w-[440px] h-[85vh] sm:h-[600px] bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ background: "var(--gradient-primary)" }}
            >
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="h-4 w-4" />
                <div>
                  <div className="text-sm font-semibold">AI Teacher</div>
                  {topicTitle && <div className="text-[11px] opacity-90">on: {topicTitle}</div>}
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/90 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Ask anything about{" "}
                    {topicTitle ? <strong>{topicTitle}</strong> : "backend development"}. I can
                    explain differently, compare topics, and generate examples or quizzes.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                  <div
                    className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                      m.role === "user" ? "text-white" : "bg-muted text-foreground"
                    }`}
                    style={
                      m.role === "user" ? { background: "var(--gradient-primary)" } : undefined
                    }
                  >
                    {m.role === "assistant" ? <Markdown>{m.content}</Markdown> : m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Thinking…
                </div>
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="border-t border-border p-3 flex gap-2 bg-background"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Ask a question…"
                className="flex-1 resize-none bg-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-3 rounded-lg text-white disabled:opacity-50"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
