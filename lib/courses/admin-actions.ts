"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/is-admin";
import { createClient } from "@/lib/supabase/server";
import type { Tier } from "@/lib/types/database";

function parseTier(value: FormDataEntryValue | null): Tier {
  return value === "member" ? "member" : "free";
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------
export async function createCourse(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .insert({
      slug: String(formData.get("slug") ?? "").trim(),
      title: String(formData.get("title") ?? "").trim(),
      description: (formData.get("description") as string)?.trim() || null,
      tier: parseTier(formData.get("tier")),
      cover_image_url: (formData.get("cover_image_url") as string)?.trim() || null,
      published: formData.get("published") === "on",
      sort_order: Number(formData.get("sort_order") ?? 0),
    })
    .select("id")
    .returns<{ id: string }[]>()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${data.id}/edit`);
}

export async function updateCourse(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("courses")
    .update({
      slug: String(formData.get("slug") ?? "").trim(),
      title: String(formData.get("title") ?? "").trim(),
      description: (formData.get("description") as string)?.trim() || null,
      tier: parseTier(formData.get("tier")),
      cover_image_url: (formData.get("cover_image_url") as string)?.trim() || null,
      published: formData.get("published") === "on",
      sort_order: Number(formData.get("sort_order") ?? 0),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}/edit`);
}

export async function deleteCourse(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
}

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------
export async function createModule(courseId: string, title: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { count } = await supabase
    .from("course_modules")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  const { error } = await supabase
    .from("course_modules")
    .insert({ course_id: courseId, title, sort_order: count ?? 0 });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function renameModule(courseId: string, moduleId: string, title: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("course_modules").update({ title }).eq("id", moduleId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function deleteModule(courseId: string, moduleId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("course_modules").delete().eq("id", moduleId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function reorderModules(courseId: string, orderedIds: string[]) {
  await requireAdmin();
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("course_modules").update({ sort_order: index }).eq("id", id)
    )
  );
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------
export async function createLesson(courseId: string, moduleId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const { count } = await supabase
    .from("course_lessons")
    .select("id", { count: "exact", head: true })
    .eq("module_id", moduleId);

  const tierValue = formData.get("tier");

  const { error } = await supabase.from("course_lessons").insert({
    module_id: moduleId,
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    tier: tierValue === "free" || tierValue === "member" ? tierValue : null,
    body: (formData.get("body") as string)?.trim() || null,
    content_item_id: (formData.get("content_item_id") as string)?.trim() || null,
    sort_order: count ?? 0,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function updateLesson(courseId: string, lessonId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const tierValue = formData.get("tier");

  const { error } = await supabase
    .from("course_lessons")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim(),
      tier: tierValue === "free" || tierValue === "member" ? tierValue : null,
      body: (formData.get("body") as string)?.trim() || null,
      content_item_id: (formData.get("content_item_id") as string)?.trim() || null,
    })
    .eq("id", lessonId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function deleteLesson(courseId: string, lessonId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("course_lessons").delete().eq("id", lessonId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function reorderLessons(courseId: string, orderedIds: string[]) {
  await requireAdmin();
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("course_lessons").update({ sort_order: index }).eq("id", id)
    )
  );
  revalidatePath(`/admin/courses/${courseId}/edit`);
}
