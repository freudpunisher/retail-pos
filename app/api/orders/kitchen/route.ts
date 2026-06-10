import { NextResponse } from "next/server"
import db from "@/lib/db"
import { transactions, transactionItems, products } from "@/lib/db/schema"
import { eq, and, desc, inArray, ne, not, sql } from "drizzle-orm"

export async function GET() {
    try {
        const foodProductIds = db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.productType, "food"))

        const foodItemTransactionIds = db
            .select({ transactionId: transactionItems.transactionId })
            .from(transactionItems)
            .where(inArray(transactionItems.productId, foodProductIds))

        const orders = await db.query.transactions.findMany({
            where: and(
                eq(transactions.type, "sale"),
                inArray(transactions.id, foodItemTransactionIds),
                ne(transactions.orderStatus, "served"),
                ne(transactions.orderStatus, "paid"),
                ne(transactions.orderStatus, "cancelled"),
            ),
            orderBy: [desc(transactions.date)],
            with: {
                items: {
                    with: {
                        product: { columns: { id: true, productType: true } },
                    },
                },
                waiter: { columns: { id: true, name: true } },
                table: { columns: { id: true, number: true } },
            },
        })

        const kitchenOrders = orders.map((order) => ({
            ...order,
            items: order.items.filter((item) => item.product?.productType === "food"),
        }))

        return NextResponse.json(kitchenOrders)
    } catch (error) {
        console.error("Failed to fetch kitchen orders:", error)
        return NextResponse.json({ error: "Failed to fetch kitchen orders" }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { id, orderStatus } = body

        if (!id || !orderStatus) {
            return NextResponse.json({ error: "id and orderStatus are required" }, { status: 400 })
        }

        const validStatuses = ["pending", "preparing", "ready", "served", "paid", "cancelled"]
        if (!validStatuses.includes(orderStatus)) {
            return NextResponse.json({ error: "Invalid order status" }, { status: 400 })
        }

        const [updated] = await db
            .update(transactions)
            .set({ orderStatus: orderStatus as any })
            .where(eq(transactions.id, id))
            .returning()

        return NextResponse.json(updated)
    } catch (error: any) {
        console.error("Failed to update kitchen order:", error)
        return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 })
    }
}
