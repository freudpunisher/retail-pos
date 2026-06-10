import { NextResponse } from "next/server"
import db from "@/lib/db"
import { products } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/lib/auth-guard"

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authError = await requireAdmin()
        if (authError) return authError

        const { id } = await params
        const body = await request.json()
        const { name, categoryId, productType, price, cost, minStock, unit, trackStock, image, sector } = body

        const [updatedProduct] = await db
            .update(products)
            .set({
                name,
                categoryId,
                productType,
                price: price?.toString(),
                cost: cost ? cost.toString() : undefined,
                minStock,
                unit,
                trackStock,
                image,
                sector,
            })
            .where(eq(products.id, id))
            .returning()

        if (!updatedProduct) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        return NextResponse.json(updatedProduct)
    } catch (error) {
        console.error("Failed to update product:", error)
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authError = await requireAdmin()
        if (authError) return authError

        const { id } = await params
        const [deletedProduct] = await db
            .delete(products)
            .where(eq(products.id, id))
            .returning()

        if (!deletedProduct) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Product deleted successfully" })
    } catch (error) {
        console.error("Failed to delete product:", error)
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
    }
}
