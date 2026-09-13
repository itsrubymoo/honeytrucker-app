import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/is-admin";
import { createClient } from "@/lib/supabase/server";
import { CourseForm } from "@/components/admin/course-form";
import { CourseBuilder } from "@/components/admin/course-builder";
import { updateCourse } from "@/lib/courses/admin-actions";
import type { Course, CourseModule, CourseLesson } from "@/lib/types/database";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .returns<Course[]>()
    .single();
  if (!course) notFound();

  const { data: modules } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", id)
    .order("sort_order")
    .returns<CourseModule[]>();

  const moduleIds = (modules ?? []).map((m) => m.id);
  const { data: lessons } = moduleIds.length
    ? await supabase
        .from("course_lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("sort_order")
        .returns<CourseLesson[]>()
    : { data: [] as CourseLesson[] };

  const { data: contentItems } = await supabase
    .from("content_items")
    .select("id, title, type")
    .order("title")
    .returns<{ id: string; title: string; type: string }[]>();

  const lessonsByModule: Record<string, CourseLesson[]> = {};
  for (const lesson of lessons ?? []) {
    (lessonsByModule[lesson.module_id] ??= []).push(lesson);
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="mb-6 font-serif text-2xl text-stone-900">edit course</h1>
        <CourseForm course={course} action={updateCourse.bind(null, id)} />
      </div>

      <div>
        <h2 className="mb-4 font-serif text-xl text-stone-900">modules & lessons</h2>
        <CourseBuilder
          courseId={id}
          modules={modules ?? []}
          lessonsByModule={lessonsByModule}
          contentOptions={contentItems ?? []}
        />
      </div>
    </div>
  );
}
