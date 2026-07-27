// Queue utility functions for export, filtering, and shareable links
import { getQueue, type QueueItem, type QueueStep } from "@/lib/storage";

export type QueueFilter = {
  step?: QueueStep;
  httpStatus?: number;
  statusFilter?: QueueItem["status"];
  pdfId?: string;
  lessonSlug?: string;
};

export function filterQueue(items: QueueItem[], filter: QueueFilter): QueueItem[] {
  return items.filter((it) => {
    if (filter.step && it.failedStep !== filter.step && it.currentStep !== filter.step) return false;
    if (filter.httpStatus && it.httpStatus !== filter.httpStatus) return false;
    if (filter.statusFilter && it.status !== filter.statusFilter) return false;
    if (filter.pdfId && it.pdfId !== filter.pdfId) return false;
    if (filter.lessonSlug && it.slug !== filter.lessonSlug) return false;
    return true;
  });
}

export function getFailedItems(items: QueueItem[]): QueueItem[] {
  return items.filter((x) => x.status === "error");
}

export function encodeShareableLink(slugs: string[]): string {
  const params = new URLSearchParams({ failed: slugs.join(",") });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function decodeShareableLink(): string[] {
  const params = new URLSearchParams(window.location.search);
  const val = params.get("failed");
  return val ? val.split(",").filter(Boolean) : [];
}

type ExportRow = {
  slug: string;
  title: string;
  domain: string;
  section: string;
  status: string;
  failedStep: string;
  httpStatus: string;
  error: string;
  stackTrace: string;
  responseBody: string;
  retryCount: number;
  pdfId: string;
};

function toExportRow(item: QueueItem): ExportRow {
  return {
    slug: item.slug,
    title: item.title,
    domain: item.domain,
    section: item.section,
    status: item.status,
    failedStep: item.failedStep ?? "",
    httpStatus: item.httpStatus ? String(item.httpStatus) : "",
    error: item.error ?? "",
    stackTrace: item.stackTrace ?? "",
    responseBody: item.responseBody ?? "",
    retryCount: item.retryCount ?? 0,
    pdfId: item.pdfId ?? "",
  };
}

export function exportJSON(items: QueueItem[], filename: string) {
  const rows = items.map(toExportRow);
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
  downloadBlob(blob, `${filename}.json`);
}

export function exportCSV(items: QueueItem[], filename: string) {
  const rows = items.map(toExportRow);
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]) as (keyof ExportRow)[];
  const escape = (v: unknown) => {
    const s = String(v ?? "").replace(/"/g, '""');
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  downloadBlob(blob, `${filename}.csv`);
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}
