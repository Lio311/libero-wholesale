"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2, RotateCcw } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CatalogClientProps {
  initialProducts: Product[];
}

export function CatalogClient({ initialProducts }: CatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedBrand, setSelectedBrand] = useState<string>("הכל");
  const [filterBackToStock, setFilterBackToStock] = useState(false);
  const [filterOnSale, setFilterOnSale] = useState(false);
  const [filterOfficial, setFilterOfficial] = useState(false);
  const [filterPriceDrop, setFilterPriceDrop] = useState(false);
  
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);

  // Extract unique brands for filter
  const brands = Array.from(new Set(initialProducts.map(p => p.brandHe || p.brand || "").filter(Boolean))).sort();

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedBrand("הכל");
    setFilterBackToStock(false);
    setFilterOnSale(false);
    setFilterOfficial(false);
    setFilterPriceDrop(false);
  };

  useEffect(() => {
    const term = debouncedSearch.toLowerCase().trim();
    
    const filtered = initialProducts.filter(product => {
      // Text Search
      const matchesSearch = !term || 
        product.name.toLowerCase().includes(term) ||
        (product.brand && product.brand.toLowerCase().includes(term)) ||
        (product.barcode && product.barcode.includes(term)) ||
        (product.model && product.model.toLowerCase().includes(term));
        
      // Brand Search
      const matchesBrand = selectedBrand === "הכל" || (product.brandHe === selectedBrand || product.brand === selectedBrand);
      
      // Boolean toggles
      const matchesBackToStock = !filterBackToStock || product.isBackToStock;
      const matchesOnSale = !filterOnSale || product.isOnSale;
      const matchesOfficial = !filterOfficial || product.isOfficialImporter;
      const matchesPriceDrop = !filterPriceDrop || (product.priceDropPrice !== null);
      
      return matchesSearch && matchesBrand && matchesBackToStock && matchesOnSale && matchesOfficial && matchesPriceDrop;
    });
    
    setProducts(filtered);
  }, [debouncedSearch, selectedBrand, filterBackToStock, filterOnSale, filterOfficial, filterPriceDrop, initialProducts]);

  return (
    <div className="w-full space-y-6">
      {/* Filters Bar */}
      <div className="bg-card border-b border-border/40 p-4 sticky top-0 z-20 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
          
          {/* Search & Brand */}
          <div className="flex flex-col sm:flex-row items-end gap-3 w-full md:w-auto">
            
            {/* Brand Filter */}
            <div className="w-full sm:w-[200px] flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground px-1">סינון לפי מותג</label>
              <Select value={selectedBrand} onValueChange={(val) => setSelectedBrand(val || "הכל")}>
                <SelectTrigger className="w-full bg-background h-9">
                  <SelectValue placeholder="סינון לפי מותג" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="הכל">הכל</SelectItem>
                  {brands.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="חיפוש חופשי..."
                className="w-full pr-9 bg-background h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Reset Button */}
            <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto h-9">
              <RotateCcw className="h-4 w-4 ml-2" />
              איפוס
            </Button>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto pb-0.5">
            <div className="flex items-center gap-2">
              <Switch id="back-to-stock" checked={filterBackToStock} onCheckedChange={setFilterBackToStock} />
              <Label htmlFor="back-to-stock" className="whitespace-nowrap cursor-pointer">חזר למלאי</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="on-sale" checked={filterOnSale} onCheckedChange={setFilterOnSale} />
              <Label htmlFor="on-sale" className="whitespace-nowrap cursor-pointer">במבצע</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="official" checked={filterOfficial} onCheckedChange={setFilterOfficial} />
              <Label htmlFor="official" className="whitespace-nowrap cursor-pointer">יבואן רשמי</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="price-drop" checked={filterPriceDrop} onCheckedChange={setFilterPriceDrop} />
              <Label htmlFor="price-drop" className="whitespace-nowrap cursor-pointer">ירד המחיר</Label>
            </div>
          </div>
          
        </div>
      </div>

      <div className="flex justify-between items-center px-4">
        <div className="text-sm text-muted-foreground font-mono">
          {products.length} תוצאות
        </div>
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-4 px-2 md:px-4">
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
