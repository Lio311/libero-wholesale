"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown, Image as ImageIcon, CheckCircle2, Pencil, EyeOff, Eye, RefreshCw } from "lucide-react";
import { ProductDialog } from "./ProductDialog";
import { ImageModal } from "@/components/ImageModal";
import { deleteProduct, bulkUpdateStatus } from "./actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkPriceDialog } from "./BulkPriceDialog";
import { toast } from "sonner";

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
  isSynced?: boolean;
}

interface Brand {
  id: string;
  name: string;
  nameHe: string | null;
  logoUrl: string | null;
}

interface ProductsClientProps {
  products: ProductRow[];
  brands?: Brand[];
}

export function ProductsClient({ products: initialProducts, brands = [] }: ProductsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<{ key: keyof ProductRow; direction: "asc" | "desc" } | null>(null);
  const [filterDraft, setFilterDraft] = useState<"all" | "draft" | "published" | "unsynced">("published");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkPriceOpen, setIsBulkPriceOpen] = useState(false);
  const [isBulkStatusLoading, setIsBulkStatusLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    toast("מסנכרן מלאי מול WooCommerce", { description: "זה עשוי לקחת מספר רגעים..." });
    try {
      const res = await fetch("/api/sync-inventory");
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("סנכרון מלאי הושלם!", { description: data.message });
        window.location.reload();
      } else {
        toast.error("שגיאה בסנכרון מלאי", { description: data.error || data.message || "נסה שוב מאוחר יותר" });
      }
    } catch (error) {
      toast.error("שגיאה", { description: "אירעה שגיאה בחיבור לשרת" });
    } finally {
      setIsSyncing(false);
    }
  };
  const handleBulkStatus = async (isDraft: boolean) => {
    if (!selectedIds.length) return;
    setIsBulkStatusLoading(true);
    const result = await bulkUpdateStatus(selectedIds, isDraft);
    setIsBulkStatusLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isDraft ? "המוצרים הועברו לטיוטה" : "המוצרים פורסמו");
      setSelectedIds([]);
    }
  };

  const filteredProducts = initialProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.barcode && p.barcode.includes(searchTerm)) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      
    let matchesDraft = true;
    if (filterDraft === "draft") matchesDraft = p.isDraft === true;
    if (filterDraft === "published") matchesDraft = p.isDraft !== true && p.isSynced !== false;
    if (filterDraft === "unsynced") matchesDraft = p.isSynced === false && p.isDraft !== true;
    
    return matchesSearch && matchesDraft;
  });

  const allFilteredIds = filteredProducts.map(p => p.id);
  const isAllSelected = allFilteredIds.length > 0 && selectedIds.length === allFilteredIds.length;
  
  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allFilteredIds);
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig) return 0;
    
    let valA: any = a[sortConfig.key];
    let valB: any = b[sortConfig.key];

    if (sortConfig.key === "size") {
      valA = parseFloat(valA as string) || 0;
      valB = parseFloat(valB as string) || 0;
    }

    if (valA === null || valA === undefined) return sortConfig.direction === "asc" ? 1 : -1;
    if (valB === null || valB === undefined) return sortConfig.direction === "asc" ? -1 : 1;

    if (valA < valB) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (valA > valB) {
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
    toast("מחיקת מוצר", {
      description: "האם אתה בטוח שברצונך למחוק מוצר זה?",
      action: {
        label: "מחק מוצר",
        onClick: async () => {
          setIsDeleting(id);
          await deleteProduct(id);
          setIsDeleting(null);
          toast.success("המוצר נמחק בהצלחה");
        }
      },
      cancel: { label: "ביטול", onClick: () => {} }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="חיפוש לפי מק״ט, שם או מותג..." 
              className="pr-9 bg-card border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterDraft} onValueChange={(v: "all" | "draft" | "published" | "unsynced" | null) => v && setFilterDraft(v as any)}>
            <SelectTrigger className="w-full sm:w-40 bg-card border-border">
              <SelectValue placeholder="סטטוס">
                {filterDraft === "published" ? "פעילים" : filterDraft === "draft" ? "טיוטות" : filterDraft === "unsynced" ? "מלאי לא מסונכרן" : "הכל"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="published">פעילים</SelectItem>
              <SelectItem value="draft">טיוטות</SelectItem>
              <SelectItem value="unsynced">מלאי לא מסונכרן</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <>
              <Button onClick={() => handleBulkStatus(false)} disabled={isBulkStatusLoading} variant="secondary" className="w-full sm:w-auto font-semibold shadow-sm text-primary">
                {isBulkStatusLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                פרסם ({selectedIds.length})
              </Button>
              <Button onClick={() => handleBulkStatus(true)} disabled={isBulkStatusLoading} variant="secondary" className="w-full sm:w-auto font-semibold shadow-sm text-primary">
                {isBulkStatusLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <EyeOff className="mr-2 h-4 w-4" />}
                לטיוטה ({selectedIds.length})
              </Button>
              <Button onClick={() => setIsBulkPriceOpen(true)} variant="secondary" className="w-full sm:w-auto font-semibold shadow-sm text-primary">
                <Edit className="mr-2 h-4 w-4" />
                עדכון מחיר ({selectedIds.length})
              </Button>
            </>
          )}
          <Button 
            onClick={handleSync} 
            disabled={isSyncing}
            variant="outline" 
            className="rounded-full shadow-sm w-full sm:w-auto"
          >
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            סנכרון מלאי
          </Button>
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 rounded-full text-primary-foreground font-semibold shadow-sm w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            הוספת מוצר חדש
          </Button>
        </div>
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
            <div className="rounded-md border border-border">
              <Table className="w-full">
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border">
                  <TableHead className="w-[50px] pr-4 pl-2 text-center">
                    <Checkbox checked={isAllSelected} onCheckedChange={toggleAll} aria-label="בחר הכל" />
                  </TableHead>
                  <TableHead className="text-center w-[50px] md:w-[60px] px-1 md:px-2">תמונה</TableHead>
                  <TableHead className="hidden md:table-cell text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort("barcode")}>
                    מק״ט / ברקוד <SortIcon columnKey="barcode" />
                  </TableHead>
                  <TableHead className="text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort("name")}>
                    שם <SortIcon columnKey="name" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort("size")}>
                    גודל <SortIcon columnKey="size" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort("brand")}>
                    מותג <SortIcon columnKey="brand" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort("stockQuantity")}>
                    מלאי <SortIcon columnKey="stockQuantity" />
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort("price")}>
                    <span className="hidden md:inline">מחיר סיטונאי</span><span className="md:hidden">מחיר</span> <SortIcon columnKey="price" />
                  </TableHead>
                  <TableHead className="text-center w-[70px] md:w-[100px] px-0 md:px-2">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.length === 0 ? (
                  <TableRow className="border-border">
                    <TableCell colSpan={9} className="text-center h-32 text-muted-foreground">לא נמצאו מוצרים</TableCell>
                  </TableRow>
                ) : (
                  sortedProducts.map((product) => (
                    <TableRow key={product.id} className={`border-border hover:bg-muted/20 transition-colors ${product.isDraft || product.isSynced === false ? "opacity-50 grayscale-[50%]" : ""}`}>
                      <TableCell className="pr-4 pl-2 text-center">
                        <Checkbox checked={selectedIds.includes(product.id)} onCheckedChange={() => toggleOne(product.id)} aria-label={`בחר ${product.name}`} />
                      </TableCell>
                      <TableCell className="p-1 md:px-2 text-center">
                        <div 
                          className={`h-10 w-10 md:h-12 md:w-12 bg-white rounded-md flex items-center justify-center overflow-hidden border border-border/50 mx-auto relative ${product.imageUrl ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                          onClick={() => {
                            if (product.imageUrl) setSelectedImage(product.imageUrl);
                          }}
                        >
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-1" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs text-center">{product.barcode || '-'}</TableCell>
                      <TableCell className="font-medium text-center p-1 md:p-2">
                        <div className="flex flex-col items-center">
                          <span className="flex items-center gap-2 justify-center text-sm md:text-base">
                            <a 
                              href={`https://libero-il.co.il/?s=${encodeURIComponent(product.name)}&post_type=product`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline hover:text-primary transition-colors cursor-pointer"
                              title="צפה במוצר באתר"
                            >
                              {product.name}
                            </a>
                            {product.isDraft && <Badge variant="secondary" className="h-5 px-1 text-[10px]">טיוטה</Badge>}
                            {product.isSynced === false && <Badge variant="destructive" className="h-5 px-1 text-[10px] bg-yellow-500 hover:bg-yellow-600 text-white">לא מסונכרן</Badge>}
                          </span>
                          <div className="md:hidden flex flex-col items-center mt-1 text-xs text-muted-foreground space-y-0.5">
                            <span className="font-bold text-primary">₪{Number(product.price).toFixed(2)}</span>
                            <span className="flex items-center justify-center gap-1">
                              מלאי: <span dir="ltr" className="inline-block">{product.stockQuantity}</span>
                              {product.isSynced ? (
                                <span title="מסונכרן מול WooCommerce"><CheckCircle2 className="h-3 w-3 text-green-500" /></span>
                              ) : (
                                <span title="ניהול מלאי ידני"><Pencil className="h-3 w-3 text-muted-foreground" /></span>
                              )}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm text-center">{product.size || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell text-center">
                        {(() => {
                          const matchingBrand = brands.find(b => b.name === product.brand || b.nameHe === product.brand);
                          if (matchingBrand?.logoUrl) {
                            return (
                              <div className="h-8 w-16 mx-auto relative flex items-center justify-center">
                                <Image src={matchingBrand.logoUrl} alt={product.brand || "Brand"} fill className="object-contain" />
                              </div>
                            );
                          }
                          return product.brand || '-';
                        })()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="flex items-center gap-1">
                            <span dir="ltr" className="inline-block">{product.stockQuantity}</span>
                            {product.isSynced ? (
                              <span title="מסונכרן מול WooCommerce"><CheckCircle2 className="h-4 w-4 text-green-500" /></span>
                            ) : (
                              <span title="ניהול מלאי ידני"><Pencil className="h-4 w-4 text-muted-foreground" /></span>
                            )}
                          </span>
                          {product.stockQuantity < 10 && <Badge variant="destructive" className="hidden md:inline-flex h-5 px-1 text-[10px]">מלאי נמוך</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center font-mono font-bold text-primary">₪{Number(product.price).toFixed(2)}</TableCell>
                      <TableCell className="text-center p-1 md:p-2">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <Button onClick={() => handleEdit(product)} variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground hover:text-foreground">
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button onClick={() => handleDelete(product.id)} disabled={isDeleting === product.id} variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground hover:text-destructive">
                            {isDeleting === product.id ? <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : <Trash2 className="h-3 w-3 md:h-4 md:w-4" />}
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
        brands={brands}
      />
      
      <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />

      <BulkPriceDialog 
        open={isBulkPriceOpen}
        onOpenChange={setIsBulkPriceOpen}
        selectedIds={selectedIds}
        onSuccess={() => setSelectedIds([])}
      />
    </div>
  );
}
