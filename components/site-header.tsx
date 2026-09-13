import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-current-user";

const navLinks = [
  { href: "/library", label: "library" },
  { href: "/audio", label: "audio" },
  { href: "/video", label: "video" },
  { href: "/courses", label: "courses" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-stone-200 bg-stone-50">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-serif text-lg text-stone-900">
          honeytrucker
        </Link>
        <nav className="flex items-center gap-5 text-sm text-stone-600">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-stone-900">
              {link.label}
            </Link>
          ))}
          {user?.isAdmin ? (
            <Link href="/admin" className="hover:text-stone-900">
              admin
            </Link>
          ) : null}
          <Link
            href={user ? "/account" : "/login"}
            className="rounded-md bg-amber-800 px-3 py-1.5 text-white hover:bg-amber-900"
          >
            {user ? "account" : "sign in"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
