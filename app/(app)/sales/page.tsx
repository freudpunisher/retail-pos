"use client"

import { useState, useMemo } from "react"
import { ProductGrid } from "@/components/pos/product-grid"
import { CartPanel } from "@/components/pos/cart-panel"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUsers } from "@/hooks/use-users"
import { useTables } from "@/hooks/use-tables"
import { useOrders } from "@/hooks/use-orders"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { Table2, User, Utensils, ShoppingBag, Loader2 } from "lucide-react"

export default function SalesPage() {
  const { user } = useAuth()
  const { users } = useUsers()
  const { tables } = useTables()
  const { createOrder } = useOrders()
  const { items, selectedClient, setSelectedClient, subtotal, discount, tax, total, clearCart } = useCart()

  const [orderMode, setOrderMode] = useState<"quick" | "dinein" | "takeaway">("quick")
  const [selectedTableId, setSelectedTableId] = useState<string>("")
  const [selectedWaiterId, setSelectedWaiterId] = useState<string>("")
  const [creating, setCreating] = useState(false)

  const waiters = useMemo(() => users.filter((u) => u.role === "waiter"), [users])
  const freeTables = useMemo(() => tables.filter((t) => t.status === "free"), [tables])

  const handleCreateOrder = async () => {
    if (!user || items.length === 0) return
    setCreating(true)
    try {
      await createOrder({
        items: items.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
        })),
        userId: user.id,
        waiterId: selectedWaiterId || user.id,
        tableId: orderMode === "dinein" ? selectedTableId : undefined,
        clientId: selectedClient?.id,
      })
      toast.success("Order created!")
      clearCart()
      setSelectedTableId("")
      setSelectedWaiterId("")
    } catch (err: any) {
      toast.error(err.message || "Failed to create order")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Order Mode Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["quick", "dinein", "takeaway"] as const).map((mode) => (
            <Button
              key={mode}
              variant={orderMode === mode ? "default" : "ghost"}
              size="sm"
              onClick={() => setOrderMode(mode)}
              className="rounded-none"
            >
              {mode === "quick" && <ShoppingBag className="h-4 w-4 mr-1" />}
              {mode === "dinein" && <Utensils className="h-4 w-4 mr-1" />}
              {mode === "takeaway" && <ShoppingBag className="h-4 w-4 mr-1" />}
              {mode === "quick" ? "Quick Sale" : mode === "dinein" ? "Dine-in" : "Takeaway"}
            </Button>
          ))}
        </div>

        {orderMode !== "quick" && (
          <>
            <div className="flex items-center gap-2">
              <Table2 className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={orderMode === "dinein" ? "Table" : "No table"} />
                </SelectTrigger>
                <SelectContent>
                  {orderMode === "dinein" ? (
                    freeTables.length === 0 ? (
                      <SelectItem value="" disabled>No free tables</SelectItem>
                    ) : (
                      freeTables.map((t) => (
                        <SelectItem key={t.id} value={t.id}>T{t.number} ({t.capacity}p)</SelectItem>
                      ))
                    )
                  ) : (
                    <SelectItem value="">No table</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedWaiterId} onValueChange={setSelectedWaiterId}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Waiter" />
                </SelectTrigger>
                <SelectContent>
                  {waiters.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-10 gap-6 items-start">
        <div className="col-span-6 flex min-w-0 flex-col">
          <ProductGrid />
        </div>
        <div className="col-span-4 flex flex-col overflow-hidden sticky top-0 h-[calc(80vh-6rem)]">
          <CartPanel
            orderMode={orderMode}
            onCreateOrder={handleCreateOrder}
            creatingOrder={creating}
          />
        </div>
      </div>
    </div>
  )
}
