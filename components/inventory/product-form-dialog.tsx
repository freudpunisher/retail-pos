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
import { Loader2 } from "lucide-react"
import Swal from "sweetalert2"

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
        price: "",
        unit: "kg",
        sector: "Alimentation",
        minStock: "10",
    })

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || "",
                categoryId: product.categoryId || "",
                price: product.price?.toString() || "",
                unit: product.unit || "unit",
                sector: product.sector || "Alimentation",
                minStock: product.minStock?.toString() || "10",
            })
        } else {
            setFormData({
                name: "",
                categoryId: "",
                price: "",
                unit: "kg",
                sector: "Alimentation",
                minStock: "10",
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
            await onSubmit({
                ...formData,
                price: parseFloat(formData.price),
                minStock: parseInt(formData.minStock),
            })
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to save product:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredCategories = categories.filter((cat: any) => {
        if (cat.id === formData.categoryId) return true
        if (!formData.sector) return true
        const name = (cat.name || "").toLowerCase()
        if (formData.sector === "Alimentation") return name.includes("alimentation")
        if (formData.sector === "Boulangerie") return name.includes("boulangerie")
        return true
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
                        <DialogDescription>
                            {product ? "Update product information." : "Enter the details for the new product."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sector" className="text-right">
                                Secteur
                            </Label>
                            <Select
                                value={formData.sector}
                                onValueChange={(value) => setFormData({ ...formData, sector: value })}
                                required
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select sector" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Alimentation">Alimentation</SelectItem>
                                    <SelectItem value="Boulangerie">Boulangerie</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Category
                            </Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                                required
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Price
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="unit" className="text-right">
                                Unit
                            </Label>
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="minStock" className="text-right">
                                Min Stock
                            </Label>
                            <Input
                                id="minStock"
                                type="number"
                                value={formData.minStock}
                                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
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
