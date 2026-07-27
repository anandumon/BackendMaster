import { useState, useEffect } from "react";
import { allTopicsMerged } from "@/lib/curriculum-extra";
import { getCachedLesson, setCachedLesson, type LessonContent } from "@/lib/storage";

export type DownloaderState = {
  running: boolean;
  currentIdx: number;
  total: number;
  cachedCount: number;
  currentTopicTitle: string | null;
  errorSlug: string | null;
};

let topics = allTopicsMerged();
let stopRequested = false;

let globalState: DownloaderState = {
  running: false,
  currentIdx: 0,
  total: topics.length,
  cachedCount: getCachedCount(),
  currentTopicTitle: null,
  errorSlug: null,
};

function getCachedCount(): number {
  let count = 0;
  for (const t of topics) {
    if (getCachedLesson(t.topic.slug)) count++;
  }
  return count;
}

const listeners = new Set<(state: DownloaderState) => void>();

function notify() {
  for (const listener of listeners) {
    listener(globalState);
  }
}

export function useOfflineDownloader(): DownloaderState & {
  startDownload: () => void;
  stopDownload: () => void;
  clearDownloads: () => void;
} {
  const [state, setState] = useState<DownloaderState>(globalState);

  useEffect(() => {
    const handler = (s: DownloaderState) => setState({ ...s });
    listeners.add(handler);
    // Refresh cached count on mount
    globalState.cachedCount = getCachedCount();
    globalState.total = allTopicsMerged().length;
    notify();
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    ...state,
    startDownload: startBackgroundDownload,
    stopDownload: stopBackgroundDownload,
    clearDownloads: clearAllDownloads,
  };
}

import { fetchLesson, saveSharedLesson } from "@/lib/lesson-db";
import { syncQueueItem } from "@/lib/storage";

export async function startBackgroundDownload() {
  if (globalState.running) return;
  topics = allTopicsMerged();
  stopRequested = false;

  globalState = {
    ...globalState,
    running: true,
    total: topics.length,
    cachedCount: getCachedCount(),
    errorSlug: null,
  };
  notify();

  console.log(`[Offline Downloader] Starting background download of ${topics.length} lessons...`);

  for (let i = 0; i < topics.length; i++) {
    if (stopRequested) {
      console.log("[Offline Downloader] Download stopped by user.");
      break;
    }

    const t = topics[i];

    // 1. Check local cache
    const existingCache = getCachedLesson(t.topic.slug);
    if (existingCache) {
      syncQueueItem({
        slug: t.topic.slug,
        title: t.topic.title,
        domain: t.domain.title,
        section: t.section.title,
        status: "done",
      });
      globalState.cachedCount = getCachedCount();
      notify();
      continue;
    }

    // 2. Check Supabase DB before making AI call
    try {
      const existingDbLesson = await fetchLesson(t.topic.slug);
      if (existingDbLesson) {
        setCachedLesson(t.topic.slug, existingDbLesson);
        syncQueueItem({
          slug: t.topic.slug,
          title: t.topic.title,
          domain: t.domain.title,
          section: t.section.title,
          status: "done",
        });
        globalState.cachedCount = getCachedCount();
        notify();
        continue;
      }
    } catch {}

    globalState = {
      ...globalState,
      currentIdx: i,
      currentTopicTitle: t.topic.title,
    };
    notify();

    console.log(`[Offline Downloader] Caching lesson [${i + 1}/${topics.length}]: "${t.topic.title}"`);

    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      if (stopRequested) break;
      try {
        const res = await fetch("/api/lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: t.topic.slug,
            title: t.topic.title,
            domain: t.domain.title,
            section: t.section.title,
          }),
        });

        if (!res.ok) {
          if (res.status === 429) {
            console.warn(`[Offline Downloader] Rate limited (429) on "${t.topic.title}". Pausing 4s before retry...`);
            await new Promise((r) => setTimeout(r, 4000));
            continue;
          }
          if (res.status === 402) {
            stopRequested = true;
            break;
          }
          await new Promise((r) => setTimeout(r, 1000 * attempt));
          continue;
        }

        const text = await res.text();
        const parsed = JSON.parse(text) as Omit<LessonContent, "generatedAt">;
        const full: LessonContent = { ...parsed, generatedAt: Date.now() };

        setCachedLesson(t.topic.slug, full);
        await saveSharedLesson(t.topic.slug, t.topic.title, t.domain.title, t.section.title, full);
        syncQueueItem({
          slug: t.topic.slug,
          title: t.topic.title,
          domain: t.domain.title,
          section: t.section.title,
          status: "done",
        });

        globalState.cachedCount = getCachedCount();
        notify();
        success = true;
        break;
      } catch (e) {
        console.error(`[Offline Downloader] Attempt ${attempt} failed for "${t.topic.title}":`, e);
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    if (!success) {
      globalState.errorSlug = t.topic.slug;
      syncQueueItem({
        slug: t.topic.slug,
        title: t.topic.title,
        domain: t.domain.title,
        section: t.section.title,
        status: "error",
        error: `Download failed for ${t.topic.title}`,
      });
      notify();
    }

    // Short 300ms pacing delay between requests to prevent API throttling
    await new Promise((r) => setTimeout(r, 300));
  }

  globalState = {
    ...globalState,
    running: false,
    currentTopicTitle: null,
    cachedCount: getCachedCount(),
  };
  notify();

  console.log("[Offline Downloader] Background download process completed.");
}

export function stopBackgroundDownload() {
  stopRequested = true;
  globalState = {
    ...globalState,
    running: false,
    currentTopicTitle: null,
  };
  notify();
}

export function clearAllDownloads() {
  topics = allTopicsMerged();
  for (const t of topics) {
    try {
      localStorage.removeItem(`lesson-cache:${t.topic.slug}`);
    } catch {}
  }
  globalState = {
    ...globalState,
    cachedCount: 0,
  };
  notify();
}
