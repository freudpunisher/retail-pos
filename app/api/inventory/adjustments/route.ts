import { NextResponse } from "next/server"
import db from "@/lib/db"
import { inventory, inventoryAdjustments, products } from "@/lib/db/schema"
import { eq, desc, sql } from "drizzle-orm"

export async function GET() {
    try {
        const adjustments = await db.query.inventoryAdjustments.findMany({
            with: {
                product: true,
                user: true
            },
            orderBy: [desc(inventoryAdjustments.createdDate)]
        })
        return NextResponse.json(adjustments)
    } catch (error) {
        console.error("Failed to fetch inventory adjustments:", error)
        return NextResponse.json({ error: "Failed to fetch inventory adjustments" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { productId, quantityChange, adjustmentType, reason, referenceNumber, createdBy, notes } = body

        if (!productId || quantityChange === undefined || !adjustmentType || !reason || !createdBy) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const result = await db.transaction(async (tx) => {
            // 1. Record the adjustment
            const [newAdjustment] = await tx.insert(inventoryAdjustments).values({
                productId,
                quantityChange,
                adjustmentType,
                reason,
                referenceNumber,
                createdBy,
                notes,
            }).returning()

            // 2. Update the inventory table
            // Try to find existing inventory record
            const [existingInventory] = await tx.select().from(inventory).where(eq(inventory.productId, productId))

            if (existingInventory) {
                await tx.update(inventory).set({
                    quantityOnHand: sql`${inventory.quantityOnHand} + ${quantityChange}`,
                    updatedAt: new Date()
                }).where(eq(inventory.productId, productId))
            } else {
                // Should technically exist if product exists, but create if not
                await tx.insert(inventory).values({
                    productId,
                    quantityOnHand: quantityChange,
                    updatedAt: new Date()
                })
            }

            // 3. Keep the products table stock in sync (if applicable)
            await tx.update(products).set({
                stock: sql`${products.stock} + ${quantityChange}`
            }).where(eq(products.id, productId))

            return newAdjustment
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Failed to create inventory adjustment:", error)
        return NextResponse.json({ error: error.message || "Failed to create inventory adjustment" }, { status: 500 })
    }
}
