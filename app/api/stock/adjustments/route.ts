import { NextResponse } from "next/server"
import db from "@/lib/db"
import { stock, stockAdjustments, products, stockMovements } from "@/lib/db/schema"
import { eq, desc, sql } from "drizzle-orm"

export async function GET() {
    try {
        const adjustments = await db.query.stockAdjustments.findMany({
            with: {
                product: true,
                user: true,
            },
            orderBy: [desc(stockAdjustments.createdDate)]
        })

        return NextResponse.json(adjustments)
    } catch (error) {
        console.error("Failed to fetch stock adjustments:", error)
        return NextResponse.json({ error: "Failed to fetch stock adjustments" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { productId, productName, quantityChange, adjustmentType, reason, notes, userId } = body

        if (!productId || quantityChange === undefined || !adjustmentType || !reason) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const result = await db.transaction(async (tx) => {
            // 1. Create adjustment record
            const [newAdjustment] = await tx.insert(stockAdjustments).values({
                productId,
                quantityChange,
                adjustmentType,
                reason,
                createdBy: userId,
                notes,
            }).returning()

            // 2. Update the stock table
            const [existingStock] = await tx.select().from(stock).where(eq(stock.productId, productId))

            if (existingStock) {
                await tx.update(stock).set({
                    quantityOnHand: sql`${stock.quantityOnHand} + ${quantityChange}`,
                    updatedAt: new Date(),
                }).where(eq(stock.productId, productId))
            } else {
                await tx.insert(stock).values({
                    productId,
                    quantityOnHand: quantityChange,
                })
            }

            // 3. Update main products table total stock
            const [product] = await tx.select().from(products).where(eq(products.id, productId))
            if (product) {
                await tx.update(products).set({
                    stock: (product.stock || 0) + quantityChange
                }).where(eq(products.id, productId))
            }

            // 4. Record stock movement
            await tx.insert(stockMovements).values({
                productId,
                productName: productName || product?.name || "Unknown",
                type: "adjustment",
                quantity: quantityChange,
                userId,
                notes: `Adjustment: ${reason}`,
            })

            return newAdjustment
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Failed to create stock adjustment:", error)
        return NextResponse.json({ error: error.message || "Failed to create stock adjustment" }, { status: 500 })
    }
}
