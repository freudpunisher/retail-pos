// app/purchases/edit/[id]/page.tsx
// or app/purchases/[id]/edit/page.tsx  ← adjust path as needed

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useSuppliers } from "@/hooks/use-suppliers"
import { useProducts } from "@/hooks/use-products"
import { usePurchases } from "@/hooks/use-purchases"
import { formatCurrency } from "@/lib/mock-data"
import { ArrowLeft, Loader2, Plus, Trash2, Package, ShoppingCart, XCircle, CheckCircle2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

interface POItem {
  productId: string
  productName: string
  quantity: number
  cost: number
}

export default function EditPurchaseOrderPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<any | null>(null)
  const [supplierId, setSupplierId] = useState("")
  const [items, setItems] = useState<POItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const { suppliers, loading: suppliersLoading } = useSuppliers()
  const { products, loading: productsLoading } = useProducts()
  const { updateOrder, cancelOrder, markAsReceived } = usePurchases()
  const { user } = useAuth()

  // Load order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/purchase-orders/${orderId}`)
        if (!res.ok) throw new Error("Failed to load order")
        const data = await res.json()
        setOrder(data)
        setSupplierId(data.supplierId)
        setItems(data.items || [])
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Could not load purchase order",
        })
        router.push("/purchases")
      } finally {
        setIsLoading(false)
      }
    }

    if (orderId) fetchOrder()
  }, [orderId, router])

  const isEditable = order?.status === "pending"

  const addProduct = () => {
    if (!selectedProductId) return
    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    const existing = items.find((i) => i.productId === selectedProductId)
    if (existing) {
      setItems((prev) =>
        prev.map((i) =>
          i.productId === selectedProductId ? { ...i, quantity: i.quantity + 1 } : i
        )
      )
    } else {
      setItems((prev) => [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          cost: parseFloat(product.cost) || 0,
        },
      ])
    }
    setSelectedProductId("")
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    const qty = Math.max(0, newQuantity)
    if (qty === 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
      )
    }
  }

  const updateCost = (productId: string, cost: string) => {
    const numericCost = parseFloat(cost) || 0
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, cost: numericCost } : i)))
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.cost, 0)
  const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEditable) return

    setIsSubmitting(true)
    try {
      await updateOrder(orderId, {
        supplierId,
        items,
        total,
      })
      toast({ title: "Order updated", description: "Changes saved successfully." })
      router.push("/purchases")
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err.message || "Could not save changes",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return
    setIsActionLoading(true)
    try {
      await cancelOrder(orderId)
      toast({ title: "Order cancelled" })
      router.push("/purchases")
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to cancel", description: err.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleReceiveOrder = async () => {
    if (!confirm("Mark as received? This will update stock levels.")) return
    setIsActionLoading(true)
    try {
      await markAsReceived(orderId, user?.id || "")
      toast({ title: "Order received", description: "Stock updated." })
      router.push("/purchases")
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to receive", description: err.message })
    } finally {
      setIsActionLoading(false)
    }
  }

  if (isLoading || suppliersLoading || productsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        Order not found
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEditable ? "Edit Purchase Order" : "View Purchase Order"}
          </h2>
          <p className="text-muted-foreground">
            Order #{order.id?.slice(0, 8)} • {order.status.toUpperCase()}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/purchases")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Total Value
              </p>
              <p className="text-4xl font-black text-primary">{formatCurrency(total)}</p>
            </div>
            <div className="space-y-2 text-right">
              <div>
                <span className="font-bold text-lg">{items.length}</span> products
              </div>
              <div>
                <span className="font-bold text-lg">{totalUnits}</span> total units
              </div>
              <Badge variant="outline" className="mt-2">
                {order.status === "pending"
                  ? "Editable"
                  : order.status === "received"
                  ? "Received – locked"
                  : "Cancelled – archived"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Supplier</Label>
              {isEditable ? (
                <Select value={supplierId} onValueChange={setSupplierId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers
                      .filter((s) => s.isActive)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50">
                  {suppliers.find((s) => s.id === supplierId)?.name || "Unknown"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products / Line Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditable && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label>Add Product</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} – {formatCurrency(parseFloat(p.cost || "0"))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  onClick={addProduct}
                  disabled={!selectedProductId}
                  className="self-end"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            )}

            {items.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      {isEditable && <TableHead className="w-12"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-right">
                          {isEditable ? (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.cost}
                              onChange={(e) => updateCost(item.productId, e.target.value)}
                              className="w-28 text-right mx-auto"
                            />
                          ) : (
                            formatCurrency(item.cost)
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditable ? (
                            <Input
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                              className="w-20 text-center mx-auto"
                            />
                          ) : (
                            item.quantity
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.quantity * item.cost)}
                        </TableCell>
                        {isEditable && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center border border-dashed rounded-lg text-muted-foreground">
                <Package className="h-10 w-10 mb-3 opacity-60" />
                <p className="font-medium">No items in this order</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/purchases")}
            className="flex-1"
          >
            Back to List
          </Button>

          {isEditable ? (
            <>
              <Button
                type="submit"
                disabled={isSubmitting || !supplierId || items.length === 0}
                className="flex-1 gap-2 bg-primary hover:bg-primary/90"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={isActionLoading}
                className="gap-2"
              >
                {isActionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                <XCircle className="h-4 w-4" />
                Cancel Order
              </Button>

              <Button
                type="button"
                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={handleReceiveOrder}
                disabled={isActionLoading}
              >
                {isActionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                <CheckCircle2 className="h-4 w-4" />
                Mark as Received
              </Button>
            </>
          ) : (
            <Button variant="secondary" className="flex-1" disabled>
              {order.status === "received" ? "Order already received" : "Order cancelled"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}