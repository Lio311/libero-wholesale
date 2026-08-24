/**
 * WooCommerce API Client
 * 
 * Centralized helper for communicating with the WooCommerce (retail) store.
 * Used by checkout, admin order routes, and sync-inventory to keep stock
 * in sync between the wholesale DB and the retail WooCommerce site.
 */

interface WcProduct {
  id: number;
  sku: string;
  stock_quantity: number | null;
}

class WooCommerceClient {
  private baseUrl: string;
  private headers: HeadersInit;
  private ready: boolean;

  constructor() {
    this.baseUrl = "https://libero-il.co.il";
    const ck = process.env.LIBERO_WC_CK;
    const cs = process.env.LIBERO_WC_CS;
    this.ready = !!(ck && cs);

    if (this.ready) {
      const credentials = Buffer.from(`${ck}:${cs}`).toString("base64");
      this.headers = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      };
    } else {
      this.headers = {};
    }
  }

  /** Find a WooCommerce product by its SKU (barcode). Returns the WC product ID or null. */
  async findProductBySku(sku: string): Promise<WcProduct | null> {
    if (!this.ready) return null;
    try {
      const url = `${this.baseUrl}/wp-json/wc/v3/products?sku=${encodeURIComponent(sku)}`;
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) return null;
      const data: WcProduct[] = await res.json();
      return data.length > 0 ? data[0] : null;
    } catch (err) {
      console.error(`[WC] Failed to find product by SKU ${sku}:`, err);
      return null;
    }
  }

  /** Get the current stock quantity from WooCommerce for a given SKU. */
  async getStock(sku: string): Promise<number | null> {
    const product = await this.findProductBySku(sku);
    return product ? (product.stock_quantity ?? 0) : null;
  }

  /** Set the absolute stock quantity on a WooCommerce product by its WC product ID. */
  async setStock(wcProductId: number, newStock: number): Promise<boolean> {
    if (!this.ready) return false;
    try {
      const url = `${this.baseUrl}/wp-json/wc/v3/products/${wcProductId}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: this.headers,
        body: JSON.stringify({ stock_quantity: newStock }),
      });
      return res.ok;
    } catch (err) {
      console.error(`[WC] Failed to set stock for WC product ${wcProductId}:`, err);
      return false;
    }
  }

  /**
   * Adjust stock on WooCommerce for a product identified by barcode/SKU.
   * `delta` is the change amount: negative to deduct, positive to restore.
   * 
   * Returns the new WC stock, or null on failure.
   */
  async adjustStockBySku(sku: string, delta: number): Promise<number | null> {
    if (!this.ready || !sku) return null;
    try {
      const product = await this.findProductBySku(sku);
      if (!product) {
        console.warn(`[WC] Product with SKU ${sku} not found in WooCommerce`);
        return null;
      }

      const currentStock = product.stock_quantity ?? 0;
      const newStock = Math.max(0, currentStock + delta);

      const success = await this.setStock(product.id, newStock);
      if (success) {
        console.log(`[WC] Stock adjusted for SKU ${sku}: ${currentStock} -> ${newStock} (delta: ${delta})`);
        return newStock;
      }
      return null;
    } catch (err) {
      console.error(`[WC] Failed to adjust stock for SKU ${sku}:`, err);
      return null;
    }
  }

  /**
   * Fetch all products from WooCommerce, page by page.
   * Returns an array of { id, sku, stock_quantity }.
   */
  async fetchAllProducts(): Promise<WcProduct[]> {
    if (!this.ready) return [];
    const allProducts: WcProduct[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const url = `${this.baseUrl}/wp-json/wc/v3/products?per_page=100&page=${page}`;
        const res = await fetch(url, { headers: this.headers });
        if (!res.ok) break;

        const data: WcProduct[] = await res.json();
        if (data.length === 0) {
          hasMore = false;
        } else {
          allProducts.push(...data);
          page++;
        }
      } catch (err) {
        console.error(`[WC] Failed to fetch page ${page}:`, err);
        break;
      }
    }
    return allProducts;
  }
}

export const wc = new WooCommerceClient();
