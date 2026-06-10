"use client"

import { useEffect, useState } from "react"
<<<<<<< HEAD
import Link from "next/link"
import { StatsCard } from "@/components/stats-card"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
=======
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
>>>>>>> origin/alimentation
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { TimePeriodSelector, type TimePeriod } from "@/components/dashboard/time-period-selector"
import { formatCurrency } from "@/lib/mock-data"
<<<<<<< HEAD
import { DollarSign, TrendingUp, CreditCard, AlertTriangle, Loader2, RefreshCw, Users, ClipboardList, Boxes, ShieldCheck } from "lucide-react"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { useTransactions } from "@/hooks/use-transactions"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("today")
  const { user } = useAuth()
  const dashboardSector = user?.role === "cashier_bakery" ? "Boulangerie" : undefined
  const { stats, loading: statsLoading, refresh: refreshStats } = useDashboardStats(timePeriod, dashboardSector)
  const { transactions, fetchTransactions, loading: txLoading } = useTransactions(dashboardSector)
=======
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { useTransactions } from "@/hooks/use-transactions"
import { useOrders } from "@/hooks/use-orders"
import {
  DollarSign, TrendingUp, CreditCard, Package, AlertTriangle,
  Loader2, RefreshCw, Receipt, Banknote, ShoppingCart, Clock,
  ChefHat, Bell, Utensils, ArrowUpRight, ArrowDownRight, BarChart3,
} from "lucide-react"

export default function DashboardPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("today")
  const { stats, loading: statsLoading, refresh: refreshStats } = useDashboardStats(timePeriod)
  const { transactions, fetchTransactions, loading: txLoading } = useTransactions()
  const { orders, loading: ordersLoading } = useOrders()
>>>>>>> origin/alimentation
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)
  const isSystemAdmin = user?.role === "admin"

  useEffect(() => {
    if (!autoRefreshEnabled) return
    const interval = setInterval(() => {
      refreshStats(timePeriod, dashboardSector)
      fetchTransactions()
    }, 30000)
    return () => clearInterval(interval)
  }, [autoRefreshEnabled, refreshStats, fetchTransactions, timePeriod, dashboardSector])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleManualRefresh = async () => {
    setIsManualRefreshing(true)
    await Promise.all([refreshStats(timePeriod, dashboardSector), fetchTransactions()])
    setIsManualRefreshing(false)
  }

<<<<<<< HEAD
  const recentTransactions = (stats?.recentTransactions?.length ? stats.recentTransactions : transactions).slice(0, 5)
  const adminConnectedUsers = stats?.systemAdminActivity?.connectedUsers || []
  const adminChangeHistory = stats?.systemAdminActivity?.adminChangeHistory || []

  const roleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Admin système",
      cashier_food: "Caissier alimentation",
      supervisor_food: "Superviseur alimentation",
      cashier_bakery: "Caissier boulangerie",
      supervisor_bakery: "Superviseur boulangerie",
      production_bakery: "Production boulangerie",
      manager: "Manager",
      investor: "Investisseur",
      accountant: "Comptable",
    }
    return labels[role] || role
  }
=======
  const recentTransactions = transactions
    .filter((t: any) => t.type === "sale")
    .slice(0, 5)
>>>>>>> origin/alimentation

  const orderStatusCounts = {
    pending: orders.filter((o: any) => o.orderStatus === "pending").length,
    preparing: orders.filter((o: any) => o.orderStatus === "preparing").length,
    ready: orders.filter((o: any) => o.orderStatus === "ready").length,
    served: orders.filter((o: any) => o.orderStatus === "served").length,
  }

  const activeOrders = orderStatusCounts.pending + orderStatusCounts.preparing + orderStatusCounts.ready + orderStatusCounts.served

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
<<<<<<< HEAD
          <h2 className="text-2xl font-bold text-foreground">
            {dashboardSector ? "Tableau de bord Boulangerie" : "Dashboard"}
          </h2>
          <p className="text-muted-foreground">
            {dashboardSector ? "Vue des activités de la boulangerie" : "Overview of your store performance"}
          </p>
