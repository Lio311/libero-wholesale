"use server";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const barcode = formData.get("barcode") as string || null;
    const brand = formData.get("brand") as string || null;
    const model = formData.get("model") as string || null;
    const imageUrl = formData.get("imageUrl") as string || null;
    const price = parseFloat(formData.get("price") as string);
    const stockQuantity = parseInt(formData.get("stockQuantity") as string, 10);

    if (!name || isNaN(price)) {
      return { error: "Missing required fields or invalid format." };
    }

    await db.insert(products).values({
      name,
      barcode,
      brand,
      model,
      imageUrl,
      price: price.toString(),
      stockQuantity: isNaN(stockQuantity) ? 0 : stockQuantity,
      status: "active",
    });

    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    return { success: true };
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: "Failed to create product." };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const barcode = formData.get("barcode") as string || null;
    const brand = formData.get("brand") as string || null;
    const model = formData.get("model") as string || null;
    const imageUrl = formData.get("imageUrl") as string || null;
    const priceStr = formData.get("price") as string;
    const stockStr = formData.get("stockQuantity") as string;
    
    if (!name) return { error: "Name is required." };

    const updateData: any = {
      name,
      barcode,
      brand,
      model,
      imageUrl,
      updatedAt: new Date(),
    };

    if (priceStr) {
      updateData.price = parseFloat(priceStr).toString();
    }
    if (stockStr !== null && stockStr !== "") {
      updateData.stockQuantity = parseInt(stockStr, 10);
    }

    await db.update(products).set(updateData).where(eq(products.id, id));

    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "Failed to update product." };
  }
}

export async function deleteProduct(id: string) {
  try {
    // Instead of deleting, we can change status or physically delete
    // We'll physically delete here if it doesn't break foreign keys (like orders)
    // Actually, marking as archived is safer, but for now we'll delete.
    await db.delete(products).where(eq(products.id, id));

    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { error: "Failed to delete product. It might be linked to an order." };
  }
}
