import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Cpu,
  Clock,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/admin/logs")({
  component: AdminLogsPage,
});

type LogItem = {
  id: string;
  created_at: string;
  slug?: string | null;
  action: string;
  metadata?: {
    topicTitle?: string;
    error?: string;
    message?: string;
    details?: string;
    logs?: Array<{
      model: string;
      status?: number;
      error?: string;
      timestamp?: string;
    }>;
  } | null;
};

function AdminLogsPage() {
  const auth = useAuth();
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      // Fetch system logs from Supabase user_activity table
      const { data, error } = await supabase
        .from("user_activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && data) {
        setLogs(data as LogItem[]);
      } else {
        // Fallback to local storage audit logs if database query is empty
        const localLogs = JSON.parse(localStorage.getItem("backend_mastery:system_logs") || "[]");
        setLogs(localLogs);
      }
    } catch {
      const localLogs = JSON.parse(localStorage.getItem("backend_mastery:system_logs") || "[]");
      setLogs(localLogs);
    } finally {
      setLoading(false);
    }
  }

  function clearLogs() {
    if (confirm("Are you sure you want to clear system logs?")) {
      localStorage.removeItem("backend_mastery:system_logs");
      setLogs([]);
    }
  }

  if (!auth.isAdmin) {
    return (
      <div className="p-8 text-center text-muted-foreground border border-border rounded-2xl bg-card">
        <Shield className="h-8 w-8 mx-auto mb-2 text-destructive" />
        <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm mt-1">This log dashboard is reserved strictly for system admins.</p>
      </div>
    );
  }

  const failedCount = logs.filter(
    (l) => l.action === "generation_failed" || l.action === "model_error",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border/80 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg leading-tight">AI &amp; System Audit Logs</h2>
            <p className="text-xs text-muted-foreground">
              Monitor model execution traces, fallback cascades, and error diagnostics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={clearLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Log Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" /> Total Recorded Events
          </div>
          <div className="mt-1 text-2xl font-bold">{logs.length}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Limit / Failure Errors
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-500">{failedCount}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 col-span-2 sm:col-span-1">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-emerald-500" /> Model Fallbacks
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-500">17 Configured</div>
        </div>
      </div>

      {/* Logs List */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-sm font-semibold flex items-center justify-between">
          <span>Execution Traces ({logs.length})</span>
          <span className="text-xs text-muted-foreground font-normal">Showing recent logs</span>
        </div>

        {logs.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm space-y-1">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <div className="font-semibold text-foreground">No failure logs recorded</div>
            <div className="text-xs">All AI model generation requests are executing smoothly.</div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((item) => {
              const isExpanded = expandedId === item.id;
              const isError = item.action === "generation_failed" || item.action === "model_error";
              const title = item.metadata?.topicTitle || item.slug || item.action || "System Event";
              const errorMsg =
                item.metadata?.error ||
                item.metadata?.message ||
                "Regeneration is not possible today because todays limit reached";

              return (
                <div key={item.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isError
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {isError ? (
                            <AlertTriangle className="h-3 w-3" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          {item.action}
                        </span>
                        <span className="text-xs font-semibold text-foreground">{title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                      {isError && (
                        <div className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                          {errorMsg}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground shrink-0"
                      title="View model trace"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Model Execution Cascade */}
                  {isExpanded && item.metadata?.logs && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2 animate-in fade-in duration-200">
                      <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-primary" /> Model Fallback Attempt Trace (
                        {item.metadata.logs.length} models)
                      </div>
                      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                        {item.metadata.logs.map((log, idx) => (
                          <div
                            key={idx}
                            className="text-xs p-2 rounded-lg bg-muted/60 border border-border/60 flex flex-wrap items-center justify-between gap-2"
                          >
                            <div className="font-mono text-[11px] truncate max-w-xs sm:max-w-md">
                              <span className="text-muted-foreground mr-1">#{idx + 1}</span>
                              {log.model}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                                  log.status === 200
                                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold"
                                    : "bg-red-500/20 text-red-600 dark:text-red-400 font-bold"
                                }`}
                              >
                                {log.status ? `HTTP ${log.status}` : "Timeout"}
                              </span>
                              {log.error && (
                                <span
                                  className="text-[10px] text-muted-foreground max-w-[200px] truncate"
                                  title={log.error}
                                >
                                  {log.error}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
