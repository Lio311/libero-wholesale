import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkIsAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress?.toLowerCase();
  const isAdmin = await checkIsAdmin(email);

  // Protect all admin routes
  if (!isAdmin) {
    redirect("/");
  }

  return <>{children}</>;
}
