import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { StoresClient } from "./StoresClient";
import { checkIsAdmin } from "@/lib/admin";

export const dynamic = 'force-dynamic';

export default async function AdminStoresPage() {
  const client = await clerkClient();
  const usersResponse = await client.users.getUserList({
    limit: 100,
    orderBy: "-created_at"
  });

  const users = await Promise.all(usersResponse.data.map(async (user) => {
    const email = user.emailAddresses[0]?.emailAddress || "";
    // checkIsAdmin internally checks current user, but also checks the email against hardcoded list and DB
    // To avoid current user side-effects masking other users, we use the fallback logic in checkIsAdmin which checks email
    const isActuallyAdmin = (user.publicMetadata.role === "admin") || await checkIsAdmin(email);
    
    return {
      id: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email,
      role: isActuallyAdmin ? "admin" : "customer",
      createdAt: new Date(user.createdAt),
      imageUrl: user.imageUrl,
    };
  }));

  const allStores = await db.query.stores.findMany();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ניהול משתמשים ולקוחות</h1>
        <p className="text-muted-foreground mt-2">
          צפה בכל המשתמשים הרשומים באתר ונהל את הרשאותיהם (לקוח רגיל / מנהל). בנוסף, אשר בקשות לפתיחת עסק.
        </p>
      </div>

      <StoresClient users={users} stores={allStores} />
    </div>
  );
}
