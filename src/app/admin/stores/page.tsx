import { clerkClient } from "@clerk/nextjs/server";
import { StoresClient } from "./StoresClient";

export const dynamic = 'force-dynamic';

export default async function AdminStoresPage() {
  const client = await clerkClient();
  const usersResponse = await client.users.getUserList({
    limit: 100,
    orderBy: "-created_at"
  });

  const users = usersResponse.data.map(user => ({
    id: user.id,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.emailAddresses[0]?.emailAddress || "",
    role: (user.publicMetadata.role as string) || "customer",
    createdAt: new Date(user.createdAt),
    imageUrl: user.imageUrl,
  }));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ניהול משתמשים ולקוחות</h1>
        <p className="text-muted-foreground mt-2">
          צפה בכל המשתמשים הרשומים באתר ונהל את הרשאותיהם (לקוח רגיל / מנהל).
        </p>
      </div>

      <StoresClient users={users} />
    </div>
  );
}
