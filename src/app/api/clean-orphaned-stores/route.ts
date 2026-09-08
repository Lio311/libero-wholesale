import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

export async function GET() {
  try {
    const client = await clerkClient();
    const usersResponse = await client.users.getUserList({
      limit: 500,
    });
    
    const validUserIds = usersResponse.data.map(u => u.id);
    
    const allStores = await db.query.stores.findMany();
    
    const orphanedStoreIds = allStores
      .filter(store => !validUserIds.includes(store.clerkUserId))
      .map(store => store.id);
      
    if (orphanedStoreIds.length > 0) {
      await db.delete(stores).where(inArray(stores.id, orphanedStoreIds));
      return NextResponse.json({ success: true, deletedCount: orphanedStoreIds.length, deletedIds: orphanedStoreIds });
    }
    
    return NextResponse.json({ success: true, deletedCount: 0, message: "No orphaned stores found" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
