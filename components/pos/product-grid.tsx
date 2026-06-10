"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/mock-data"
import { useCart } from "@/lib/cart-context"
import {
  Search,
  Plus,
  Package,
  Headphones,
  Shirt,
  Coffee,
  Home,
  Dumbbell,
  Cable,
  Smartphone,
  Footprints,
  Leaf,
  Lamp,
  FlowerIcon,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useProducts, useCategories } from "@/hooks/use-products"
import { useAuth } from "@/lib/auth-context"

function getCategoryIcon(category: string, productName: string) {
  // Specific product icons
  const nameLower = productName.toLowerCase()
  if (nameLower.includes("headphone")) return Headphones
  if (nameLower.includes("cable")) return Cable
  if (nameLower.includes("phone") || nameLower.includes("case")) return Smartphone
  if (nameLower.includes("shirt")) return Shirt
  if (nameLower.includes("jeans")) return Shirt
  if (nameLower.includes("sneaker") || nameLower.includes("shoe")) return Footprints
  if (nameLower.includes("coffee")) return Coffee
  if (nameLower.includes("tea")) return Leaf
  if (nameLower.includes("lamp")) return Lamp
  if (nameLower.includes("plant") || nameLower.includes("pot")) return FlowerIcon
  if (nameLower.includes("yoga") || nameLower.includes("mat")) return Dumbbell
  if (nameLower.includes("resistance") || nameLower.includes("band")) return Dumbbell

  // Fallback to category icons
  switch (category) {
    case "Electronics":
      return Headphones
    case "Clothing":
      return Shirt
    case "Food & Beverages":
      return Coffee
    case "Home & Garden":
      return Home
    case "Sports":
      return Dumbbell
    default:
      return Package
  }
}

