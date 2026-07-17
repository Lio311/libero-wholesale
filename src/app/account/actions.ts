"use server";

import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function createBusinessProfile(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "User not authenticated" };
    }

    const name = formData.get("name") as string;
    const contactName = formData.get("contactName") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;

    if (!name || !contactName || !phone || !email || !address) {
      return { error: "Missing required fields." };
    }

    // Default values for a new store
    await db.insert(stores).values({
      name,
      contactName,
      phone,
      email,
      address,
      clerkUserId: user.id,
      creditLimit: "0",
      currentBalance: "0",
      isFrozen: false,
      status: "active", // Can be set to pending if we want manual approval later
    });

    revalidatePath("/account");
    revalidatePath("/admin/stores");
    return { success: true };
  } catch (error) {
    console.error("Error creating business profile:", error);
    return { error: "Failed to create business profile." };
  }
}
