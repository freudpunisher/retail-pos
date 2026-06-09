"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
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
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Truck,
  ClipboardList,
  Receipt,
  LogOut,
  Factory,
  Wheat,
  Wallet,
  HandCoins,
  PieChart,
  Bell,
  Building2,
  UserRound,
} from "lucide-react"

const navItems: { href: string; label: string; icon: any; roles: UserRole[] }[] = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    roles: [
      "admin",
      "cashier_food",
      "supervisor_food",
      "cashier_bakery",
      "supervisor_bakery",
      "production_bakery",
      "manager",
      "investor",
      "accountant",
    ],
  },
  {
    href: "/sales",
    label: "Ventes",
    icon: ShoppingCart,
    roles: ["cashier_food", "supervisor_food", "cashier_bakery", "supervisor_bakery"],
  },
  {
    href: "/sales-history",
    label: "Factures de vente",
    icon: Receipt,
    roles: [
      "cashier_food",
      "supervisor_food",
      "cashier_bakery",
      "supervisor_bakery",
      "manager",
      "investor",
      "accountant",
    ],
  },
  {
    href: "/credit",
    label: "Payement credit",
    icon: CreditCard,
    roles: [
      "cashier_food",
      "supervisor_food",
      "cashier_bakery",
      "supervisor_bakery",
      "manager",
      "investor",
      "accountant",
    ],
  },
  {
    href: "/purchases",
    label: "Approvisionnement (Alimentation)",
    icon: Truck,
    roles: ["cashier_food", "supervisor_food", "manager", "investor"],
  },
  {
    href: "/suppliers",
    label: "Fournisseurs",
    icon: Building2,
    roles: ["supervisor_food", "supervisor_bakery", "cashier_food", "cashier_bakery"],
  },
  {
    href: "/clients",
    label: "Clients",
    icon: UserRound,
    roles: ["supervisor_food", "supervisor_bakery", "cashier_food", "cashier_bakery"],
  },
  {
    href: "/bakery/raw-materials",
    label: "Matière Première",
    icon: Wheat,
    roles: ["cashier_bakery", "supervisor_bakery", "production_bakery", "manager", "investor"],
  },
  {
    href: "/bakery/purchases/create",
    label: "Achat Matières Premières",
    icon: Truck,
    roles: ["supervisor_bakery", "manager", "investor"],
  },
  {
    href: "/bakery/purchases",
    label: "Liste Achats Boulangerie",
    icon: ClipboardList,
    roles: ["supervisor_bakery", "cashier_bakery", "production_bakery", "manager", "investor"],
  },
  {
    href: "/bakery/stock",
    label: "Stock Boulangerie",
    icon: Warehouse,
    roles: ["supervisor_bakery", "cashier_bakery", "production_bakery", "manager", "investor"],
  },
  {
    href: "/inventory",
    label: "Statut de l'inventaire",
    icon: Warehouse,
    roles: [
      "cashier_food",
      "supervisor_food",
      "cashier_bakery",
      "supervisor_bakery",
      "production_bakery",
      "manager",
      "investor",
    ],
  },
  {
    href: "/products",
    label: "Produits",
    icon: Package,
    roles: ["cashier_food", "supervisor_food", "supervisor_bakery", "admin"],
  },
  {
    href: "/inventory/count",
    label: "Sessions d'inventaire",
    icon: ClipboardList,
    roles: ["cashier_food", "supervisor_food"],
  },
  {
    href: "/inventory/count",
    label: "Sessions d'inventaire (Boulangerie)",
    icon: ClipboardList,
    roles: ["cashier_bakery", "supervisor_bakery", "production_bakery"],
  },
  {
    href: "/finance/expenses",
    label: "Dépenses",
    icon: Wallet,
    roles: ["cashier_food", "supervisor_food", "supervisor_bakery", "manager", "investor"],
  },
  {
    href: "/finance/payments",
    label: "Historique paiements",
    icon: HandCoins,
    roles: ["admin", "cashier_food", "supervisor_food", "cashier_bakery", "supervisor_bakery", "manager", "investor", "accountant"],
  },
  {
    href: "/bakery/production",
    label: "Production",
    icon: Factory,
    roles: ["production_bakery", "supervisor_bakery"],
  },
  {
    href: "/bakery/production/history",
    label: "Historique Production",
    icon: ClipboardList,
    roles: ["production_bakery", "supervisor_bakery"],
  },
  {
    href: "/reports",
    label: "Rapports",
    icon: BarChart3,
    roles: [
      "cashier_food",
      "supervisor_food",
      "cashier_bakery",
      "supervisor_bakery",
      "production_bakery",
      "accountant",
    ],
  },
  {
    href: "/finance/reports",
    label: "Comptabilité",
    icon: PieChart,
    roles: ["manager", "investor", "accountant"],
  },
  { href: "/users", label: "Utilisateurs", icon: Users, roles: ["admin"] },
  { href: "/notifications", label: "Notifications", icon: Bell, roles: ["admin"] },
  { href: "/settings", label: "Paramétrage", icon: Settings, roles: ["admin"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { hasRole, logout, user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await logout()
    window.location.href = "/login"
  }

  const filteredNavItems = navItems.filter((item) => hasRole(item.roles))

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
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(`${item.href}/`) && item.href !== "/bakery/production")
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

      {/* User Info & Logout */}
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
          {!collapsed && "Logout"}
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
