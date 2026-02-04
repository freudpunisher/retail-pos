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

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body; // required for stock movement

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
                // Update main products stock & last cost
                const [product] = await tx
                    .select()
                    .from(products)
                    .where(eq(products.id, item.productId));

                if (product) {
                    await tx
                        .update(products)
                        .set({
                            stock: sql`${products.stock} + ${item.quantity}`,
                            cost: item.cost, // update to latest purchase cost
                        })
                        .where(eq(products.id, item.productId));
                }

                // Update separate stock table (if you use it)
                const [stockRecord] = await tx
                    .select()
                    .from(stock)
                    .where(eq(stock.productId, item.productId));

                if (stockRecord) {
                    await tx
                        .update(stock)
                        .set({
                            quantityOnHand: sql`${stock.quantityOnHand} + ${item.quantity}`,
                            updatedAt: new Date(),
                        })
                        .where(eq(stock.productId, item.productId));
                }

                // Record movement
                await tx.insert(stockMovements).values({
                    productId: item.productId,
                    productName: item.productName,
                    type: "purchase",
                    quantity: item.quantity,
                    userId,
                    notes: `Received from PO ${id}`,
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
