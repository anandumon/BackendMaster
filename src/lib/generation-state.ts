import { useState, useEffect } from "react";
import { saveSharedLesson } from "@/lib/lesson-db";
import { syncQueueItem, type LessonContent } from "@/lib/storage";

export type TopicGenStatus = "pending" | "generating" | "done" | "error";

export type GenerationState = {
  activeRoadmapSlug: string | null;
  activeRoadmapTitle: string | null;
  currentTopicSlug: string | null;
  currentTopicTitle: string | null;
  currentSectionTitle: string | null;
  status: "idle" | "parsing" | "generating" | "completed" | "error";
  progress: { completed: number; total: number; percent: number };
  topicStatuses: Record<string, TopicGenStatus>;
  estimatedSecondsRemaining: number;
  error?: string;
};

let globalState: GenerationState = {
  activeRoadmapSlug: null,
  activeRoadmapTitle: null,
  currentTopicSlug: null,
  currentTopicTitle: null,
  currentSectionTitle: null,
  status: "idle",
  progress: { completed: 0, total: 0, percent: 0 },
  topicStatuses: {},
  estimatedSecondsRemaining: 0,
};

const listeners = new Set<(state: GenerationState) => void>();

function notify() {
  for (const listener of listeners) {
    listener(globalState);
  }
}

export function getGenerationState(): GenerationState {
  return globalState;
}

export function useGenerationState(): GenerationState {
  const [state, setState] = useState<GenerationState>(globalState);

  useEffect(() => {
    const handler = (newState: GenerationState) => setState({ ...newState });
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return state;
}

let cancelFlag = false;

export function cancelRoadmapGeneration() {
  cancelFlag = true;
  globalState = {
    ...globalState,
    status: "idle",
    currentTopicSlug: null,
    currentTopicTitle: null,
  };
  notify();
}

export async function startRoadmapGeneration({
  domainSlug,
  domainTitle,
  topics,
  userId,
}: {
  domainSlug: string;
  domainTitle: string;
  topics: Array<{ slug: string; title: string; section: string }>;
  userId?: string;
}) {
  if (topics.length === 0) return;
  cancelFlag = false;

  const initialTopicStatuses: Record<string, TopicGenStatus> = {};
  for (const t of topics) {
    initialTopicStatuses[t.slug] = "pending";
  }

  const SECONDS_PER_LESSON = 12;

  globalState = {
    activeRoadmapSlug: domainSlug,
    activeRoadmapTitle: domainTitle,
    currentTopicSlug: topics[0]?.slug ?? null,
    currentTopicTitle: topics[0]?.title ?? null,
    currentSectionTitle: topics[0]?.section ?? null,
    status: "generating",
    progress: { completed: 0, total: topics.length, percent: 0 },
    topicStatuses: initialTopicStatuses,
    estimatedSecondsRemaining: topics.length * SECONDS_PER_LESSON,
  };
  notify();

  console.log(
    `[Generation] Starting roadmap lesson generation for: "${domainTitle}" (${topics.length} topics)`,
  );

  let completedCount = 0;

  for (let i = 0; i < topics.length; i++) {
    if (cancelFlag) {
      console.log(`[Generation] Generation cancelled for roadmap: "${domainTitle}"`);
      return;
    }

    const t = topics[i];
    const remainingLessons = topics.length - i;
    const estSeconds = remainingLessons * SECONDS_PER_LESSON;

    globalState = {
      ...globalState,
      currentTopicSlug: t.slug,
      currentTopicTitle: t.title,
      currentSectionTitle: t.section,
      topicStatuses: {
        ...globalState.topicStatuses,
        [t.slug]: "generating",
      },
      estimatedSecondsRemaining: estSeconds,
    };
    notify();

    console.log(
      `[Generation] File/Topic [${i + 1}/${topics.length}] now generating: "${t.title}" (${t.slug})`,
    );
    console.log(
      `[Generation] Estimated time for current lesson: ~${SECONDS_PER_LESSON} seconds (Total remaining: ~${estSeconds}s)`,
    );

    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: t.slug,
          title: t.title,
          domain: domainTitle,
          section: t.section,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(
          `[Generation] Failed topic "${t.title}": ${res.status} ${text.slice(0, 100)}`,
        );
        globalState = {
          ...globalState,
          topicStatuses: {
            ...globalState.topicStatuses,
            [t.slug]: "error",
          },
        };
        notify();
        continue;
      }

      const text = await res.text();
      const parsed = JSON.parse(text) as Omit<LessonContent, "generatedAt">;
      const content: LessonContent = { ...parsed, generatedAt: Date.now() };

      await saveSharedLesson(t.slug, t.title, domainTitle, t.section, content, userId);
      syncQueueItem({
        slug: t.slug,
        title: t.title,
        domain: domainTitle,
        section: t.section,
        status: "done",
      });

      completedCount++;
      const pct = Math.round((completedCount / topics.length) * 100);

      globalState = {
        ...globalState,
        progress: { completed: completedCount, total: topics.length, percent: pct },
        topicStatuses: {
          ...globalState.topicStatuses,
          [t.slug]: "done",
        },
      };
      notify();

      console.log(
        `[Generation] Completed file/topic [${completedCount}/${topics.length}]: "${t.title}" (${t.slug})`,
      );
    } catch (e) {
      console.error(`[Generation] Exception generating "${t.title}":`, e);
      globalState = {
        ...globalState,
        topicStatuses: {
          ...globalState.topicStatuses,
          [t.slug]: "error",
        },
      };
      notify();
    }
  }

  globalState = {
    ...globalState,
    status: "completed",
    currentTopicSlug: null,
    currentTopicTitle: null,
    estimatedSecondsRemaining: 0,
  };
  notify();

  console.log(
    `[Generation] All ${topics.length} topics finished generating for roadmap: "${domainTitle}"`,
  );
}
