// Client-side storage for AI-extracted roadmaps (from PDF uploads).
// Merged with the static DOMAINS at runtime.

import { useEffect, useState } from "react";
import type { Domain, Section, Topic } from "@/lib/curriculum";
import { DOMAINS } from "@/lib/curriculum";
import { safeGet, safeSet } from "@/lib/storage";

const KEY = "extracted-domains-v1";
const PDFS_KEY = "uploaded-pdfs-v1";

export type ExtractedDomain = Domain & {
  extractedFromPdfId?: string;
  extractedAt?: number;
};

export type TopicConfidence = {
  slug: string;
  title: string;
  confidence: number; // 0-1
};

export type SkippedNode = {
  title: string;
  reason: string;
};

export type ParseQuality = {
  domains: number;
  sections: number;
  topics: number;
  warnings: string[];
  hierarchyDepth: number;
  maxBranching: number;
  avgBranching: number;
  topicConfidences: TopicConfidence[];
  skippedNodes: SkippedNode[];
  expectedNodeCount: number;
};

export type UploadedPdf = {
  id: string;
  name: string;
  size: number;
  uploadedAt: number;
  status: "pending" | "parsing" | "done" | "error";
  error?: string;
  parseNotes?: string;
  quality?: ParseQuality;
  domainSlugs?: string[]; // slugs of domains produced by this PDF
};

export type CompletenessReport = {
  pdfId: string;
  pdfName: string;
  domainSlug: string;
  domainTitle: string;
  expectedNodeCount: number;
  actualNodeCount: number;
  coveragePercent: number;
  missingNodes: { title: string; section: string; reason: string }[];
  status: "complete" | "partial" | "incomplete";
};

let listeners: Array<() => void> = [];
function emit() {
  listeners.forEach((l) => l());
}
export function subscribe(fn: () => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function getExtractedDomains(): ExtractedDomain[] {
  return safeGet<ExtractedDomain[]>(KEY, []);
}
export function setExtractedDomains(list: ExtractedDomain[]) {
  safeSet(KEY, list);
  emit();
}

export function getPdfs(): UploadedPdf[] {
  return safeGet<UploadedPdf[]>(PDFS_KEY, []);
}
export function setPdfs(list: UploadedPdf[]) {
  safeSet(PDFS_KEY, list);
  emit();
}
export function upsertPdf(pdf: UploadedPdf) {
  const list = getPdfs();
  const i = list.findIndex((p) => p.id === pdf.id);
  if (i >= 0) list[i] = pdf;
  else list.unshift(pdf);
  setPdfs(list);
}
export function deletePdf(id: string) {
  const pdf = getPdfs().find((p) => p.id === id);
  setPdfs(getPdfs().filter((p) => p.id !== id));
  if (pdf?.domainSlugs?.length) {
    setExtractedDomains(getExtractedDomains().filter((d) => !pdf.domainSlugs!.includes(d.slug)));
  }
}

export function getAllDomains(): Domain[] {
  const extra = getExtractedDomains();
  const baseSlugs = new Set(DOMAINS.map((d) => d.slug));
  // Merge: if an extracted domain has the same slug as a static one, extend it.
  const out: Domain[] = DOMAINS.map((base) => {
    const overlay = extra.find((e) => e.slug === base.slug);
    if (!overlay) return base;
    // Append new sections; skip sections whose slug already exists in base.
    const existingSecSlugs = new Set(base.sections.map((s) => s.slug));
    const mergedSections: Section[] = [
      ...base.sections,
      ...overlay.sections.filter((s) => !existingSecSlugs.has(s.slug)),
    ];
    return { ...base, sections: mergedSections };
  });
  for (const ex of extra) {
    if (!baseSlugs.has(ex.slug)) out.push(ex);
  }
  return out;
}

export function useAllDomains(): Domain[] {
  const [domains, setDomains] = useState<Domain[]>(() =>
    typeof window === "undefined" ? DOMAINS : getAllDomains(),
  );
  useEffect(() => {
    setDomains(getAllDomains());
    return subscribe(() => setDomains(getAllDomains()));
  }, []);
  return domains;
}

export function addExtractedDomain(d: ExtractedDomain) {
  const list = getExtractedDomains();
  const i = list.findIndex((x) => x.slug === d.slug);
  if (i >= 0) list[i] = d;
  else list.push(d);
  setExtractedDomains(list);
}

export function renameTopic(slug: string, newTitle: string) {
  const list = getExtractedDomains();
  for (const d of list) {
    for (const s of d.sections) {
      const t = s.topics.find((x) => x.slug === slug);
      if (t) {
        t.title = newTitle;
        setExtractedDomains(list);
        return true;
      }
    }
  }
  return false;
}

export function deleteTopic(slug: string) {
  const list = getExtractedDomains();
  let changed = false;
  for (const d of list) {
    for (const s of d.sections) {
      const i = s.topics.findIndex((x) => x.slug === slug);
      if (i >= 0) {
        s.topics.splice(i, 1);
        changed = true;
      }
    }
  }
  if (changed) setExtractedDomains(list);
  return changed;
}

export type FlatTopic = { domain: Domain; section: Section; topic: Topic };

export function allTopicsMerged(): FlatTopic[] {
  const out: FlatTopic[] = [];
  for (const domain of getAllDomains()) {
    for (const section of domain.sections) {
      for (const topic of section.topics) {
        out.push({ domain, section, topic });
      }
    }
  }
  return out;
}

export function findLessonMerged(slug: string) {
  if (!slug) return null;
  const normSlug = slug.toLowerCase().trim();

  // 1. Exact or normalized slug match
  for (const domain of getAllDomains()) {
    for (const section of domain.sections) {
      for (const topic of section.topics) {
        if (topic.slug.toLowerCase().trim() === normSlug) return { domain, section, topic };
      }
    }
  }

  // 2. Title-derived slug match (e.g. "control-flow" -> "Control Flow")
  for (const domain of getAllDomains()) {
    for (const section of domain.sections) {
      for (const topic of section.topics) {
        const topicTitleSlug = topic.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        if (topicTitleSlug === normSlug) return { domain, section, topic };
      }
    }
  }

  // 3. Dynamic fallback for any valid topic slug so no valid URL returns 404
  const formattedTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    domain: {
      slug: "general",
      title: "Backend Engineering",
      icon: "💻",
      color: "oklch(0.6 0.2 240)",
      tagline: "Core engineering concepts and topics",
      sections: [],
    },
    section: { slug: "core-topics", title: "Core Topics", topics: [] },
    topic: {
      slug,
      title: formattedTitle,
      summary: `Master class and textbook-quality guide for ${formattedTitle}.`,
    },
  };
}

