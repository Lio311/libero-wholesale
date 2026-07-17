"use server";

import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createBrand(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const nameHe = formData.get("nameHe") as string || null;
    const logoUrl = formData.get("logoUrl") as string || null;

    if (!name) return { error: "Name is required." };

    await db.insert(brands).values({ name, nameHe, logoUrl });

    revalidatePath("/admin/brands");
    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    return { success: true };
  } catch (error) {
    console.error("Error creating brand:", error);
    return { error: "Failed to create brand. Name might already exist." };
  }
}

export async function updateBrand(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const nameHe = formData.get("nameHe") as string || null;
    const logoUrl = formData.get("logoUrl") as string || null;

    if (!name) return { error: "Name is required." };

    const updateData: any = { name, nameHe, updatedAt: new Date() };
    if (logoUrl) updateData.logoUrl = logoUrl;

    await db.update(brands).set(updateData).where(eq(brands.id, id));

    revalidatePath("/admin/brands");
    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    return { success: true };
  } catch (error) {
    console.error("Error updating brand:", error);
    return { error: "Failed to update brand." };
  }
}

export async function deleteBrand(id: string) {
  try {
    await db.delete(brands).where(eq(brands.id, id));
    revalidatePath("/admin/brands");
    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    return { success: true };
  } catch (error) {
    console.error("Error deleting brand:", error);
    return { error: "Failed to delete brand." };
  }
}
