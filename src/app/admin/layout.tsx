import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress?.toLowerCase();

  // Protect all admin routes
  if (email !== "lior31197@gmail.com") {
    redirect("/");
  }

  return <>{children}</>;
}
