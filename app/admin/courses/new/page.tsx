import { requireAdmin } from "@/lib/auth/is-admin";
import { CourseForm } from "@/components/admin/course-form";
import { createCourse } from "@/lib/courses/admin-actions";

export default async function NewCoursePage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-stone-900">new course</h1>
      <CourseForm action={createCourse} />
    </div>
  );
}
