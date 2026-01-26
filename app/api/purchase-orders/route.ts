import { NextResponse } from "next/server"
import db from "@/lib/db"
import { purchaseOrders, purchaseOrderItems, suppliers, inventory, stockMovements, products } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET() {
    try {
        const orders = await db
            .select({
                id: purchaseOrders.id,
                date: purchaseOrders.date,
                status: purchaseOrders.status,
                total: purchaseOrders.total,
                supplierId: purchaseOrders.supplierId,
                supplierName: suppliers.name,
            })
            .from(purchaseOrders)
            .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
            .orderBy(desc(purchaseOrders.date))

        // Fetch items for each order
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const items = await db
                    .select()
                    .from(purchaseOrderItems)
                    .where(eq(purchaseOrderItems.purchaseOrderId, order.id))
                return { ...order, items }
            })
        )

        return NextResponse.json(ordersWithItems)
    } catch (error) {
        console.error("Failed to fetch purchase orders:", error)
        return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { supplierId, items, total, status = "received", userId } = body

        if (!supplierId || !items || !items.length) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const result = await db.transaction(async (tx) => {
            // 1. Create Purchase Order
            const [newOrder] = await tx
                .insert(purchaseOrders)
                .values({
                    supplierId,
                    total: total.toString(),
                    status,
                })
                .returning()

            // 2. Create PO Items and Update Stock if received
            for (const item of items) {
                await tx.insert(purchaseOrderItems).values({
                    purchaseOrderId: newOrder.id,
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    cost: item.cost.toString(),
                })

                if (status === "received") {
                    // Update main products table stock
                    const [product] = await tx.select().from(products).where(eq(products.id, item.productId))
                    if (product) {
                        await tx
                            .update(products)
                            .set({
                                stock: (product.stock || 0) + item.quantity,
                                cost: item.cost.toString() // Also update the cost of the product to the latest purchase cost
                            })
                            .where(eq(products.id, item.productId))
                    }

                    // Update inventory table
                    const [invRecord] = await tx.select().from(inventory).where(eq(inventory.productId, item.productId))
                    if (invRecord) {
                        await tx
                            .update(inventory)
                            .set({
                                quantityOnHand: invRecord.quantityOnHand + item.quantity,
                                updatedAt: new Date()
                            })
                            .where(eq(inventory.productId, item.productId))
                    }

                    // Record stock movement
                    await tx.insert(stockMovements).values({
                        productId: item.productId,
                        productName: item.productName,
                        type: "purchase",
                        quantity: item.quantity,
                        userId: userId, // Pass current user id from frontend
                        notes: `Purchase Order ${newOrder.id}`,
                    })
                }
            }

            return newOrder
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("Failed to create purchase order:", error)
        return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 })
    }
}
