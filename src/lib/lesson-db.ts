// Lesson DB layer — shared lessons + per-user overrides via Supabase
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { getCachedLesson, setCachedLesson, type LessonContent } from "@/lib/storage";

/** Fetch a lesson: local cache first (0ms) → user override → shared lesson → null */
export async function fetchLesson(slug: string, userId?: string): Promise<LessonContent | null> {
  // 1. Instant local cache check for 0ms load
  const localCached = getCachedLesson(slug);
  if (localCached) {
    return localCached;
  }

  // 2. Check user override
  if (userId) {
    try {
      const { data: override } = await supabase
        .from("user_lesson_overrides")
        .select("content, generated_at")
        .eq("user_id", userId)
        .eq("slug", slug)
        .maybeSingle();
      if (override?.content) {
        const full = {
          ...(override.content as unknown as LessonContent),
          generatedAt: new Date(override.generated_at).getTime(),
        };
        setCachedLesson(slug, full);
        return full;
      }
    } catch (e) {
      console.warn("Error fetching user override lesson:", e);
    }
  }

  // 3. Check shared lesson
  try {
    const { data: shared } = await supabase
      .from("lessons")
      .select("content, generated_at")
      .eq("slug", slug)
      .maybeSingle();
    if (shared?.content) {
      const full = {
        ...(shared.content as unknown as LessonContent),
        generatedAt: new Date(shared.generated_at).getTime(),
      };
      setCachedLesson(slug, full);
      return full;
    }
  } catch (e) {
    console.warn("Error fetching shared lesson:", e);
  }

  return null;
}

import { syncQueueItem, getQueue, setQueue } from "@/lib/storage";

/** Save a lesson to the shared table (first generation) and sync queue/cache */
export async function saveSharedLesson(
  slug: string,
  title: string,
  domain: string,
  section: string,
  content: LessonContent,
  userId?: string,
) {
  let uid = userId;
  if (!uid) {
    try {
      const { data } = await supabase.auth.getUser();
      uid = data?.user?.id;
    } catch {
      /* ignore */
    }
  }
  const { error } = await supabase.from("lessons").upsert(
    {
      slug,
      title,
      domain,
      section_name: section,
      content: content as unknown as Json,
      generated_at: new Date().toISOString(),
      generated_by: uid ?? null,
    },
    { onConflict: "slug" },
  );
  if (error) {
    console.error("saveSharedLesson error:", error);
  } else {
    setCachedLesson(slug, content);
    syncQueueItem({ slug, title, domain, section, status: "done" });
  }
}

/** Sync all DB lessons into local storage cache & regen queue */
export async function syncRegenQueueWithDB() {
  try {
    const { data: sharedLessons } = await supabase
      .from("lessons")
      .select("slug, title, domain, section_name, content, generated_at");
    if (!sharedLessons) return;

    const queue = getQueue();
    let updated = false;

    for (const l of sharedLessons) {
      if (l.content) {
        const fullContent: LessonContent = {
          ...(l.content as unknown as LessonContent),
          generatedAt: l.generated_at ? new Date(l.generated_at).getTime() : Date.now(),
        };
        setCachedLesson(l.slug, fullContent);
        const idx = queue.findIndex((q) => q.slug === l.slug);
        if (idx >= 0 && queue[idx].status !== "done") {
          queue[idx] = {
            ...queue[idx],
            status: "done",
            completedAt: l.generated_at ? new Date(l.generated_at).getTime() : Date.now(),
            currentStep: undefined,
            error: undefined,
          };
          updated = true;
        }
      }
    }
    if (updated) {
      setQueue(queue);
    }
  } catch (e) {
    console.error("syncRegenQueueWithDB error:", e);
  }
}

