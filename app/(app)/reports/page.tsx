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
  const [dateFrom, setDateFrom] = useState(getMonthStart)
  const [dateTo, setDateTo] = useState(getMonthEnd)
  const [granularity, setGranularity] = useState<"day" | "week" | "month">("day")

  const { transactions, loading: txLoading, fetchTransactions } = useTransactions()
  const { purchaseOrders, loading: poLoading, refresh: fetchPurchaseOrders } = usePurchaseOrders()
  const { movements, loading: moveLoading, refresh: fetchStockMovements } = useStockMovements()
  const { clients, loading: clientLoading, refresh: fetchClients } = useClients()
  const { products } = useProducts()

  const isLoading = txLoading || poLoading || moveLoading || clientLoading

  // Helper function to check if a date is within the selected range
  const isInRange = (dateStr: string) => {
    if (!dateFrom || !dateTo) return true
    const date = new Date(dateStr)
    const start = new Date(dateFrom)
    const end = new Date(dateTo)
    end.setHours(23, 59, 59, 999)
    return date >= start && date <= end
  }

  // Create a map of product sectors for quick lookup
  const productSectorById = new Map(products.map((p: any) => [p.id, p.sector]))

  // Helper to check if a transaction belongs to the bakery sector
  const isBakeryTransaction = (txn: any) => {
    return (txn.items || []).some((item: any) => productSectorById.get(item.productId) === "Boulangerie")
  }

  const fetchAllData = useCallback((from?: string, to?: string) => {
    fetchTransactions(from, to)
    fetchPurchaseOrders(from, to)
    fetchStockMovements(from, to)
    fetchClients()
  }, [fetchTransactions, fetchPurchaseOrders, fetchStockMovements, fetchClients])

  // Fetch on mount with no date filter (all data)
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Sales data (API already filters by date if params provided)
  const saleTransactions = transactions.filter((t: any) => t.type === "sale" && t.status === "completed")
  const salesTotal = saleTransactions.reduce((sum, t) => sum + Number.parseFloat(t.total), 0)

  const salesByPayment = [
    { name: "Cash", value: saleTransactions.filter((t) => t.paymentMethod === "cash").reduce((sum, t) => sum + Number.parseFloat(t.total), 0) },
    { name: "Credit", value: saleTransactions.filter((t) => t.paymentMethod === "credit").reduce((sum, t) => sum + Number.parseFloat(t.total), 0) },
  ]

  // Build daily sales from real transaction data, grouped by date
  const dailySalesMap = new Map<string, number>()
  saleTransactions.forEach((t: any) => {
    const day = new Date(t.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    dailySalesMap.set(day, (dailySalesMap.get(day) || 0) + Number.parseFloat(t.total))
  })
  const dailySales = Array.from(dailySalesMap.entries()).map(([day, sales]) => ({ day, sales }))

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
      title: "Rapport de ventes",
      subtitle: "Smart POS System",
      period: periodStr,
      metrics: [
        { label: "Total des ventes", value: formatCurrency(salesTotal), highlight: true },
        { label: "Transactions", value: saleTransactions.length },
        { label: "Panier moyen", value: formatCurrency(salesTotal / (saleTransactions.length || 1)) },
        { label: "Ventes espèces", value: saleTransactions.filter((t) => t.paymentMethod === "cash").length },
        { label: "Ventes crédit", value: saleTransactions.filter((t) => t.paymentMethod === "credit").length },
      ],
      columns: [
        { header: "ID", key: "id", format: "text" },
        { header: "Date", key: "date", format: "date" },
        { header: "Client", key: "clientName" },
        { header: "Paiement", key: "paymentMethod" },
        { header: "Caissier", key: "cashier" },
        { header: "Montant", key: "total", format: "currency", align: "right" },
      ],
      rows: saleTransactions.map((t: any) => ({
        id: t.id.slice(0, 8),
        date: t.date,
        clientName: t.client?.name || "Sur place",
        paymentMethod: t.paymentMethod || "—",
        cashier: t.user?.name || "—",
        total: t.total,
      })),
    })
  }

  const handlePrintPurchases = () => {
    const periodStr = dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : "All time"
    printReport({
      title: "Rapport d'achats",
      subtitle: "Smart POS System",
      period: periodStr,
      metrics: [
        { label: "Total des achats", value: formatCurrency(purchaseTotal), highlight: true },
        { label: "Commandes d'achat", value: purchaseOrders.length },
      ],
      columns: [
        { header: "ID", key: "id", format: "text" },
        { header: "Date", key: "date", format: "date" },
        { header: "Fournisseur", key: "supplier" },
        { header: "Articles", key: "items", format: "number", align: "right" },
        { header: "Statut", key: "status" },
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
      title: "Rapport des mouvements de stock",
      subtitle: "Smart POS System",
      period: periodStr,
      metrics: [
        { label: "Total entrées", value: `${inboundQty} unités`, highlight: true },
        { label: "Total sorties", value: `${outboundQty} unités` },
        { label: "Mouvement net", value: `${inboundQty - outboundQty} unités` },
      ],
      columns: [
        { header: "ID", key: "id", format: "text" },
        { header: "Date", key: "date", format: "date" },
        { header: "Produit", key: "product" },
        { header: "Type", key: "type" },
        { header: "Quantité", key: "quantity", format: "number", align: "right" },
        { header: "Utilisateur", key: "user" },
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
      title: "Rapport de crédit",
      subtitle: "Smart POS System",
      period: "All time",
      metrics: [
        { label: "Total impayé", value: formatCurrency(totalCreditBalance), highlight: true },
        { label: "Clients avec crédit", value: activeClients.length },
      ],
      columns: [
        { header: "Client", key: "name" },
        { header: "Solde crédit", key: "balance", format: "currency", align: "right" },
        { header: "Limite de crédit", key: "limit", format: "currency", align: "right" },
        { header: "Utilisation", key: "utilization", align: "right" },
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
          <h2 className="text-2xl font-bold text-foreground">Rapports</h2>
          <p className="text-muted-foreground">Générer et exporter des rapports d'entreprise</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
            </div>
            <Button variant="outline" onClick={handleApplyFilter}>
              <Calendar className="mr-2 h-4 w-4" />
              Appliquer le filtre
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="purchases">Achats</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="credit">Crédit</TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales" className="mt-4 space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleExport("sales")}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button variant="outline" onClick={handlePrintSales}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total des ventes</p>
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
                    <p className="text-sm text-muted-foreground">Panier moyen</p>
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
              <CardTitle>Ventes (Boulangerie)</CardTitle>
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
                <CardTitle>Ventes par moyen de paiement</CardTitle>
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
              <CardTitle>Transactions de vente</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-muted-foreground">ID</TableHead>
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Client</TableHead>
                      <TableHead className="text-muted-foreground">Paiement</TableHead>
                      <TableHead className="text-muted-foreground">Caissier</TableHead>
                      <TableHead className="text-muted-foreground text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {txLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Chargement des transactions...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : saleTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          Aucune transaction de vente trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      saleTransactions.map((txn: any) => (
                        <TableRow key={txn.id} className="border-border">
                          <TableCell className="font-mono text-xs overflow-hidden text-ellipsis block max-w-[100px]">{txn.id}</TableCell>
                          <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                          <TableCell>{txn.client?.name || "Sur place"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {txn.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell>{txn.user?.name || "Inconnu"}</TableCell>
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
              Exporter
            </Button>
            <Button variant="outline" onClick={handlePrintPurchases}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total des achats</p>
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
                    <p className="text-sm text-muted-foreground">Commandes d'achat</p>
                    <p className="text-2xl font-bold">{poLoading ? "..." : bakeryPurchaseOrders.length}</p>
                  </div>
                  <ArrowDownRight className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Commandes d'achat</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-muted-foreground">ID</TableHead>
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Fournisseur</TableHead>
                      <TableHead className="text-muted-foreground">Articles</TableHead>
                      <TableHead className="text-muted-foreground">Statut</TableHead>
                      <TableHead className="text-muted-foreground text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Chargement des commandes d'achat...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : bakeryPurchaseOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          Aucune commande d'achat trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      bakeryPurchaseOrders.map((po: any) => (
                        <TableRow key={po.id} className="border-border">
                          <TableCell className="font-mono text-xs overflow-hidden text-ellipsis block max-w-[100px]">{po.id}</TableCell>
                          <TableCell>{new Date(po.date).toLocaleDateString()}</TableCell>
                          <TableCell>{po.supplier?.name || "Inconnu"}</TableCell>
                          <TableCell>{po.items?.length || 0} articles</TableCell>
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
              Exporter
            </Button>
            <Button variant="outline" onClick={handlePrintStock}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total entrées</p>
                    <p className="text-2xl font-bold text-foreground">+{moveLoading ? "..." : inboundQty} unités</p>
                  </div>
                  <ArrowDownRight className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total sorties</p>
                    <p className="text-2xl font-bold text-destructive">-{moveLoading ? "..." : outboundQty} unités</p>
                  </div>
                  <ArrowUpRight className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Résumé des mouvements de stock</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-muted-foreground">ID</TableHead>
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Produit</TableHead>
                      <TableHead className="text-muted-foreground">Type</TableHead>
                      <TableHead className="text-muted-foreground text-right">Quantité</TableHead>
                      <TableHead className="text-muted-foreground">Utilisateur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moveLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Chargement des mouvements...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : bakeryMovements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          Aucun mouvement trouvé
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
                          <TableCell>{movement.user?.name || "Inconnu"}</TableCell>
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
              Exporter
            </Button>
            <Button variant="outline" onClick={handlePrintCredit}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total des crédits impayés</p>
                    <p className="text-2xl font-bold">{clientLoading ? "..." : formatCurrency(totalCreditBalance)}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Résumé des crédits clients</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-muted-foreground">Client</TableHead>
                      <TableHead className="text-muted-foreground text-right">Solde crédit</TableHead>
                      <TableHead className="text-muted-foreground text-right">Limite de crédit</TableHead>
                      <TableHead className="text-muted-foreground text-right">Utilisation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Chargement des clients...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : bakeryClients.filter((c: any) => Number.parseFloat(c.creditBalance) > 0).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          Aucun client avec solde créditeur trouvé
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
