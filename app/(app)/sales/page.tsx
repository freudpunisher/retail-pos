"use client"

import { useState, useMemo } from "react"
import { ProductGrid } from "@/components/pos/product-grid"
import { CartPanel } from "@/components/pos/cart-panel"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useUsers } from "@/hooks/use-users"
import { useTables } from "@/hooks/use-tables"
import { useOrders } from "@/hooks/use-orders"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/hooks/use-settings"
import { toast } from "sonner"
import { Table2, User, Utensils, ShoppingBag } from "lucide-react"
import { printThermal } from "@/lib/thermal-print"

export default function SalesPage() {
  const { user } = useAuth()
  const { settings } = useSettings()
  const { users } = useUsers()
  const { tables } = useTables()
  const { createOrder } = useOrders()
  const { items, selectedClient, total, clearCart } = useCart()

  const [orderMode, setOrderMode] = useState<"dinein" | "takeaway">("dinein")
  const [selectedTableId, setSelectedTableId] = useState<string>("")
  const [selectedWaiterId, setSelectedWaiterId] = useState<string>("")
  const [creating, setCreating] = useState(false)

  const waiters = useMemo(() => users.filter((u) => u.role === "waiter"), [users])
  const freeTables = useMemo(() => tables.filter((t) => t.status === "free"), [tables])

  const handleCreateOrder = async () => {
    if (!user || items.length === 0) return
    setCreating(true)
    try {
      const order = await createOrder({
        items: items.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
        })),
        userId: user.id,
        waiterId: selectedWaiterId || user.id,
        tableId: orderMode === "dinein" ? (selectedTableId || undefined) : undefined,
        clientId: selectedClient?.id,
      })
      clearCart()
      setSelectedTableId("")
      setSelectedWaiterId("")

      // Print bill
      const billItems = items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.price) * item.quantity,
      }))
      printThermal({
        header: {
          name: settings?.name || "SmartPOS",
          address: settings?.address || "",
          phone: settings?.phone || "",
        },
        orderId: order.id,
        date: new Date(),
        waiter: selectedWaiterId ? users.find((u) => u.id === selectedWaiterId)?.name : user.name,
        table: orderMode === "dinein" && selectedTableId
          ? `T${tables.find((t) => t.id === selectedTableId)?.number || ""}`
          : undefined,
        items: billItems,
        total: total,
        currencySymbol: ({ USD: "$", EUR: "€", GBP: "£", FBU: "FBU " } as Record<string, string>)[settings?.currency] || settings?.currencySymbol || "FBU",
      })

      toast.success("Order created! Bill printed.")
    } catch (err: any) {
      toast.error(err.message || "Failed to create order")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["dinein", "takeaway"] as const).map((mode) => (
            <Button
              key={mode}
              variant={orderMode === mode ? "default" : "ghost"}
              size="sm"
              onClick={() => setOrderMode(mode)}
              className="rounded-none"
            >
              {mode === "dinein" && <Utensils className="h-4 w-4 mr-1" />}
              {mode === "takeaway" && <ShoppingBag className="h-4 w-4 mr-1" />}
              {mode === "dinein" ? "Dine-in" : "Takeaway"}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Table2 className="h-4 w-4 text-muted-foreground" />
          {orderMode === "dinein" ? (
            <Select value={selectedTableId} onValueChange={setSelectedTableId}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Table" />
              </SelectTrigger>
              <SelectContent>
                {freeTables.length === 0 ? (
                  <SelectItem value="none" disabled>No free tables</SelectItem>
                ) : (
                  freeTables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>T{t.number} ({t.capacity}p)</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm text-muted-foreground">Takeaway</span>
          )}
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
