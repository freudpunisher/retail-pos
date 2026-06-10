"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { TimePeriodSelector, type TimePeriod } from "@/components/dashboard/time-period-selector"
import { formatCurrency } from "@/lib/mock-data"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { useTransactions } from "@/hooks/use-transactions"
import { useOrders } from "@/hooks/use-orders"
import {
  DollarSign, TrendingUp, CreditCard, Package, AlertTriangle,
  Loader2, RefreshCw, Receipt, Banknote, ShoppingCart, Clock,
  ChefHat, Bell, Utensils, ArrowUpRight, ArrowDownRight, BarChart3,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("today")
  const { stats, loading: statsLoading, refresh: refreshStats } = useDashboardStats(timePeriod)
  const { transactions, fetchTransactions, loading: txLoading } = useTransactions()
  const { orders, loading: ordersLoading } = useOrders()
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)
  const [dashboardSector] = useState<string | undefined>(undefined)
  const { user } = useAuth()
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

  const recentTransactions = transactions
    .filter((t: any) => t.type === "sale")
    .slice(0, 5)

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
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${txn.paymentMethod === "cash" ? "bg-green-500/10" : txn.paymentMethod === "credit" ? "bg-blue-500/10" : "bg-muted"
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
                      className={`text-[10px] px-1.5 py-0 ${txn.status === "completed"
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
