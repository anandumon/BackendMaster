// Client-side persistence (localStorage). Safe on SSR (guarded).

const isBrowser = typeof window !== "undefined";

export function safeGet<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function safeSet(key: string, value: unknown) {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota
  }
}

// Lesson cache: slug -> generated content
export type LessonContent = {
  overview: string;
  theory: string;
  whyExists: string;
  internalWorking: string;
  realWorldExamples: string;
  advantages: string;
  disadvantages: string;
  bestPractices: string;
  commonMistakes: string;
  interviewQuestions: string;
  cheatsheet: string;
  practicalUsage: string;
  prerequisites: string;
  revisionNotes: string;
  mcqs: Array<{ q: string; options: string[]; answer: number; explanation: string }>;
  flashcards: Array<{ q: string; a: string }>;
  relatedTopics: string[];
  generatedAt: number;
};

const CACHE_KEY = (slug: string) => `lesson-cache:${slug}`;

export function getCachedLesson(slug: string): LessonContent | null {
  return safeGet<LessonContent | null>(CACHE_KEY(slug), null);
}

export function setCachedLesson(slug: string, content: LessonContent) {
  safeSet(CACHE_KEY(slug), content);
  if (isBrowser) {
    window.dispatchEvent(new CustomEvent("backend_mastery:cache-updated", { detail: { slug } }));
  }
}

export function clearCachedLesson(slug: string) {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(CACHE_KEY(slug));
  } catch {
    // ignore
  }
}

// Admin unlock flag (weak client-side gate; server verifies the passcode).
export function isAdminUnlocked(): boolean {
  return safeGet<boolean>("admin-unlocked", false);
}
export function setAdminUnlocked(v: boolean) {
  safeSet("admin-unlocked", v);
}

// Bulk regeneration queue (persisted so it survives reloads)
export type QueueStep = "parse" | "extract" | "generate" | "finalize";
export const QUEUE_STEPS: QueueStep[] = ["parse", "extract", "generate", "finalize"];

export type QueueItem = {
  slug: string;
  title: string;
  domain: string;
  section: string;
  status: "pending" | "running" | "done" | "error" | "cancelled";
  error?: string;
  pdfId?: string;
  startedAt?: number;
  completedAt?: number;
  duration?: number;
  retryCount?: number;
  /** Current step being executed */
  currentStep?: QueueStep;
  /** Step that failed (if status === "error") */
  failedStep?: QueueStep;
  /** Completed steps so far */
  completedSteps?: QueueStep[];
  /** HTTP status code of the failure */
  httpStatus?: number;
  /** Full stack trace from the error */
  stackTrace?: string;
  /** Full server response body on error */
  responseBody?: string;
};
export function getQueue(): QueueItem[] {
  return safeGet<QueueItem[]>("regen-queue", []);
}
export function setQueue(list: QueueItem[]) {
  safeSet("regen-queue", list);
  if (isBrowser) {
    window.dispatchEvent(new CustomEvent("backend_mastery:queue-updated", { detail: { count: list.length } }));
  }
}

export function syncQueueItem(item: {
  slug: string;
  title: string;
  domain: string;
  section: string;
  status: QueueItem["status"];
  error?: string;
}) {
  const list = getQueue();
  const idx = list.findIndex((x) => x.slug === item.slug);
  const now = Date.now();
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      title: item.title || list[idx].title,
      domain: item.domain || list[idx].domain,
      section: item.section || list[idx].section,
      status: item.status,
      error: item.error,
      completedAt: item.status === "done" ? now : list[idx].completedAt,
      duration: item.status === "done" && list[idx].startedAt ? now - list[idx].startedAt! : list[idx].duration,
      currentStep: undefined,
    };
  } else {
    list.push({
      slug: item.slug,
      title: item.title,
      domain: item.domain,
      section: item.section,
      status: item.status,
      error: item.error,
      completedAt: item.status === "done" ? now : undefined,
    });
  }
  setQueue(list);
}

// VoiceReader resume position (persisted per lesson slug)
export type VoiceReaderPosition = {
  slug: string;
  chunkIndex: number;
  timestamp: number;
};
export function getVoiceReaderPosition(slug: string): VoiceReaderPosition | null {
  return safeGet<VoiceReaderPosition | null>(`voice-position:${slug}`, null);
}
export function setVoiceReaderPosition(slug: string, chunkIndex: number) {
  safeSet(`voice-position:${slug}`, {
    slug,
    chunkIndex,
    timestamp: Date.now(),
  } satisfies VoiceReaderPosition);
}
export function clearVoiceReaderPosition(slug: string) {
  if (!isBrowser) return;
  try { localStorage.removeItem(`voice-position:${slug}`); } catch {}
}

// Progress
export function getCompleted(): string[] {
  return safeGet<string[]>("completed", []);
}
export function toggleCompleted(slug: string): string[] {
  const list = new Set(getCompleted());
  if (list.has(slug)) list.delete(slug);
  else list.add(slug);
  const arr = Array.from(list);
  safeSet("completed", arr);
  return arr;
}

// Bookmarks
export function getBookmarks(): string[] {
  return safeGet<string[]>("bookmarks", []);
}
export function toggleBookmark(slug: string): string[] {
  const list = new Set(getBookmarks());
  if (list.has(slug)) list.delete(slug);
  else list.add(slug);
  const arr = Array.from(list);
  safeSet("bookmarks", arr);
  return arr;
}

// Pinned Lessons
export function getPinnedLessons(): string[] {
  return safeGet<string[]>("pinned-lessons", []);
}
export function setPinnedLessons(slugs: string[]) {
  safeSet("pinned-lessons", slugs);
  if (isBrowser) {
    window.dispatchEvent(new CustomEvent("backend_mastery:pins-updated", { detail: { slugs } }));
  }
}
export function togglePinnedLesson(slug: string): string[] {
  const list = new Set(getPinnedLessons());
  if (list.has(slug)) list.delete(slug);
  else list.add(slug);
  const arr = Array.from(list);
  setPinnedLessons(arr);
  return arr;
}
export function unpinLesson(slug: string): string[] {
  const list = new Set(getPinnedLessons());
  list.delete(slug);
  const arr = Array.from(list);
  setPinnedLessons(arr);
  return arr;
}

// Theme
export function getTheme(): "light" | "dark" {
  return safeGet<"light" | "dark">("theme", "light");
}
export function setTheme(theme: "light" | "dark") {
  safeSet("theme", theme);
  if (isBrowser) {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }
}

// User Profile Cache
export function getCachedUserDisplayName(): string {
  return safeGet<string>("cached_user_display_name", "");
}
export function setCachedUserDisplayName(name: string) {
  if (name && name !== "learner") {
    safeSet("cached_user_display_name", name);
  }
}