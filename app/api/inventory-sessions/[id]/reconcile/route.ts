import { NextResponse } from "next/server"
import db from "@/lib/db"
import { inventory, inventoryItems, stock, stockMovements, products, stockAdjustments } from "@/lib/db/schema"
import { and, eq, sql } from "drizzle-orm"
import { resolveWarehouse } from "@/lib/db/location-utils"

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
                const warehouse = await resolveWarehouse(tx, item.product?.productType || "ingredient")

                if (variance !== 0) {
                    // Update Stock table
                    const [stockRow] = await tx
                        .select()
                        .from(stock)
                        .where(and(eq(stock.productId, item.productId), eq(stock.locationId, warehouse.id)))

                    if (stockRow) {
                        await tx
                            .update(stock)
                            .set({
                                quantityOnHand: physicalQty.toString(),
                                lastCountedDate: new Date(),
                                updatedAt: new Date(),
                            })
                            .where(eq(stock.id, stockRow.id))
                    } else {
                        await tx.insert(stock).values({
                            productId: item.productId,
                            locationId: warehouse.id,
                            quantityOnHand: physicalQty.toString(),
                            quantityReserved: "0",
                            reorderLevel: (item.product?.minStock || 0).toString(),
                            reorderQuantity: "20",
                            lastCountedDate: new Date(),
                            updatedAt: new Date(),
                        })
                    }

                    // Update Products table (denormalized total stock)
                    await tx.update(products).set({
                        stock: physicalQty.toString()
                    }).where(eq(products.id, item.productId))

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
                    const [stockRow] = await tx
                        .select()
                        .from(stock)
                        .where(and(eq(stock.productId, item.productId), eq(stock.locationId, warehouse.id)))

                    if (stockRow) {
                        await tx
                            .update(stock)
                            .set({
                                lastCountedDate: new Date(),
                                updatedAt: new Date(),
                            })
                            .where(eq(stock.id, stockRow.id))
                    } else {
                        await tx.insert(stock).values({
                            productId: item.productId,
                            locationId: warehouse.id,
                            quantityOnHand: physicalQty.toString(),
                            quantityReserved: "0",
                            reorderLevel: (item.product?.minStock || 0).toString(),
                            reorderQuantity: "20",
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
