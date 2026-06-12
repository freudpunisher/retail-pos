"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit2, Trash2, Loader2, Package, Beer, Utensils, Wheat } from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import { useAuth } from "@/lib/auth-context"
import { ProductFormDialog } from "@/components/inventory/product-form-dialog"
import { formatCurrency } from "@/lib/mock-data"
import Swal from "sweetalert2"

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
    drink: { label: "Drink", icon: Beer, color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" },
    food: { label: "Food", icon: Utensils, color: "bg-amber-500/20 text-amber-700 dark:text-amber-400" },
    ingredient: { label: "Ingredient", icon: Wheat, color: "bg-green-500/20 text-green-700 dark:text-green-400" },
}

export default function ProductManagementPage() {
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)

    const { products, loading, deleteProduct, createProduct, updateProduct } = useProducts()
    const { user } = useAuth()
    const canEdit = user?.role === "admin"
    const roleSector =
        (user?.role as string) === "cashier_bakery" || (user?.role as string) === "supervisor_bakery" || (user?.role as string) === "production_bakery"
            ? "Boulangerie"
            : (user?.role as string) === "cashier_food" || (user?.role as string) === "supervisor_food"
                ? "Alimentation"
                : null

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.sku.toLowerCase().includes(search.toLowerCase())
        const matchesType = typeFilter === "all" || product.productType === typeFilter
        return matchesSearch && matchesType
    })

    const handleEdit = (product: any) => {
        setSelectedProduct(product)
        setIsFormOpen(true)
    }

    const handleAddNew = () => {
        setSelectedProduct(null)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: "Supprimer ce produit ?",
            text: "Cette action est irréversible et supprimera le produit de l'inventaire.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Supprimer",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
        })
        if (result.isConfirmed) {
            try {
                await deleteProduct(id)
                await Swal.fire({
                    icon: "success",
                    title: "Produit supprimé",
                    timer: 1500,
                    showConfirmButton: false,
                })
            } catch (error) {
                await Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text: "Impossible de supprimer le produit.",
                })
            }
        }
    }

    const handleFormSubmit = async (data: any) => {
        try {
            if (selectedProduct) {
                await updateProduct(selectedProduct.id, data)
                await Swal.fire({
                    icon: "success",
                    title: "Produit modifié",
                    timer: 1500,
                    showConfirmButton: false,
                })
            } else {
                await createProduct(data)
                await Swal.fire({
                    icon: "success",
                    title: "Produit créé",
                    timer: 1500,
                    showConfirmButton: false,
                })
            }
            setIsFormOpen(false)
        } catch (error: any) {
            await Swal.fire({
                icon: "error",
                title: "Erreur",
                text: error.message || "Une erreur est survenue.",
            })
        }
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
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Product
                </Button>
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
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or SKU..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
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
                                            <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>
                                                <Badge className={type.color}>
                                                    <TypeIcon className="h-3 w-3 mr-1" />
                                                    {type.label}
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
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${Number(product.stock) <= Number(product.minStock)
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
