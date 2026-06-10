"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/mock-data"
import { printReport } from "@/lib/print-report"
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  ShoppingCart,
  Package,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useTransactions } from "@/hooks/use-transactions"
import { useProducts } from "@/hooks/use-products"
import { usePurchaseOrders } from "@/hooks/use-purchase-orders"
import { useStockMovements } from "@/hooks/use-stock-movements"
import { useClients } from "@/hooks/use-clients"

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))", "hsl(var(--destructive))"]

const getMonthStart = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return start.toISOString().slice(0, 10)
}

const getMonthEnd = () => {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return end.toISOString().slice(0, 10)
}

export default function ReportsPage() {
<<<<<<< HEAD
  const [dateFrom, setDateFrom] = useState(getMonthStart)
  const [dateTo, setDateTo] = useState(getMonthEnd)
  const [granularity, setGranularity] = useState<"day" | "week" | "month">("day")

  const { transactions, loading: txLoading, fetchTransactions } = useTransactions()
  const { purchaseOrders, loading: poLoading } = usePurchaseOrders()
  const { movements, loading: moveLoading } = useStockMovements()
  const { clients, loading: clientLoading } = useClients()
  const { products, loading: productsLoading } = useProducts()
=======
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const { transactions, loading: txLoading, fetchTransactions } = useTransactions()
  const { purchaseOrders, loading: poLoading, refresh: fetchPurchaseOrders } = usePurchaseOrders()
  const { movements, loading: moveLoading, refresh: fetchMovements } = useStockMovements()
  const { clients, loading: clientLoading, refresh: fetchClients } = useClients()
>>>>>>> origin/alimentation

  const fetchAllData = useCallback((from?: string, to?: string) => {
    fetchTransactions(from, to)
    fetchPurchaseOrders(from, to)
    fetchMovements(from, to)
    fetchClients()
  }, [fetchTransactions, fetchPurchaseOrders, fetchMovements, fetchClients])

  // Fetch on mount with no date filter (all data)
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

<<<<<<< HEAD
  const isLoading = txLoading || poLoading || moveLoading || clientLoading || productsLoading

  const productSectorById = new Map(products.map((p: any) => [p.id, p.sector]))

  const dateStart = dateFrom ? new Date(dateFrom) : null
  const dateEnd = dateTo ? new Date(dateTo) : null
  if (dateEnd) dateEnd.setHours(23, 59, 59, 999)

  const isInRange = (dateStr: string) => {
    const d = new Date(dateStr)
    if (dateStart && d < dateStart) return false
    if (dateEnd && d > dateEnd) return false
    return true
  }

  const isBakeryTransaction = (t: any) =>
    (t.items || []).some((it: any) => productSectorById.get(it.productId) === "Boulangerie")

  // Sales data (Boulangerie)
  const saleTransactions = transactions.filter(
    (t: any) => t.type === "sale" && t.status === "completed" && isInRange(t.date) && isBakeryTransaction(t)
  )
=======
  // Sales data (API already filters by date if params provided)
  const saleTransactions = transactions.filter((t: any) => t.type === "sale" && t.status === "completed")
>>>>>>> origin/alimentation
  const salesTotal = saleTransactions.reduce((sum, t) => sum + Number.parseFloat(t.total), 0)

  const salesByPayment = [
    { name: "Cash", value: saleTransactions.filter((t) => t.paymentMethod === "cash").reduce((sum, t) => sum + Number.parseFloat(t.total), 0) },
    { name: "Credit", value: saleTransactions.filter((t) => t.paymentMethod === "credit").reduce((sum, t) => sum + Number.parseFloat(t.total), 0) },
  ]

<<<<<<< HEAD
  const groupKey = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    if (granularity === "month") return `${y}-${m}`
    if (granularity === "week") {
      const firstDay = new Date(d.getFullYear(), 0, 1)
      const dayOfYear = Math.floor((d.getTime() - firstDay.getTime()) / 86400000) + 1
      const week = Math.ceil(dayOfYear / 7)
      return `${y}-W${String(week).padStart(2, "0")}`
    }
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }

  const salesByPeriodMap = new Map<string, number>()
  for (const t of saleTransactions) {
    const key = groupKey(new Date(t.date))
    salesByPeriodMap.set(key, (salesByPeriodMap.get(key) || 0) + Number.parseFloat(t.total))
  }
  const dailySales = Array.from(salesByPeriodMap.entries()).map(([day, sales]) => ({ day, sales }))
