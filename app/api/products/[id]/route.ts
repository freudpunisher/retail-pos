import { NextResponse } from "next/server"
import db from "@/lib/db"
import { products } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { name, categoryId, price, cost, minStock, image } = body

        const [updatedProduct] = await db
            .update(products)
            .set({
                name,
                categoryId,
                price: price?.toString(),
                cost: cost ? cost.toString() : null,
                minStock,
                image,
            })
            .where(eq(products.id, params.id))
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
    { params }: { params: { id: string } }
) {
    try {
        const [deletedProduct] = await db
            .delete(products)
            .where(eq(products.id, params.id))
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
