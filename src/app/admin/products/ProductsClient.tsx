"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react";
import { ProductDialog } from "./ProductDialog";
import { deleteProduct } from "./actions";

interface ProductRow {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  barcode: string | null;
  stockQuantity: number;
  status: string;
  imageUrl: string | null;
}

interface ProductsClientProps {
  products: ProductRow[];
}

export function ProductsClient({ products: initialProducts }: ProductsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredProducts = initialProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchTerm)) ||
    (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border">
                  <TableHead className="text-right">מק״ט / ברקוד</TableHead>
                  <TableHead className="text-right">מוצר</TableHead>
                  <TableHead className="text-right">מותג</TableHead>
                  <TableHead className="text-right">מלאי</TableHead>
                  <TableHead className="text-left">מחיר סיטונאי</TableHead>
                  <TableHead className="text-center w-[100px]">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow className="border-border">
                    <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">לא נמצאו מוצרים</TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} className="border-border hover:bg-muted/20 transition-colors">
                      <TableCell className="font-mono text-xs">{product.barcode || '-'}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{product.name}</span>
                          {product.model && <span className="text-xs text-muted-foreground">{product.model}</span>}
                        </div>
                      </TableCell>
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
