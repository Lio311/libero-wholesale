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
import Link from "next/link"

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
    const targetValue = pathname?.startsWith("/admin") ? "admin" : "main";
    setOpenItems((prev) => {
      if (prev.includes(targetValue)) {
        return prev;
      }
      return [...prev, targetValue];
    });
  }, [pathname]);

  const getButtonClass = (url: string) => {
    const isActive = pathname === url || (url !== "/" && url !== "/admin" && pathname !== "/admin" && pathname?.startsWith(`${url}/`));
    return `transition-all duration-300 ease-out rounded-xl my-1 h-12 flex items-center px-4 w-full justify-start text-right gap-3 ${
      isActive 
        ? "bg-white/10 font-medium text-white shadow-sm" 
        : "hover:bg-white/10 text-white/70 hover:text-white"
    }`;
  };

  const getIconClass = (url: string) => {
    const isActive = pathname === url || (url !== "/" && url !== "/admin" && pathname !== "/admin" && pathname?.startsWith(`${url}/`));
    return `w-5 h-5 transition-colors ${isActive ? "text-white" : "text-white/70 group-hover:text-white"}`;
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
                  className={`group ${getButtonClass(item.url)} !no-underline`}
                >
                  <item.icon className={getIconClass(item.url)} />
                  <span className={isActive ? "font-semibold text-white" : ""}>{item.title}</span>
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
                  asChild
                  className={`group ${getButtonClass(item.url)} !no-underline`}
                >
                  <Link href={item.url}>
                    <item.icon className={getIconClass(item.url)} />
                    <span className={isActive ? "font-semibold text-white" : ""}>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          )
        })}
      </SidebarMenu>
    </SidebarGroupContent>
  );

  return (
    <Sidebar className="dark border-l border-white/10 bg-zinc-950 text-white" side="right">
      <SidebarHeader className="p-4 flex items-center justify-center border-b border-white/10 bg-black/10">
        <img src="/libero-w-white.png" alt="Libero Wholesale" className="w-[90%] h-auto object-contain drop-shadow-sm" />
      </SidebarHeader>
      <SidebarContent className="pb-4" dir="rtl">
        {isAdmin ? (
          <Accordion 
            type="multiple"
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
                          asChild
                          className={`group ${getButtonClass("/admin")} !no-underline`}
                        >
                          <Link href="/admin">
                            <Home className={getIconClass("/admin")} />
                            <span className={pathname === "/admin" ? "font-semibold text-white" : ""}>לוח בקרה</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          asChild
                          className={`group ${getButtonClass("/admin/orders")} !no-underline`}
                        >
                          <Link href="/admin/orders">
                            <ShoppingCart className={getIconClass("/admin/orders")} />
                            <span className={pathname === "/admin/orders" ? "font-semibold text-white" : ""}>ניהול הזמנות</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          asChild
                          className={`group ${getButtonClass("/admin/products")} !no-underline`}
                        >
                          <Link href="/admin/products">
                            <Box className={getIconClass("/admin/products")} />
                            <span className={pathname === "/admin/products" ? "font-semibold text-white" : ""}>ניהול מוצרים</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          asChild
                          className={`group ${getButtonClass("/admin/brands")} !no-underline`}
                        >
                          <Link href="/admin/brands">
                            <ShoppingBag className={getIconClass("/admin/brands")} />
                            <span className={pathname === "/admin/brands" ? "font-semibold text-white" : ""}>ניהול מותגים</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          asChild
                          className={`group ${getButtonClass("/admin/stores")} !no-underline`}
                        >
                          <Link href="/admin/stores">
                            <User className={getIconClass("/admin/stores")} />
                            <span className={pathname === "/admin/stores" ? "font-semibold text-white" : ""}>ניהול לקוחות</span>
                            {pendingStoresCount > 0 && (
                              <span className="mr-auto bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                {pendingStoresCount}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          asChild
                          className={`group ${getButtonClass("/admin/settings")} !no-underline`}
                        >
                          <Link href="/admin/settings">
                            <Settings className={getIconClass("/admin/settings")} />
                            <span className={pathname === "/admin/settings" ? "font-semibold text-white" : ""}>הגדרות עסק</span>
                          </Link>
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
