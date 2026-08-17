import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const WC_URL = "https://libero-il.co.il";
    const WC_CK = process.env.LIBERO_WC_CK;
    const WC_CS = process.env.LIBERO_WC_CS;

    if (!WC_CK || !WC_CS) {
      return NextResponse.json({ error: "WooCommerce credentials not configured" }, { status: 500 });
    }

    const auth = Buffer.from(`${WC_CK}:${WC_CS}`).toString('base64');
    
    // Fetch all WC products
    let wcProducts: any[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const res = await fetch(`${WC_URL}/wp-json/wc/v3/products?per_page=100&page=${page}`, {
        headers: { 'Authorization': `Basic ${auth}` }
      });
      if (!res.ok) break;
      const data = await res.json();
      if (data.length === 0) {
        hasMore = false;
      } else {
        wcProducts = wcProducts.concat(data);
        page++;
      }
    }
    
    // Fetch local products
    const localProducts = await db.select().from(products);
    
    const cleanStr = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const matches: any[] = [];
    const noMatches: any[] = [];
    const mismatchedBarcodes: any[] = [];
    
    for (const lp of localProducts) {
      const lName = cleanStr(lp.name);
      const lSize = cleanStr(lp.size || "");
      
      const potential = wcProducts.filter(wp => {
        const wName = cleanStr(wp.name);
        if (!wName.includes(lName) && !lName.includes(wName)) return false;
        
        if (lSize && wName.includes(lSize)) return true;
        if (lSize === '100ml' && wName.includes('100')) return true;
        if (lSize === '50ml' && wName.includes('50')) return true;
        if (lSize === '75ml' && wName.includes('75')) return true;
        
        return true;
      });
      
      let bestMatch = null;
      if (potential.length > 0) {
         const nonMini = potential.filter(p => !cleanStr(p.name).includes('mini') && !cleanStr(p.name).includes('travel'));
         const candidates = nonMini.length > 0 ? nonMini : potential;
         
         if (candidates.length === 1) {
           bestMatch = candidates[0];
         } else if (candidates.length > 1) {
           const exact = candidates.find(c => cleanStr(c.name) === lName);
           if (exact) bestMatch = exact;
           else {
               const sizeMatch = candidates.find(c => cleanStr(c.name).includes(lSize));
               if (sizeMatch) bestMatch = sizeMatch;
               else bestMatch = candidates[0];
           }
         }
      }
      
      if (bestMatch && bestMatch.sku) {
        if (lp.barcode !== bestMatch.sku) {
          if (lp.barcode) {
             mismatchedBarcodes.push({
               localName: lp.name,
               localSize: lp.size,
               localBarcode: lp.barcode,
               wcName: bestMatch.name,
               wcBarcode: bestMatch.sku
             });
          } else {
             matches.push({
               localName: lp.name,
               localSize: lp.size,
               wcName: bestMatch.name,
               newBarcode: bestMatch.sku
             });
          }
        }
      } else {
        if (!lp.barcode || lp.isSynced === false) {
          noMatches.push({
            name: lp.name,
            size: lp.size,
            barcode: lp.barcode
          });
        }
      }
    }
    
    return NextResponse.json({
      totalWc: wcProducts.length,
      totalLocal: localProducts.length,
      mismatchedBarcodes,
      foundBarcodesForMissing: matches,
      unmatchedMissingBarcodes: noMatches
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
