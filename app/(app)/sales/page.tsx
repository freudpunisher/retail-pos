"use client"

import { ProductGrid } from "@/components/pos/product-grid"
import { CartPanel } from "@/components/pos/cart-panel"

export default function SalesPage() {
  return (
    <div className="flex h-[calc(100vh-10rem)] gap-6">
      <div className="flex-2 flex min-w-0">
        <ProductGrid />
      </div>
      <div className="w-96 shrink-0 ">
        <CartPanel />
      </div>
    </div>
  )
}
