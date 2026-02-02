"use client"
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
import { Truck, Package, DollarSign, Clock, Building2, Phone, Mail, MapPin, Loader2, AlertCircle, Plus, PowerOff, Power, Edit } from "lucide-react"
import { useState } from "react"

export default function PurchasesPage() {
  const router = useRouter()

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
        return <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">Received</Badge>
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
          <p className="text-muted-foreground">Loading purchase & supplier data...</p>
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
              <h3 className="text-lg font-bold text-destructive">Data Load Error</h3>
              <p className="text-sm text-muted-foreground">
                Could not load purchases or suppliers. Check connection or contact support.
              </p>
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
  <Button 
    onClick={() => router.push("/purchases/create")}
    className="gap-2 bg-primary hover:bg-primary/90"
  >
    <Plus className="h-4 w-4" />
    Create Purchase Order
  </Button>
</div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suppliers</p>
                <p className="text-2xl font-bold">{suppliers.length}</p>
              </div>
              <Truck className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Received</p>
                <p className="text-2xl font-bold text-emerald-600">{receivedCount}</p>
              </div>
              <Package className="h-8 w-8 text-emerald-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.push(`/purchases/${order.id}`)}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {order.id.slice(0, 8)}…
                        </TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{order.supplierName || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.items?.length || 0} items</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(parseFloat(order.total) || 0)}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddSupplier} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <Card
                key={supplier.id}
                className={`transition-all ${!supplier.isActive ? "opacity-60 grayscale" : "hover:shadow-md"}`}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            supplier.isActive ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          <Building2
                            className={`h-6 w-6 ${supplier.isActive ? "text-primary" : "text-muted-foreground"}`}
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{supplier.name}</h3>
                          <p className="text-xs text-muted-foreground font-mono">ID: {supplier.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" /> {supplier.email || "—"}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" /> {supplier.phone || "—"}
                        </div>
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-0.5" /> {supplier.address || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <Badge
                        variant="outline"
                        className={`font-medium ${
                          supplier.isActive
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-gray-100 text-gray-600 border-gray-300"
                        }`}
                      >
                        {supplier.isActive ? "Active" : "Inactive"}
                      </Badge>

                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditSupplier(supplier)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(supplier)}
                          className={supplier.isActive ? "text-red-600" : "text-emerald-600"}
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

      <SupplierFormDialog
        supplier={editingSupplier}
        open={isSupplierDialogOpen}
        onOpenChange={setIsSupplierDialogOpen}
        onSubmit={handleSupplierSubmit}
      />
    </div>
  )
}