"use client"

import { useEffect } from "react"
import { StatsCard } from "@/components/stats-card"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/mock-data"
import { DollarSign, TrendingUp, CreditCard, AlertTriangle, Loader2 } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { useTransactions } from "@/hooks/use-transactions"

const salesChartData = [
  { name: "Mon", sales: 1200 },
  { name: "Tue", sales: 1800 },
  { name: "Wed", sales: 1400 },
  { name: "Thu", sales: 2200 },
  { name: "Fri", sales: 2800 },
  { name: "Sat", sales: 3200 },
  { name: "Sun", sales: 2400 },
]

export default function DashboardPage() {
  const { stats, loading: statsLoading } = useDashboardStats()
  const { transactions, fetchTransactions, loading: txLoading } = useTransactions()

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const recentTransactions = transactions.slice(0, 5)

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
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your store performance</p>
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
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Products Sold Today</span>
                <span className="font-medium">47 items</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div className="h-2 w-3/4 rounded-full bg-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Transactions Today</span>
                <span className="font-medium">23 orders</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div className="h-2 w-1/2 rounded-full bg-accent" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Average Order Value</span>
                <span className="font-medium">$29.34</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div className="h-2 w-2/3 rounded-full bg-warning" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Credit Sales Ratio</span>
                <span className="font-medium">18%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div className="h-2 w-[18%] rounded-full bg-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
