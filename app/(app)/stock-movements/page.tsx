"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, ArrowDownCircle, ArrowUpCircle, RefreshCw, Filter, Loader2, Plus } from "lucide-react"
import { useStockMovements } from "@/hooks/use-stock-movements"
import { useProducts } from "@/hooks/use-products"
import { useUsers } from "@/hooks/use-users"

export default function StockMovementsPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { movements, loading, createMovement } = useStockMovements()
  const { products, loading: productsLoading } = useProducts()
  const { users } = useUsers()

  const [formData, setFormData] = useState({
    productId: "",
    type: "adjustment",
    quantity: "",
    notes: "",
    userId: "",
  })

  // Set default user if available
  useEffect(() => {
    if (users.length > 0 && !formData.userId) {
      setFormData((prev) => ({ ...prev, userId: users[0].id }))
    }
  }, [users, formData.userId])

  const filteredMovements = useMemo(() => {
    return movements.filter((movement: any) => {
      const productName = movement.productName || movement.product?.name || ""
      const matchesSearch = productName.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === "all" || movement.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [movements, search, typeFilter])

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createMovement({
        ...formData,
        quantity: parseInt(formData.quantity),
      })
      setShowAddModal(false)
      setFormData({
        productId: "",
        type: "adjustment",
        quantity: "",
        notes: "",
        userId: users[0]?.id || "",
      })
    } catch (error) {
      console.error("Failed to add movement:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <ArrowDownCircle className="h-4 w-4 text-accent" />
      case "sale":
        return <ArrowUpCircle className="h-4 w-4 text-destructive" />
      case "adjustment":
        return <RefreshCw className="h-4 w-4 text-warning" />
      default:
        return null
    }
  }

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "purchase":
        return <Badge className="bg-accent/20 text-accent">Purchase</Badge>
      case "sale":
        return <Badge className="bg-primary/20 text-primary">Sale</Badge>
      case "adjustment":
        return <Badge className="bg-warning/20 text-warning">Adjustment</Badge>
      default:
        return null
    }
  }

  const inboundCount = movements.filter((m) => m.quantity > 0).length
  const outboundCount = movements.filter((m) => m.quantity < 0).length
  const adjustmentCount = movements.filter((m) => m.type === "adjustment").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Stock Movements</h2>
          <p className="text-muted-foreground">Track all inventory changes</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Movement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddMovement}>
              <DialogHeader>
                <DialogTitle>Add Stock Movement</DialogTitle>
                <DialogDescription>Manually adjust stock or record a purchase.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(val) => setFormData({ ...formData, productId: val })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} (Stock: {p.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(val) => setFormData({ ...formData, type: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                        <SelectItem value="purchase">Purchase (Inbound)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 10 or -5"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>User</Label>
                  <Select
                    value={formData.userId}
                    onValueChange={(val) => setFormData({ ...formData, userId: val })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    placeholder="Reason for adjustment..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Movement
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inbound</p>
                <p className="text-2xl font-bold text-accent">{loading ? "..." : inboundCount}</p>
              </div>
              <ArrowDownCircle className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outbound</p>
                <p className="text-2xl font-bold text-destructive">{loading ? "..." : outboundCount}</p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Adjustments</p>
                <p className="text-2xl font-bold text-warning">{loading ? "..." : adjustmentCount}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by product name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Movement Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">Sales</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
                <SelectItem value="adjustment">Adjustments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-muted-foreground">ID</TableHead>
                  <TableHead className="text-muted-foreground">Date & Time</TableHead>
                  <TableHead className="text-muted-foreground">Product</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground text-right">Quantity</TableHead>
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Loading movements...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No movements found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((movement: any) => (
                    <TableRow key={movement.id} className="border-border">
                      <TableCell className="font-mono text-xs overflow-hidden text-ellipsis block max-w-[100px]">{movement.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{new Date(movement.date).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(movement.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{movement.productName || movement.product?.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.type)}
                          {getMovementBadge(movement.type)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${movement.quantity > 0 ? "text-accent" : "text-destructive"}`}>
                          {movement.quantity > 0 ? "+" : ""}
                          {movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{movement.user?.name || "Unknown"}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-sm text-muted-foreground">{movement.notes || "-"}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
