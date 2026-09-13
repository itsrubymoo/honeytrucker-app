"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/is-admin";
import { createClient } from "@/lib/supabase/server";
import type { ContentType, Tier } from "@/lib/types/database";

function parseTier(value: FormDataEntryValue | null): Tier {
  return value === "member" ? "member" : "free";
}

function fieldsFromForm(formData: FormData) {
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    description: (formData.get("description") as string)?.trim() || null,
    tier: parseTier(formData.get("tier")),
    cover_image_url: (formData.get("cover_image_url") as string)?.trim() || null,
    file_url: (formData.get("file_url") as string)?.trim() || null,
    mux_playback_id: (formData.get("mux_playback_id") as string)?.trim() || null,
    mux_asset_id: (formData.get("mux_asset_id") as string)?.trim() || null,
    published: formData.get("published") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
}

export async function createContentItem(type: ContentType, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("content_items").insert({ type, ...fieldsFromForm(formData) });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/content/${type}`);
  redirect(`/admin/content/${type}`);
}

export async function updateContentItem(id: string, type: ContentType, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("content_items").update(fieldsFromForm(formData)).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/content/${type}`);
  redirect(`/admin/content/${type}`);
}

export async function deleteContentItem(id: string, type: ContentType) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("content_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/content/${type}`);
}
