"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useSuppliers } from "@/hooks/use-suppliers"
import { useProducts } from "@/hooks/use-products"
import { usePurchases } from "@/hooks/use-purchases"
import { formatCurrency } from "@/lib/mock-data"
import { Plus, Trash2, Package, Loader2, ArrowLeft, ShoppingCart } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface POItem {
  productId: string
  productName: string
  productType: string
  quantity: number
  cost: number
  boxes: number
  quantityPerBox: number
}

export default function CreatePurchaseOrderPage() {
  const router = useRouter()
  const [sector, setSector] = useState("Alimentation")
  const [supplierId, setSupplierId] = useState("")
  const [items, setItems] = useState<POItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { suppliers, loading: suppliersLoading } = useSuppliers()
  const { products, loading: productsLoading } = useProducts()
  const { createOrder } = usePurchases()

  const purchasableProducts = products.filter(
    (p) => p.sector === sector && p.trackStock
  )

  const addProduct = () => {
    if (!selectedProductId) return
    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    const isDrink = product.productType === "drink"
    const existing = items.find((i) => i.productId === selectedProductId)
    if (existing) {
      setItems((prev) =>
        prev.map((i) => {
          if (i.productId === selectedProductId) {
            if (isDrink) {
              const nextBoxes = i.boxes + 1
              return { ...i, boxes: nextBoxes, quantity: nextBoxes * i.quantityPerBox }
            }
            return { ...i, quantity: i.quantity + 1 }
          }
          return i
        })
      )
    } else {
      const qpb = product.quantityPerBox || 1
      setItems((prev) => [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          productType: product.productType,
          boxes: isDrink ? 1 : 0,
          quantityPerBox: qpb,
          quantity: isDrink ? qpb : 1,
          cost: 0,
        },
      ])
    }
    setSelectedProductId("")
  }

  // Drink: update by number of boxes
  const updateBoxes = (productId: string, newBoxes: number) => {
    const bxs = Math.max(0, newBoxes)
    if (bxs === 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId))
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId
            ? { ...i, boxes: bxs, quantity: bxs * i.quantityPerBox }
            : i
        )
      )
    }
  }

  // Non-drink: update direct unit quantity
  const updateQuantity = (productId: string, newQty: number) => {
    const qty = Math.max(0, newQty)
    if (qty === 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
      )
    }
  }

  const updateUnitCost = (productId: string, cost: string) => {
    const numeric = parseFloat(cost) || 0
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, cost: numeric } : i)))
  }

  const updateBoxCost = (productId: string, boxCost: string) => {
    const numericBoxCost = parseFloat(boxCost) || 0
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId) {
          const qpb = i.quantityPerBox || 1
          return { ...i, cost: numericBoxCost / qpb }
        }
        return i
      })
    )
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.cost, 0)
  const totalUnits = items.reduce((sum, i) => sum + Number(i.quantity || 0), 0)
  const totalBoxes = items.filter(i => i.productType === "drink").reduce((sum, i) => sum + Number(i.boxes || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createOrder({ supplierId, items, total, sector })
      toast({ title: "Commande créée", description: "Nouveau bon de commande sauvegardé comme en attente." })
      router.push("/purchases")
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur", description: err.message || "Impossible de créer la commande" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Créer un bon de commande</h2>
          <p className="text-muted-foreground">Sera sauvegardé comme en attente jusqu'à réception</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/purchases")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total</p>
                <p className="text-4xl font-black text-primary">{formatCurrency(total)}</p>
              </div>
              <div className="text-right space-y-1">
                <p><span className="font-bold text-lg">{items.length}</span> produits</p>
                <p><span className="font-bold text-lg">{totalBoxes}</span> caisses / <span className="font-bold text-lg">{totalUnits}</span> unités</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Informations de commande
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-base">Fournisseur *</Label>
                <Select value={supplierId} onValueChange={setSupplierId} required>
                  <SelectTrigger>
                    <SelectValue placeholder={suppliersLoading ? "Chargement..." : "Sélectionner un fournisseur"} />
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector" className="text-base">Secteur *</Label>
                <Select value={sector} onValueChange={setSector} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alimentation">Alimentation</SelectItem>
                    <SelectItem value="Bar">Bar</SelectItem>
                    <SelectItem value="Cuisine">Cuisine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Articles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="product">Ajouter un produit</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder={productsLoading ? "Chargement..." : "Choisir un produit"} />
                  </SelectTrigger>
                  <SelectContent>
                    {purchasableProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                onClick={addProduct}
                disabled={!selectedProductId || productsLoading}
                className="mt-8 sm:mt-0 self-end"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>

            {items.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-right w-44">Coût</TableHead>
                      <TableHead className="text-center w-56">Quantité</TableHead>
                      <TableHead className="text-right w-32">Sous-total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const isDrink = item.productType === "drink"
                      return (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col gap-0.5">
                              <span>{item.productName}</span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                {item.productType}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {isDrink ? (
                              <div className="flex flex-col gap-1 items-end">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">Unité :</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.cost}
                                    onChange={(e) => updateUnitCost(item.productId, e.target.value)}
                                    className="w-24 text-right h-8"
                                  />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">Caisse :</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={(item.cost * item.quantityPerBox).toFixed(2)}
                                    onChange={(e) => updateBoxCost(item.productId, e.target.value)}
                                    className="w-24 text-right h-8"
                                  />
                                </div>
                              </div>
                            ) : (
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.cost}
                                onChange={(e) => updateUnitCost(item.productId, e.target.value)}
                                className="w-24 text-right h-8"
                              />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {isDrink ? (
                              <div className="flex flex-col gap-1 items-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={item.boxes}
                                    onChange={(e) => updateBoxes(item.productId, Number(e.target.value))}
                                    className="w-20 text-center h-8"
                                  />
                                  <span className="text-sm font-medium">Caisses</span>
                                </div>
                                <div className="text-xs text-muted-foreground flex gap-1.5 items-center mt-0.5">
                                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                                    {item.quantityPerBox} unités/caisse
                                  </Badge>
                                  <span>=</span>
                                  <span className="font-semibold text-foreground">{item.quantity} total unités</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                                  className="w-20 text-center h-8"
                                />
                                <span className="text-sm font-medium text-muted-foreground">unités</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.quantity * item.cost)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive/90"
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-lg text-muted-foreground">
                <Package className="h-10 w-10 mb-3 opacity-50" />
                <p className="font-medium">Aucun article ajouté</p>
                <p className="text-sm">Sélectionnez un produit et cliquez sur Ajouter</p>
              </div>
            )}
          </CardContent>
        </Card>

       <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push("/purchases")} className="flex-1">
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !supplierId || items.length === 0}
            className="flex-1 gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Créer la commande en attente
          </Button>
        </div>
      </form>
    </div>
  )
}
