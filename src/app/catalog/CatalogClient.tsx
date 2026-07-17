"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface CatalogClientProps {
  initialProducts: Product[];
}

export function CatalogClient({ initialProducts }: CatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function searchProducts() {
      if (!debouncedSearch.trim()) {
        setProducts(initialProducts);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(debouncedSearch)}`);
        if (res.ok) {
          const data = await res.json();
          // Map partial API results to Product interface if needed
          setProducts(data.results || []);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    }

    searchProducts();
  }, [debouncedSearch, initialProducts]);

  return (
    <div className="w-full space-y-6">
      {/* Top Bar with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-8 px-4 sm:px-8 max-w-4xl mx-auto w-full">
        <div className="relative w-full">
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/50" />
          <Input
            type="text"
            placeholder="חפש מותג, בושם או ברקוד..."
            className="w-full pr-16 pl-12 bg-muted/30 hover:bg-muted/50 focus:bg-background border-transparent focus:border-border text-xl md:text-2xl py-8 rounded-full shadow-sm transition-all duration-300 font-medium placeholder:text-muted-foreground/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isLoading && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground font-mono">
          {products.length} תוצאות
        </div>
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="bg-muted/50 p-6 rounded-full">
            <Search className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-semibold">לא נמצאו מוצרים</h3>
          <p className="text-muted-foreground max-w-md">
            נסה לחפש במילים אחרות או לבדוק את איות המילה. המערכת שלנו תומכת בחיפוש בעברית ובאנגלית.
          </p>
        </div>
      )}
    </div>
  );
}
