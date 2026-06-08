"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/mock-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useTransactions } from "@/hooks/use-transactions"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/hooks/use-settings"
import { PaymentDialog } from "@/components/pos/payment-dialog"
import { printThermal, type ReceiptData } from "@/lib/thermal-print"
import { toast } from "sonner"
import {
  Receipt, Search, DollarSign, Banknote, ShoppingCart,
  Calendar, User, Package, Loader2, Eye, Printer, CreditCard,
  TrendingUp, ArrowUpDown, ChevronDown, X,
} from "lucide-react"

export default function SalesHistoryPage() {
  const { user } = useAuth()
  const { settings } = useSettings()
  const { transactions, loading, fetchTransactions } = useTransactions()
  const receiptRef = useRef<HTMLDivElement>(null)

  const [search, setSearch] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tableFilter, setTableFilter] = useState<string>("all")
  const [waiterFilter, setWaiterFilter] = useState<string>("all")
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; order: any | null }>({ open: false, order: null })

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const salesTransactions = useMemo(() => {
    return transactions.filter((t: any) => t.type === "sale")
  }, [transactions])

  const tables = useMemo(() => {
    const set = new Set<string>()
    salesTransactions.forEach((t: any) => {
      if (t.table?.number) set.add(String(t.table.number))
    })
    return Array.from(set).sort((a, b) => Number(a) - Number(b))
  }, [salesTransactions])

  const waiters = useMemo(() => {
    const set = new Set<string>()
    salesTransactions.forEach((t: any) => {
      if (t.user?.name) set.add(t.user.name)
    })
    return Array.from(set).sort()
  }, [salesTransactions])

  const filteredTransactions = useMemo(() => {
    let filtered = salesTransactions

    if (statusFilter !== "all") {
      if (statusFilter === "paid") {
        filtered = filtered.filter((t: any) => t.status === "completed")
      } else if (statusFilter === "pending") {
        filtered = filtered.filter((t: any) => t.status !== "completed" && t.status !== "cancelled")
      } else if (statusFilter === "cancelled") {
        filtered = filtered.filter((t: any) => t.status === "cancelled")
      }
    }

    if (tableFilter !== "all") {
      filtered = filtered.filter((t: any) => String(t.table?.number) === tableFilter)
    }

    if (waiterFilter !== "all") {
      filtered = filtered.filter((t: any) => t.user?.name === waiterFilter)
    }

    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((t: any) =>
        t.id.toLowerCase().includes(q) ||
        t.client?.name?.toLowerCase().includes(q) ||
        t.user?.name?.toLowerCase().includes(q) ||
        String(t.table?.number || "").includes(q)
      )
    }

    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      filtered = filtered.filter((t: any) => new Date(t.date) >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filtered = filtered.filter((t: any) => new Date(t.date) <= end)
    }

    return filtered
  }, [salesTransactions, search, startDate, endDate, statusFilter, tableFilter, waiterFilter])

  const stats = useMemo(() => {
    const completed = salesTransactions.filter((t: any) => t.status === "completed")
    const totalRevenue = completed.reduce((sum: number, t: any) => sum + Number.parseFloat(t.total), 0)
    const cashSales = completed.filter((t: any) => t.paymentMethod === "cash").length
    const creditSales = completed.filter((t: any) => t.paymentMethod === "credit").length
    const pendingCount = salesTransactions.filter((t: any) => t.status !== "completed" && t.status !== "cancelled").length
    const totalItems = completed.reduce((sum: number, t: any) => sum + (t.items?.length || 0), 0)
    return { totalSales: completed.length, totalRevenue, cashSales, creditSales, pendingCount, totalItems }
  }, [salesTransactions])

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction)
    setShowDetails(true)
  }

  const handlePayment = async ({ paymentMethod, clientId }: { paymentMethod: "cash" | "credit"; clientId?: string }) => {
    if (!paymentDialog.order || !user) return
    try {
      const res = await fetch(`/api/orders/${paymentDialog.order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: "paid", paymentMethod, clientId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Payment failed")
      }
      toast.success(`Payment of ${formatCurrency(Number(paymentDialog.order.total))} received via ${paymentMethod}`)
      setPaymentDialog({ open: false, order: null })
      fetchTransactions()
    } catch (err: any) {
      toast.error(err.message || "Payment failed")
    }
  }

  const handlePrintThermal = (txn?: any) => {
    const data = txn || selectedTransaction
    if (!data) return
    const items = (data.items || []).map((item: any) => ({
      name: item.productName,
      quantity: item.quantity,
      price: Number(item.price),
      total: Number(item.price) * item.quantity,
    }))
    printThermal({
      header: {
        name: settings?.name || "SmartPOS",
        address: settings?.address || "",
        phone: settings?.phone || "",
      },
      orderId: data.id,
      date: new Date(data.date || Date.now()),
      client: data.client?.name,
      cashier: data.user?.name,
      items,
      total: Number(data.total),
      paymentMethod: data.paymentMethod,
      currencySymbol: settings?.currencySymbol || "FBU",
    })
  }

  const statusCounts = useMemo(() => {
    return {
      all: salesTransactions.length,
      paid: salesTransactions.filter((t: any) => t.status === "completed").length,
      pending: salesTransactions.filter((t: any) => t.status !== "completed" && t.status !== "cancelled").length,
      cancelled: salesTransactions.filter((t: any) => t.status === "cancelled").length,
    }
  }, [salesTransactions])

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales History</h2>
          <p className="text-muted-foreground">Manage and review all sales transactions</p>
        </div>
        <Button variant="outline" onClick={() => setShowReport(true)} disabled={filteredTransactions.length === 0}>
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Completed</p>
                <p className="text-xl font-bold">{loading ? "—" : stats.totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Revenue</p>
                <p className="text-xl font-bold text-green-600">{loading ? "—" : formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Banknote className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Cash</p>
                <p className="text-xl font-bold">{loading ? "—" : stats.cashSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Credit</p>
                <p className="text-xl font-bold">{loading ? "—" : stats.creditSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stats.pendingCount > 0 ? "bg-red-500/10" : "bg-muted"}`}>
                <Receipt className={`h-5 w-5 ${stats.pendingCount > 0 ? "text-red-500" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pending</p>
                <p className={`text-xl font-bold ${stats.pendingCount > 0 ? "text-red-500" : ""}`}>
                  {loading ? "—" : stats.pendingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, client, or cashier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={waiterFilter} onValueChange={setWaiterFilter}>
                <SelectTrigger className="w-36 h-10">
                  <SelectValue placeholder="Waiter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Waiters</SelectItem>
                  {waiters.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger className="w-32 h-10">
                  <SelectValue placeholder="Table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tables</SelectItem>
                  {tables.map((num) => (
                    <SelectItem key={num} value={num}>Table {num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-36 h-10" />
                <span className="text-muted-foreground text-sm">—</span>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-36 h-10" />
              </div>
              {(startDate || endDate) && (
                <Button variant="ghost" size="icon" onClick={() => { setStartDate(""); setEndDate("") }} className="h-10 w-10">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-0">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" className="relative">
              All
              <Badge variant="secondary" className="ml-2 text-xs px-1.5">{statusCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="paid">
              Paid
              <Badge variant="secondary" className="ml-2 text-xs px-1.5 bg-green-500/10 text-green-700">{statusCounts.paid}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-2 text-xs px-1.5 bg-amber-500/10 text-amber-700">{statusCounts.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled
              <Badge variant="secondary" className="ml-2 text-xs px-1.5 bg-red-500/10 text-red-700">{statusCounts.cancelled}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={statusFilter} className="mt-4">
          {/* Table */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 border-border">
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date & Time</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Table</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Total</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">Loading transactions...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Receipt className="h-12 w-12 text-muted-foreground/30 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">No transactions found</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((txn: any) => (
                        <TableRow key={txn.id} className="border-border hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <span className="font-mono text-xs text-muted-foreground">#{txn.id.slice(0, 8)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-sm whitespace-nowrap">{new Date(txn.date).toLocaleDateString()}</span>
                              <span className="text-xs text-muted-foreground">{new Date(txn.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {txn.client ? (
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                                  <User className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-sm font-medium">{txn.client.name}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground italic">Walk-in</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {txn.table ? (
                              <Badge variant="outline" className="text-xs font-mono">
                                T{txn.table.number}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs font-normal">
                              {txn.items?.length || 0} {txn.items?.length === 1 ? "item" : "items"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {txn.paymentMethod ? (
                              <div className="flex items-center gap-1.5">
                                {txn.paymentMethod === "cash" ? (
                                  <Banknote className="h-3.5 w-3.5 text-green-600" />
                                ) : (
                                  <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                                )}
                                <span className="text-sm capitalize">{txn.paymentMethod}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm font-semibold">{formatCurrency(Number.parseFloat(txn.total))}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                txn.status === "completed"
                                  ? "border-green-500/30 bg-green-500/10 text-green-700 text-xs"
                                  : txn.status === "cancelled"
                                    ? "border-red-500/30 bg-red-500/10 text-red-700 text-xs"
                                    : "border-amber-500/30 bg-amber-500/10 text-amber-700 text-xs"
                              }
                            >
                              {txn.status === "completed" ? "Paid" : txn.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {txn.status !== "completed" && txn.status !== "cancelled" && (
                                <Button size="sm" className="h-8" onClick={() => setPaymentDialog({ open: true, order: txn })}>
                                  <CreditCard className="h-3.5 w-3.5 mr-1" /> Pay
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetails(txn)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {txn.status === "completed" && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePrintThermal(txn)}>
                                  <Printer className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
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

      {/* Transaction Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Transaction Details
            </DialogTitle>
            <DialogDescription>Full details of this sale transaction</DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Transaction ID</p>
                  <p className="font-mono text-xs mt-0.5">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Date</p>
                  <p className="mt-0.5">{new Date(selectedTransaction.date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Client</p>
                  <p className="mt-0.5">{selectedTransaction.client?.name || <span className="italic text-muted-foreground">Walk-in</span>}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Cashier</p>
                  <p className="mt-0.5">{selectedTransaction.user?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Table</p>
                  <p className="mt-0.5">{selectedTransaction.table ? `T${selectedTransaction.table.number}` : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Payment</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {selectedTransaction.paymentMethod ? (
                      <>
                        {selectedTransaction.paymentMethod === "cash" ? (
                          <Banknote className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                        )}
                        <span className="capitalize">{selectedTransaction.paymentMethod}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Not paid</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Status</p>
                  <Badge
                    variant="outline"
                    className={
                      selectedTransaction.status === "completed"
                        ? "border-green-500/30 bg-green-500/10 text-green-700 mt-0.5"
                        : selectedTransaction.status === "cancelled"
                          ? "border-red-500/30 bg-red-500/10 text-red-700 mt-0.5"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-700 mt-0.5"
                    }
                  >
                    {selectedTransaction.status === "completed" ? "Paid" : selectedTransaction.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Items
                </h4>
                <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                  {selectedTransaction.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.quantity}x</span>
                      <span className="flex-1 px-2">{item.productName}</span>
                      <span className="font-medium">{formatCurrency(Number.parseFloat(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                  {(!selectedTransaction.items || selectedTransaction.items.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-2">No items</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-base font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(Number.parseFloat(selectedTransaction.total))}
                </span>
              </div>

              {selectedTransaction.status !== "completed" && selectedTransaction.status !== "cancelled" && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    setShowDetails(false)
                    setPaymentDialog({ open: true, order: selectedTransaction })
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" /> Process Payment
                </Button>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowDetails(false)}>Close</Button>
                {selectedTransaction.status === "completed" && (
                  <Button onClick={() => handlePrintThermal()}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Receipt
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialog.open}
        onOpenChange={(open) => setPaymentDialog({ open, order: open ? paymentDialog.order : null })}
        order={paymentDialog.order}
        onPay={handlePayment}
      />

      {/* Report Preview Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sales Report</DialogTitle>
            <DialogDescription>Review and print the sales report</DialogDescription>
          </DialogHeader>

          <div id="printable-report" className="space-y-6 p-6">
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold tracking-tight">SALES ACTIVITY REPORT</h2>
              <p className="text-sm text-muted-foreground">Generated {new Date().toLocaleString()}</p>
              {(startDate || endDate) && (
                <p className="text-sm font-medium mt-1">
                  Period: {startDate || "—"} to {endDate || "—"}
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4 text-center">
              {[
                { label: "Total Transactions", value: filteredTransactions.length },
                { label: "Revenue", value: formatCurrency(filteredTransactions.reduce((a: number, t: any) => a + Number.parseFloat(t.total), 0)), highlight: true },
                { label: "Cash", value: filteredTransactions.filter((t: any) => t.paymentMethod === "cash").length },
                { label: "Credit", value: filteredTransactions.filter((t: any) => t.paymentMethod === "credit").length },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                  <p className={`text-lg font-bold mt-1 ${s.highlight ? "text-primary" : ""}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Transactions</h3>
              {filteredTransactions.map((txn: any) => (
                <div key={txn.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-mono text-sm font-semibold">#{txn.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(txn.date).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(Number.parseFloat(txn.total))}</p>
                      <Badge variant="outline" className="text-xs mt-1">{txn.status}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {txn.client?.name || "Walk-in"} &middot; {txn.user?.name || "—"} &middot; {txn.table ? `T${txn.table.number}` : "—"} &middot; {txn.paymentMethod || "Unpaid"}
                  </p>
                  <div className="border-l-2 border-muted pl-3 space-y-1">
                    {txn.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span><span className="text-muted-foreground">{item.quantity}x</span> {item.productName}</span>
                        <span>{formatCurrency(Number.parseFloat(item.price) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowReport(false)}>Close</Button>
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
