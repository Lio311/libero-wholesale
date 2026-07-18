"use server";

import { db } from "@/lib/db";
import { products, brands } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const barcode = formData.get("barcode") as string || null;
    let brand = formData.get("brand") as string || null;
    let brandHe = formData.get("brandHe") as string || null;
    
    // Check for inline new brand
    const newBrandName = formData.get("newBrandName") as string;
    const newBrandNameHe = formData.get("newBrandNameHe") as string;
    
    if (newBrandName) {
      // Create new brand
      try {
        await db.insert(brands).values({
          name: newBrandName,
          nameHe: newBrandNameHe || null,
        }).onConflictDoNothing({ target: brands.name });
        brand = newBrandName;
        brandHe = newBrandNameHe || null;
      } catch (err) {
        console.error("Failed to inline create brand:", err);
      }
    }
    
    const model = formData.get("model") as string || null;
    const imageUrl = formData.get("imageUrl") as string || null;
    const price = parseFloat(formData.get("price") as string);
    const stockQuantity = parseInt(formData.get("stockQuantity") as string, 10);
    
    // New fields
    const nameHe = formData.get("nameHe") as string || null;
    // brandHe is already handled above
    const modelHe = formData.get("modelHe") as string || null;
    const isBackToStock = formData.get("isBackToStock") === "true";
    const isOnSale = formData.get("isOnSale") === "true";
    const isOfficialImporter = formData.get("isOfficialImporter") === "true";
    const isDraft = formData.get("isDraft") === "true";
    const rawSize = formData.get("size") as string || null;
    let size = rawSize;
    if (size) {
      const numericMatch = size.match(/(\d+(\.\d+)?)/);
      if (numericMatch) {
        size = `${numericMatch[0]}ml`;
      }
    }
    
    const priceDropPriceStr = formData.get("priceDropPrice") as string;
    const priceDropPrice = priceDropPriceStr ? parseFloat(priceDropPriceStr).toString() : null;
    
    const testerRatioStr = formData.get("testerRatio") as string;
    const testerRatio = testerRatioStr ? parseInt(testerRatioStr, 10) : null;

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
      nameHe,
      brandHe,
      modelHe,
      isBackToStock,
      isOnSale,
      isOfficialImporter,
      isDraft,
      size,
      priceDropPrice,
      testerRatio,
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
    let brand = formData.get("brand") as string || null;
    let brandHe = formData.get("brandHe") as string || null;
    
    // Check for inline new brand
    const newBrandName = formData.get("newBrandName") as string;
    const newBrandNameHe = formData.get("newBrandNameHe") as string;
    
    if (newBrandName) {
      // Create new brand
      try {
        await db.insert(brands).values({
          name: newBrandName,
          nameHe: newBrandNameHe || null,
        }).onConflictDoNothing({ target: brands.name });
        brand = newBrandName;
        brandHe = newBrandNameHe || null;
      } catch (err) {
        console.error("Failed to inline create brand:", err);
      }
    }

    const model = formData.get("model") as string || null;
    const imageUrl = formData.get("imageUrl") as string || null;
    const priceStr = formData.get("price") as string;
    const stockStr = formData.get("stockQuantity") as string;
    
    // New fields
    const nameHe = formData.get("nameHe") as string || null;
    // brandHe is already handled above
    const modelHe = formData.get("modelHe") as string || null;
    const isBackToStock = formData.get("isBackToStock") === "true";
    const isOnSale = formData.get("isOnSale") === "true";
    const isOfficialImporter = formData.get("isOfficialImporter") === "true";
    const isDraft = formData.get("isDraft") === "true";
    const rawSize = formData.get("size") as string || null;
    let size = rawSize;
    if (size) {
      const numericMatch = size.match(/(\d+(\.\d+)?)/);
      if (numericMatch) {
        size = `${numericMatch[0]}ml`;
      }
    }
    
    const priceDropPriceStr = formData.get("priceDropPrice") as string;
    const priceDropPrice = priceDropPriceStr ? parseFloat(priceDropPriceStr).toString() : null;
    
    const testerRatioStr = formData.get("testerRatio") as string;
    const testerRatio = testerRatioStr ? parseInt(testerRatioStr, 10) : null;

    if (!name) return { error: "Name is required." };

    const updateData: any = {
      name,
      barcode,
      brand,
      model,
      nameHe,
      brandHe,
      modelHe,
      isBackToStock,
      isOnSale,
      isOfficialImporter,
      isDraft,
      size,
      priceDropPrice,
      testerRatio,
      updatedAt: new Date(),
    };
    
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

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
    await db.delete(products).where(eq(products.id, id));

    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { error: "Failed to delete product. It might be linked to an order." };
  }
}
