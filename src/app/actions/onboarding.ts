"use server";

import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function submitOnboarding(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const businessName = formData.get("businessName") as string;
    const contactName = formData.get("contactName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    if (!businessName || !contactName || !email || !phone || !address) {
      return { error: "All fields are required" };
    }

    await db.insert(stores).values({
      clerkUserId: user.id,
      name: businessName,
      contactName: contactName,
      email: email,
      phone: phone,
      address: address,
      status: "pending",
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Onboarding error:", error);
    if (error.code === '23505') {
      return { error: "A business is already registered for this user." };
    }
    return { error: "Failed to create business profile." };
  }
}
