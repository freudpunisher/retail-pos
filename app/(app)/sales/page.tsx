"use client"

import { ProductGrid } from "@/components/pos/product-grid"
import { CartPanel } from "@/components/pos/cart-panel"

export default function SalesPage() {
  return (
    <div className="grid grid-cols-10 gap-6 items-start">
      <div className="col-span-6 flex min-w-0 flex-col">
        <ProductGrid />
      </div>
      <div className="col-span-4 flex flex-col overflow-hidden sticky top-0 h-[calc(80vh-6rem)]">
        <CartPanel />
      </div>
    </div>
  )
}
