import { db } from "./src/lib/db";
import { stores } from "./src/lib/db/schema";
import { inArray } from "drizzle-orm";
import { createClerkClient } from "@clerk/backend";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});

async function run() {
  try {
    const usersResponse = await clerkClient.users.getUserList({
      limit: 500,
    });
    
    const validUserIds = usersResponse.data.map(u => u.id);
    console.log(`Found ${validUserIds.length} valid users in Clerk`);
    
    const allStores = await db.query.stores.findMany();
    console.log(`Found ${allStores.length} stores in DB`);
    
    const orphanedStoreIds = allStores
      .filter(store => !validUserIds.includes(store.clerkUserId))
      .map(store => store.id);
      
    if (orphanedStoreIds.length > 0) {
      console.log(`Deleting ${orphanedStoreIds.length} orphaned stores:`, orphanedStoreIds);
      await db.delete(stores).where(inArray(stores.id, orphanedStoreIds));
      console.log("Cleanup complete!");
    } else {
      console.log("No orphaned stores found.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();
