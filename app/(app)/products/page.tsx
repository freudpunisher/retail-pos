"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
<<<<<<< HEAD
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit2, Trash2, Loader2, Package } from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import { ProductFormDialog } from "@/components/inventory/product-form-dialog"
import { useAuth } from "@/lib/auth-context"

export default function ProductManagementPage() {
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
=======
import { Search, Plus, Edit2, Trash2, Loader2, Package, Beer, Utensils, Wheat } from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import { ProductFormDialog } from "@/components/inventory/product-form-dialog"
import { formatCurrency } from "@/lib/mock-data"

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
    drink: { label: "Drink", icon: Beer, color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" },
    food: { label: "Food", icon: Utensils, color: "bg-amber-500/20 text-amber-700 dark:text-amber-400" },
    ingredient: { label: "Ingredient", icon: Wheat, color: "bg-green-500/20 text-green-700 dark:text-green-400" },
}

export default function ProductManagementPage() {
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState<string>("all")
>>>>>>> origin/alimentation
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)

    const { products, loading, deleteProduct, createProduct, updateProduct } = useProducts()
    const { user } = useAuth()
    const canEdit = user?.role === "admin"
    const roleSector =
        user?.role === "cashier_bakery" || user?.role === "supervisor_bakery" || user?.role === "production_bakery"
            ? "Boulangerie"
            : user?.role === "cashier_food" || user?.role === "supervisor_food"
            ? "Alimentation"
            : null

<<<<<<< HEAD
    const filteredProducts = products
        .filter((product) => (roleSector ? product.sector === roleSector : true))
        .filter((product) =>
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.sku.toLowerCase().includes(search.toLowerCase()),
        )
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
    const currentPage = Math.min(page, totalPages)
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const handleSearchChange = (value: string) => {
        setSearch(value)
        setPage(1)
    }

    const handlePageSizeChange = (value: string) => {
        const nextSize = Number(value)
        setPageSize(nextSize)
        setPage(1)
    }
=======
    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.sku.toLowerCase().includes(search.toLowerCase())
        const matchesType = typeFilter === "all" || product.productType === typeFilter
        return matchesSearch && matchesType
    })
>>>>>>> origin/alimentation

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

    const typeFilters = [
        { key: "all", label: "All", icon: Package },
        { key: "drink", label: "Drinks", icon: Beer },
        { key: "food", label: "Food", icon: Utensils },
        { key: "ingredient", label: "Ingredients", icon: Wheat },
    ]

    const counts = {
        all: products.length,
        drink: products.filter((p) => p.productType === "drink").length,
        food: products.filter((p) => p.productType === "food").length,
        ingredient: products.filter((p) => p.productType === "ingredient").length,
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Products</h2>
                    <p className="text-muted-foreground">Manage drinks, food plates, and ingredients</p>
                </div>
<<<<<<< HEAD
                {canEdit ? (
                    <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                ) : (
                    <Badge variant="outline" className="border-border/50 bg-background/50 text-muted-foreground">
                        Lecture seule
                    </Badge>
                )}
=======
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Product
                </Button>
>>>>>>> origin/alimentation
            </div>

            {/* Type Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {typeFilters.map(({ key, label, icon: Icon }) => (
                    <Button
                        key={key}
                        variant={typeFilter === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTypeFilter(key)}
                    >
                        <Icon className="h-4 w-4 mr-1" />
                        {label} ({counts[key as keyof typeof counts]})
                    </Button>
                ))}
            </div>

            <Card>
                <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Product Catalog
                        </CardTitle>
<<<<<<< HEAD
                        <div className="flex items-center gap-2">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or SKU..."
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10 bg-background/50 border-border/50 focus:ring-primary/20"
                                />
                            </div>
                            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                                <SelectTrigger className="w-[120px] border-border/50">
                                    <SelectValue placeholder="Rows" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 rows</SelectItem>
                                    <SelectItem value="20">20 rows</SelectItem>
                                    <SelectItem value="50">50 rows</SelectItem>
                                </SelectContent>
                            </Select>
=======
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or SKU..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
>>>>>>> origin/alimentation
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
<<<<<<< HEAD
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border/50 bg-secondary/10">
                                    <TableHead className="w-24">SKU</TableHead>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Secteur</TableHead>
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
                                ) : paginatedProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                                            No products found matching your search.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedProducts.map((product) => (
                                        <TableRow key={product.id} className="border-border/50 hover:bg-secondary/5 transition-colors">
=======
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-secondary/10">
                                <TableHead>SKU</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
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
                                    <TableCell colSpan={8} className="h-32 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground italic">
                                        No products found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts.map((product) => {
                                    const type = typeConfig[product.productType] || typeConfig.drink
                                    const TypeIcon = type.icon
                                    const isIngredient = product.productType === "ingredient"
                                    const isFood = product.productType === "food"
                                    const isMadeToOrder = isFood || (product.productType === "drink" && Number(product.stock) <= 0)

                                    return (
                                        <TableRow key={product.id}>
>>>>>>> origin/alimentation
                                            <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>
<<<<<<< HEAD
                                                <Badge variant="outline" className="font-normal border-border/50 bg-background/50">
                                                    {product.sector || "—"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal border-border/50 bg-background/50">
                                                    {product.categoryName || "Uncategorized"}
=======
                                                <Badge className={type.color}>
                                                    <TypeIcon className="h-3 w-3 mr-1" />
                                                    {type.label}
>>>>>>> origin/alimentation
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground">{product.categoryName || "—"}</span>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {isIngredient ? (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                ) : (
                                                    formatCurrency(Number(product.price))
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {isMadeToOrder ? (
                                                    <Badge variant="outline" className="text-xs border-dashed">MTO</Badge>
                                                ) : (
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                                        Number(product.stock) <= Number(product.minStock)
                                                            ? "bg-destructive/10 text-destructive"
                                                            : "bg-primary/10 text-primary"
                                                    }`}>
                                                        {product.stock}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {isMadeToOrder ? (
                                                    <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">Made to Order</Badge>
                                                ) : Number(product.stock) <= Number(product.minStock) ? (
                                                    <Badge className="bg-destructive/20 text-destructive">Low Stock</Badge>
                                                ) : (
                                                    <Badge className="bg-green-500/15 text-green-700 border-green-500/20">In Stock</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
<<<<<<< HEAD
                                                {canEdit ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive text-muted-foreground">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Lecture seule</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-border/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-border/50"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-border/50"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
=======
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="h-8 w-8">
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
>>>>>>> origin/alimentation
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
