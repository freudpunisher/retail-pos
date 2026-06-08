import { NextResponse } from "next/server"
import db from "@/lib/db"
import { transactions, tables as tablesSchema } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const validTransitions: Record<string, string[]> = {
    pending: ["preparing", "cancelled"],
    preparing: ["ready", "cancelled"],
    ready: ["served", "cancelled"],
    served: ["paid", "cancelled"],
    paid: [],
    cancelled: [],
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const { orderStatus, paymentMethod } = body

        const [order] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.id, id))
            .limit(1)

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        const allowed = validTransitions[order.orderStatus] || []
        if (orderStatus && !allowed.includes(orderStatus)) {
            return NextResponse.json(
                { error: `Cannot transition from ${order.orderStatus} to ${orderStatus}` },
                { status: 400 },
            )
        }

        const updateData: any = {}
        if (orderStatus) updateData.orderStatus = orderStatus

        if (orderStatus === "paid") {
            updateData.status = "completed"
            if (paymentMethod) updateData.paymentMethod = paymentMethod
        }

        if (orderStatus === "cancelled") {
            updateData.status = "cancelled"
        }

        const [updated] = await db
            .update(transactions)
            .set(updateData)
            .where(eq(transactions.id, id))
            .returning()

        // Free table when order is paid or cancelled
        if ((orderStatus === "paid" || orderStatus === "cancelled") && order.tableId) {
            await db
                .update(tablesSchema)
                .set({ status: "free" })
                .where(eq(tablesSchema.id, order.tableId))
        }

        return NextResponse.json(updated)
    } catch (error) {
        console.error("Failed to update order status:", error)
        return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }
}
