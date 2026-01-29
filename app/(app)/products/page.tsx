"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit2, Trash2, Filter, Loader2, Package } from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import { ProductFormDialog } from "@/components/inventory/product-form-dialog"

export default function ProductManagementPage() {
    const [search, setSearch] = useState("")
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)

    const { products, loading, deleteProduct, createProduct, updateProduct } = useProducts()

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase()),
    )

    const handleEdit = (product: any) => {
        setSelectedProduct(product)
        setIsFormOpen(true)
    }

    const handleAddNew = () => {
        setSelectedProduct(null)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            await deleteProduct(id)
        }
    }

    const handleFormSubmit = async (data: any) => {
        if (selectedProduct) {
            await updateProduct(selectedProduct.id, data)
        } else {
            await createProduct(data)
        }
        setIsFormOpen(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Product Management</h2>
                    <p className="text-muted-foreground">Catalog and stock overview for your store</p>
                </div>
                <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-3 border-b border-border/50">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Product Catalog
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or SKU..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 bg-background/50 border-border/50 focus:ring-primary/20"
                                />
                            </div>
                            <Button variant="outline" size="icon" className="border-border/50">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border/50 bg-secondary/10">
                                    <TableHead className="w-24">SKU</TableHead>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <span className="text-sm text-muted-foreground">Loading products...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                                            No products found matching your search.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <TableRow key={product.id} className="border-border/50 hover:bg-secondary/5 transition-colors">
                                            <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                                            <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal border-border/50 bg-background/50">
                                                    {product.categoryName || "Uncategorized"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">{parseFloat(product.price).toFixed(0)}FBU</TableCell>
                                            <TableCell className="text-right">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${product.stock <= product.minStock ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>
                                                    {product.stock}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {product.stock <= product.minStock ? (
                                                    <Badge className="bg-destructive/20 text-destructive border-destructive/30 animate-pulse">Low Stock</Badge>
                                                ) : (
                                                    <Badge className="bg-accent/20 text-accent border-accent/20">Available</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive text-muted-foreground">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <ProductFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                product={selectedProduct}
                onSubmit={handleFormSubmit}
            />
        </div>
    )
}
