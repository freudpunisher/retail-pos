"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useSuppliers } from "@/hooks/use-suppliers"
import { useProducts } from "@/hooks/use-products"
import { usePurchases } from "@/hooks/use-purchases"
import { useUsers } from "@/hooks/use-users"
import { formatCurrency } from "@/lib/mock-data"
import { Plus, Minus, Trash2, Package, Loader2, ArrowLeft, ShoppingCart } from "lucide-react"

interface POItem {
  productId: string
  productName: string
  quantity: number
  cost: number
}

export default function CreatePurchaseOrderPage() {
  const router = useRouter()
  const [supplierId, setSupplierId] = useState("")
  const [items, setItems] = useState<POItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { suppliers, loading: suppliersLoading } = useSuppliers()
  const { products, loading: productsLoading } = useProducts()
  const { createOrder } = usePurchases()
  const { users } = useUsers()

  const addProduct = () => {
    if (!selectedProductId) return
    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    const existing = items.find((i) => i.productId === selectedProductId)
    if (existing) {
      setItems((prev) =>
        prev.map((i) =>
          i.productId === selectedProductId ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      )
    } else {
      setItems((prev) => [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          cost: 0,
        },
      ])
    }
    setSelectedProductId("")
  }

  const updateQuantity = (productId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0),
    )
  }

  const updateCost = (productId: string, cost: string) => {
    const numericCost = parseFloat(cost) || 0
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, cost: numericCost } : i)))
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.cost, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createOrder({
        supplierId,
        items,
        total,
        status: "received",
        userId: users[0]?.id || "",
      })
      router.push("/purchases")
    } catch (error) {
      console.error("Failed to create purchase order:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Create Purchase Order</h2>
          <p className="text-muted-foreground">Add a new purchase order from a supplier</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/purchases")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Purchases
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier Selection */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="bg-secondary/10 border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Select Supplier *</Label>
              <Select value={supplierId} onValueChange={setSupplierId} required>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={suppliersLoading ? "Loading suppliers..." : "Choose a supplier"} />
                </SelectTrigger>
                <SelectContent>
                  {suppliers
                    .filter((s) => s.isActive)
                    .map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Add Products */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="bg-secondary/10 border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Products
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Add Products to Order</Label>
                <div className="flex gap-2">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="flex-1 h-10">
                      <SelectValue placeholder={productsLoading ? "Loading products..." : "Select product"} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center justify-between gap-4">
                            <span>{product.name}</span>
                            <span className="text-muted-foreground">
                              {formatCurrency(parseFloat(product.cost) || 0)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={addProduct}
                    disabled={!selectedProductId || productsLoading}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Items Table */}
              {items.length > 0 && (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/5 border-border hover:bg-secondary/5">
                        <TableHead className="text-muted-foreground font-semibold">Product</TableHead>
                        <TableHead className="text-muted-foreground font-semibold text-right">Unit Cost</TableHead>
                        <TableHead className="text-muted-foreground font-semibold text-center">Quantity</TableHead>
                        <TableHead className="text-muted-foreground font-semibold text-right">Subtotal</TableHead>
                        <TableHead className="text-muted-foreground w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.productId} className="border-border hover:bg-secondary/5">
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.01"
                              value={item.cost}
                              onChange={(e) => updateCost(item.productId, e.target.value)}
                              className="h-8 w-24 ml-auto text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 bg-transparent"
                                onClick={() => updateQuantity(item.productId, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-semibold">{item.quantity}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 bg-transparent"
                                onClick={() => updateQuantity(item.productId, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.quantity * item.cost)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {items.length === 0 && (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
                  <div className="text-center text-muted-foreground">
                    <Package className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p className="font-medium">No items added yet</p>
                    <p className="text-sm">Select a product and click Add to get started</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="border-primary/20 bg-primary/5 shadow-lg shadow-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Order Value</p>
                <p className="text-3xl font-black text-primary leading-none mt-2">{formatCurrency(total)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Items: {items.length}</p>
                <p className="text-sm text-muted-foreground">Units: {items.reduce((sum, i) => sum + i.quantity, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/purchases")}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!supplierId || items.length === 0 || isSubmitting}
            className="flex-1 gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Creating Order..." : "Create Purchase Order"}
          </Button>
        </div>
      </form>
    </div>
  )
}
