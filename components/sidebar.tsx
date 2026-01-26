"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-context"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  ArrowLeftRight,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Truck,
  RefreshCw,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "cashier"] },
  { href: "/sales", label: "Sales (POS)", icon: ShoppingCart, roles: ["admin", "manager", "cashier"] },
  { href: "/purchases", label: "Purchases", icon: Truck, roles: ["admin", "manager"] },
  { href: "/products", label: "Product Management", icon: Package, roles: ["admin", "manager", "cashier"] },
  { href: "/inventory", label: "Inventory Status", icon: Warehouse, roles: ["admin", "manager", "cashier"] },
  { href: "/inventory/adjustments", label: "Stock Adjustments", icon: RefreshCw, roles: ["admin", "manager"] },
  { href: "/stock-movements", label: "Stock Movements", icon: ArrowLeftRight, roles: ["admin", "manager"] },
  { href: "/clients", label: "Clients", icon: Users, roles: ["admin", "manager", "cashier"] },
  { href: "/credit", label: "Credit Management", icon: CreditCard, roles: ["admin", "manager"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["admin", "manager"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["admin"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { hasRole } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const filteredNavItems = navItems.filter((item) => hasRole(item.roles as ("admin" | "manager" | "cashier")[]))

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Warehouse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">SmartPOS</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Warehouse className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-secondary text-foreground",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border border-border bg-card"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </aside>
  )
}
