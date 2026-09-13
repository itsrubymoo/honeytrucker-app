import { getCurrentUser } from "@/lib/auth/get-current-user";

// Defense-in-depth check for every admin Server Action — middleware already
// blocks page navigation to /admin for non-admins, but Server Actions can in
// principle be invoked directly, so mutations re-check here too.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    throw new Error("Not authorized.");
  }
  return user;
}
