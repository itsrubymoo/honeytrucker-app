import { createClient } from "@/lib/supabase/server";
import { rethrowIfFrameworkError } from "@/lib/rethrow-framework-errors";
import type {
  ContentType,
  ContentItem,
  ContentItemPreview,
  CoursePreview,
  CourseModulePreview,
  CourseLessonPreview,
  CourseLesson,
} from "@/lib/types/database";

// Listing pages always read from the *_public views (metadata only, safe for
// anyone) so locked member-tier items still render as a card. Detail/player
// code separately re-fetches from the base table, which is RLS-gated, to
// get the actual gated fields — see getContentItemFull below.
//
// Every export here is wrapped in try/catch: these are called directly from
// page components, so a misconfigured or unreachable Supabase project (e.g.
// before it's set up yet) must fail soft — an empty list / null, not a
// crashed page — rather than throwing.

export async function listContentByType(type: ContentType): Promise<ContentItemPreview[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_items_public")
      .select("*")
      .eq("type", type)
      .order("sort_order", { ascending: true })
      .returns<ContentItemPreview[]>();

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    rethrowIfFrameworkError(error);
    console.error("listContentByType failed:", error);
    return [];
  }
}

export async function getContentPreviewBySlug(
  type: ContentType,
  slug: string
): Promise<ContentItemPreview | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("content_items_public")
      .select("*")
      .eq("type", type)
      .eq("slug", slug)
      .returns<ContentItemPreview[]>()
      .maybeSingle();

    return data;
  } catch (error) {
    rethrowIfFrameworkError(error);
    console.error("getContentPreviewBySlug failed:", error);
    return null;
  }
}

// Full row including mux_playback_id / file_url — RLS on the base table
// returns null here for member-tier content unless the caller is entitled,
// regardless of what the preview above showed.
export async function getContentItemFull(id: string): Promise<ContentItem | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("content_items")
      .select("*")
      .eq("id", id)
      .returns<ContentItem[]>()
      .maybeSingle();
    return data;
  } catch (error) {
    rethrowIfFrameworkError(error);
    console.error("getContentItemFull failed:", error);
    return null;
  }
}

export async function listCourses(): Promise<CoursePreview[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses_public")
      .select("*")
      .order("sort_order", { ascending: true })
      .returns<CoursePreview[]>();

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    rethrowIfFrameworkError(error);
    console.error("listCourses failed:", error);
    return [];
  }
}

export async function getCourseOverviewBySlug(slug: string) {
  try {
    const supabase = await createClient();

    const { data: course } = await supabase
      .from("courses_public")
      .select("*")
      .eq("slug", slug)
      .returns<CoursePreview[]>()
      .maybeSingle();
    if (!course) return null;

    const { data: modules } = await supabase
      .from("course_modules_public")
      .select("*")
      .eq("course_id", course.id)
      .order("sort_order", { ascending: true })
      .returns<CourseModulePreview[]>();

    const moduleIds = (modules ?? []).map((m) => m.id);
    const { data: lessons } = moduleIds.length
      ? await supabase
          .from("course_lessons_public")
          .select("*")
          .in("module_id", moduleIds)
          .order("sort_order", { ascending: true })
          .returns<CourseLessonPreview[]>()
      : { data: [] as CourseLessonPreview[] };

    return { course, modules: modules ?? [], lessons: lessons ?? [] };
  } catch (error) {
    rethrowIfFrameworkError(error);
    console.error("getCourseOverviewBySlug failed:", error);
    return null;
  }
}

// Looks up a lesson by (courseSlug, lessonSlug) via the public views (so we
// can find its id/tier without needing membership), then fetches the full
// row from the RLS-gated base table — which returns null unless the viewer
// is entitled to the lesson's effective tier.
export async function getLessonBySlugs(courseSlug: string, lessonSlug: string) {
  try {
    const supabase = await createClient();

    const { data: course } = await supabase
      .from("courses_public")
      .select("*")
      .eq("slug", courseSlug)
      .returns<CoursePreview[]>()
      .maybeSingle();
    if (!course) return null;

    const { data: modules } = await supabase
      .from("course_modules_public")
      .select("id")
      .eq("course_id", course.id)
      .returns<{ id: string }[]>();
    const moduleIds = (modules ?? []).map((m) => m.id);
    if (!moduleIds.length) return null;

    const { data: preview } = await supabase
      .from("course_lessons_public")
      .select("*")
      .in("module_id", moduleIds)
      .eq("slug", lessonSlug)
      .returns<CourseLessonPreview[]>()
      .maybeSingle();
    if (!preview) return null;

    const { data: full } = await supabase
      .from("course_lessons")
      .select("*")
      .eq("id", preview.id)
      .returns<CourseLesson[]>()
      .maybeSingle();

    return { course, preview, full };
  } catch (error) {
    rethrowIfFrameworkError(error);
    console.error("getLessonBySlugs failed:", error);
    return null;
  }
}