/** Save a per-user override (user regenerated) */
export async function saveUserOverride(userId: string, slug: string, content: LessonContent) {
  const { error } = await supabase.from("user_lesson_overrides").upsert(
    {
      user_id: userId,
      slug,
      content: content as unknown as Json,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,slug" },
  );
  if (error) {
    console.error("saveUserOverride error:", error);
  } else {
    setCachedLesson(slug, content);
    syncQueueItem({ slug, title: slug, domain: "", section: "", status: "done" });
  }
}

// ─── User Completions ──────────────────────────────────────────
export async function getCompletions(userId: string): Promise<string[]> {
  const { data } = await supabase.from("user_completions").select("slug").eq("user_id", userId);
  return data?.map((r) => r.slug) ?? [];
}

export async function toggleCompletion(userId: string, slug: string): Promise<string[]> {
  const existing = await getCompletions(userId);
  if (existing.includes(slug)) {
    await supabase.from("user_completions").delete().eq("user_id", userId).eq("slug", slug);
  } else {
    await supabase.from("user_completions").insert({ user_id: userId, slug });
    logActivity(userId, "topic_completed", slug);
  }
  return getCompletions(userId);
}

// ─── User Bookmarks ────────────────────────────────────────────
export async function getBookmarksDB(userId: string): Promise<string[]> {
  const { data } = await supabase.from("user_bookmarks").select("slug").eq("user_id", userId);
  return data?.map((r) => r.slug) ?? [];
}

export async function toggleBookmarkDB(userId: string, slug: string): Promise<string[]> {
  const existing = await getBookmarksDB(userId);
  if (existing.includes(slug)) {
    await supabase.from("user_bookmarks").delete().eq("user_id", userId).eq("slug", slug);
  } else {
    await supabase.from("user_bookmarks").insert({ user_id: userId, slug });
    logActivity(userId, "topic_bookmarked", slug);
  }
  return getBookmarksDB(userId);
}

// ─── User Pinned Lessons ───────────────────────────────────────
import { getPinnedLessons, togglePinnedLesson, setPinnedLessons, unpinLesson } from "@/lib/storage";

export async function getPinnedDB(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("user_pins" as never)
      .select("slug")
      .eq("user_id", userId);
    if (!error && data) {
      const slugs = (data as Array<{ slug: string }>).map((r) => r.slug);
      setPinnedLessons(slugs);
      return slugs;
    }
  } catch {
    /* ignore */
  }
  return getPinnedLessons();
}

export async function togglePinDB(userId: string, slug: string): Promise<string[]> {
  const updated = togglePinnedLesson(slug);
  const isPinned = updated.includes(slug);
  try {
    if (isPinned) {
      await supabase.from("user_pins" as never).insert({ user_id: userId, slug } as never);
      logActivity(userId, "lesson_pinned", slug);
    } else {
      await supabase
        .from("user_pins" as never)
        .delete()
        .eq("user_id", userId)
        .eq("slug", slug);
      logActivity(userId, "lesson_unpinned", slug);
    }
  } catch {
    /* ignore */
  }
  return updated;
}

export async function unpinLessonDB(userId: string | undefined, slug: string): Promise<string[]> {
  const updated = unpinLesson(slug);
  if (userId) {
    try {
      await supabase
        .from("user_pins" as never)
        .delete()
        .eq("user_id", userId)
        .eq("slug", slug);
      logActivity(userId, "lesson_unpinned", slug);
    } catch {
      /* ignore */
    }
  }
  return updated;
}

// ─── Activity Logging ──────────────────────────────────────────
export async function logActivity(
  userId: string,
  action: string,
  slug?: string,
  metadata?: Record<string, unknown>,
) {
  await supabase.from("user_activity").insert({
    user_id: userId,
    action,
    slug,
    metadata: metadata ?? {},
  } as never);
}

export async function getRecentActivity(userId: string, limit = 20) {
  const { data } = await supabase
    .from("user_activity")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

// ─── Admin: All users activity stats ───────────────────────────
export async function getAllUsersStats() {
  const { data: profiles } = await supabase.from("profiles").select("*");
  const { data: roles } = await supabase.from("user_roles").select("*");
  const { data: completions } = await supabase.from("user_completions").select("user_id, slug");
  const { data: bookmarks } = await supabase.from("user_bookmarks").select("user_id, slug");

  return (profiles ?? []).map((p) => ({
    id: p.id,
    email: p.email,
    displayName: p.display_name,
    createdAt: p.created_at,
    role: roles?.find((r) => r.user_id === p.id)?.role ?? "user",
    completedCount: completions?.filter((c) => c.user_id === p.id).length ?? 0,
    bookmarkCount: bookmarks?.filter((b) => b.user_id === p.id).length ?? 0,
  }));
}
