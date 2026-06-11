"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Package, AlertTriangle, Loader2, Clock, ArrowDownCircle, Warehouse, Store, Save } from "lucide-react"
import { useStock } from "@/hooks/use-stock"
import { useLocations } from "@/hooks/use-locations"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InventoryStatusPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [productType, setProductType] = useState<string>("all")
  const { stockItems, adjustments, loading, createAdjustment } = useStock()
  const { locations } = useLocations()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [inventoryForm, setInventoryForm] = useState({ productId: "", physicalQuantity: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isBakeryUser = (user?.role as string) === "cashier_bakery" || (user?.role as string) === "supervisor_bakery" || user?.role === "admin"

  const filteredByLocation = useMemo(() => {
    let items = stockItems
    if (productType === "drink") {
      items = items.filter(item => item.product.productType === "drink")
    } else if (productType === "ingredient") {
      items = items.filter(item => item.product.productType === "ingredient")
    }
    if (selectedLocationId) {
      items = items.filter(item => item.locationId === selectedLocationId)
    }
    return items
  }, [stockItems, selectedLocationId, productType])

  const filteredInventory = useMemo(() => {
    return filteredByLocation.filter(item =>
      item.product.name.toLowerCase().includes(search.toLowerCase()) ||
      item.product.sku.toLowerCase().includes(search.toLowerCase())
    )
  }, [filteredByLocation, search])

  const selectedLocation = locations.find(l => l.id === selectedLocationId)
  const locationLabel = selectedLocation
    ? `${selectedLocation.name} (${selectedLocation.type})`
    : "All Locations"

  const bakeryProducts = useMemo(() => {
    return stockItems.filter(item =>
      String(item.product.sector || "").toLowerCase() === "boulangerie"
    )
  }, [stockItems])

  const selectedStockItem = useMemo(() => {
    return stockItems.find(item => item.productId === inventoryForm.productId)
  }, [stockItems, inventoryForm.productId])

  const physicalQtyNum = parseFloat(inventoryForm.physicalQuantity) || 0
  const logicalQty = selectedStockItem ? parseFloat(selectedStockItem.quantityOnHand) : 0
  const variance = physicalQtyNum - logicalQty
  const loss = variance < 0 ? Math.abs(variance) : 0

  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedInventory = filteredInventory.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handlePageSizeChange = (value: string) => {
    const nextSize = Number(value)
    setPageSize(nextSize)
    setPage(1)
  }

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inventoryForm.productId || inventoryForm.physicalQuantity === "") {
      toast.error("Veuillez sélectionner un produit et saisir une quantité physique")
      return
    }

    setIsSubmitting(true)
    try {
      await createAdjustment({
        productId: inventoryForm.productId,
        productName: selectedStockItem?.product.name,
        quantityChange: variance,
        adjustmentType: "stock_count",
        reason: "Inventaire physique",
        notes: `Ajustement d'inventaire - Stock avant: ${logicalQty}, Stock après: ${physicalQtyNum}`,
        userId: user?.id
      })
      toast.success("Inventaire enregistré et stock mis à jour")
      setInventoryForm({ productId: "", physicalQuantity: "" })
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'enregistrement de l'inventaire")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Stock Status</h2>
          <p className="text-muted-foreground">Monitor real-time stock levels across locations</p>
        </div>
      </div>

      {/* Location filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!selectedLocationId ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedLocationId(null)}
        >
          <Warehouse className="h-4 w-4 mr-1" />
          All Locations
        </Button>
        {locations.map((loc) => (
          <Button
            key={loc.id}
            variant={selectedLocationId === loc.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedLocationId(loc.id)}
          >
            {loc.type === "principal" ? (
              <Warehouse className="h-4 w-4 mr-1" />
            ) : (
              <Store className="h-4 w-4 mr-1" />
            )}
            {loc.name}
          </Button>
        ))}
      </div>

      {/* Product type filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={productType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setProductType("all")}
        >
          All
        </Button>
        <Button
          variant={productType === "drink" ? "default" : "outline"}
          size="sm"
          onClick={() => setProductType("drink")}
        >
          <Package className="h-4 w-4 mr-1" />
          Drinks
        </Button>
        <Button
          variant={productType === "ingredient" ? "default" : "outline"}
          size="sm"
          onClick={() => setProductType("ingredient")}
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          Ingredients
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unités totales</p>
                <p className="text-3xl font-black text-foreground mt-1">
                  {filteredByLocation.reduce((acc, item) => acc + item.quantityOnHand, 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unités réservées</p>
                <p className="text-3xl font-black text-warning mt-1">
                  {filteredByLocation.reduce((acc, item) => acc + item.quantityReserved, 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02]">
          <CardContent className="p-6 border-l-4 border-l-destructive">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alertes stock bas</p>
                <p className="text-3xl font-black text-destructive mt-1">
                  {filteredByLocation.filter(item => item.quantityOnHand <= item.reorderLevel).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Products</p>
                <p className="text-3xl font-black text-accent mt-1">
                  {new Set(filteredByLocation.map(i => i.product.id)).size}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <ArrowDownCircle className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isBakeryUser && (
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="pb-3 bg-secondary/5 border-b border-border/50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-primary" />
              {locationLabel}
            </CardTitle>
            <CardDescription>
              Saisissez la quantité physique pour mettre à jour le stock
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleInventorySubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="product">Produit</Label>
                <Select
                  value={inventoryForm.productId}
                  onValueChange={(val) => setInventoryForm({ ...inventoryForm, productId: val })}
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Sélectionner un produit de boulangerie" />
                  </SelectTrigger>
                  <SelectContent>
                    {bakeryProducts.map((item) => (
                      <SelectItem key={item.productId} value={item.productId}>
                        {item.product.name} - {item.product.sku}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantité physique</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="0.001"
                  placeholder="0.000"
                  value={inventoryForm.physicalQuantity}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, physicalQuantity: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={isSubmitting || !inventoryForm.productId} className="w-full">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Mettre à jour le stock
              </Button>
            </form>

            {selectedStockItem && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-secondary/10 border border-border/50">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Stock logique</p>
                  <p className="text-xl font-bold">{logicalQty.toFixed(3)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Différence</p>
                  <p className={`text-xl font-bold ${variance < 0 ? 'text-destructive' : variance > 0 ? 'text-accent' : ''}`}>
                    {variance > 0 ? '+' : ''}{variance.toFixed(3)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Perte</p>
                  <p className="text-xl font-bold text-destructive">{loss.toFixed(3)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="journal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[420px] mb-6">
          <TabsTrigger value="journal">Journal d'état des stocks</TabsTrigger>
          <TabsTrigger value="history">Historique des inventaires</TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="mt-0 space-y-4">
          <Card className="border-border/50 shadow-2xl overflow-hidden w-full">
            <CardHeader className="bg-secondary/5 border-b border-border/50 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Warehouse className="h-5 w-5 text-primary" />
                  Journal d'état des stocks
                </CardTitle>
                <CardDescription>
                  Consultez les niveaux de stock actuels et les seuils d'alerte
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par produit ou SKU..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-[110px] h-9">
                    <SelectValue placeholder="Lignes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 lignes</SelectItem>
                    <SelectItem value="20">20 lignes</SelectItem>
                    <SelectItem value="50">50 lignes</SelectItem>
                    <SelectItem value="100">100 lignes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/10 hover:bg-secondary/10 border-border/50">
                    <TableHead className="font-bold">Product</TableHead>
                    <TableHead className="font-bold">SKU</TableHead>
                    <TableHead className="font-bold">Location</TableHead>
                    <TableHead className="text-right font-bold">On Hand</TableHead>
                    <TableHead className="text-right font-bold">Reserved</TableHead>
                    <TableHead className="text-right font-bold">Reorder Level</TableHead>
                    <TableHead className="text-right font-bold">Reorder Qty</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Last Counted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-sm text-muted-foreground">Analyzing inventory...</p>
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredInventory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground italic">
                        No inventory records found.
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && paginatedInventory.map((item) => (
                    <TableRow key={item.id} className="border-border/50 hover:bg-secondary/5 transition-colors group">
                      <TableCell className="font-bold text-foreground group-hover:text-primary transition-colors">{item.product.name}</TableCell>
                      <TableCell className="font-mono text-xs">{item.product.sku}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {item.location?.type === "principal" ? (
                            <Warehouse className="h-3 w-3" />
                          ) : (
                            <Store className="h-3 w-3" />
                          )}
                          {item.location?.name || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-black text-lg">{item.quantityOnHand}</TableCell>
                      <TableCell className="text-right text-muted-foreground font-medium">{item.quantityReserved}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{item.reorderLevel}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{item.reorderQuantity}</TableCell>
                      <TableCell>
                        {item.quantityOnHand <= 0 ? (
                          <Badge variant="destructive" className="font-bold shadow-sm">Out of Stock</Badge>
                        ) : item.quantityOnHand <= item.reorderLevel ? (
                          <Badge className="bg-warning text-warning-foreground font-bold shadow-sm ring-1 ring-warning/30">Low Stock</Badge>
                        ) : (
                          <Badge className="bg-accent/20 text-accent font-bold shadow-sm ring-1 ring-accent/30">Healthy</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground">
                        {item.lastCountedDate ? new Date(item.lastCountedDate).toLocaleDateString() : (
                          <span className="flex items-center gap-1 opacity-50">
                            <AlertTriangle className="h-3 w-3" /> Never
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Affichage de {(currentPage - 1) * pageSize + 1} à {Math.min(currentPage * pageSize, filteredInventory.length)} sur {filteredInventory.length} produits
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card className="border-border/50 shadow-2xl overflow-hidden w-full">
            <CardHeader className="bg-secondary/5 border-b border-border/50 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Historique des inventaires
              </CardTitle>
              <CardDescription>
                Derniers ajustements de stock enregistrés par inventaire physique
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/10 hover:bg-secondary/10 border-border/50">
                    <TableHead className="font-bold">Product</TableHead>
                    <TableHead className="text-right font-bold">Avant</TableHead>
                    <TableHead className="text-right font-bold">Après</TableHead>
                    <TableHead className="text-right font-bold text-destructive">Perte</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && (adjustments || []).filter(a => a.reason === "Inventaire physique").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                        Aucun inventaire effectué.
                      </TableCell>
                    </TableRow>
                  )}
                  {(adjustments || [])
                    .filter(a => a.reason === "Inventaire physique")
                    .map((adj) => {
                      const notesMatch = adj.notes?.match(/Stock avant: ([\d.]+), Stock après: ([\d.]+)/);
                      const before = notesMatch ? parseFloat(notesMatch[1]) : (adj.adjustmentType === 'addition' ? 0 : Math.abs(adj.quantityChange));
                      const after = notesMatch ? parseFloat(notesMatch[2]) : (adj.adjustmentType === 'addition' ? adj.quantityChange : 0);
                      const diff = after - before;
                      const itemLoss = diff < 0 ? Math.abs(diff) : 0;

                      return (
                        <TableRow key={adj.id} className="border-border/50 hover:bg-secondary/5 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{adj.product?.name || adj.productName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{before.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-bold">{after.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-destructive font-bold">{itemLoss.toFixed(2)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(adj.createdDate).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
