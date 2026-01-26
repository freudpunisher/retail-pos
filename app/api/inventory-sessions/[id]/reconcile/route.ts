import { NextResponse } from "next/server"
import db from "@/lib/db"
import { inventory, inventoryItems, stock, stockMovements, products } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await db.query.inventory.findFirst({
            where: eq(inventory.id, id),
            with: {
                items: {
                    with: {
                        product: true
                    }
                }
            }
        })

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        if (session.status === "reconciled") {
            return NextResponse.json({ error: "Session already reconciled" }, { status: 400 })
        }

        const result = await db.transaction(async (tx) => {
            // 1. Update stock levels and record movements for each variance
            for (const item of session.items) {
                if (item.variance !== 0) {
                    // Update Stock table
                    await tx
                        .update(stock)
                        .set({
                            quantityOnHand: item.physicalQuantity,
                            lastCountedDate: new Date(),
                            updatedAt: new Date(),
                        })
                        .where(eq(stock.productId, item.productId))

                    // Update Products table (denormalized total stock)
                    const [product] = await tx.select().from(products).where(eq(products.id, item.productId))
                    if (product) {
                        await tx.update(products).set({
                            stock: item.physicalQuantity
                        }).where(eq(products.id, item.productId))
                    }

                    // Record Stock Movement
                    await tx.insert(stockMovements).values({
                        productId: item.productId,
                        productName: item.product.name,
                        type: "adjustment",
                        quantity: item.variance,
                        userId: session.countedBy,
                        notes: `Inventory Count Reconciliation (Session ${session.id})`,
                    })
                } else {
                    // Even if variance is 0, update last counted date
                    await tx
                        .update(stock)
                        .set({
                            lastCountedDate: new Date(),
                            updatedAt: new Date(),
                        })
                        .where(eq(stock.productId, item.productId))
                }
            }

            // 2. Mark session as reconciled
            const [updatedSession] = await tx
                .update(inventory)
                .set({
                    status: "reconciled",
                    updatedAt: new Date(),
                })
                .where(eq(inventory.id, params.id))
                .returning()

            return updatedSession
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("Failed to reconcile inventory session:", error)
        return NextResponse.json({ error: "Failed to reconcile inventory session" }, { status: 500 })
    }
}
