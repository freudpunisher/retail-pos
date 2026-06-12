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
import { useUnits } from "@/hooks/use-units"
import { Loader2, Beer, Utensils, Package, Save } from "lucide-react"
import Swal from "sweetalert2"
import { toast } from "sonner"

interface ProductFormDialogProps {
    product?: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: any) => Promise<void>
}

export function ProductFormDialog({ product, open, onOpenChange, onSubmit }: ProductFormDialogProps) {
    const { categories, loading: categoriesLoading } = useCategories()
    const { units, loading: unitsLoading } = useUnits()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        categoryId: "",
        productType: "drink",
        price: "",
        unit: "kg",
        minStock: "10",
        trackStock: false,
        quantityPerBox: "1",
    })

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || "",
                categoryId: product.categoryId || "",
                productType: product.productType || "drink",
                price: product.price?.toString() || "",
                unit: product.unit || "unit",
                minStock: product.minStock?.toString() || "10",
                trackStock: product.productType === "ingredient" || Number(product.stock) > 0,
                quantityPerBox: product.quantityPerBox?.toString() || "1",
            })
        } else {
            setFormData({
                name: "",
                categoryId: "",
                productType: "drink",
                price: "",
                unit: "kg",
                minStock: "10",
                trackStock: false,
                quantityPerBox: "1",
            })
        }
    }, [product, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.unit.trim()) {
            await Swal.fire({
                icon: "error",
                title: "Invalid unit",
                text: "Unit is required.",
            })
            return
        }
        setLoading(true)
        try {
            const data: any = {
                name: formData.name,
                categoryId: formData.categoryId,
                productType: formData.productType,
                unit: formData.unit,
            }

            if (formData.productType === "ingredient") {
                data.minStock = parseInt(formData.minStock) || 10
                data.trackStock = true
                data.price = 0
            } else {
                data.price = parseFloat(formData.price) || 0
                data.trackStock = formData.trackStock
                data.minStock = formData.trackStock ? (parseInt(formData.minStock) || 10) : 0
                data.quantityPerBox = parseInt(formData.quantityPerBox) || 1
            }

            await onSubmit(data)
            onOpenChange(false)
            toast.success(product ? "Produit mis à jour" : "Produit ajouté")
        } catch (error: any) {
            console.error("Failed to save product:", error)
            toast.error(error.message || "Erreur lors de l'enregistrement du produit")
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
                                {(['drink', 'food', 'ingredient'] as const).map((type) => (
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

                        {/* Sector */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Category
                            </Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                            >
                                <SelectTrigger id="category" className="col-span-3">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.length === 0 ? (
                                        <SelectItem value="none" disabled>No categories found</SelectItem>
                                    ) : (
                                        categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {categoriesLoading && <span className="col-span-3 text-xs text-muted-foreground">Loading categories...</span>}
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

                        {/* Unit */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="unit" className="text-right">Unit</Label>
                            <Select
                                value={formData.unit}
                                onValueChange={(value) => setFormData({ ...formData, unit: value })}
                                required
                            >
                                <SelectTrigger id="unit" className="col-span-3">
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.length === 0 ? (
                                        <SelectItem value="unit">Unité (unit)</SelectItem>
                                    ) : (
                                        units.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.code}>
                                                {unit.name} ({unit.symbol || unit.code})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Track Stock Toggle (drinks only) */}
                        {isDrink && (
                            <>
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
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="quantityPerBox" className="text-right">Qty per Box</Label>
                                    <Input
                                        id="quantityPerBox"
                                        type="number"
                                        min="1"
                                        value={formData.quantityPerBox}
                                        onChange={(e) => setFormData({ ...formData, quantityPerBox: e.target.value })}
                                        className="col-span-3"
                                        placeholder="Quantity in a case (e.g. 24)"
                                    />
                                </div>
                            </>
                        )}

                        {/* Unit Selection */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="unit" className="text-right">Unit</Label>
                            <Select
                                value={formData.unit}
                                onValueChange={(value) => setFormData({ ...formData, unit: value })}
                                required
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.length === 0 ? (
                                        <SelectItem value="unit">Unité (unit)</SelectItem>
                                    ) : (
                                        units.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.code}>
                                                {unit.name} ({unit.symbol || unit.code})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {unitsLoading && <span className="col-span-3 text-xs text-muted-foreground">Loading units...</span>}
                        </div>

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
                                    required
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {product ? "Save Changes" : "Add Product"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
