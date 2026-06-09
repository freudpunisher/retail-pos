"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { StatsCard } from "@/components/stats-card"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { TimePeriodSelector, TimePeriod } from "@/components/dashboard/time-period-selector"
import { formatCurrency } from "@/lib/mock-data"
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
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)
  const isSystemAdmin = user?.role === "admin"

  // Auto-refresh dashboard every 30 seconds
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

  const transactionColumns = [
    {
      key: "id" as const,
      header: "Transaction ID",
      render: (t: any) => <span className="font-mono text-xs overflow-hidden text-ellipsis block max-w-[100px]">{t.id}</span>,
    },
    {
      key: "date" as const,
      header: "Date",
      render: (t: any) => new Date(t.date).toLocaleDateString(),
    },
    {
      key: "clientId" as const,
      header: "Customer",
      render: (t: any) => t.client?.name || "Walk-in Customer",
    },
    {
      key: "total" as const,
      header: "Amount",
      render: (t: any) => <span className="font-medium">{formatCurrency(Number.parseFloat(t.total))}</span>,
    },
    {
      key: "paymentMethod" as const,
      header: "Payment",
      render: (t: any) => (
        <Badge
          variant="outline"
          className={
            t.paymentMethod === "cash"
              ? "border-accent/50 text-accent"
              : t.paymentMethod === "credit"
                ? "border-warning/50 text-warning"
                : "border-primary/50 text-primary"
          }
        >
          {t.paymentMethod}
        </Badge>
      ),
    },
    {
      key: "status" as const,
      header: "Status",
      render: (t: any) => (
        <Badge
          className={
            t.status === "completed"
              ? "bg-accent/20 text-accent"
              : t.status === "pending"
                ? "bg-warning/20 text-warning"
                : "bg-destructive/20 text-destructive"
          }
        >
          {t.status}
        </Badge>
      ),
    },
    {
      key: "userId" as const,
      header: "Cashier",
      render: (t: any) => t.user?.name || "Unknown",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {dashboardSector ? "Tableau de bord Boulangerie" : "Dashboard"}
          </h2>
          <p className="text-muted-foreground">
            {dashboardSector ? "Vue des activités de la boulangerie" : "Overview of your store performance"}
          </p>
        </div>
        <TimePeriodSelector selected={timePeriod} onSelect={setTimePeriod} />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
          className={autoRefreshEnabled ? "border-primary" : ""}
        >
          {autoRefreshEnabled ? "Auto-refresh: ON" : "Auto-refresh: OFF"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualRefresh}
          disabled={isManualRefreshing || statsLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isManualRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Sales"
          value={statsLoading ? "..." : formatCurrency(stats?.todaySales || 0)}
          description="Total sales for today"
          icon={DollarSign}
          trend={{ value: 12.5, positive: true }}
          variant="success"
        />
        <StatsCard
          title="Monthly Revenue"
          value={statsLoading ? "..." : formatCurrency(stats?.monthlyRevenue || 0)}
          description="Revenue this month"
          icon={TrendingUp}
          trend={{ value: 8.2, positive: true }}
        />
        <StatsCard
          title="Credit Balance"
          value={statsLoading ? "..." : formatCurrency(stats?.totalCreditBalance || 0)}
          description="Outstanding credit"
          icon={CreditCard}
          variant="warning"
        />
        <StatsCard
          title="Low Stock Items"
          value={statsLoading ? "..." : stats?.lowStockItems || 0}
          description="Items need restocking"
          icon={AlertTriangle}
          variant="destructive"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart loading={statsLoading} timePeriod={timePeriod} sector={dashboardSector} />

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Products Sold Today</span>
                <span className="font-medium">{statsLoading ? "..." : stats?.productsCount || 0} items</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-300"
                  style={{
                    width: statsLoading ? "0%" : `${Math.min((stats?.productsCount || 0) / 100 * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Transactions Today</span>
                <span className="font-medium">{statsLoading ? "..." : stats?.todayTransactionCount || 0} orders</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-accent transition-all duration-300"
                  style={{
                    width: statsLoading ? "0%" : `${Math.min((stats?.todayTransactionCount || 0) / 50 * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Average Order Value</span>
                <span className="font-medium">
                  {statsLoading
                    ? "..."
                    : formatCurrency(
                        (stats?.todaySales || 0) / Math.max(stats?.todayTransactionCount || 1, 1)
                      )}
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-warning transition-all duration-300"
                  style={{
                    width: statsLoading ? "0%" : `${Math.min(((stats?.todaySales || 0) / Math.max(stats?.todayTransactionCount || 1, 1)) / 100 * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Credit Sales Ratio</span>
                <span className="font-medium">{statsLoading ? "..." : stats?.creditSalesRatio || 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-destructive transition-all duration-300"
                  style={{
                    width: statsLoading ? "0%" : `${Math.min(stats?.creditSalesRatio || 0, 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
        </Card>
      ) : (
        <DataTable
          title="Recent Transactions"
          data={recentTransactions}
          columns={transactionColumns}
          emptyMessage="No transactions yet"
        />
      )}
    </div>
  )
}
