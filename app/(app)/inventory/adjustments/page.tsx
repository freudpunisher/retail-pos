"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Plus,
    Search,
    Loader2,
    User,
    RefreshCw,
    History,
    FileText,
    Calendar,
    ArrowUpDown,
    Clock
} from "lucide-react"
import { useStock } from "@/hooks/use-stock"
import { useProducts } from "@/hooks/use-products"
import { useUsers } from "@/hooks/use-users"

export default function StockAdjustmentsPage() {
    const [search, setSearch] = useState("")
    const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { adjustments, loading, createAdjustment } = useStock()
    const { products } = useProducts()
    const { users } = useUsers()

    const [formData, setFormData] = useState({
        productId: "",
        adjustmentType: "stock_count",
        quantityChange: "",
        reason: "",
        referenceNumber: "",
        createdBy: "",
        notes: ""
    })

    const filteredAdjustments = useMemo(() => {
        return adjustments.filter(adj =>
            adj.product.name.toLowerCase().includes(search.toLowerCase()) ||
            adj.reason.toLowerCase().includes(search.toLowerCase())
        )
    }, [adjustments, search])

    const handleAdjustmentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const userId = formData.createdBy || (users.length > 0 ? users[0].id : "")
            await createAdjustment({
                ...formData,
                createdBy: userId,
                quantityChange: parseInt(formData.quantityChange)
            })
            setShowAdjustmentDialog(false)
            setFormData({
                productId: "",
                adjustmentType: "stock_count",
                quantityChange: "",
                reason: "",
                referenceNumber: "",
                createdBy: users[0]?.id || "",
                notes: ""
            })
        } catch (error) {
            console.error("Adjustment failed:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const getAdjustmentBadge = (type: string) => {
        const variants: Record<string, string> = {
            stock_count: "bg-primary/20 text-primary border-primary/30",
            damage: "bg-destructive/20 text-destructive border-destructive/30",
            loss: "bg-destructive/20 text-destructive border-destructive/30",
            return: "bg-accent/20 text-accent border-accent/30",
            transfer: "bg-warning/20 text-warning border-warning/30",
            correction: "bg-warning/20 text-warning border-warning/30",
            opening_stock: "bg-accent/20 text-accent border-accent/30"
        }
        return <Badge variant="outline" className={`font-bold uppercase text-[10px] ${variants[type] || ""}`}>{type.replace("_", " ")}</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Stock Adjustments</h2>
                    <p className="text-muted-foreground">Record and audit manual stock modifications</p>
                </div>
                <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                            <Plus className="mr-2 h-4 w-4" />
                            Record Adjustment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] border-border/50 shadow-2xl backdrop-blur-xl bg-card/90">
                        <form onSubmit={handleAdjustmentSubmit}>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <RefreshCw className="h-6 w-6 text-primary" />
                                    </div>
                                    Manual Adjustment
                                </DialogTitle>
                                <DialogDescription className="text-base italic">Ensure accuracy when recording inventory changes for the audit trail.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-primary/80">Select Product</Label>
                                    <Select
                                        value={formData.productId}
                                        onValueChange={(val) => setFormData({ ...formData, productId: val })}
                                        required
                                    >
                                        <SelectTrigger className="bg-background/50 border-border/50 hover:border-primary/50 transition-colors">
                                            <SelectValue placeholder="Which product are you adjusting?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name} — <span className="opacity-50 text-xs">{p.sku}</span></SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-primary/80">Adjustment Type</Label>
                                        <Select
                                            value={formData.adjustmentType}
                                            onValueChange={(val) => setFormData({ ...formData, adjustmentType: val })}
                                        >
                                            <SelectTrigger className="bg-background/50 border-border/50 hover:border-primary/50 transition-colors">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="stock_count">Stock Count</SelectItem>
                                                <SelectItem value="damage">Damage</SelectItem>
                                                <SelectItem value="loss">Loss</SelectItem>
                                                <SelectItem value="return">Return</SelectItem>
                                                <SelectItem value="transfer">Transfer</SelectItem>
                                                <SelectItem value="correction">Correction</SelectItem>
                                                <SelectItem value="opening_stock">Opening Stock</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-primary/80">Quantity Change</Label>
                                        <Input
                                            type="number"
                                            placeholder="Use -ive for loss"
                                            value={formData.quantityChange}
                                            onChange={(e) => setFormData({ ...formData, quantityChange: e.target.value })}
                                            className="bg-background/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-primary/80">Reason</Label>
                                    <Input
                                        placeholder="Detailed reason for the audit trail"
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        className="bg-background/50 border-border/50 hover:border-primary/50 transition-colors"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-primary/80">Ref # (Optional)</Label>
                                        <Input
                                            placeholder="e.g. INV-2024"
                                            value={formData.referenceNumber}
                                            onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                                            className="bg-background/50 border-border/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-primary/80">Performed By</Label>
                                        <Select
                                            value={formData.createdBy}
                                            onValueChange={(val) => setFormData({ ...formData, createdBy: val })}
                                            required
                                        >
                                            <SelectTrigger className="bg-background/50 border-border/50 text-xs hover:border-primary/50 transition-colors">
                                                <SelectValue placeholder="Assign user" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map(u => (
                                                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="bg-secondary/5 -mx-6 -mb-6 p-6 rounded-b-lg border-t border-border/50">
                                <Button type="button" variant="outline" onClick={() => setShowAdjustmentDialog(false)} className="border-border/50">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="min-w-[170px] bg-gradient-to-r from-primary to-primary/80 hover:shadow-primary/30 shadow-lg transition-all">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                    Sync Stock
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-border/50 shadow-2xl overflow-hidden backdrop-blur-md bg-card/70 border-t-4 border-t-primary/20">
                <CardHeader className="border-b border-border/50 bg-secondary/10 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <CardTitle className="text-xl font-black flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <History className="h-5 w-5 text-primary" />
                            </div>
                            Adjustment Audit Trail
                        </CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Search audits..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 w-full md:w-64 bg-background/50 border-border/50 focus:w-80 transition-all duration-300"
                                />
                            </div>
                            <Button variant="outline" size="sm" className="gap-2 border-border/50 bg-background/50">
                                <ArrowUpDown className="h-4 w-4 text-primary" /> Date
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-secondary/5 hover:bg-secondary/5 border-border/50">
                                    <TableHead className="font-bold py-5 px-6">Timeline</TableHead>
                                    <TableHead className="font-bold py-5 px-6">Product</TableHead>
                                    <TableHead className="font-bold py-5 px-6">Category Type</TableHead>
                                    <TableHead className="text-right font-bold py-5 px-6">Quantity Change</TableHead>
                                    <TableHead className="font-bold py-5 px-6">Auditor</TableHead>
                                    <TableHead className="font-bold py-5 px-6">Audit Reason</TableHead>
                                    <TableHead className="font-bold py-5 px-6">Reference</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64 text-center bg-background/10">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-4 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
                                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                                </div>
                                                <p className="text-lg font-bold text-foreground/80">Synchronizing database items...</p>
                                                <p className="text-sm text-muted-foreground max-w-xs">Retrieving full historical audit logs for stock modifications.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && filteredAdjustments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48 text-center text-muted-foreground bg-background/5 italic px-6">
                                            <div className="flex flex-col items-center gap-2">
                                                <History className="h-12 w-12 opacity-10" />
                                                <p className="text-lg font-medium">No audit entries found</p>
                                                <p className="text-sm">Try adjusting your filters or search query.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filteredAdjustments.map((adj) => (
                                    <TableRow key={adj.id} className="border-border/50 hover:bg-primary/5 transition-all duration-300 group cursor-default">
                                        <TableCell className="py-5 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                                                    <Calendar className="h-3.5 w-3.5 opacity-50" />
                                                    {new Date(adj.createdDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-2 mt-0.5">
                                                    <Clock className="h-3 w-3 opacity-50" />
                                                    {new Date(adj.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-foreground group-hover:translate-x-1 transition-transform">{adj.product.name}</span>
                                                <span className="text-[10px] font-mono text-muted-foreground uppercase">{adj.product.sku}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 px-6">{getAdjustmentBadge(adj.adjustmentType)}</TableCell>
                                        <TableCell className="text-right py-5 px-6">
                                            <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-black ring-1 transition-all group-hover:scale-110 ${adj.quantityChange > 0 ? 'bg-accent/10 text-accent ring-accent/30' : 'bg-destructive/10 text-destructive ring-destructive/30'}`}>
                                                {adj.quantityChange > 0 ? '+' : ''}{adj.quantityChange}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center border-2 border-background shadow-sm hover:scale-110 transition-transform">
                                                    <User className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-foreground">{adj.user.name}</span>
                                                    <span className="text-[10px] text-muted-foreground capitalize">{adj.user.role}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[220px] py-5 px-6">
                                            <p className="text-xs font-semibold text-muted-foreground' group-hover:text-foreground/80 leading-relaxed italic" title={adj.reason}>
                                                "{adj.reason}"
                                            </p>
                                        </TableCell>
                                        <TableCell className="py-5 px-6">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black font-mono bg-background/60 px-2.5 py-1.5 rounded-md border border-border/30 shadow-inner group-hover:border-primary/30 transition-colors">
                                                <FileText className="h-3.5 w-3.5 opacity-40 text-primary" />
                                                {adj.referenceNumber || 'SYSTEM-GEN'}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
