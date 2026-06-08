"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCategories } from "@/hooks/use-products"
import { Loader2, Beer, Utensils, Package } from "lucide-react"

interface ProductFormDialogProps {
    product?: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: any) => Promise<void>
}

export function ProductFormDialog({ product, open, onOpenChange, onSubmit }: ProductFormDialogProps) {
    const { categories, loading: categoriesLoading } = useCategories()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        categoryId: "",
        productType: "drink",
        price: "",
        minStock: "10",
        trackStock: false,
    })

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || "",
                categoryId: product.categoryId || "",
                productType: product.productType || "drink",
                price: product.price?.toString() || "",
                minStock: product.minStock?.toString() || "10",
                trackStock: product.productType === "ingredient" || Number(product.stock) > 0,
            })
        } else {
            setFormData({
                name: "",
                categoryId: "",
                productType: "drink",
                price: "",
                minStock: "10",
                trackStock: false,
            })
        }
    }, [product, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const data: any = {
                name: formData.name,
                categoryId: formData.categoryId,
                productType: formData.productType,
            }

            if (formData.productType === "ingredient") {
                data.minStock = parseInt(formData.minStock) || 10
                data.trackStock = true
                data.price = 0
            } else if (formData.productType === "drink") {
                data.price = parseFloat(formData.price) || 0
                data.trackStock = formData.trackStock
                data.minStock = formData.trackStock ? (parseInt(formData.minStock) || 10) : 0
            } else {
                data.price = parseFloat(formData.price) || 0
                data.trackStock = false
                data.minStock = 0
            }

            await onSubmit(data)
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to save product:", error)
        } finally {
            setLoading(false)
        }
    }

    const isIngredient = formData.productType === "ingredient"
    const isFood = formData.productType === "food"
    const isDrink = formData.productType === "drink"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
                        <DialogDescription>
                            {product ? "Update product information." : "Enter the details for the new product."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Product Type */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Type</Label>
                            <div className="col-span-3 flex gap-2">
                                {(["drink", "food", "ingredient"] as const).map((type) => (
                                    <Button
                                        key={type}
                                        type="button"
                                        variant={formData.productType === type ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, productType: type })}
                                        className="flex-1"
                                    >
                                        {type === "drink" && <Beer className="h-4 w-4 mr-1" />}
                                        {type === "food" && <Utensils className="h-4 w-4 mr-1" />}
                                        {type === "ingredient" && <Package className="h-4 w-4 mr-1" />}
                                        {type === "drink" ? "Drink" : type === "food" ? "Food" : "Ingredient"}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Name */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                                required
                                placeholder={isIngredient ? "e.g. Chicken Breast" : isDrink ? "e.g. Bottled Beer" : "e.g. Grilled Chicken Plate"}
                            />
                        </div>

                        {/* Category */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Category</Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Selling Price (hidden for ingredients) */}
                        {!isIngredient && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">
                                    {isFood ? "Plate Price" : "Sell Price"}
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                        )}

                        {/* Track Stock Toggle (drinks only) */}
                        {isDrink && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Track Stock</Label>
                                <div className="col-span-3">
                                    <Button
                                        type="button"
                                        variant={formData.trackStock ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, trackStock: !formData.trackStock })}
                                    >
                                        {formData.trackStock ? "Yes — Countable" : "No — Made to Order"}
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formData.trackStock
                                            ? "Stock decreases when sold (e.g. bottled beer, soda can)"
                                            : "No stock tracking (e.g. cafe, fresh juice)"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Min Stock (for tracked drinks and ingredients) */}
                        {(isIngredient || (isDrink && formData.trackStock)) && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="minStock" className="text-right">Min Stock Alert</Label>
                                <Input
                                    id="minStock"
                                    type="number"
                                    min="0"
                                    value={formData.minStock}
                                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {product ? "Save Changes" : "Add Product"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
