"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/types"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  UserCog,
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Truck,
  ClipboardList,
  Receipt,
  LogOut,
  ArrowRightLeft,
  Wallet,
  Loader2,
  ChefHat,
  UtensilsCrossed,
  ArrowLeftRight,
  RefreshCw,
  Store,
  Landmark,
  Banknote,
  Bell,
} from "lucide-react"

const iconMap: Record<string, any> = {
  LayoutDashboard, ShoppingCart, Package, Warehouse,
  ArrowLeftRight, Users, UserCog, CreditCard,
  BarChart3, Settings, Truck, RefreshCw,
  ClipboardList, Receipt, ArrowRightLeft, Wallet,
  ChefHat, UtensilsCrossed, Landmark, Banknote,
  Bell,
}

const DEFAULT_MENUS = [
  { id: "1", href: "/dashboard", label: "Tableau de bord", icon: "LayoutDashboard", roles: ["admin", "manager", "cashier", "stock_manager"], sortOrder: 1 },
  { id: "2", href: "/sales", label: "Ventes (POS)", icon: "ShoppingCart", roles: ["admin", "manager", "cashier"], sortOrder: 2 },
  { id: "3", href: "/sales-history", label: "Historique des ventes", icon: "Receipt", roles: ["admin", "manager", "cashier"], sortOrder: 3 },
  { id: "4", href: "/purchases", label: "Achats", icon: "Truck", roles: ["admin", "manager", "stock_manager"], sortOrder: 4 },
  { id: "5", href: "/products", label: "Gestion des produits", icon: "Package", roles: ["admin", "manager", "cashier", "stock_manager"], sortOrder: 5 },
  { id: "6", href: "/inventory", label: "État des stocks", icon: "Warehouse", roles: ["admin", "manager", "cashier", "stock_manager"], sortOrder: 6 },
  { id: "7", href: "/inventory/adjustments", label: "Ajustements de stock", icon: "RefreshCw", roles: ["admin", "manager", "stock_manager"], sortOrder: 7 },
  { id: "8", href: "/inventory/count", label: "Inventaire", icon: "ClipboardList", roles: ["admin", "manager", "stock_manager"], sortOrder: 8 },
  { id: "9", href: "/stock-movements", label: "Mouvements de stock", icon: "ArrowLeftRight", roles: ["admin", "manager", "stock_manager"], sortOrder: 9 },
  { id: "10", href: "/stock/transfers", label: "Transferts de stock", icon: "ArrowRightLeft", roles: ["admin", "manager", "stock_manager", "cashier"], sortOrder: 10 },
  { id: "11", href: "/caisse", label: "Caisse", icon: "Banknote", roles: ["admin", "manager", "cashier"], sortOrder: 11 },
  { id: "111", href: "/notifications", label: "Notifications", icon: "Bell", roles: ["admin", "manager", "cashier", "stock_manager"], sortOrder: 111 },
  { id: "12", href: "/expenses", label: "Dépenses", icon: "Wallet", roles: ["admin", "manager", "stock_manager"], sortOrder: 12 },
  { id: "13", href: "/staff-tables", label: "Personnel & Tables", icon: "UserCog", roles: ["admin", "manager"], sortOrder: 13 },
  { id: "14", href: "/clients", label: "Clients", icon: "Users", roles: ["admin", "manager", "cashier"], sortOrder: 14 },
  { id: "15", href: "/credit", label: "Gestion des crédits", icon: "CreditCard", roles: ["admin", "manager"], sortOrder: 15 },
  { id: "16", href: "/finance", label: "Finance", icon: "Landmark", roles: ["admin", "manager"], sortOrder: 16 },
  { id: "161", href: "/finance/cuisine", label: "Finance Cuisine", icon: "UtensilsCrossed", roles: ["admin", "manager"], sortOrder: 161 },
  { id: "17", href: "/reports", label: "Rapports", icon: "BarChart3", roles: ["admin", "manager"], sortOrder: 17 },
  { id: "18", href: "/settings", label: "Paramètres", icon: "Settings", roles: ["admin"], sortOrder: 18 },
]

interface MenuItem {
  id: string
  href: string
  label: string
  icon: string
  roles: string[]
  sortOrder: number
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  const visibleDefaultMenus = useMemo(() =>
    DEFAULT_MENUS.filter(m => user && m.roles.includes(user.role)),
    [user]
  )

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch("/api/menus")
        if (res.ok) {
          const data = await res.json()
          if (data.length > 0) {
            setMenuItems(data)
            setLoading(false)
            return
          }
        }
      } catch { } finally {
        setMenuItems(visibleDefaultMenus)
        setLoading(false)
      }
    }
    fetchMenus()
  }, [user?.role, visibleDefaultMenus])

  const handleLogout = async () => {
    await logout()
    window.location.href = "/login"
  }

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
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">SmartPOS</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            menuItems.map((item) => {
              const Icon = iconMap[item.icon]
              const isActive = pathname === item.href
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
                    {Icon && <Icon className="h-5 w-5 shrink-0" />}
                    {!collapsed && <span>{item.label}</span>}
                  </Button>
                </Link>
              )
            })
          )}
        </nav>
      </ScrollArea>

      <div className="border-t border-border p-4">
        {!collapsed && user && (
          <div className="mb-2">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <Button
          variant="outline"
          className={cn("w-full", collapsed && "px-2")}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
          {!collapsed && "Déconnexion"}
        </Button>
      </div>

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
