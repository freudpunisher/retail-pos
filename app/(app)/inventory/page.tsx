"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Package, AlertTriangle, Loader2, Clock, ArrowDownCircle, Warehouse } from "lucide-react"
import { useInventory } from "@/hooks/use-inventory"
import { formatCurrency } from "@/lib/mock-data"

export default function InventoryStatusPage() {
  const [search, setSearch] = useState("")
  const { inventoryItems, loading } = useInventory()

  const filteredInventory = useMemo(() => {
    return inventoryItems.filter(item =>
      item.product.name.toLowerCase().includes(search.toLowerCase()) ||
      item.product.sku.toLowerCase().includes(search.toLowerCase())
    )
  }, [inventoryItems, search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Inventory Status</h2>
          <p className="text-muted-foreground">Monitor real-time stock levels and valuation</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Units</p>
                <p className="text-3xl font-black text-foreground mt-1">
                  {inventoryItems.reduce((acc, item) => acc + item.quantityOnHand, 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reserved Units</p>
                <p className="text-3xl font-black text-warning mt-1">
                  {inventoryItems.reduce((acc, item) => acc + item.quantityReserved, 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02]">
          <CardContent className="p-6 border-l-4 border-l-destructive">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Low Stock Alerts</p>
                <p className="text-3xl font-black text-destructive mt-1">
                  {inventoryItems.filter(item => item.quantityOnHand <= item.reorderLevel).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Valuation</p>
                <p className="text-3xl font-black text-accent mt-1">
                  {formatCurrency(inventoryItems.reduce((acc, item) => acc + (item.quantityOnHand * (parseFloat(item.product.cost) || 0)), 0))}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <ArrowDownCircle className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-2xl overflow-hidden">
        <CardHeader className="bg-secondary/5 border-b border-border/50 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-primary" />
              Stock Status Log
            </CardTitle>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter by product name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background/50 border-border/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/10 hover:bg-secondary/10 border-border/50">
                <TableHead className="font-bold">Product</TableHead>
                <TableHead className="font-bold">SKU</TableHead>
                <TableHead className="text-right font-bold">On Hand</TableHead>
                <TableHead className="text-right font-bold">Reserved</TableHead>
                <TableHead className="text-right font-bold">Reorder Level</TableHead>
                <TableHead className="text-right font-bold">Reorder Qty</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Last Counted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">Analyzing inventory...</p>
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredInventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground italic">
                    No inventory records found.
                  </TableCell>
                </TableRow>
              )}
              {filteredInventory.map((item) => (
                <TableRow key={item.id} className="border-border/50 hover:bg-secondary/5 transition-colors group">
                  <TableCell className="font-bold text-foreground group-hover:text-primary transition-colors">{item.product.name}</TableCell>
                  <TableCell className="font-mono text-xs">{item.product.sku}</TableCell>
                  <TableCell className="text-right font-black text-lg">{item.quantityOnHand}</TableCell>
                  <TableCell className="text-right text-muted-foreground font-medium">{item.quantityReserved}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.reorderLevel}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.reorderQuantity}</TableCell>
                  <TableCell>
                    {item.quantityOnHand <= 0 ? (
                      <Badge variant="destructive" className="font-bold shadow-sm">Out of Stock</Badge>
                    ) : item.quantityOnHand <= item.reorderLevel ? (
                      <Badge className="bg-warning text-warning-foreground font-bold shadow-sm ring-1 ring-warning/30">Low Stock</Badge>
                    ) : (
                      <Badge className="bg-accent/20 text-accent font-bold shadow-sm ring-1 ring-accent/30">Healthy</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-muted-foreground">
                    {item.lastCountedDate ? new Date(item.lastCountedDate).toLocaleDateString() : (
                      <span className="flex items-center gap-1 opacity-50">
                        <AlertTriangle className="h-3 w-3" /> Never
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
