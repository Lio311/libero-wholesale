"use client";

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

  const getButtonClass = (url: string) => {
    const isActive = pathname === url || (url !== "/" && url !== "/admin" && pathname !== "/admin" && pathname?.startsWith(`${url}/`))
    return `transition-all duration-300 ease-out rounded-xl my-1 h-12 flex items-center px-4 w-full text-right ${
      isActive 
        ? "bg-black/5 dark:bg-white/10 font-medium text-foreground shadow-sm" 
        : "hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground"
    }`
  }

  const getIconClass = (url: string) => {
    const isActive = pathname === url || (url !== "/" && url !== "/admin" && pathname !== "/admin" && pathname?.startsWith(`${url}/`))
    return `transition-colors ${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`
  }

  return (
    <Sidebar side="right" className="dark border-l-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <SidebarHeader className="p-4 hidden md:flex items-center justify-center">
        <img src="/libero-w-white.png" alt="Libero Wholesale" className="w-[90%] h-auto object-contain drop-shadow-sm" />
      </SidebarHeader>
      <SidebarContent className="pb-4">
        <SidebarGroup>
          <SidebarGroupLabel>תפריט ראשי</SidebarGroupLabel>
          <SidebarGroupContent>
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
                        <span className={isActive ? "font-semibold text-foreground" : ""}>{item.title}</span>
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
                        <span className={isActive ? "font-semibold text-foreground" : ""}>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </div>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {isAdmin && (
        <SidebarGroup className="mt-auto border-t border-border/50 pt-4">
          <SidebarGroupLabel>ניהול מערכת</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  render={<a href="/admin" />}
                  className={`group ${getButtonClass("/admin")}`}
                >
                  <Home className={getIconClass("/admin")} />
                  <span className={pathname === "/admin" ? "font-semibold text-foreground" : ""}>לוח בקרה</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  render={<a href="/admin/orders" />}
                  className={`group ${getButtonClass("/admin/orders")}`}
                >
                  <ShoppingCart className={getIconClass("/admin/orders")} />
                  <span className={pathname === "/admin/orders" ? "font-semibold text-foreground" : ""}>ניהול הזמנות</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  render={<a href="/admin/products" />}
                  className={`group ${getButtonClass("/admin/products")}`}
                >
                  <Box className={getIconClass("/admin/products")} />
                  <span className={pathname === "/admin/products" ? "font-semibold text-foreground" : ""}>ניהול מוצרים</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  render={<a href="/admin/brands" />}
                  className={`group ${getButtonClass("/admin/brands")}`}
                >
                  <ShoppingBag className={getIconClass("/admin/brands")} />
                  <span className={pathname === "/admin/brands" ? "font-semibold text-foreground" : ""}>ניהול מותגים</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  render={<a href="/admin/stores" />}
                  className={`group ${getButtonClass("/admin/stores")}`}
                >
                  <User className={getIconClass("/admin/stores")} />
                  <span className={pathname === "/admin/stores" ? "font-semibold text-foreground" : ""}>ניהול לקוחות</span>
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
                  <span className={pathname === "/admin/settings" ? "font-semibold text-foreground" : ""}>הגדרות עסק</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      <SidebarFooter className="p-4 border-t border-white/10 mt-auto bg-black/20 [&_.cl-userButtonOuterIdentifier]:!text-white [&_.cl-userButtonOuterIdentifier]:font-medium [&_.cl-userButtonOuterIdentifier]:ml-2">
        <div className="flex items-center justify-start text-foreground px-2 py-2">
          <div className="flex items-center gap-3">
            <UserButton showName />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
