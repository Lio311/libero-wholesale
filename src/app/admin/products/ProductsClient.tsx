"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { ProductDialog } from "./ProductDialog";
import { deleteProduct } from "./actions";

interface ProductRow {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  barcode: string | null;
  price: string | number;
  stockQuantity: number;
  status: string;
  imageUrl: string | null;
  size?: string | null;
  isDraft?: boolean;
}

interface ProductsClientProps {
  products: ProductRow[];
}

export function ProductsClient({ products: initialProducts }: ProductsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<{ key: keyof ProductRow; direction: "asc" | "desc" } | null>(null);

  const filteredProducts = initialProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchTerm)) ||
    (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === null || aValue === undefined) return sortConfig.direction === "asc" ? 1 : -1;
    if (bValue === null || bValue === undefined) return sortConfig.direction === "asc" ? -1 : 1;

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key: keyof ProductRow) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof ProductRow }) => {
    if (sortConfig?.key !== columnKey) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50 inline-block" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 inline-block" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 inline-block" />
    );
  };

  const handleEdit = (product: ProductRow) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק מוצר זה?")) return;
    setIsDeleting(id);
    await deleteProduct(id);
    setIsDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="חיפוש לפי מק״ט, שם או מותג..." 
            className="pr-9 bg-card border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 rounded-full text-primary-foreground font-semibold shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          הוספת מוצר חדש
        </Button>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <div>
              <CardTitle>ניהול קטלוג מוצרים</CardTitle>
              <CardDescription>סה״כ {filteredProducts.length} מוצרים נמצאו</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <div className="rounded-md border border-border min-w-[800px]">
              <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border">
                  <TableHead className="text-right w-[60px] px-2">תמונה</TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort("barcode")}>
                    מק״ט / ברקוד <SortIcon columnKey="barcode" />
                  </TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort("name")}>
                    שם <SortIcon columnKey="name" />
                  </TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort("size")}>
                    גודל <SortIcon columnKey="size" />
                  </TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort("brand")}>
                    מותג <SortIcon columnKey="brand" />
                  </TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort("stockQuantity")}>
                    מלאי <SortIcon columnKey="stockQuantity" />
                  </TableHead>
                  <TableHead className="text-left cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort("price")}>
                    מחיר סיטונאי <SortIcon columnKey="price" />
                  </TableHead>
                  <TableHead className="text-center w-[100px]">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.length === 0 ? (
                  <TableRow className="border-border">
                    <TableCell colSpan={8} className="text-center h-32 text-muted-foreground">לא נמצאו מוצרים</TableCell>
                  </TableRow>
                ) : (
                  sortedProducts.map((product) => (
                    <TableRow key={product.id} className={`border-border hover:bg-muted/20 transition-colors ${product.isDraft ? "opacity-50 grayscale-[50%]" : ""}`}>
                      <TableCell className="p-1 px-2">
                        <div className="relative h-10 w-10 bg-white rounded flex items-center justify-center overflow-hidden border border-border/50">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-0.5" />
                          ) : (
                            <div className="text-muted-foreground/50 text-[10px] font-mono opacity-30">N/A</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{product.barcode || '-'}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-2">
                            {product.name}
                            {product.isDraft && <Badge variant="secondary" className="h-5 px-1 text-[10px]">טיוטה</Badge>}
                          </span>
                          {product.model && <span className="text-xs text-muted-foreground">{product.model}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{product.size || '-'}</TableCell>
                      <TableCell>{product.brand || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.stockQuantity}
                          {product.stockQuantity < 10 && <Badge variant="destructive" className="h-5 px-1 text-[10px]">מלאי נמוך</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-left font-mono font-bold text-primary">₪{Number(product.price).toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button onClick={() => handleEdit(product)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleDelete(product.id)} disabled={isDeleting === product.id} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            {isDeleting === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ProductDialog 
        product={editingProduct} 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </div>
  );
}
