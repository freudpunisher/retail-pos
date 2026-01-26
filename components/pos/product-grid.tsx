"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useProducts, useCategories } from "@/hooks/use-products"

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
  const { addItem } = useCart()

  const { products, loading: productsLoading } = useProducts(selectedCategoryId || "all", search)
  const { categories, loading: categoriesLoading } = useCategories()

  const getStockStatus = (product: any) => {
    if (product.stock === 0) return "out"
    if (product.stock <= product.minStock) return "low"
    return "in-stock"
  }

  const handleAddItem = (product: any) => {
    console.log("[v0] Adding product to cart:", product.name, product.id)
    addItem({
      ...product,
      price: Number.parseFloat(product.price),
      cost: Number.parseFloat(product.cost),
      category: product.categoryName || product.category
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            <Button
              variant={selectedCategoryId === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategoryId(null)}
              className="shrink-0"
            >
              All
            </Button>
            {categories.map((category: any) => (
              <Button
                key={category.id}
                variant={selectedCategoryId === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategoryId(category.id)}
                className="shrink-0"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <ScrollArea className="flex-1">
        {productsLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product: any) => {
              const stockStatus = getStockStatus(product)
              const isOutOfStock = stockStatus === "out"
              const IconComponent = getCategoryIcon(product.categoryName || "", product.name)

              return (
                <Card
                  key={product.id}
                  className={cn(
                    "group cursor-pointer border-border bg-card transition-all hover:border-primary/50",
                    isOutOfStock && "opacity-60",
                  )}
                  onClick={() => !isOutOfStock && handleAddItem(product)}
                >
                  <CardContent className="p-3">
                    <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-secondary">
                      <div className="flex h-full items-center justify-center">
                        <IconComponent className="h-12 w-12 text-muted-foreground" />
                      </div>
                      {stockStatus !== "in-stock" && (
                        <Badge
                          className={cn(
                            "absolute right-1 top-1",
                            stockStatus === "out" ? "bg-destructive" : "bg-warning",
                          )}
                        >
                          {stockStatus === "out" ? "Out of Stock" : "Low Stock"}
                        </Badge>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <Plus className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-primary">{formatCurrency(Number.parseFloat(product.price))}</p>
                        <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        {!productsLoading && products.length === 0 && (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <p>No products found</p>
          </div>
        ) as any}
      </ScrollArea>
    </div>
  )
}