export function findAdjacentMerged(slug: string) {
  const all = allTopicsMerged();
  const i = all.findIndex((x) => x.topic.slug === slug);
  return {
    prev: i > 0 ? all[i - 1] : null,
    next: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
  };
}

// ─── Completeness Checker ───────────────────────────────────────────────────

export function checkCompleteness(pdf: UploadedPdf): CompletenessReport | null {
  if (pdf.status !== "done" || !pdf.domainSlugs?.length || !pdf.quality) return null;

  const domains = getExtractedDomains().filter((d) => pdf.domainSlugs!.includes(d.slug));
  if (domains.length === 0) return null;

  const domain = domains[0];
  const actualNodeCount = domain.sections.reduce((sum, sec) => sum + sec.topics.length, 0);
  const expectedNodeCount = pdf.quality.expectedNodeCount || actualNodeCount;

  // Find missing nodes from skipped list
  const missingNodes: CompletenessReport["missingNodes"] = (pdf.quality.skippedNodes || []).map(
    (sn) => ({
      title: sn.title,
      section: "Unknown",
      reason: sn.reason,
    }),
  );

  const coveragePercent =
    expectedNodeCount > 0 ? Math.round((actualNodeCount / expectedNodeCount) * 100) : 100;

  let status: CompletenessReport["status"];
  if (coveragePercent >= 95) status = "complete";
  else if (coveragePercent >= 70) status = "partial";
  else status = "incomplete";

  return {
    pdfId: pdf.id,
    pdfName: pdf.name,
    domainSlug: domain.slug,
    domainTitle: domain.title,
    expectedNodeCount,
    actualNodeCount,
    coveragePercent,
    missingNodes,
    status,
  };
}

export function getAllCompletenessReports(): CompletenessReport[] {
  return getPdfs()
    .filter((p) => p.status === "done")
    .map(checkCompleteness)
    .filter((r): r is CompletenessReport => r !== null);
}
