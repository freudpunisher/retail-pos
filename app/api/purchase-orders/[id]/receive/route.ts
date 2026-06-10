import { NextResponse } from "next/server";
import db from "@/lib/db";
import {
    purchaseOrders,
    purchaseOrderItems,
    products,
    stock,
    stockMovements,
} from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { resolveWarehouse } from "@/lib/db/location-utils";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    try {
        await db.transaction(async (tx) => {
            const [order] = await tx
                .select()
                .from(purchaseOrders)
                .where(eq(purchaseOrders.id, id));

            if (!order) throw new Error("Order not found");
            if (order.status !== "pending") throw new Error("Order already processed");

            const items = await tx
                .select()
                .from(purchaseOrderItems)
                .where(eq(purchaseOrderItems.purchaseOrderId, id));

            for (const item of items) {
<<<<<<< HEAD
                const quantity = Number(item.quantity || 0);
                // Update main products stock & last cost
=======
>>>>>>> origin/alimentation
                const [product] = await tx
                    .select({ productType: products.productType })
                    .from(products)
                    .where(eq(products.id, item.productId))
                    .limit(1)
                const warehouse = await resolveWarehouse(tx, product?.productType || "ingredient")

                // Update legacy products.stock
                await tx
                    .update(products)
                    .set({
                        stock: sql`${products.stock} + ${item.quantity}`,
                    })
                    .where(eq(products.id, item.productId));

<<<<<<< HEAD
                if (product) {
                    await tx
                        .update(products)
                        .set({
                            stock: sql`${products.stock} + ${quantity}`,
                            cost: item.cost, // update to latest purchase cost
                        })
                        .where(eq(products.id, item.productId));
                }

                // Update separate stock table (if you use it)
=======
                // Update warehouse stock
>>>>>>> origin/alimentation
                const [stockRecord] = await tx
                    .select()
                    .from(stock)
                    .where(
                        sql`${stock.productId} = ${item.productId} AND ${stock.locationId} = ${warehouse.id}`
                    )
                    .limit(1);

                if (stockRecord) {
                    await tx
                        .update(stock)
                        .set({
                            quantityOnHand: sql`${stock.quantityOnHand} + ${quantity}`,
                            updatedAt: new Date(),
                        })
<<<<<<< HEAD
                        .where(eq(stock.productId, item.productId));
                } else {
                    await tx.insert(stock).values({
                        productId: item.productId,
                        quantityOnHand: quantity,
                        quantityReserved: 0,
                        reorderLevel: product?.minStock ?? 10,
                        reorderQuantity: 20,
                        updatedAt: new Date(),
=======
                        .where(eq(stock.id, stockRecord.id));
                } else {
                    await tx.insert(stock).values({
                        productId: item.productId,
                        locationId: warehouse.id,
                        quantityOnHand: item.quantity,
>>>>>>> origin/alimentation
                    });
                }

                // Record movement
                await tx.insert(stockMovements).values({
                    productId: item.productId,
                    productName: item.productName,
                    type: "purchase",
                    quantity,
                    userId,
                    notes: `Received from PO ${id} at ${warehouse.name}`,
                });
            }

            // Mark as received
            await tx
                .update(purchaseOrders)
                .set({ status: "received" })
                .where(eq(purchaseOrders.id, id));
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to receive order:", error);
        return NextResponse.json(
            { error: error.message || "Failed to receive order" },
            { status: 500 }
        );
    }
}
