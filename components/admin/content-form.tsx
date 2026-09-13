import { Field, TextInput, Textarea, Select, Checkbox } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { ContentItem, ContentType } from "@/lib/types/database";

export function ContentForm({
  type,
  item,
  action,
}: {
  type: ContentType;
  item?: ContentItem;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-5">
      <Field label="title" htmlFor="title">
        <TextInput id="title" name="title" required defaultValue={item?.title} />
      </Field>

      <Field label="slug" htmlFor="slug" hint="used in the URL, e.g. autumn-check-in">
        <TextInput id="slug" name="slug" required defaultValue={item?.slug} pattern="[a-z0-9-]+" />
      </Field>

      <Field label="description" htmlFor="description">
        <Textarea id="description" name="description" rows={3} defaultValue={item?.description ?? ""} />
      </Field>

      <Field label="cover image URL" htmlFor="cover_image_url">
        <TextInput id="cover_image_url" name="cover_image_url" defaultValue={item?.cover_image_url ?? ""} />
      </Field>

      {type === "resource" ? (
        <Field label="file URL" htmlFor="file_url" hint="PDF or other download link">
          <TextInput id="file_url" name="file_url" defaultValue={item?.file_url ?? ""} />
        </Field>
      ) : (
        <>
          <Field
            label="Mux playback ID"
            htmlFor="mux_playback_id"
            hint="use a public-policy ID for free items, signed-policy for member items"
          >
            <TextInput id="mux_playback_id" name="mux_playback_id" defaultValue={item?.mux_playback_id ?? ""} />
          </Field>
          <Field label="Mux asset ID" htmlFor="mux_asset_id" hint="optional, for your own reference">
            <TextInput id="mux_asset_id" name="mux_asset_id" defaultValue={item?.mux_asset_id ?? ""} />
          </Field>
        </>
      )}

      <Field label="tier" htmlFor="tier">
        <Select id="tier" name="tier" defaultValue={item?.tier ?? "free"}>
          <option value="free">free</option>
          <option value="member">member</option>
        </Select>
      </Field>

      <Field label="sort order" htmlFor="sort_order" hint="lower numbers show first">
        <TextInput id="sort_order" name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-stone-800">
        <Checkbox name="published" defaultChecked={item?.published ?? false} />
        published (visible on the site)
      </label>

      <Button type="submit">{item ? "save changes" : "create"}</Button>
    </form>
  );
}
