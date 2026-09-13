import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="mb-4 font-serif text-4xl text-stone-900">honeytrucker</h1>
      <p className="mx-auto mb-8 max-w-md text-stone-600">
        a universe for creatorship and intentional living — resources, audio, video, and
        courses, some free, some for members.
      </p>
      <div className="flex justify-center gap-3">
        <Link
          href="/library"
          className="rounded-md bg-amber-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-900"
        >
          browse the library
        </Link>
        {!user ? (
          <Link
            href="/login"
            className="rounded-md bg-stone-100 px-5 py-2.5 text-sm font-medium text-stone-900 hover:bg-stone-200"
          >
            sign in
          </Link>
        ) : null}
      </div>
    </div>
  );
}
