"use client";

import { useCartStore } from "@/store/cart";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, ShoppingBag } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";

export function MobileHeader() {
  const { getTotalItems, setIsOpen } = useCartStore();
  const { isSignedIn } = useUser();
  const totalItems = getTotalItems();

  return (
    <div className="relative flex items-center justify-between px-4 md:hidden border-b border-border/40 bg-black/95 backdrop-blur-md z-10 shrink-0 shadow-sm h-16">
      
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-white hover:bg-white/10 hover:text-white rounded-full"
          onClick={() => setIsOpen(true)}
        >
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
        <div className="text-white flex items-center justify-center ml-2">
           <UserButton />
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <img src="/libero-w-white.png" alt="Libero Logo" className="h-10 object-contain" />
      </div>

      <SidebarTrigger className="h-10 w-10 text-white hover:text-white/80 hover:bg-white/10 rounded-full">
        <Menu className="h-6 w-6" />
      </SidebarTrigger>
    </div>
  );
}
