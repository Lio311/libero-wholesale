import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // TODO: Verify admin role

  return (
    <SidebarProvider>
      <AppSidebar isAdmin={true} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-xl font-bold">הגדרות מערכת</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
          <SettingsClient />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