export function ProductGrid() {
  const [search, setSearch] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [posFilter, setPosFilter] = useState<string>("all")
  const { addItem, items, productStockMap, principalStockMap } = useCart()
  const [stockAlert, setStockAlert] = useState<{ product: any; secondary: number; principal: number } | null>(null)

  const { products, loading: productsLoading, refresh } = useProducts(selectedCategoryId || "all", search)
  const { categories, loading: categoriesLoading } = useCategories()

  // Filter: only show drink and food (not ingredients), optionally filter by type
  const posProducts = useMemo(() => {
    return products.filter((p: any) => {
      if (p.productType === "ingredient") return false
      if (posFilter === "all") return true
      return p.productType === posFilter
    })
  }, [products, posFilter])

  const getStockStatus = (product: any, effectiveStock: number) => {
    if (product.productType === "food") return "mto" // made to order
    if (effectiveStock === 0 && product.productType !== "food") return "out"
    if (effectiveStock <= product.minStock) return "low"
    return "in-stock"
  }

  const handleAddItem = (product: any) => {
    const secondaryQty = productStockMap[product.id]
    const principalQty = principalStockMap[product.id]
    const isTracked = product.productType !== "food" && product.trackStock

    if (isTracked && secondaryQty !== undefined && secondaryQty <= 0 && principalQty && principalQty > 0) {
      setStockAlert({ product, secondary: secondaryQty, principal: principalQty })
      return
    }

    addItem({
      ...product,
      price: Number.parseFloat(product.price),
      category: product.categoryName || product.category
    })
  }

  useEffect(() => {
    const onTransactionCompleted = () => {
      refresh()
    }
    window.addEventListener("pos:transaction-completed", onTransactionCompleted)
    return () => window.removeEventListener("pos:transaction-completed", onTransactionCompleted)
  }, [refresh])

  return (
    <div className="flex flex-col overflow-hidden h-full">
      {/* Search and filters - fixed header */}
      <div className="space-y-2 p-3 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-1.5 pb-1">
            <Button
              variant={posFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setPosFilter("all")}
              className="shrink-0 h-7 text-xs"
            >
              All
            </Button>
            <Button
              variant={posFilter === "drink" ? "default" : "outline"}
              size="sm"
              onClick={() => setPosFilter("drink")}
              className="shrink-0 h-7 text-xs"
            >
              Drinks
            </Button>
            <Button
              variant={posFilter === "food" ? "default" : "outline"}
              size="sm"
              onClick={() => setPosFilter("food")}
              className="shrink-0 h-7 text-xs"
            >
              Food
            </Button>
            <div className="w-px bg-border mx-1" />
            <Button
              variant={selectedCategoryId === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategoryId(null)}
              className="shrink-0 h-7 text-xs"
            >
              Categories
            </Button>
            {categories.map((category: any) => (
              <Button
                key={category.id}
                variant={selectedCategoryId === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategoryId(category.id)}
                className="shrink-0 h-7 text-xs"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Product grid - scrollable */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {productsLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
            {posProducts.map((product: any) => {
              const isTracked = product.productType === "food" || product.trackStock
              const effectiveStock = isTracked ? (productStockMap[product.id] ?? 0) : Infinity
              const stockStatus = getStockStatus(product, effectiveStock)
              const isOutOfStock = stockStatus === "out"
              const isMadeToOrder = stockStatus === "mto"
              const IconComponent = getCategoryIcon(product.categoryName || "", product.name)

              const cartQty = items.filter((i) => i.id === product.id).reduce((sum, i) => sum + i.quantity, 0)
              const isCartFull = !isMadeToOrder && cartQty >= effectiveStock

              return (
                <Card
                  key={product.id}
                  className={cn(
                    "group cursor-pointer border-border bg-card transition-all hover:border-primary/50",
                    (isOutOfStock || isCartFull) && "opacity-60",
                  )}
                  onClick={() => !isOutOfStock && !isCartFull && handleAddItem(product)}
                >
                  <CardContent className="p-3">
                    <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-secondary">
                      <div className="flex h-full items-center justify-center">
                        <IconComponent className="h-14 w-14 text-muted-foreground" />
                      </div>
                      {isMadeToOrder ? (
                        <Badge className="absolute right-1 top-1 bg-purple-500/80 text-white border-0 text-xs">
                          MTO
                        </Badge>
                      ) : isCartFull ? (
                        <Badge className="absolute right-1 top-1 bg-destructive text-xs">Max</Badge>
                      ) : stockStatus === "out" ? (
                        <Badge className="absolute right-1 top-1 bg-destructive text-xs">Out</Badge>
                      ) : stockStatus === "low" ? (
                        <Badge className="absolute right-1 top-1 bg-warning text-xs">Low</Badge>
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        {isCartFull || isOutOfStock ? (
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Max</span>
                        ) : (
                          <Plus className="h-10 w-10 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-primary">{formatCurrency(Number.parseFloat(product.price))}</p>
                        <span className="text-xs text-muted-foreground">
                          {isMadeToOrder ? "Made to Order" : !isTracked ? "In Stock" : `${effectiveStock} in stock`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        {!productsLoading && posProducts.length === 0 && (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <p>No products found</p>
          </div>
        ) as any}
      </div>

      {/* Stock Alert Dialog */}
      <Dialog open={!!stockAlert} onOpenChange={(open) => !open && setStockAlert(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-warning">
              <AlertTriangle className="h-5 w-5" />
              Out of Stock in Bar
            </DialogTitle>
            <DialogDescription className="text-sm">
              <strong>{stockAlert?.product.name}</strong> is currently out of stock in the
              secondary location, but there are{" "}
              <span className="font-bold text-accent">{stockAlert?.principal ?? 0}</span> units
              available in the principal warehouse.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-secondary/10 rounded-lg p-4 text-sm space-y-1">
            <p className="font-medium">Recommended:</p>
            <p className="text-muted-foreground">
              Go to <strong>Stock Transfers</strong> to move stock from the warehouse to the bar
              before selling.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setStockAlert(null)}>
              Cancel
            </Button>
            <Button asChild>
              <Link href="/stock/transfers">Go to Transfers</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
