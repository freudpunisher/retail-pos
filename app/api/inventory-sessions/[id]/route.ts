import { NextResponse } from "next/server"
import db from "@/lib/db"
import { inventory, inventoryItems, stock, stockMovements, products } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await db.query.inventory.findFirst({
            where: eq(inventory.id, id),
            with: {
                user: true,
                items: {
                    with: {
                        product: true
                    }
                },
            }
        })

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        return NextResponse.json(session)
    } catch (error) {
        console.error("Failed to fetch session:", error)
        return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
    }
}

// Update physical quantities in a session
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { items } = body // Expected array of { productId, physicalQuantity }

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: "Invalid items data" }, { status: 400 })
        }

        await db.transaction(async (tx) => {
            for (const item of items) {
                // Fetch current stock to calculate variance again (for safety)
                const [invItem] = await tx
                    .select()
                    .from(inventoryItems)
                    .where(sql`${inventoryItems.inventoryId} = ${id} AND ${inventoryItems.productId} = ${item.productId}`)

                if (invItem) {
                    await tx
                        .update(inventoryItems)
                        .set({
                            physicalQuantity: item.physicalQuantity,
                            variance: item.physicalQuantity - invItem.quantityInStock
                        })
                        .where(eq(inventoryItems.id, invItem.id))
                }
            }

            await tx.update(inventory).set({ updatedAt: new Date() }).where(eq(inventory.id, id))
        })

        return NextResponse.json({ message: "Items updated successfully" })
    } catch (error) {
        console.error("Failed to update count session items:", error)
        return NextResponse.json({ error: "Failed to update count session items" }, { status: 500 })
    }
}
