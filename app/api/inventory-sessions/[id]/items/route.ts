import { NextResponse } from "next/server"
import db from "@/lib/db"
import { inventory, inventoryItems, stock } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { productId } = body

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
        }

        // Check if session exists and is in_progress
        const session = await db.query.inventory.findFirst({
            where: eq(inventory.id, id)
        })

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        if (session.status !== "in_progress") {
            return NextResponse.json({ error: "Cannot add items to a completed session" }, { status: 400 })
        }

        // Check if item already in session
        const existingItem = await db.query.inventoryItems.findFirst({
            where: sql`${inventoryItems.inventoryId} = ${id} AND ${inventoryItems.productId} = ${productId}`
        })

        if (existingItem) {
            return NextResponse.json({ error: "Product already in count session" }, { status: 400 })
        }

        // Get current stock
        const [stockRecord] = await db.select().from(stock).where(eq(stock.productId, productId))
        const quantityInStock = stockRecord ? stockRecord.quantityOnHand : 0

        const [newItem] = await db
            .insert(inventoryItems)
            .values({
                inventoryId: id,
                productId: productId,
                quantityInStock: quantityInStock,
                physicalQuantity: 0,
                variance: -quantityInStock,
            })
            .returning()

        return NextResponse.json(newItem)
    } catch (error) {
        console.error("Failed to add item to session:", error)
        return NextResponse.json({ error: "Failed to add item to session" }, { status: 500 })
    }
}
