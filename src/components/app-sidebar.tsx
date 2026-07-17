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
import { Box, Home, ShoppingCart, User, Settings, FileText } from "lucide-react"
import { useCartStore } from "@/store/cart"

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

export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const setIsOpen = useCartStore((state) => state.setIsOpen)
  const totalItems = useCartStore((state) => state.getTotalItems())

  return (
    <Sidebar side="right">
      <SidebarHeader className="p-6 flex items-center justify-center">
        <img src="/libero-w.png" alt="Libero Wholesale" className="h-10 object-contain drop-shadow-sm" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>תפריט ראשי</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                if (item.url === "/cart") {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        onClick={() => setIsOpen(true)}
                        className="transition-all duration-300 ease-out hover:bg-gradient-to-l hover:from-primary/20 hover:to-primary/5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group rounded-xl my-1 h-12"
                      >
                        <item.icon className="text-primary/70 group-hover:text-primary transition-colors" />
                        <span>{item.title}</span>
                        {totalItems > 0 && (
                          <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                            {totalItems}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      render={<a href={item.url} />}
                      className="transition-all duration-300 ease-out hover:bg-gradient-to-l hover:from-primary/20 hover:to-primary/5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group rounded-xl my-1 h-12"
                    >
                      <item.icon className="text-muted-foreground group-hover:text-primary transition-colors" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
                  className="transition-all duration-300 ease-out hover:bg-gradient-to-l hover:from-primary/20 hover:to-primary/5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group rounded-xl my-1 h-12"
                >
                  <Home className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>לוח בקרה</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  render={<a href="/admin/products" />}
                  className="transition-all duration-300 ease-out hover:bg-gradient-to-l hover:from-primary/20 hover:to-primary/5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group rounded-xl my-1 h-12"
                >
                  <Box className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>ניהול מוצרים</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  render={<a href="/admin/stores" />}
                  className="transition-all duration-300 ease-out hover:bg-gradient-to-l hover:from-primary/20 hover:to-primary/5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group rounded-xl my-1 h-12"
                >
                  <User className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>ניהול לקוחות</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  render={<a href="/admin/settings" />}
                  className="transition-all duration-300 ease-out hover:bg-gradient-to-l hover:from-primary/20 hover:to-primary/5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group rounded-xl my-1 h-12"
                >
                  <Settings className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>הגדרות עסק</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </Sidebar>
  )
}
