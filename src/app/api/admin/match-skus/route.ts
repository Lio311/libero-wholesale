import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sku = url.searchParams.get("sku") || "8032779258728";

    const WC_URL = "https://libero-il.co.il";
    const WC_CK = process.env.LIBERO_WC_CK;
    const WC_CS = process.env.LIBERO_WC_CS;

    const credentials = Buffer.from(`${WC_CK}:${WC_CS}`).toString('base64');
    const headers = { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' };

    const fetchUrl = `${WC_URL}/wp-json/wc/v3/products?sku=${encodeURIComponent(sku)}`;
    const res = await fetch(fetchUrl, { headers });
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
