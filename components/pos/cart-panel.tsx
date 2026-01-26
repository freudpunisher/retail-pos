"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/mock-data"
import { Minus, Plus, Trash2, ShoppingCart, User, Receipt, CreditCard, Banknote, X, Loader2 } from "lucide-react"
import { useClients } from "@/hooks/use-clients"
import { useTransactions } from "@/hooks/use-transactions"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export function CartPanel() {
  const {
    items,
    selectedClient,
    setSelectedClient,
    updateQuantity,
    updateDiscount,
    removeItem,
    clearCart,
    subtotal,
    discount,
    tax,
    total,
    taxRate,
  } = useCart()

  const { user } = useAuth()
  const { clients, loading: clientsLoading } = useClients()
  const { processTransaction, loading: processing } = useTransactions()

  const [showCheckout, setShowCheckout] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit" | "card">("cash")
  const [lastTransactionId, setLastTransactionId] = useState<string | null>(null)

  const isCreditExceeded = !!(selectedClient && paymentMethod === "credit" &&
    (Number.parseFloat(String(selectedClient.creditBalance)) + total > Number.parseFloat(String(selectedClient.creditLimit))))

  const handleCheckout = async () => {
    if (!user) {
      toast.error("You must be logged in to complete a sale")
      return
    }

    try {
      const transactionData = {
        type: "sale",
        total,
        paymentMethod,
        clientId: selectedClient?.id,
        userId: user.id || "00000000-0000-0000-0000-000000000001", // Use current user ID or admin fallback
        items: items.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount
        }))
      }

      const result = await processTransaction(transactionData)
      setLastTransactionId(result.id)
      setShowReceipt(true)
      setShowCheckout(false)
      toast.success("Transaction completed successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to process transaction")
    }
  }

  const handleComplete = () => {
    setShowReceipt(false)
    clearCart()
    setLastTransactionId(null)
  }

  return (
    <>
      <Card className="flex h-full flex-col border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart
              {items.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </CardTitle>
            {items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Select
            value={selectedClient?.id || "default"}
            onValueChange={(value) => {
              const client = clients.find((c: any) => c.id === value)
              setSelectedClient(client || null)
            }}
            disabled={clientsLoading}
          >
            <SelectTrigger className="mt-2">
              <User className="mr-2 h-4 w-4" />
              <SelectValue placeholder={clientsLoading ? "Loading clients..." : "Walk-in Customer"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Walk-in Customer</SelectItem>
              {clients.map((client: any) => (
                <SelectItem key={client.id} value={client.id}>
                  <div className="flex items-center justify-between gap-4">
                    <span>{client.name}</span>
                    {Number.parseFloat(client.creditBalance) > 0 && (
                      <Badge variant="outline" className="text-warning">
                        {formatCurrency(Number.parseFloat(client.creditBalance))} credit
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-4">
            {items.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
                <ShoppingCart className="mb-2 h-12 w-12 opacity-50" />
                <p>Cart is empty</p>
                <p className="text-sm">Add products to get started</p>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border bg-secondary/30 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.sku}</p>
                        <p className="mt-1 font-semibold text-primary">{formatCurrency(item.price)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Disc:</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discount}
                          onChange={(e) => updateDiscount(item.id, Number.parseFloat(e.target.value) || 0)}
                          className="h-7 w-16 text-right text-xs"
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Line total:</span>
                      <span className="font-medium">
                        {formatCurrency(item.price * item.quantity - item.discount * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <CardFooter className="flex-col gap-3 border-t border-border pt-4">
          <div className="w-full space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-destructive">
              <span>Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax ({taxRate}%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2">
            <Button variant="outline" disabled={items.length === 0} onClick={() => { setPaymentMethod("credit"); setShowCheckout(true); }}>
              <CreditCard className="mr-2 h-4 w-4" />
              Credit
            </Button>
            <Button disabled={items.length === 0} onClick={() => { setPaymentMethod("cash"); setShowCheckout(true); }}>
              <Banknote className="mr-2 h-4 w-4" />
              Cash
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>Complete the transaction</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {(["cash", "card", "credit"] as const).map((method) => (
                  <Button
                    key={method}
                    variant={paymentMethod === method ? "default" : "outline"}
                    onClick={() => setPaymentMethod(method)}
                    className="capitalize"
                    disabled={method === "credit" && !selectedClient}
                  >
                    {method === "cash" && <Banknote className="mr-2 h-4 w-4" />}
                    {method === "card" && <CreditCard className="mr-2 h-4 w-4" />}
                    {method === "credit" && <User className="mr-2 h-4 w-4" />}
                    {method}
                  </Button>
                ))}
              </div>
              {paymentMethod === "credit" && !selectedClient && (
                <p className="text-xs text-destructive">Select a client to use credit payment</p>
              )}
            </div>

            {selectedClient && paymentMethod === "credit" && (
              <div className={`rounded-lg border p-3 ${isCreditExceeded ? 'border-destructive bg-destructive/10' : 'border-warning/50 bg-warning/10'}`}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">Client: {selectedClient.name}</p>
                  {isCreditExceeded && <Badge variant="destructive">Limit Exceeded</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Current Balance: {formatCurrency(Number.parseFloat(String(selectedClient.creditBalance)))}
                </p>
                <p className="text-sm text-muted-foreground">
                  Credit Limit: {formatCurrency(Number.parseFloat(String(selectedClient.creditLimit)))}
                </p>
                {isCreditExceeded && (
                  <p className="text-xs font-bold text-destructive mt-2 flex items-center gap-1">
                    <Trash2 className="h-3 w-3" /> Sale exceeds available credit!
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={processing || (paymentMethod === "credit" && isCreditExceeded)}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreditExceeded ? "Credit Limit Exceeded" : "Complete Sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Receipt
            </DialogTitle>
          </DialogHeader>

          <div className="rounded-lg border border-border bg-card p-4 font-mono text-sm">
            <div className="text-center mb-4">
              <p className="text-lg font-bold">SmartPOS Store</p>
              <p className="text-xs text-muted-foreground">123 Main Street, Downtown</p>
              <p className="text-xs text-muted-foreground">Tel: +1 555-0000</p>
            </div>

            <Separator className="my-3" />

            <div className="space-y-1 mb-4">
              <p className="text-xs">
                Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </p>
              <p className="text-xs">Transaction: {lastTransactionId || "N/A"}</p>
              {selectedClient && <p className="text-xs">Client: {selectedClient.name}</p>}
              <p className="text-xs">Payment: {paymentMethod.toUpperCase()}</p>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Tax ({taxRate}%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>TOTAL</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Separator className="my-3" />

            <p className="text-center text-xs text-muted-foreground">Thank you for your purchase!</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleComplete}>
              New Sale
            </Button>
            <Button onClick={handleComplete}>
              <Receipt className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
