"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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
