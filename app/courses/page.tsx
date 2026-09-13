import { listCourses } from "@/lib/content/queries";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { CourseCard } from "@/components/course-card";

export default async function CoursesPage() {
  const [courses, user] = await Promise.all([listCourses(), getCurrentUser()]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-6 font-serif text-3xl text-stone-900">courses</h1>
      {courses.length === 0 ? (
        <p className="text-sm text-stone-500">no courses yet — check back soon.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} isMember={Boolean(user?.isMember)} />
          ))}
        </div>
      )}
    </div>
  );
}
