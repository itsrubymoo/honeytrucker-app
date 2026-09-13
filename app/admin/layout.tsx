import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";

const links = [
  { href: "/admin", label: "dashboard" },
  { href: "/admin/content/resource", label: "resources" },
  { href: "/admin/content/audio", label: "audio" },
  { href: "/admin/content/video", label: "video" },
  { href: "/admin/courses", label: "courses" },
  { href: "/admin/members", label: "members" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth — middleware already blocks non-admins from /admin, but
  // this re-checks server-side in case that ever changes.
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) redirect("/");

  return (
    <div className="mx-auto flex max-w-5xl gap-8 px-4 py-10">
      <aside className="w-48 shrink-0">
        <nav className="flex flex-col gap-1 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 text-stone-700 hover:bg-stone-100">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
