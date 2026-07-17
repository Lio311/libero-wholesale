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
      <SidebarHeader className="p-4 flex items-center justify-center">
        <img src="/logo2.png" alt="Libero Wholesale" className="h-10 object-contain drop-shadow-sm" />
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
                      <SidebarMenuButton onClick={() => setIsOpen(true)}>
                        <item.icon />
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
                    <SidebarMenuButton render={<a href={item.url} />}>
                      <item.icon />
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
        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<a href="/admin" />}>
                <Settings />
                <span>ניהול מערכת</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
