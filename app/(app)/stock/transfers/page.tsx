"use client"

import { useState, useEffect, useMemo } from "react"
import { useStockTransfers } from "@/hooks/use-stock-transfers"
import { useProducts } from "@/hooks/use-products"
import { useLocations } from "@/hooks/use-locations"
import { useUsers } from "@/hooks/use-users"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ArrowRightLeft, Loader2, Plus, CheckCircle, Trash2, Package, Warehouse, Store } from "lucide-react"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    pending: { label: "Pending", variant: "secondary" },
    approved: { label: "Approved", variant: "default" },
    completed: { label: "Completed", variant: "outline" },
    cancelled: { label: "Cancelled", variant: "destructive" },
}

interface LineItem {
    key: string
    productId: string
    quantity: string
}

export default function StockTransfersPage() {
    const { transfers, loading, createTransfer, approveTransfer, receiveTransfer, refresh } = useStockTransfers()
    const { products } = useProducts()
    const { locations } = useLocations()
    const { users } = useUsers()
    const [showTransfer, setShowTransfer] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [form, setForm] = useState({
        fromLocationId: "",
        toLocationId: "",
        notes: "",
        userId: "",
    })

    const [lineItems, setLineItems] = useState<LineItem[]>([
        { key: crypto.randomUUID(), productId: "", quantity: "" },
    ])

    const [stockByLocation, setStockByLocation] = useState<any[]>([])
    const [loadingStock, setLoadingStock] = useState(false)

    const currentUserId = users[0]?.id || ""

    // Fetch stock when source location changes
    useEffect(() => {
        if (!form.fromLocationId) {
            setStockByLocation([])
            return
        }
        setLoadingStock(true)
        fetch(`/api/stock?locationId=${form.fromLocationId}`)
            .then((r) => r.json())
            .then((data) => setStockByLocation(data))
            .catch(() => setStockByLocation([]))
            .finally(() => setLoadingStock(false))
    }, [form.fromLocationId])

    // Available products at the source location (trackable only)
    const availableProducts = useMemo(() => {
        return stockByLocation
            .filter((s: any) =>
                s.product?.productType === "ingredient" ||
                (s.product?.productType === "drink" && s.product?.trackStock)
            )
            .map((s: any) => ({
                ...s.product,
                availableQty: s.quantityOnHand,
            }))
    }, [stockByLocation])

    const getProductQty = (productId: string) => {
        const s = stockByLocation.find((s: any) => s.productId === productId)
        return s?.quantityOnHand ?? 0
    }

    const principalLocations = locations.filter((l: any) => l.type === "principal")
    const secondaryLocations = locations.filter((l: any) => l.type === "secondary")

    const addLineItem = () => {
        setLineItems([...lineItems, { key: crypto.randomUUID(), productId: "", quantity: "" }])
    }

    const removeLineItem = (key: string) => {
        if (lineItems.length <= 1) return
        setLineItems(lineItems.filter((i) => i.key !== key))
    }

    const updateLineItem = (key: string, field: keyof LineItem, value: string) => {
        setLineItems(lineItems.map((i) => (i.key === key ? { ...i, [field]: value } : i)))
    }

    const resetForm = () => {
        setForm({ fromLocationId: "", toLocationId: "", notes: "", userId: currentUserId })
        setLineItems([{ key: crypto.randomUUID(), productId: "", quantity: "" }])
    }

    const handleSubmit = async () => {
        const items = lineItems
            .filter((i) => i.productId && i.quantity)
            .map((i) => ({ productId: i.productId, quantity: parseInt(i.quantity) }))

        if (!items.length) {
            alert("Add at least one product")
            return
        }

        setSubmitting(true)
        try {
            await createTransfer({ ...form, items })
            setShowTransfer(false)
            resetForm()
            refresh()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleApprove = async (id: string) => {
        try {
            await approveTransfer(id, currentUserId)
        } catch (err: any) {
            alert(err.message)
        }
    }

    const handleReceive = async (id: string) => {
        try {
            await receiveTransfer(id, currentUserId)
        } catch (err: any) {
            alert(err.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Stock Transfers</h2>
                    <p className="text-muted-foreground">Request → Approve → Receive workflow</p>
                </div>
                <Button onClick={() => { setForm((prev) => ({ ...prev, userId: currentUserId })); setShowTransfer(true) }}>
                    <Plus className="h-4 w-4 mr-2" /> New Request
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Requested By</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                            ) : transfers.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transfers yet</TableCell></TableRow>
                            ) : (
                                transfers.map((t: any) => {
                                    const sc = statusConfig[t.status] || statusConfig.pending
                                    const itemCount = t.items?.length || (t.productId ? 1 : 0)
                                    return (
                                        <TableRow key={t.id}>
                                            <TableCell className="text-sm whitespace-nowrap">{new Date(t.date).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    {t.items?.length > 0 ? (
                                                        t.items.map((it: any) => (
                                                            <span key={it.id} className="text-sm">
                                                                {it.product?.name || "—"} <span className="font-bold">×{it.quantity}</span>
                                                            </span>
                                                        ))
                                                    ) : t.productId ? (
                                                        <span className="text-sm">
                                                            {t.product?.name || "—"} <span className="font-bold">×{t.quantity}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">—</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Badge variant="outline" className="text-xs">{t.fromLocation?.name}</Badge>
                                                    <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                                                    <Badge variant="outline" className="text-xs">{t.toLocation?.name}</Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{t.user?.name || "—"}</TableCell>
                                            <TableCell>
                                                <Badge variant={sc.variant}>{sc.label}</Badge>
                                                {t.approver?.name && t.status === "approved" && (
                                                    <div className="text-xs text-muted-foreground mt-0.5">by {t.approver.name}</div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {t.status === "pending" && (
                                                        <Button size="sm" variant="outline" onClick={() => handleApprove(t.id)}>
                                                            <CheckCircle className="h-3 w-3 mr-1" /> Approve
                                                        </Button>
                                                    )}
                                                    {t.status === "approved" && (
                                                        <Button size="sm" onClick={() => handleReceive(t.id)}>
                                                            <Package className="h-3 w-3 mr-1" /> Receive
                                                        </Button>
                                                    )}
                                                    {t.status === "completed" && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3 text-green-500" /> Done
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* New Transfer Dialog */}
            <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ArrowRightLeft className="h-5 w-5" />
                            New Transfer Request
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Location Selectors */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    <Warehouse className="h-3.5 w-3.5" /> From (Warehouse)
                                </Label>
                                <Select
                                    value={form.fromLocationId}
                                    onValueChange={(v) => {
                                        setForm({ ...form, fromLocationId: v })
                                        setLineItems(lineItems.map((i) => ({ ...i, productId: "" })))
                                    }}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                                    <SelectContent>
                                        {principalLocations.map((l: any) => (
                                            <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    <Store className="h-3.5 w-3.5" /> To (Destination)
                                </Label>
                                <Select
                                    value={form.toLocationId}
                                    onValueChange={(v) => setForm({ ...form, toLocationId: v })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                                    <SelectContent>
                                        {secondaryLocations.map((l: any) => (
                                            <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Products</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Product
                                </Button>
                            </div>

                            {loadingStock ? (
                                <div className="flex items-center justify-center py-8 text-muted-foreground">
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading products...
                                </div>
                            ) : form.fromLocationId && availableProducts.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No trackable products in stock at this location.
                                </p>
                            ) : !form.fromLocationId ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Select a source warehouse first.
                                </p>
                            ) : (
                                <div className="border rounded-lg divide-y">
                                    {lineItems.map((item, idx) => (
                                        <div key={item.key} className="flex items-end gap-3 p-3">
                                            <div className="flex-1 space-y-1">
                                                <Label className="text-xs text-muted-foreground">Product</Label>
                                                <Select
                                                    value={item.productId}
                                                    onValueChange={(v) => updateLineItem(item.key, "productId", v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select product..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableProducts.map((p: any) => (
                                                            <SelectItem key={p.id} value={p.id}>
                                                                {p.name} (Stock: {p.availableQty})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="w-28 space-y-1">
                                                <Label className="text-xs text-muted-foreground">Quantity</Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={item.productId ? getProductQty(item.productId) : undefined}
                                                    value={item.quantity}
                                                    onChange={(e) => updateLineItem(item.key, "quantity", e.target.value)}
                                                    placeholder="Qty"
                                                />
                                            </div>
                                            <div className="text-xs text-muted-foreground pb-2 w-16 text-right">
                                                {item.productId ? `avail: ${getProductQty(item.productId)}` : ""}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 mb-0.5"
                                                disabled={lineItems.length <= 1}
                                                onClick={() => removeLineItem(item.key)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label>Notes (optional)</Label>
                            <Textarea
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                placeholder="e.g. Restock the bar for weekend service"
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowTransfer(false); resetForm() }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={
                                submitting ||
                                !form.fromLocationId ||
                                !form.toLocationId ||
                                !lineItems.some((i) => i.productId && i.quantity)
                            }
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <ArrowRightLeft className="h-4 w-4 mr-2" />
                            )}
                            Submit Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
