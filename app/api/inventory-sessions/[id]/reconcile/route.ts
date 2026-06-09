import { NextResponse } from "next/server"
import db from "@/lib/db"
import { inventory, inventoryItems, stock, stockMovements, products, stockAdjustments } from "@/lib/db/schema"
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
                const variance = Number(item.variance ?? 0)
                const physicalQty = Number(item.physicalQuantity ?? 0)
                if (variance !== 0) {
                    // Update Stock table
                    const [stockRow] = await tx.select().from(stock).where(eq(stock.productId, item.productId))
                    if (stockRow) {
                        await tx
                            .update(stock)
                            .set({
                                quantityOnHand: physicalQty.toString(),
                                lastCountedDate: new Date(),
                                updatedAt: new Date(),
                            })
                            .where(eq(stock.productId, item.productId))
                    } else {
                        await tx.insert(stock).values({
                            productId: item.productId,
                            quantityOnHand: physicalQty.toString(),
                            quantityReserved: "0",
                            reorderLevel: Number(item.product?.minStock || 10),
                            reorderQuantity: 20,
                            lastCountedDate: new Date(),
                            updatedAt: new Date(),
                        })
                    }

                    // Update Products table (denormalized total stock)
                    const [product] = await tx.select().from(products).where(eq(products.id, item.productId))
                    if (product) {
                        await tx.update(products).set({
                            stock: physicalQty
                        }).where(eq(products.id, item.productId))
                    }

                    // Record Stock Movement
                    await tx.insert(stockMovements).values({
                        productId: item.productId,
                        productName: item.product.name,
                        type: "adjustment",
                        quantity: variance.toString(),
                        userId: session.countedBy,
                        notes: `Inventory Count Reconciliation (Session ${session.id})`,
                    })

                    // Record detailed adjustment (loss/surplus correction) for reporting
                    await tx.insert(stockAdjustments).values({
                        productId: item.productId,
                        quantityChange: variance.toString(),
                        adjustmentType: variance < 0 ? "loss" : "correction",
                        reason: variance < 0 ? "Physical inventory loss" : "Physical inventory surplus",
                        createdBy: session.countedBy,
                        notes: `Session ${session.id} | logical=${Number(item.quantityInStock)} physical=${physicalQty} variance=${variance}`,
                    })
                } else {
                    // Even if variance is 0, update last counted date
                    const [stockRow] = await tx.select().from(stock).where(eq(stock.productId, item.productId))
                    if (stockRow) {
                        await tx
                            .update(stock)
                            .set({
                                lastCountedDate: new Date(),
                                updatedAt: new Date(),
                            })
                            .where(eq(stock.productId, item.productId))
                    } else {
                        await tx.insert(stock).values({
                            productId: item.productId,
                            quantityOnHand: physicalQty.toString(),
                            quantityReserved: "0",
                            reorderLevel: Number(item.product?.minStock || 10),
                            reorderQuantity: 20,
                            lastCountedDate: new Date(),
                            updatedAt: new Date(),
                        })
                    }
                }
            }

            // 2. Mark session as reconciled
            const [updatedSession] = await tx
                .update(inventory)
                .set({
                    status: "reconciled",
                    updatedAt: new Date(),
                })
                .where(eq(inventory.id, id))
                .returning()

            return updatedSession
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("Failed to reconcile inventory session:", error)
        return NextResponse.json({ error: "Failed to reconcile inventory session" }, { status: 500 })
    }
}
