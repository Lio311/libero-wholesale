/**
 * Comax API Integration Client (Simulation)
 * 
 * This file serves as the abstraction layer between our Neon Database / Next.js app
 * and the external Comax ERP. It provides methods to fetch inventory, pricing, 
 * push orders, and sync store data.
 * 
 * NOTE: Currently returning mock data mimicking expected Comax structures.
 * To be replaced with actual fetch() calls to the Comax endpoints when available.
 */

export interface ComaxProduct {
  barcode: string;
  name: string;
  brand: string;
  stock_quantity: number;
  wholesale_price: number;
}

export interface ComaxStoreSync {
  comax_id: string;
  obligo_limit: number;
  obligo_balance: number;
}

export interface ComaxOrderPayload {
  order_id: string;
  store_comax_id: string;
  items: {
    barcode: string;
    quantity: number;
    unit_price: number;
  }[];
  total_amount: number;
}

class ComaxClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.COMAX_API_KEY || 'test-key';
    this.baseUrl = process.env.COMAX_API_URL || 'https://api.comax.co.il/v1';
  }

  /**
   * Fetch the latest inventory and pricing from Comax.
   * Expected to be run on a cron job or triggered manually from Admin.
   */
  async syncCatalog(): Promise<ComaxProduct[]> {
    console.log(`[Comax] Fetching catalog from ${this.baseUrl}/catalog`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return [
      { barcode: '7290001', name: 'Chanel No. 5', brand: 'Chanel', stock_quantity: 45, wholesale_price: 350 },
      { barcode: '7290002', name: 'Dior Sauvage', brand: 'Dior', stock_quantity: 12, wholesale_price: 280 },
      { barcode: '7290003', name: 'Creed Aventus', brand: 'Creed', stock_quantity: 4, wholesale_price: 890 }
    ];
  }

  /**
   * Sync Financial Data (Obligo) for a specific store
   */
  async getStoreFinancials(storeComaxId: string): Promise<ComaxStoreSync> {
    console.log(`[Comax] Fetching financials for store ${storeComaxId}`);
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      comax_id: storeComaxId,
      obligo_limit: 50000,
      obligo_balance: 15400
    };
  }

  /**
   * Push a new order from our system into Comax ERP
   */
  async submitOrder(order: ComaxOrderPayload): Promise<{ success: boolean; comax_order_number?: string; error?: string }> {
    console.log(`[Comax] Submitting order ${order.order_id} to ERP...`);
    console.dir(order, { depth: null });
    
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Simulate success
    return {
      success: true,
      comax_order_number: `CMX-${Math.floor(Math.random() * 100000)}`
    };
  }
}

export const comax = new ComaxClient();
