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

    useEffect(() => {
        fetchTransactions()
    }, [fetchTransactions])

    const filteredTransactions = useMemo(() => {
        if (!search) return transactions.filter((t: any) => t.type === "sale")
        const lowerSearch = search.toLowerCase()
        return transactions.filter((t: any) =>
            t.type === "sale" && (
                t.id.toLowerCase().includes(lowerSearch) ||
                t.client?.name?.toLowerCase().includes(lowerSearch) ||
                t.user?.name?.toLowerCase().includes(lowerSearch)
            )
        )
    }, [transactions, search])

    const stats = useMemo(() => {
        const sales = transactions.filter((t: any) => t.type === "sale")
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

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case "cash":
                return <Banknote className="h-4 w-4 text-accent" />
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
                                <p className="text-2xl font-bold text-accent">{loading ? "..." : formatCurrency(stats.totalRevenue)}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-accent" />
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
                            <Banknote className="h-8 w-8 text-accent" />
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

            {/* Search */}
            <Card className="border-border bg-card">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by transaction ID, client, or cashier..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
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
                                                    className={txn.status === "completed" ? "bg-accent/20 text-accent font-bold ring-1 ring-accent/30" : ""}
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
                                        className={selectedTransaction.status === "completed" ? "bg-accent/20 text-accent" : ""}
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
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