=======
  // Build daily sales from real transaction data, grouped by date
  const dailySalesMap = new Map<string, number>()
  saleTransactions.forEach((t: any) => {
    const day = new Date(t.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    dailySalesMap.set(day, (dailySalesMap.get(day) || 0) + Number.parseFloat(t.total))
  })
  const dailySales = Array.from(dailySalesMap.entries()).map(([day, sales]) => ({ day, sales }))
>>>>>>> origin/alimentation

  // Purchase data
  const bakeryPurchaseOrders = purchaseOrders.filter(
    (po: any) => po.sector === "Boulangerie" && isInRange(po.date)
  )
  const purchaseTotal = bakeryPurchaseOrders.reduce((sum, po) => sum + Number.parseFloat(po.total), 0)

  // Stock movement data
  const bakeryMovements = movements.filter((m: any) => {
    if (!isInRange(m.date)) return false
    return productSectorById.get(m.productId) === "Boulangerie"
  })
  const inboundQty = bakeryMovements
    .filter((m) => Number(m.quantity) > 0)
    .reduce((sum, m) => sum + Number(m.quantity || 0), 0)
  const outboundQty = bakeryMovements
    .filter((m) => Number(m.quantity) < 0)
    .reduce((sum, m) => sum + Math.abs(Number(m.quantity || 0)), 0)

  const bakeryClientIds = new Set(
    transactions
      .filter((t: any) => isInRange(t.date) && isBakeryTransaction(t) && t.clientId)
      .map((t: any) => t.clientId),
  )
  const bakeryClients = clients.filter((c: any) => bakeryClientIds.has(c.id))

  // Credit data (Boulangerie)
  const totalCreditBalance = bakeryClients.reduce((sum, c) => sum + Number.parseFloat(c.creditBalance), 0)

  const handleExport = (reportType: string) => {
    console.log(`Exporting ${reportType} report...`)
  }

  const handleApplyFilter = () => {
    fetchAllData(dateFrom || undefined, dateTo || undefined)
  }

  const handlePrintSales = () => {
    const periodStr = dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : "All time"
    printReport({
      title: "Sales Report",
      subtitle: "Smart POS System",
      period: periodStr,
      metrics: [
        { label: "Total Sales", value: formatCurrency(salesTotal), highlight: true },
        { label: "Transactions", value: saleTransactions.length },
        { label: "Average Order", value: formatCurrency(salesTotal / (saleTransactions.length || 1)) },
        { label: "Cash Sales", value: saleTransactions.filter((t) => t.paymentMethod === "cash").length },
        { label: "Credit Sales", value: saleTransactions.filter((t) => t.paymentMethod === "credit").length },
      ],
      columns: [
        { header: "ID", key: "id", format: "text" },
        { header: "Date", key: "date", format: "date" },
        { header: "Customer", key: "clientName" },
        { header: "Payment", key: "paymentMethod" },
        { header: "Cashier", key: "cashier" },
        { header: "Amount", key: "total", format: "currency", align: "right" },
      ],
      rows: saleTransactions.map((t: any) => ({
        id: t.id.slice(0, 8),
        date: t.date,
        clientName: t.client?.name || "Walk-in",
        paymentMethod: t.paymentMethod || "—",
        cashier: t.user?.name || "—",
        total: t.total,
      })),
    })
  }

  const handlePrintPurchases = () => {
    const periodStr = dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : "All time"
    printReport({
      title: "Purchases Report",
      subtitle: "Smart POS System",
      period: periodStr,
      metrics: [
        { label: "Total Purchases", value: formatCurrency(purchaseTotal), highlight: true },
        { label: "Purchase Orders", value: purchaseOrders.length },
      ],
      columns: [
        { header: "ID", key: "id", format: "text" },
        { header: "Date", key: "date", format: "date" },
        { header: "Supplier", key: "supplier" },
        { header: "Items", key: "items", format: "number", align: "right" },
        { header: "Status", key: "status" },
        { header: "Total", key: "total", format: "currency", align: "right" },
      ],
      rows: purchaseOrders.map((po: any) => ({
        id: po.id.slice(0, 8),
        date: po.date,
        supplier: po.supplier?.name || "—",
        items: po.items?.length || 0,
        status: po.status,
        total: po.total,
      })),
    })
  }

  const handlePrintStock = () => {
    const periodStr = dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : "All time"
    printReport({
      title: "Stock Movements Report",
      subtitle: "Smart POS System",
      period: periodStr,
      metrics: [
        { label: "Total Inbound", value: `${inboundQty} units`, highlight: true },
        { label: "Total Outbound", value: `${outboundQty} units` },
        { label: "Net Movement", value: `${inboundQty - outboundQty} units` },
      ],
      columns: [
        { header: "ID", key: "id", format: "text" },
        { header: "Date", key: "date", format: "date" },
        { header: "Product", key: "product" },
        { header: "Type", key: "type" },
        { header: "Quantity", key: "quantity", format: "number", align: "right" },
        { header: "User", key: "user" },
      ],
      rows: movements.map((m: any) => ({
        id: m.id.slice(0, 8),
        date: m.date,
        product: m.productName,
        type: m.type,
        quantity: m.quantity,
        user: m.user?.name || "—",
      })),
    })
  }

  const handlePrintCredit = () => {
    const activeClients = clients.filter((c: any) => Number.parseFloat(c.creditBalance) > 0)
    printReport({
      title: "Credit Report",
      subtitle: "Smart POS System",
      period: "All time",
      metrics: [
        { label: "Total Outstanding", value: formatCurrency(totalCreditBalance), highlight: true },
        { label: "Clients with Credit", value: activeClients.length },
      ],
      columns: [
        { header: "Client", key: "name" },
        { header: "Credit Balance", key: "balance", format: "currency", align: "right" },
        { header: "Credit Limit", key: "limit", format: "currency", align: "right" },
        { header: "Utilization", key: "utilization", align: "right" },
      ],
      rows: activeClients.map((c: any) => ({
        name: c.name,
        balance: c.creditBalance,
        limit: c.creditLimit,
        utilization: Number.parseFloat(c.creditLimit) > 0
          ? `${((Number.parseFloat(c.creditBalance) / Number.parseFloat(c.creditLimit)) * 100).toFixed(1)}%`
          : "0%",
      })),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports</h2>
          <p className="text-muted-foreground">Generate and export business reports</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
            </div>
<<<<<<< HEAD
            <div className="space-y-2">
              <Label>Granularité</Label>
              <Select value={granularity} onValueChange={(v) => setGranularity(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Jour</SelectItem>
                  <SelectItem value="week">Semaine</SelectItem>
                  <SelectItem value="month">Mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
=======
            <Button variant="outline" onClick={handleApplyFilter}>
              <Calendar className="mr-2 h-4 w-4" />
              Apply Filter
            </Button>
>>>>>>> origin/alimentation
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="credit">Credit</TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales" className="mt-4 space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleExport("sales")}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={handlePrintSales}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold text-accent">{isLoading ? "..." : formatCurrency(salesTotal)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-bold">{isLoading ? "..." : saleTransactions.length}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Order</p>
                    <p className="text-2xl font-bold">
                      {isLoading ? "..." : formatCurrency(salesTotal / saleTransactions.length || 0)}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border bg-card">
              <CardHeader>
              <CardTitle>Sales (Boulangerie)</CardTitle>
            </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Sales by Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByPayment}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {salesByPayment.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Sales Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-muted-foreground">ID</TableHead>
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Customer</TableHead>
                      <TableHead className="text-muted-foreground">Payment</TableHead>
                      <TableHead className="text-muted-foreground">Cashier</TableHead>
                      <TableHead className="text-muted-foreground text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {txLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Loading transactions...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : saleTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No sales transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      saleTransactions.map((txn: any) => (
                        <TableRow key={txn.id} className="border-border">
                          <TableCell className="font-mono text-xs overflow-hidden text-ellipsis block max-w-[100px]">{txn.id}</TableCell>
                          <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                          <TableCell>{txn.client?.name || "Walk-in"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {txn.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell>{txn.user?.name || "Unknown"}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(Number.parseFloat(txn.total))}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchases Report */}
        <TabsContent value="purchases" className="mt-4 space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleExport("purchases")}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={handlePrintPurchases}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Purchases</p>
                    <p className="text-2xl font-bold">{poLoading ? "..." : formatCurrency(purchaseTotal)}</p>
                  </div>
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Orders</p>
                    <p className="text-2xl font-bold">{poLoading ? "..." : bakeryPurchaseOrders.length}</p>
                  </div>
                  <ArrowDownRight className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-muted-foreground">ID</TableHead>
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Supplier</TableHead>
                      <TableHead className="text-muted-foreground">Items</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Loading purchase orders...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : bakeryPurchaseOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No purchase orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      bakeryPurchaseOrders.map((po: any) => (
                        <TableRow key={po.id} className="border-border">
                          <TableCell className="font-mono text-xs overflow-hidden text-ellipsis block max-w-[100px]">{po.id}</TableCell>
                          <TableCell>{new Date(po.date).toLocaleDateString()}</TableCell>
                          <TableCell>{po.supplier?.name || "Unknown"}</TableCell>
                          <TableCell>{po.items?.length || 0} items</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                po.status === "received"
                                  ? "bg-accent/20 text-accent"
                                  : po.status === "pending"
                                    ? "bg-warning/20 text-warning"
                                    : "bg-destructive/20 text-destructive"
                              }
                            >
                              {po.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(Number.parseFloat(po.total))}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Report */}
        <TabsContent value="stock" className="mt-4 space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleExport("stock")}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={handlePrintStock}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Inbound</p>
                    <p className="text-2xl font-bold text-foreground">+{moveLoading ? "..." : inboundQty} units</p>
                  </div>
                  <ArrowDownRight className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Outbound</p>
                    <p className="text-2xl font-bold text-destructive">-{moveLoading ? "..." : outboundQty} units</p>
                  </div>
                  <ArrowUpRight className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Stock Movements Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-muted-foreground">ID</TableHead>
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Product</TableHead>
                      <TableHead className="text-muted-foreground">Type</TableHead>
                      <TableHead className="text-muted-foreground text-right">Quantity</TableHead>
                      <TableHead className="text-muted-foreground">User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moveLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Loading movements...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : bakeryMovements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No movements found
                        </TableCell>
                      </TableRow>
                    ) : (
                      bakeryMovements.map((movement: any) => (
                        <TableRow key={movement.id} className="border-border">
                          <TableCell className="font-mono text-xs overflow-hidden text-ellipsis block max-w-[100px]">{movement.id}</TableCell>
                          <TableCell>{new Date(movement.date).toLocaleDateString()}</TableCell>
                          <TableCell>{movement.productName}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                movement.type === "purchase"
                                  ? "bg-accent text-accent-foreground"
                                  : movement.type === "sale"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-warning text-warning-foreground"
                              }
                            >
                              {movement.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-foreground">
                              {movement.quantity > 0 ? "+" : ""}
                              {movement.quantity}
                            </span>
                          </TableCell>
                          <TableCell>{movement.user?.name || "Unknown"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Report */}
        <TabsContent value="credit" className="mt-4 space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleExport("credit")}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={handlePrintCredit}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Credit Outstanding</p>
                    <p className="text-2xl font-bold">{clientLoading ? "..." : formatCurrency(totalCreditBalance)}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Client Credit Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-muted-foreground">Client</TableHead>
                      <TableHead className="text-muted-foreground text-right">Credit Balance</TableHead>
                      <TableHead className="text-muted-foreground text-right">Credit Limit</TableHead>
                      <TableHead className="text-muted-foreground text-right">Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Loading clients...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : bakeryClients.filter((c: any) => Number.parseFloat(c.creditBalance) > 0).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No clients with credit balance found
                        </TableCell>
                      </TableRow>
                    ) : (
                      bakeryClients
                        .filter((c: any) => Number.parseFloat(c.creditBalance) > 0)
                        .map((client: any) => (
                          <TableRow key={client.id} className="border-border">
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell className="text-right text-warning">
                              {formatCurrency(Number.parseFloat(client.creditBalance))}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(Number.parseFloat(client.creditLimit))}</TableCell>
                            <TableCell className="text-right">
                              {Number.parseFloat(client.creditLimit) > 0
                                ? ((Number.parseFloat(client.creditBalance) / Number.parseFloat(client.creditLimit)) * 100).toFixed(1)
                                : "0"}%
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
