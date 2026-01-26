"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    ClipboardList,
    Save,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    ArrowLeft,
    User,
    Package,
    Search,
    Plus,
    PlusCircle
} from "lucide-react"
import { useInventorySessions } from "@/hooks/use-inventory-sessions"
import { useProducts } from "@/hooks/use-products"
import { formatCurrency } from "@/lib/mock-data"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CountSessionPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [session, setSession] = useState<any>(null)
    const [localCounts, setLocalCounts] = useState<Record<string, number>>({})
    const [isSaving, setIsSaving] = useState(false)
    const [isReconciling, setIsReconciling] = useState(false)
    const [isAddingItem, setIsAddingItem] = useState(false)
    const [search, setSearch] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState("")

    const { getSession, updateSessionItems, reconcileSession, addItemToSession } = useInventorySessions()
    const { products } = useProducts()

    useEffect(() => {
        const load = async () => {
            const data = await getSession(id)
            setSession(data)

            // Initialize local counts from session items
            const counts: Record<string, number> = {}
            data.items.forEach((item: any) => {
                counts[item.productId] = item.physicalQuantity
            })
            setLocalCounts(counts)
        }
        load()
    }, [id])

    const filteredItems = useMemo(() => {
        if (!session) return []
        return session.items.filter((item: any) =>
            item.product.name.toLowerCase().includes(search.toLowerCase()) ||
            item.product.sku.toLowerCase().includes(search.toLowerCase())
        )
    }, [session, search])

    const handleCountChange = (productId: string, value: string) => {
        const num = parseInt(value) || 0
        setLocalCounts(prev => ({ ...prev, [productId]: num }))
    }

    const handleSaveProgress = async () => {
        setIsSaving(true)
        try {
            const itemsToUpdate = Object.entries(localCounts).map(([productId, physicalQuantity]) => ({
                productId,
                physicalQuantity
            }))
            await updateSessionItems(id, itemsToUpdate)
            // Refresh session data
            const data = await getSession(id)
            setSession(data)
        } catch (error) {
            console.error("Failed to save progress:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleReconcile = async () => {
        if (!confirm("This will permanently adjust your stock levels based on the physical count. Proceed?")) return

        setIsReconciling(true)
        try {
            // First save progress to ensure items are up to date in DB
            const itemsToUpdate = Object.entries(localCounts).map(([productId, physicalQuantity]) => ({
                productId,
                physicalQuantity
            }))
            await updateSessionItems(id, itemsToUpdate)

            // Then reconcile
            await reconcileSession(id)
            router.push("/inventory/count")
        } catch (error) {
            console.error("Failed to reconcile:", error)
        } finally {
            setIsReconciling(false)
        }
    }

    const handleAddItem = async () => {
        if (!selectedProductId) return
        setIsAddingItem(true)
        try {
            await addItemToSession(id, selectedProductId)
            // Refresh data
            const data = await getSession(id)
            setSession(data)
            // Update local counts
            setLocalCounts(prev => ({
                ...prev,
                [selectedProductId]: 0
            }))
            setIsAddDialogOpen(false)
            setSelectedProductId("")
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsAddingItem(false)
        }
    }

    if (!session) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    const isReconciled = session.status === "reconciled"

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">Count Session</h2>
                            {isReconciled ? (
                                <Badge className="bg-accent/20 text-accent font-bold ring-1 ring-accent/30 lowercase h-6">
                                    <CheckCircle2 className="mr-1 h-3 w-3" /> Reconciled
                                </Badge>
                            ) : (
                                <Badge className="bg-warning/20 text-warning font-bold ring-1 ring-warning/30 lowercase h-6">
                                    In Progress
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1 font-medium"><User className="h-3 w-3 text-primary" /> {session.user?.name}</span>
                            <span className="font-mono text-xs opacity-50">ID: {session.id}</span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isReconciled && (
                        <>
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/5">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Item to List
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Add Product to Count</DialogTitle>
                                        <DialogDescription>
                                            Select a product to add to this session for verification.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Select Product</Label>
                                            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Which product are you adding?" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products
                                                        .filter(p => !session.items.some((item: any) => item.productId === p.id))
                                                        .map(p => (
                                                            <SelectItem key={p.id} value={p.id}>{p.name} — <span className="opacity-50 text-xs">{p.sku}</span></SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={handleAddItem} disabled={!selectedProductId || isAddingItem}>
                                            {isAddingItem && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Add to Count
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Button variant="outline" onClick={handleSaveProgress} disabled={isSaving || isReconciling}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Progress
                            </Button>
                            <Button className="bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20" onClick={handleReconcile} disabled={isSaving || isReconciling}>
                                {isReconciling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                Finalize & Reconcile
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Card className="border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-secondary/10 border-b border-border/50 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Inventory Verification Sheet
                        </CardTitle>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-secondary/5 border-border/50">
                                <TableHead className="py-4 px-6 font-bold">Product</TableHead>
                                <TableHead className="py-4 px-6 font-bold text-right">System Qty</TableHead>
                                <TableHead className="py-4 px-6 font-bold text-center w-40">Physical Count</TableHead>
                                <TableHead className="py-4 px-6 font-bold text-right">Variance</TableHead>
                                <TableHead className="py-4 px-6 font-bold text-center">Impact</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.map((item: any) => {
                                const phyCount = localCounts[item.productId] ?? 0
                                const variance = phyCount - item.quantityInStock

                                return (
                                    <TableRow key={item.id} className="border-border/50 hover:bg-secondary/5 group transition-colors">
                                        <TableCell className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground">{item.product.name}</span>
                                                <span className="text-[10px] font-mono text-muted-foreground">{item.product.sku}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right py-4 px-6 font-black opacity-60">
                                            {item.quantityInStock}
                                        </TableCell>
                                        <TableCell className="py-2 px-6">
                                            <Input
                                                type="number"
                                                className="text-center font-bold text-lg h-10 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
                                                value={phyCount}
                                                onChange={(e) => handleCountChange(item.productId, e.target.value)}
                                                disabled={isReconciled}
                                            />
                                        </TableCell>
                                        <TableCell className={`text-right py-4 px-6 font-black text-lg ${variance === 0 ? 'text-muted-foreground' : variance > 0 ? 'text-accent' : 'text-destructive'}`}>
                                            {variance > 0 ? '+' : ''}{variance}
                                        </TableCell>
                                        <TableCell className="text-center py-4 px-6">
                                            {variance === 0 ? (
                                                <Badge variant="outline" className="opacity-40">Matched</Badge>
                                            ) : variance > 0 ? (
                                                <Badge className="bg-accent/20 text-accent font-bold ring-1 ring-accent/30 lowercase">Surplus</Badge>
                                            ) : (
                                                <Badge className="bg-destructive/20 text-destructive font-bold ring-1 ring-destructive/30 lowercase">Deficit</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {!isReconciled && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm font-medium">
                    <AlertTriangle className="h-5 w-5" />
                    Finalizing the count will update your system stock levels to match the physical counts. This action is irreversible.
                </div>
            )}
        </div>
    )
}
