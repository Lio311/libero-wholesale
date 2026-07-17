"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { BrandDialog } from "./BrandDialog";
import { deleteBrand } from "./actions";

interface Brand {
  id: string;
  name: string;
  nameHe: string | null;
  logoUrl: string | null;
}

export function BrandsClient({ initialBrands }: { initialBrands: Brand[] }) {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.nameHe && b.nameHe.includes(searchQuery))
  );

  const handleDelete = async (id: string) => {
    if (confirm("האם אתה בטוח שברצונך למחוק מותג זה? (לא ימחק מוצרים המשויכים אליו)")) {
      const res = await deleteBrand(id);
      if (res.success) {
        setBrands(brands.filter(b => b.id !== id));
      } else {
        alert(res.error);
      }
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש מותג..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 w-full bg-background rounded-full border-border/50 focus:border-primary/50 transition-colors"
          />
        </div>
        <Button
          onClick={() => {
            setEditingBrand(null);
            setDialogOpen(true);
          }}
          className="w-full md:w-auto rounded-full shadow-sm hover:shadow transition-shadow"
        >
          <Plus className="mr-2 h-4 w-4" />
          מותג חדש
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-right whitespace-nowrap">לוגו</TableHead>
              <TableHead className="text-right whitespace-nowrap">שם (אנגלית)</TableHead>
              <TableHead className="text-right whitespace-nowrap">שם (עברית)</TableHead>
              <TableHead className="text-left whitespace-nowrap">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBrands.map((brand) => (
              <TableRow key={brand.id} className="hover:bg-muted/30 transition-colors group">
                <TableCell>
                  {brand.logoUrl ? (
                    <div className="h-10 w-10 md:h-12 md:w-12 bg-white rounded-lg border border-border/50 flex items-center justify-center p-1 shadow-sm">
                      <img src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 md:h-12 md:w-12 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                      אין
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell>{brand.nameHe || "-"}</TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingBrand(brand);
                        setDialogOpen(true);
                      }}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(brand.id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredBrands.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  לא נמצאו מותגים.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {dialogOpen && (
        <BrandDialog
          brand={editingBrand}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </div>
  );
}
