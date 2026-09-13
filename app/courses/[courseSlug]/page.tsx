import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseOverviewBySlug } from "@/lib/content/queries";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { TierBadge } from "@/components/ui/badge";

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const data = await getCourseOverviewBySlug(courseSlug);
  if (!data) notFound();

  const { course, modules, lessons } = data;
  const user = await getCurrentUser();
  const isMember = Boolean(user?.isMember);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-4 flex items-center gap-2">
        <h1 className="font-serif text-3xl text-stone-900">{course.title}</h1>
        <TierBadge tier={course.tier} />
      </div>
      {course.description ? <p className="mb-8 text-stone-600">{course.description}</p> : null}

      <div className="flex flex-col gap-8">
        {modules.map((mod) => (
          <div key={mod.id}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
              {mod.title}
            </h2>
            <ul className="flex flex-col gap-2">
              {lessons
                .filter((lesson) => lesson.module_id === mod.id)
                .map((lesson) => {
                  const locked = lesson.tier === "member" && !isMember;
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={locked ? "/account" : `/courses/${course.slug}/${lesson.slug}`}
                        className="flex items-center justify-between rounded-md border border-stone-200 bg-white px-4 py-3 text-sm hover:border-amber-700/50"
                      >
                        <span className={locked ? "text-stone-400" : "text-stone-900"}>
                          {locked ? "🔒 " : ""}
                          {lesson.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
