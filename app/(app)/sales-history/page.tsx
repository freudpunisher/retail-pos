"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/mock-data"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useTransactions } from "@/hooks/use-transactions"
import {
    Receipt,
    Search,
    DollarSign,
    CreditCard,
    Banknote,
    ShoppingCart,
    Calendar,
    User,
    Package,
    Loader2,
    Eye,
} from "lucide-react"

export default function SalesHistoryPage() {
    const { transactions, loading, fetchTransactions } = useTransactions()
    const [search, setSearch] = useState("")
    const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [showReport, setShowReport] = useState(false)

    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    useEffect(() => {
        fetchTransactions()
    }, [fetchTransactions])

    const filteredTransactions = useMemo(() => {
        // First filter by type "sale"
        let filtered = transactions.filter((t: any) => t.type === "sale")

        // Search filter
        if (search) {
            const lowerSearch = search.toLowerCase()
            filtered = filtered.filter((t: any) =>
                t.id.toLowerCase().includes(lowerSearch) ||
                t.client?.name?.toLowerCase().includes(lowerSearch) ||
                t.user?.name?.toLowerCase().includes(lowerSearch)
            )
        }

        // Date range filter
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
    }, [transactions, search, startDate, endDate])

    const stats = useMemo(() => {
        const sales = transactions.filter((t: any) => t.type === "sale") // calculate stats on ALL sales, or filtered? Usually ALL or filtered. Let's use filtered for dynamic stats? No, usually overall stats. Sticking to overall for now as per code.
        const totalRevenue = sales.reduce((sum: number, t: any) => sum + Number.parseFloat(t.total), 0)
        const cashSales = sales.filter((t: any) => t.paymentMethod === "cash").length
        const creditSales = sales.filter((t: any) => t.paymentMethod === "credit").length
        const cardSales = sales.filter((t: any) => t.paymentMethod === "card").length
        return { totalSales: sales.length, totalRevenue, cashSales, creditSales, cardSales }
    }, [transactions])

    const handleViewDetails = (transaction: any) => {
        setSelectedTransaction(transaction)
        setShowDetails(true)
    }

    const handlePrint = () => {
        if (typeof window !== "undefined") {
            window.print()
        }
    }

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case "cash":
                return <Banknote className="h-4 w-4 text-green-600" />
            case "card":
                return <CreditCard className="h-4 w-4 text-primary" />
            case "credit":
                return <User className="h-4 w-4 text-warning" />
            default:
                return <DollarSign className="h-4 w-4" />
        }
    }

    return (
        <div className="space-y-6">
            <style>
                {`
                  @media print {
                    body * {
                      visibility: hidden;
                    }
                    #printable-receipt, #printable-receipt *,
                    #printable-report, #printable-report * {
                      visibility: visible;
                    }
                    #printable-receipt, #printable-report {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100% !important;
                      margin: 0 !important;
                      padding: 20px !important;
                    }
                    /* Ensure table borders differ for print */
                    #printable-report table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    #printable-report th, #printable-report td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                  }
                `}
            </style>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Sales History</h2>
                    <p className="text-muted-foreground">View all completed sales transactions</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-border bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Sales</p>
                                <p className="text-2xl font-bold">{loading ? "..." : stats.totalSales}</p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold text-green-600">{loading ? "..." : formatCurrency(stats.totalRevenue)}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Cash Sales</p>
                                <p className="text-2xl font-bold">{loading ? "..." : stats.cashSales}</p>
                            </div>
                            <Banknote className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Credit Sales</p>
                                <p className="text-2xl font-bold text-warning">{loading ? "..." : stats.creditSales}</p>
                            </div>
                            <User className="h-8 w-8 text-warning" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-border bg-card">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by transaction ID, client, or cashier..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="grid gap-1">
                                <label className="text-xs font-medium">From</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <div className="grid gap-1">
                                <label className="text-xs font-medium">To</label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            {startDate || endDate ? (
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setStartDate("")
                                        setEndDate("")
                                    }}
                                    className="mt-5 h-10 px-3"
                                >
                                    Clear
                                </Button>
                            ) : null}
                            <div className="h-10 border-l border-border mx-2 mt-5"></div>
                            <Button
                                onClick={() => setShowReport(true)}
                                disabled={filteredTransactions.length === 0}
                                className="mt-5"
                            >
                                <Receipt className="mr-2 h-4 w-4" />
                                Print Report
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sales Table */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Transaction History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-md border border-border">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border">
                                    <TableHead className="text-muted-foreground">Transaction ID</TableHead>
                                    <TableHead className="text-muted-foreground">Date & Time</TableHead>
                                    <TableHead className="text-muted-foreground">Customer</TableHead>
                                    <TableHead className="text-muted-foreground">Items</TableHead>
                                    <TableHead className="text-muted-foreground">Payment</TableHead>
                                    <TableHead className="text-muted-foreground">Total</TableHead>
                                    <TableHead className="text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                <span>Loading transactions...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            No sales found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((txn: any) => (
                                        <TableRow key={txn.id} className="border-border hover:bg-secondary/50">
                                            <TableCell>
                                                <span className="font-mono text-xs">{txn.id.slice(0, 8)}...</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-sm">{new Date(txn.date).toLocaleString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {txn.client ? (
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3 w-3 text-muted-foreground" />
                                                        <span>{txn.client.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Walk-in</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{txn.items?.length || 0} items</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getPaymentIcon(txn.paymentMethod)}
                                                    <span className="capitalize">{txn.paymentMethod}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-bold text-primary">
                                                    {formatCurrency(Number.parseFloat(txn.total))}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={txn.status === "completed" ? "default" : "secondary"}
                                                    className={txn.status === "completed" ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-500/20" : ""}
                                                >
                                                    {txn.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleViewDetails(txn)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Transaction Details Dialog */}
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            Transaction Details
                        </DialogTitle>
                        <DialogDescription>Full details of this sale</DialogDescription>
                    </DialogHeader>

                    {selectedTransaction && (
                        <>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Transaction ID</p>
                                        <p className="font-mono">{selectedTransaction.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Date</p>
                                        <p>{new Date(selectedTransaction.date).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Customer</p>
                                        <p>{selectedTransaction.client?.name || "Walk-in Customer"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Cashier</p>
                                        <p>{selectedTransaction.user?.name || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Payment Method</p>
                                        <div className="flex items-center gap-2">
                                            {getPaymentIcon(selectedTransaction.paymentMethod)}
                                            <span className="capitalize">{selectedTransaction.paymentMethod}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Status</p>
                                        <Badge
                                            variant={selectedTransaction.status === "completed" ? "default" : "secondary"}
                                            className={selectedTransaction.status === "completed" ? "bg-green-500/15 text-green-700 border-green-500/20" : ""}
                                        >
                                            {selectedTransaction.status}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Items Sold
                                    </h4>
                                    <div className="space-y-2 rounded-lg border border-border p-3">
                                        {selectedTransaction.items?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span>
                                                    {item.quantity}x {item.productName}
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(Number.parseFloat(item.price) * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">
                                        {formatCurrency(Number.parseFloat(selectedTransaction.total))}
                                    </span>
                                </div>
                            </div>

                            {/* Printable Receipt Section (Hidden on Screen, Visible on Print) */}
                            <div id="printable-receipt" className="hidden">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold">SmartPOS Store</h2>
                                    <p className="text-sm">123 Payment Street, Commerce City</p>
                                    <p className="text-sm">Tel: +1 234 567 890</p>
                                </div>

                                <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

                                <div className="space-y-1 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span>Date:</span>
                                        <span>{new Date(selectedTransaction.date).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Transaction ID:</span>
                                        <span>{selectedTransaction.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Customer:</span>
                                        <span>{selectedTransaction.client?.name || "Walk-in Customer"}</span>
                                    </div>
                                </div>

                                <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

                                <div className="space-y-2 mb-4">
                                    {selectedTransaction.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span>{item.quantity}x {item.productName}</span>
                                            <span>{formatCurrency(Number.parseFloat(item.price) * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

                                <div className="space-y-1 font-bold">
                                    <div className="flex justify-between text-lg">
                                        <span>Total</span>
                                        <span>{formatCurrency(Number.parseFloat(selectedTransaction.total))}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-2">
                                        <span>Payment Method:</span>
                                        <span className="capitalize">{selectedTransaction.paymentMethod}</span>
                                    </div>
                                </div>

                                <div className="mt-8 text-center text-sm">
                                    <p>Thank you for your purchase!</p>
                                    <p>Please come again.</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => setShowDetails(false)}>
                                    Close
                                </Button>
                                <Button onClick={handlePrint}>
                                    <Receipt className="mr-2 h-4 w-4" />
                                    Print Receipt
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Report Preview Dialog */}
            <Dialog open={showReport} onOpenChange={setShowReport}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Sales Report Preview</DialogTitle>
                        <DialogDescription>
                            Review the report before printing.
                        </DialogDescription>
                    </DialogHeader>

                    <div id="printable-report" className="space-y-6 p-4 border rounded-md">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">Sales Activity Report</h2>
                            <p className="text-sm text-muted-foreground">Generated on {new Date().toLocaleString()}</p>
                            {(startDate || endDate) && (
                                <p className="text-sm font-medium mt-1">
                                    Period: {startDate || "Start"} to {endDate || "End"}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-center border-y py-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase">Total Sales</p>
                                <p className="font-bold text-lg">{filteredTransactions.length}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase">Revenue</p>
                                <p className="font-bold text-lg text-primary">
                                    {formatCurrency(filteredTransactions.reduce((acc: number, t: any) => acc + Number.parseFloat(t.total), 0))}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase">Cash</p>
                                <p className="font-bold text-lg">{filteredTransactions.filter((t: any) => t.paymentMethod === "cash").length}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase">Credit</p>
                                <p className="font-bold text-lg">{filteredTransactions.filter((t: any) => t.paymentMethod === "credit").length}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {filteredTransactions.map((txn: any) => (
                                <div key={txn.id} className="border-b pb-4 last:border-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-sm">#{txn.id.slice(0, 8)}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(txn.date).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{formatCurrency(Number.parseFloat(txn.total))}</p>
                                            <Badge variant="outline" className="text-xs">{txn.status}</Badge>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-2">
                                        {txn.client?.name || "Walk-in"} • {txn.user?.name || "Staff"} • <span className="capitalize">{txn.paymentMethod}</span>
                                    </div>
                                    <div className="pl-4 border-l-2 border-muted">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="text-left text-muted-foreground">
                                                    <th className="font-normal w-12">Qty</th>
                                                    <th className="font-normal">Item</th>
                                                    <th className="font-normal text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {txn.items?.map((item: any, i: number) => (
                                                    <tr key={i}>
                                                        <td>{item.quantity}</td>
                                                        <td>{item.productName}</td>
                                                        <td className="text-right">{formatCurrency(Number.parseFloat(item.price) * item.quantity)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowReport(false)}>
                            Close
                        </Button>
                        <Button onClick={handlePrint}>
                            <Receipt className="mr-2 h-4 w-4" />
                            Print Report
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
