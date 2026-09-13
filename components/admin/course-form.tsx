import { Field, TextInput, Textarea, Select, Checkbox } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { Course } from "@/lib/types/database";

export function CourseForm({
  course,
  action,
}: {
  course?: Course;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-5">
      <Field label="title" htmlFor="title">
        <TextInput id="title" name="title" required defaultValue={course?.title} />
      </Field>

      <Field label="slug" htmlFor="slug" hint="used in the URL, e.g. autumn-reset">
        <TextInput id="slug" name="slug" required defaultValue={course?.slug} pattern="[a-z0-9-]+" />
      </Field>

      <Field label="description" htmlFor="description">
        <Textarea id="description" name="description" rows={3} defaultValue={course?.description ?? ""} />
      </Field>

      <Field label="cover image URL" htmlFor="cover_image_url">
        <TextInput id="cover_image_url" name="cover_image_url" defaultValue={course?.cover_image_url ?? ""} />
      </Field>

      <Field label="tier" htmlFor="tier" hint="default tier for lessons that don't override it">
        <Select id="tier" name="tier" defaultValue={course?.tier ?? "free"}>
          <option value="free">free</option>
          <option value="member">member</option>
        </Select>
      </Field>

      <Field label="sort order" htmlFor="sort_order">
        <TextInput id="sort_order" name="sort_order" type="number" defaultValue={course?.sort_order ?? 0} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-stone-800">
        <Checkbox name="published" defaultChecked={course?.published ?? false} />
        published (visible on the site)
      </label>

      <Button type="submit">{course ? "save changes" : "create course"}</Button>
    </form>
  );
}
