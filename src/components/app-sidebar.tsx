"use client";

import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { 
  Home, 
  Settings, 
  ShoppingBag,
  Users,
  PackageSearch,
  ShoppingCart,
  Box,
  User,
  FileText
} from "lucide-react";
import { useCartStore } from "@/store/cart"
import { usePathname } from "next/navigation"
import { UserButton, SignOutButton } from "@clerk/nextjs"

const items = [
  {
    title: "קטלוג",
    url: "/catalog",
    icon: Box,
  },
  {
    title: "עגלת קניות",
    url: "/cart",
    icon: ShoppingCart,
  },
  {
    title: "היסטוריית הזמנות",
    url: "/orders",
    icon: FileText,
  },
  {
    title: "אזור אישי",
    url: "/account",
    icon: User,
  },
]

export function AppSidebar({ isAdmin = false, pendingStoresCount = 0 }: { isAdmin?: boolean, pendingStoresCount?: number }) {
  const setIsOpen = useCartStore((state) => state.setIsOpen)
  const totalItems = useCartStore((state) => state.getTotalItems())
  const pathname = usePathname()

  const [openItems, setOpenItems] = useState<string[]>(["main"]);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      setOpenItems(["admin"]);
    } else {
      setOpenItems(["main"]);
    }
  }, [pathname]);

  const getButtonClass = (url: string) => {
    const isActive = pathname === url || (url !== "/" && url !== "/admin" && pathname !== "/admin" && pathname?.startsWith(`${url}/`));
    return `w-full justify-start text-right gap-3 px-4 py-2.5 rounded-xl transition-all ${
      isActive 
        ? "bg-white/10 text-white shadow-md font-semibold" 
        : "text-zinc-400 hover:text-white hover:bg-white/5"
    }`;
  };

  const getIconClass = (url: string) => {
    const isActive = pathname === url || (url !== "/" && url !== "/admin" && pathname !== "/admin" && pathname?.startsWith(`${url}/`));
    return `w-5 h-5 transition-transform group-hover:scale-110 ${
      isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
    }`;
  };

  const mainMenuContent = (
    <SidebarGroupContent className="px-2 pt-1">
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url || (item.url !== "/" && item.url !== "/admin" && pathname !== "/admin" && pathname?.startsWith(`${item.url}/`));
          if (item.url === "/cart") {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  onClick={() => setIsOpen(true)}
                  className={`group ${getButtonClass(item.url)}`}
                >
                  <item.icon className={getIconClass(item.url)} />
                  <span className={isActive ? "font-semibold text-white" : "group-hover:text-white transition-colors"}>{item.title}</span>
                  {totalItems > 0 && (
                    <span className="mr-auto bg-white text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }
          
          return (
            <div key={item.title}>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  render={<a href={item.url} />}
                  className={`group ${getButtonClass(item.url)}`}
                >
                  <item.icon className={getIconClass(item.url)} />
                  <span className={isActive ? "font-semibold text-white" : "group-hover:text-white transition-colors"}>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          )
        })}
      </SidebarMenu>
    </SidebarGroupContent>
  );

  return (
    <Sidebar className="border-l border-white/10 bg-zinc-950 text-white" side="right">
      <SidebarHeader className="p-4 flex items-center justify-center border-b border-white/10 bg-black/10">
        <img src="/libero-w-white.png" alt="Libero Wholesale" className="w-[90%] h-auto object-contain drop-shadow-sm" />
      </SidebarHeader>
      <SidebarContent className="pb-4" dir="rtl">
        {isAdmin ? (
          <Accordion 
            value={openItems} 
            onValueChange={(val) => setOpenItems(val)} 
            className="w-full space-y-2" 
            dir="rtl"
          >
            <AccordionItem value="main" className="border-none">
              <SidebarGroup className="p-0">
                <AccordionTrigger className="px-6 hover:no-underline py-2 opacity-70 hover:opacity-100 transition-opacity [&>svg]:text-white">
                  <span className="text-xs font-medium text-white uppercase tracking-wider">תפריט ראשי</span>
                </AccordionTrigger>
                <AccordionContent>
                  {mainMenuContent}
                </AccordionContent>
              </SidebarGroup>
            </AccordionItem>

            <AccordionItem value="admin" className="border-none border-t border-border/50">
              <SidebarGroup className="p-0 pt-2 mt-2">
                <AccordionTrigger className="px-6 hover:no-underline py-2 opacity-70 hover:opacity-100 transition-opacity [&>svg]:text-white">
                  <span className="text-xs font-medium text-white uppercase tracking-wider">ניהול מערכת</span>
                </AccordionTrigger>
                <AccordionContent>
                  <SidebarGroupContent className="px-2 pt-1">
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          render={<a href="/admin" />}
                          className={`group ${getButtonClass("/admin")}`}
                        >
                          <Home className={getIconClass("/admin")} />
                          <span className={pathname === "/admin" ? "font-semibold text-white" : "group-hover:text-white transition-colors"}>לוח בקרה</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          render={<a href="/admin/orders" />}
                          className={`group ${getButtonClass("/admin/orders")}`}
                        >
                          <ShoppingCart className={getIconClass("/admin/orders")} />
                          <span className={pathname === "/admin/orders" ? "font-semibold text-white" : "group-hover:text-white transition-colors"}>ניהול הזמנות</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          render={<a href="/admin/products" />}
                          className={`group ${getButtonClass("/admin/products")}`}
                        >
                          <Box className={getIconClass("/admin/products")} />
                          <span className={pathname === "/admin/products" ? "font-semibold text-white" : "group-hover:text-white transition-colors"}>ניהול מוצרים</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          render={<a href="/admin/brands" />}
                          className={`group ${getButtonClass("/admin/brands")}`}
                        >
                          <ShoppingBag className={getIconClass("/admin/brands")} />
                          <span className={pathname === "/admin/brands" ? "font-semibold text-white" : "group-hover:text-white transition-colors"}>ניהול מותגים</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          render={<a href="/admin/stores" />}
                          className={`group ${getButtonClass("/admin/stores")}`}
                        >
                          <User className={getIconClass("/admin/stores")} />
                          <span className={pathname === "/admin/stores" ? "font-semibold text-white" : "group-hover:text-white transition-colors"}>ניהול לקוחות</span>
                          {pendingStoresCount > 0 && (
                            <span className="mr-auto bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                              {pendingStoresCount}
                            </span>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          render={<a href="/admin/settings" />}
                          className={`group ${getButtonClass("/admin/settings")}`}
                        >
                          <Settings className={getIconClass("/admin/settings")} />
                          <span className={pathname === "/admin/settings" ? "font-semibold text-white" : "group-hover:text-white transition-colors"}>הגדרות עסק</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </AccordionContent>
              </SidebarGroup>
            </AccordionItem>
          </Accordion>
        ) : (
          <SidebarGroup className="p-0">
            <span className="px-6 py-2 text-xs font-medium text-white uppercase tracking-wider block opacity-70">תפריט ראשי</span>
            {mainMenuContent}
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-white/10 mt-auto bg-black/20 [&_.cl-userButtonOuterIdentifier]:!text-white [&_.cl-userButtonOuterIdentifier]:font-medium [&_.cl-userButtonOuterIdentifier]:ml-2">
        <div className="flex items-center justify-center text-foreground px-2 py-2">
          <div className="flex items-center gap-3">
            <UserButton showName />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