=======
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Real-time overview of your business</p>
        </div>
        <div className="flex items-center gap-3">
          <TimePeriodSelector selected={timePeriod} onSelect={setTimePeriod} />
          <div className="flex items-center gap-1.5 border-l pl-3 border-border">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${autoRefreshEnabled ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              title={autoRefreshEnabled ? "Auto-refresh on" : "Auto-refresh off"}
            >
              <Clock className={`h-4 w-4 ${autoRefreshEnabled ? "animate-pulse" : ""}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleManualRefresh}
              disabled={isManualRefreshing || statsLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isManualRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
>>>>>>> origin/alimentation
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Today&apos;s Sales</p>
                <p className="text-2xl font-bold tracking-tight">
                  {statsLoading ? <span className="text-muted-foreground animate-pulse">---</span> : formatCurrency(stats?.todaySales || 0)}
                </p>
                <p className="text-xs text-muted-foreground">{stats?.todayTransactionCount || 0} transactions</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

<<<<<<< HEAD
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart loading={statsLoading} timePeriod={timePeriod} sector={dashboardSector} />
=======
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {timePeriod === "month" ? "Monthly Revenue" : timePeriod === "week" ? "Weekly Revenue" : "Today&apos;s Revenue"}
                </p>
                <p className="text-2xl font-bold tracking-tight">
                  {statsLoading ? <span className="text-muted-foreground animate-pulse">---</span> : formatCurrency(stats?.monthlyRevenue || 0)}
                </p>
                <p className="text-xs text-muted-foreground">{stats?.productsCount || 0} products sold</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
>>>>>>> origin/alimentation

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Orders</p>
                <p className="text-2xl font-bold tracking-tight">
                  {ordersLoading ? <span className="text-muted-foreground animate-pulse">---</span> : activeOrders}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Clock className="h-3 w-3 text-amber-500" />{orderStatusCounts.pending}</span>
                  <span className="flex items-center gap-0.5"><ChefHat className="h-3 w-3 text-blue-500" />{orderStatusCounts.preparing}</span>
                  <span className="flex items-center gap-0.5"><Bell className="h-3 w-3 text-green-500" />{orderStatusCounts.ready}</span>
                  <span className="flex items-center gap-0.5"><Utensils className="h-3 w-3 text-purple-500" />{orderStatusCounts.served}</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <ShoppingCart className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Outstanding Credit</p>
                <p className="text-2xl font-bold tracking-tight">
                  {statsLoading ? <span className="text-muted-foreground animate-pulse">---</span> : formatCurrency(stats?.totalCreditBalance || 0)}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] px-1 py-0 font-normal">
                    {stats?.creditSalesRatio || 0}% credit ratio
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 font-normal border-red-500/30 text-red-600">
                    {stats?.lowStockItems || 0} low stock
                  </Badge>
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <CreditCard className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

<<<<<<< HEAD
      {isSystemAdmin && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Activité administrateur système</CardTitle>
            <CardDescription>Suivi des actions et points de contrôle administratifs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Total utilisateurs</span>
                </div>
                <p className="text-2xl font-semibold">{statsLoading ? "..." : stats?.systemAdminActivity?.totalUsers || 0}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-sm">Comptes admin</span>
                </div>
                <p className="text-2xl font-semibold">{statsLoading ? "..." : stats?.systemAdminActivity?.adminUsers || 0}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <ClipboardList className="h-4 w-4" />
                  <span className="text-sm">Total produits</span>
                </div>
                <p className="text-2xl font-semibold">{statsLoading ? "..." : stats?.systemAdminActivity?.totalProducts || 0}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Boxes className="h-4 w-4" />
                  <span className="text-sm">Total catégories</span>
                </div>
                <p className="text-2xl font-semibold">{statsLoading ? "..." : stats?.systemAdminActivity?.totalCategories || 0}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Total unités de mesure</p>
                <p className="text-2xl font-semibold">{statsLoading ? "..." : stats?.systemAdminActivity?.totalMeasurementUnits || 0}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Bons d'achat en attente</p>
                <p className="text-2xl font-semibold">{statsLoading ? "..." : stats?.systemAdminActivity?.pendingPurchaseOrders || 0}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Inventaires en cours</p>
                <p className="text-2xl font-semibold">{statsLoading ? "..." : stats?.systemAdminActivity?.inProgressInventories || 0}</p>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <p className="mb-3 text-sm font-medium">Utilisateurs actifs (24h)</p>
                <div className="space-y-2">
                  {adminConnectedUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun utilisateur actif récent.</p>
                  ) : (
                    adminConnectedUsers.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{roleLabel(item.role)}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-accent/20 text-accent">Actif</Badge>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(item.lastActivity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <p className="mb-3 text-sm font-medium">Historique création / modification</p>
                <div className="space-y-2">
                  {adminChangeHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun historique disponible.</p>
                  ) : (
                    adminChangeHistory.map((item: any) => (
                      <div key={item.id} className="rounded-md border border-border px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{item.description}</p>
                          <Badge variant="outline">{item.actionType}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.userName} ({roleLabel(item.userRole)}) - {new Date(item.date).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">
                Ajustements de stock sur la période:{" "}
                <span className="font-semibold text-foreground">
                  {statsLoading ? "..." : stats?.systemAdminActivity?.stockAdjustmentsInPeriod || 0}
                </span>
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/users">Utilisateurs</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/notifications">Notifications</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/settings">Paramétrage</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {txLoading ? (
        <Card className="flex h-40 flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading recent transactions...</p>
=======
      {/* Chart + Quick Stats Side by Side */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart loading={statsLoading} timePeriod={timePeriod} />
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <MetricBar
              label="Products Sold"
              value={stats?.productsCount || 0}
              suffix="items"
              max={100}
              loading={statsLoading}
              color="bg-primary"
            />
            <MetricBar
              label="Transactions"
              value={stats?.todayTransactionCount || 0}
              suffix="orders"
              max={50}
              loading={statsLoading}
              color="bg-green-500"
            />
            <MetricBar
              label="Avg Order Value"
              value={formatCurrency(
                (stats?.todaySales || 0) / Math.max(stats?.todayTransactionCount || 1, 1)
              )}
              max={100}
              progress={Math.min(((stats?.todaySales || 0) / Math.max(stats?.todayTransactionCount || 1, 1)) / 50000 * 100, 100)}
              loading={statsLoading}
              color="bg-amber-500"
            />
            <MetricBar
              label="Credit Sales"
              value={`${stats?.creditSalesRatio || 0}%`}
              suffix={`${stats?.creditSalesRatio || 0}% of total`}
              max={100}
              loading={statsLoading}
              color="bg-red-500"
            />
          </CardContent>
>>>>>>> origin/alimentation
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            Recent Transactions
          </CardTitle>
          <Badge variant="outline" className="text-xs font-normal">
            Last 5
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {txLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <Receipt className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentTransactions.map((txn: any) => (
                <div key={txn.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      txn.paymentMethod === "cash" ? "bg-green-500/10" : txn.paymentMethod === "credit" ? "bg-blue-500/10" : "bg-muted"
                    }`}>
                      {txn.paymentMethod === "cash"
                        ? <Banknote className="h-4 w-4 text-green-600" />
                        : txn.paymentMethod === "credit"
                          ? <CreditCard className="h-4 w-4 text-blue-600" />
                          : <Receipt className="h-4 w-4 text-muted-foreground" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {txn.client?.name || <span className="italic text-muted-foreground">Walk-in</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-mono">#{txn.id.slice(0, 8)}</span>
                        <span className="mx-1">&middot;</span>
                        {new Date(txn.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {txn.user?.name && (
                          <><span className="mx-1">&middot;</span>{txn.user.name}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold">{formatCurrency(Number.parseFloat(txn.total))}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        txn.status === "completed"
                          ? "border-green-500/30 bg-green-500/10 text-green-700"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-700"
                      }`}
                    >
                      {txn.status === "completed" ? "Paid" : txn.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MetricBar({
  label, value, suffix, max, progress, loading, color,
}: {
  label: string
  value: string | number
  suffix?: string
  max?: number
  progress?: number
  loading?: boolean
  color: string
}) {
  const pct = progress ?? (typeof value === "number" && max ? Math.min((value / max) * 100, 100) : 0)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {loading ? <span className="text-muted-foreground animate-pulse">---</span> : value}
          {suffix && !loading && <span className="text-muted-foreground font-normal ml-0.5">{suffix}</span>}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: loading ? "0%" : `${pct}%` }}
        />
      </div>
    </div>
  )
}
