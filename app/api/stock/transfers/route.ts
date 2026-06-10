import { NextResponse } from "next/server"
import db from "@/lib/db"
import { stockTransfers, stockTransferItems, stock, products, stockMovements } from "@/lib/db/schema"
import { eq, desc, sql, inArray } from "drizzle-orm"

export async function GET() {
    try {
        const transfers = await db.query.stockTransfers.findMany({
            orderBy: [desc(stockTransfers.date)],
            with: {
                product: { columns: { name: true, sku: true } },
                fromLocation: { columns: { name: true } },
                toLocation: { columns: { name: true } },
                user: { columns: { name: true } },
                approver: { columns: { name: true } },
                items: {
                    with: {
                        product: { columns: { name: true, sku: true } },
                    },
                },
            },
        })
        return NextResponse.json(transfers)
    } catch (error) {
        console.error("Failed to fetch transfers:", error)
        return NextResponse.json({ error: "Failed to fetch transfers" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { fromLocationId, toLocationId, userId, notes, items } = body

        if (!fromLocationId || !toLocationId || !userId || !items?.length) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        if (fromLocationId === toLocationId) {
            return NextResponse.json({ error: "Source and destination must differ" }, { status: 400 })
        }

        const result = await db.transaction(async (tx) => {
            const [newTransfer] = await tx
                .insert(stockTransfers)
                .values({ fromLocationId, toLocationId, userId, notes, status: "pending", transferType: "demand" })
                .returning()

            for (const item of items) {
                const [product] = await tx.select().from(products).where(eq(products.id, item.productId))
                if (!product) throw new Error(`Product ${item.productId} not found`)

                await tx.insert(stockTransferItems).values({
                    transferId: newTransfer.id,
                    productId: item.productId,
                    quantity: item.quantity,
                })
            }

            return newTransfer
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Failed to create transfer request:", error)
        return NextResponse.json({ error: error.message || "Failed to create transfer request" }, { status: 400 })
    }
}
