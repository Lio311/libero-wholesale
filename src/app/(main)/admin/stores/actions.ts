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

export async function deleteStore(storeId: string) {
  try {
    const { orders, transactions, orderItems } = await import('@/lib/db/schema');
    
    // Find all orders for this store
    const storeOrders = await db.select({ id: orders.id }).from(orders).where(eq(orders.storeId, storeId));
    const orderIds = storeOrders.map(o => o.id);
    
    // Delete order items for these orders
    if (orderIds.length > 0) {
      const { inArray } = await import('drizzle-orm');
      await db.delete(orderItems).where(inArray(orderItems.orderId, orderIds));
    }
    
    // Delete transactions related to this store
    await db.delete(transactions).where(eq(transactions.storeId, storeId));
    
    // Delete orders related to this store
    await db.delete(orders).where(eq(orders.storeId, storeId));
    
    // Now delete the store
    await db.delete(stores).where(eq(stores.id, storeId));
    
    revalidatePath("/admin/stores");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting store:", error);
    return { success: false, error: error.message || "Failed to delete store" };
  }
}
