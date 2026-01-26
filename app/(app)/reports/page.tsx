"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/mock-data"
import {
  BarChart3,
  Download,
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
import { usePurchaseOrders } from "@/hooks/use-purchase-orders"
import { useStockMovements } from "@/hooks/use-stock-movements"
import { useClients } from "@/hooks/use-clients"

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))", "hsl(var(--destructive))"]

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("2024-12-01")
  const [dateTo, setDateTo] = useState("2024-12-31")

  const { transactions, loading: txLoading, fetchTransactions } = useTransactions()
  const { purchaseOrders, loading: poLoading } = usePurchaseOrders()
  const { movements, loading: moveLoading } = useStockMovements()
  const { clients, loading: clientLoading } = useClients()

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Sales data
  const saleTransactions = transactions.filter((t: any) => t.type === "sale" && t.status === "completed")
  const salesTotal = saleTransactions.reduce((sum, t) => sum + Number.parseFloat(t.total), 0)

  const salesByPayment = [
    {
      name: "Cash",
      value: saleTransactions
        .filter((t) => t.paymentMethod === "cash")
        .reduce((sum, t) => sum + Number.parseFloat(t.total), 0),
    },
    {
      name: "Card",
      value: saleTransactions
        .filter((t) => t.paymentMethod === "card")
        .reduce((sum, t) => sum + Number.parseFloat(t.total), 0),
    },
    {
      name: "Credit",
      value: saleTransactions
        .filter((t) => t.paymentMethod === "credit")
        .reduce((sum, t) => sum + Number.parseFloat(t.total), 0),
    },
  ]

  const dailySales = [
    { day: "Mon", sales: 1250 },
    { day: "Tue", sales: 1890 },
    { day: "Wed", sales: 1420 },
    { day: "Thu", sales: 2280 },
    { day: "Fri", sales: 2950 },
    { day: "Sat", sales: 3400 },
    { day: "Sun", sales: 2100 },
  ]

  // Purchase data
  const purchaseTotal = purchaseOrders.reduce((sum, po) => sum + Number.parseFloat(po.total), 0)

  // Stock movement data
  const inboundQty = movements.filter((m) => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0)
  const outboundQty = movements.filter((m) => m.quantity < 0).reduce((sum, m) => sum + Math.abs(m.quantity), 0)

  // Credit data
  const totalCreditBalance = clients.reduce((sum, c) => sum + Number.parseFloat(c.creditBalance), 0)

  const handleExport = (reportType: string) => {
    console.log(`Exporting ${reportType} report...`)
    // Mock export functionality
  }

  const isLoading = txLoading || poLoading || moveLoading || clientLoading

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
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Apply Filter
            </Button>
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
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => handleExport("sales")}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
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
                <CardTitle>Daily Sales</CardTitle>
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
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => handleExport("purchases")}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
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
                    <p className="text-2xl font-bold">{poLoading ? "..." : purchaseOrders.length}</p>
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
                    ) : purchaseOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No purchase orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      purchaseOrders.map((po: any) => (
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
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => handleExport("stock")}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Inbound</p>
                    <p className="text-2xl font-bold text-accent">+{moveLoading ? "..." : inboundQty} units</p>
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
                    ) : movements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No movements found
                        </TableCell>
                      </TableRow>
                    ) : (
                      movements.map((movement: any) => (
                        <TableRow key={movement.id} className="border-border">
                          <TableCell className="font-mono text-xs overflow-hidden text-ellipsis block max-w-[100px]">{movement.id}</TableCell>
                          <TableCell>{new Date(movement.date).toLocaleDateString()}</TableCell>
                          <TableCell>{movement.productName}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                movement.type === "purchase"
                                  ? "bg-accent/20 text-accent"
                                  : movement.type === "sale"
                                    ? "bg-primary/20 text-primary"
                                    : "bg-warning/20 text-warning"
                              }
                            >
                              {movement.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={movement.quantity > 0 ? "text-accent" : "text-destructive"}>
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
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => handleExport("credit")}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
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
                    ) : clients.filter((c: any) => Number.parseFloat(c.creditBalance) > 0).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No clients with credit balance found
                        </TableCell>
                      </TableRow>
                    ) : (
                      clients
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
