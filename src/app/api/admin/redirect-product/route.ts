import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const barcode = url.searchParams.get("barcode");
    const name = url.searchParams.get("name");
    
    if (!barcode) {
      if (name) {
         return NextResponse.redirect(`https://libero-il.co.il/?s=${encodeURIComponent(name)}&post_type=product`);
      }
      return NextResponse.redirect("https://libero-il.co.il");
    }

    const WC_URL = "https://libero-il.co.il";
    const WC_CK = process.env.LIBERO_WC_CK;
    const WC_CS = process.env.LIBERO_WC_CS;

    const credentials = Buffer.from(`${WC_CK}:${WC_CS}`).toString('base64');
    const headers = { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' };

    const fetchUrl = `${WC_URL}/wp-json/wc/v3/products?sku=${encodeURIComponent(barcode)}`;
    const res = await fetch(fetchUrl, { headers });
    const data = await res.json();

    if (data && data.length > 0 && data[0].permalink) {
      return NextResponse.redirect(data[0].permalink);
    }
    
    // Fallback to search if not found by SKU
    return NextResponse.redirect(`https://libero-il.co.il/?s=${encodeURIComponent(name || barcode)}&post_type=product`);
  } catch (error) {
    return NextResponse.redirect("https://libero-il.co.il");
  }
}
