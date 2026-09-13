import { requireAdmin } from "@/lib/auth/is-admin";
import { createClient } from "@/lib/supabase/server";
import { LinkButton, Button } from "@/components/ui/button";
import { TierBadge, Badge } from "@/components/ui/badge";
import { deleteCourse } from "@/lib/courses/admin-actions";
import type { Course } from "@/lib/types/database";

export default async function AdminCoursesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("sort_order")
    .returns<Course[]>();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-stone-900">courses</h1>
        <LinkButton href="/admin/courses/new">add new</LinkButton>
      </div>

      <div className="flex flex-col divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {(courses ?? []).length === 0 ? (
          <p className="p-4 text-sm text-stone-500">no courses yet.</p>
        ) : (
          courses!.map((course) => (
            <div key={course.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-stone-900">{course.title}</p>
                <p className="text-xs text-stone-500">/courses/{course.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <TierBadge tier={course.tier} />
                <Badge tone={course.published ? "green" : "neutral"}>
                  {course.published ? "published" : "draft"}
                </Badge>
                <LinkButton href={`/admin/courses/${course.id}/edit`} variant="secondary">
                  edit
                </LinkButton>
                <form action={deleteCourse.bind(null, course.id)}>
                  <Button type="submit" variant="danger">
                    delete
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
