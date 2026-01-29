"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePurchases } from "@/hooks/use-purchases"
import { useSuppliers } from "@/hooks/use-suppliers"
import { formatCurrency } from "@/lib/mock-data"
import { SupplierFormDialog } from "@/components/inventory/supplier-form-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Truck, Package, DollarSign, Clock, Building2, Phone, Mail, MapPin, Loader2, AlertCircle, Edit, Power, PowerOff, Plus } from "lucide-react"

export default function PurchasesPage() {
  const router = useRouter()
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  // Supplier Management State
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null)

  const { orders, loading: ordersLoading, error: ordersError } = usePurchases()
  const {
    suppliers,
    loading: suppliersLoading,
    error: suppliersError,
    createSupplier,
    updateSupplier,
    toggleSupplierStatus
  } = useSuppliers()

  const pendingCount = orders.filter((po) => po.status === "pending").length
  const receivedCount = orders.filter((po) => po.status === "received").length
  const totalValue = orders.reduce((sum, po) => sum + (parseFloat(po.total) || 0), 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "received":
        return <Badge className="bg-accent/20 text-accent">Received</Badge>
      case "pending":
        return <Badge className="bg-warning/20 text-warning">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-destructive/20 text-destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleAddSupplier = () => {
    setEditingSupplier(null)
    setIsSupplierDialogOpen(true)
  }

  const handleEditSupplier = (supplier: any) => {
    setEditingSupplier(supplier)
    setIsSupplierDialogOpen(true)
  }

  const handleSupplierSubmit = async (data: any) => {
    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, data)
    } else {
      await createSupplier(data)
    }
  }

  const handleToggleStatus = async (supplier: any) => {
    await toggleSupplierStatus(supplier.id, !supplier.isActive)
  }

  if (ordersLoading || suppliersLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Synchronizing purchase records...</p>
        </div>
      </div>
    )
  }

  if (ordersError || suppliersError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Card className="max-w-md border-destructive/50 bg-destructive/5">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-destructive">System Synchronization Error</h3>
              <p className="text-sm text-muted-foreground">Failed to retrieve purchase or supplier data. Please verify your network connection or contact support.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Purchases</h2>
          <p className="text-muted-foreground">Manage suppliers and purchase orders</p>
        </div>
        <Button onClick={() => router.push("/purchases/create")} className="bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          Create Purchase Order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suppliers</p>
                <p className="text-2xl font-bold">{suppliers.length}</p>
              </div>
              <Truck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-warning">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Received</p>
                <p className="text-2xl font-bold text-accent">{receivedCount}</p>
              </div>
              <Package className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-muted-foreground">Order ID</TableHead>
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Supplier</TableHead>
                      <TableHead className="text-muted-foreground">Items</TableHead>
                      <TableHead className="text-muted-foreground text-right">Total</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      return (
                        <TableRow
                          key={order.id}
                          className="border-border cursor-pointer hover:bg-secondary/50 group"
                          onClick={() => handleOrderClick(order)}
                        >
                          <TableCell className="font-mono text-xs opacity-50 group-hover:opacity-100 transition-opacity">{order.id.substring(0, 8)}...</TableCell>
                          <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-bold text-foreground">{order.supplierName || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium">{order.items.length} items</Badge>
                          </TableCell>
                          <TableCell className="text-right font-black text-primary">{formatCurrency(parseFloat(order.total) || 0)}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddSupplier} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {suppliers.map((supplier) => (
              <Card key={supplier.id} className={`border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all group ${!supplier.isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${supplier.isActive ? 'bg-primary/10 border border-primary/20 group-hover:bg-primary/20' : 'bg-muted border border-border'}`}>
                          <Building2 className={`h-6 w-6 ${supplier.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground">{supplier.name}</h3>
                          <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-50 group-hover:opacity-100 transition-opacity">ID: {supplier.id}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm font-medium">
                        <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                          <Mail className="h-4 w-4 text-primary/50" />
                          <span>{supplier.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                          <Phone className="h-4 w-4 text-primary/50" />
                          <span>{supplier.phone}</span>
                        </div>
                        <div className="flex items-start gap-2 text-muted-foreground hover:text-foreground transition-colors">
                          <MapPin className="h-4 w-4 mt-0.5 text-primary/50" />
                          <span className="leading-tight">{supplier.address}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className={`font-bold ring-1 shadow-sm ${supplier.isActive ? 'bg-accent/10 text-accent ring-accent/30 shadow-accent/10' : 'bg-muted text-muted-foreground ring-border shadow-none'}`}>
                        {supplier.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleEditSupplier(supplier)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${supplier.isActive ? 'text-destructive' : 'text-accent'}`}
                          onClick={() => handleToggleStatus(supplier)}
                        >
                          {supplier.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl" style={{maxWidth:"80vh",}}>
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
            <DialogDescription>Order {selectedOrder?.id}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-secondary/20 p-4 transition-all hover:bg-secondary/30">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Supplier Entity</p>
                  <p className="font-black text-foreground text-lg">{selectedOrder.supplierName}</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/20 p-4 transition-all hover:bg-secondary/30">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Acquisition Date</p>
                  <p className="font-black text-foreground text-lg">{new Date(selectedOrder.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border overflow-hidden shadow-inner bg-background/50">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border bg-secondary/10">
                      <TableHead className="text-foreground font-bold py-4 px-6">Product Details</TableHead>
                      <TableHead className="text-foreground font-bold text-right py-4 px-6">Unit Cost</TableHead>
                      <TableHead className="text-foreground font-bold text-right py-4 px-6">Quantity</TableHead>
                      <TableHead className="text-foreground font-bold text-right py-4 px-6">Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item: any) => (
                      <TableRow key={item.id} className="border-border hover:bg-primary/5 transition-colors">
                        <TableCell className="font-bold py-4 px-6">{item.productName}</TableCell>
                        <TableCell className="text-right py-4 px-6">{formatCurrency(parseFloat(item.cost))}</TableCell>
                        <TableCell className="text-right py-4 px-6 font-mono font-bold text-lg">{item.quantity}</TableCell>
                        <TableCell className="text-right font-black text-primary py-4 px-6">
                          {formatCurrency(item.quantity * parseFloat(item.cost))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between rounded-xl border-2 border-primary/20 bg-primary/5 p-6 shadow-lg shadow-primary/5">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Lifecycle Status</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Gross Purchase Value</p>
                  <p className="text-3xl font-black text-primary leading-none">{formatCurrency(parseFloat(selectedOrder.total))}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <SupplierFormDialog
        supplier={editingSupplier}
        open={isSupplierDialogOpen}
        onOpenChange={setIsSupplierDialogOpen}
        onSubmit={handleSupplierSubmit}
      />
    </div>
  )
}
