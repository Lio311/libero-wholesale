"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function toggleUserRole(userId: string, currentRole: string | undefined) {
  try {
    const client = await clerkClient();
    const newRole = currentRole === "admin" ? "customer" : "admin";
    
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: newRole,
      },
    });

    revalidatePath("/admin/stores");
    return { success: true, newRole };
  } catch (error) {
    console.error("Error toggling user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function approveStore(storeId: string) {
  try {
    await db.update(stores).set({ status: 'active' }).where(eq(stores.id, storeId));
    revalidatePath("/admin/stores");
    return { success: true };
  } catch (error) {
    console.error("Error approving store:", error);
    return { success: false, error: "Failed to approve store" };
  }
}
