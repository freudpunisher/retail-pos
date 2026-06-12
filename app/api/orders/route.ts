import { NextResponse } from "next/server"
import db from "@/lib/db"
import { transactions, products, stock, stockMovements, locations } from "@/lib/db/schema"
import { eq, and, desc, sql, max } from "drizzle-orm"

export async function GET() {
    try {
        const orders = await db.query.transactions.findMany({
            where: eq(transactions.type, "sale"),
            orderBy: [desc(transactions.date)],
            with: {
                items: true,
                client: true,
                user: true,
                waiter: { columns: { id: true, name: true } },
                table: { columns: { id: true, number: true, section: true } },
            },
        })
        return NextResponse.json(orders)
    } catch (error) {
        console.error("Failed to fetch orders:", error)
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { items, userId, waiterId, tableId, clientId, notes } = body

        if (!items || items.length === 0 || !userId) {
            return NextResponse.json({ error: "Items and userId are required" }, { status: 400 })
        }

        const total = items.reduce(
            (sum: number, item: any) => sum + item.price * item.quantity * (1 - (item.discount || 0) / 100),
            0,
        )

        // Generate sequential reference: FACT0001, FACT0002, ...
        const [lastRef] = await db
            .select({ maxRef: max(transactions.reference) })
            .from(transactions)
            .where(sql`${transactions.reference} ~ '^FACT[0-9]+$'`)
        const lastNum = lastRef?.maxRef ? parseInt(lastRef.maxRef.replace("FACT", ""), 10) : 0
        const reference = `FACT${String(lastNum + 1).padStart(4, "0")}`

        const [newOrder] = await db
            .insert(transactions)
            .values({
                type: "sale",
                status: "pending",
                orderStatus: "pending",
                total: total.toString(),
                userId,
                waiterId: waiterId || userId,
                tableId: tableId || null,
                clientId: clientId || null,
                reference,
            })
            .returning()

        // Insert transaction items and deduct stock
        const { transactionItems } = await import("@/lib/db/schema")
        for (const item of items) {
            await db.insert(transactionItems).values({
                transactionId: newOrder.id,
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                price: item.price.toString(),
                discount: (item.discount || 0).toString(),
            })

            // Deduct stock
            await db
                .update(products)
                .set({ stock: sql`${products.stock} - ${item.quantity}` })
                .where(eq(products.id, item.productId))

            // Deduct per-location stock from bar location only
            let [saleLocation] = await db
                .select()
                .from(locations)
                .where(eq(locations.type, "bar"))
                .limit(1)
            if (!saleLocation) continue
            const [existingStock] = await db
                .select()
                .from(stock)
                .where(and(eq(stock.productId, item.productId), eq(stock.locationId, saleLocation.id)))
                .limit(1)
            if (existingStock) {
                await db
                    .update(stock)
                    .set({ quantityOnHand: sql`${stock.quantityOnHand} - ${item.quantity}`, updatedAt: new Date() })
                    .where(eq(stock.id, existingStock.id))
            } else {
                await db.insert(stock).values({
                    productId: item.productId,
                    locationId: saleLocation.id,
                    quantityOnHand: (-item.quantity).toString(),
                    reorderLevel: "0",
                    reorderQuantity: "0",
                })
            }

            // Record stock movement
            await db.insert(stockMovements).values({
                productId: item.productId,
                productName: item.productName,
                type: "sale",
                quantity: (-item.quantity).toString(),
                userId,
                notes: `Order ${newOrder.id}`,
            })
        }

        // No longer marking table as occupied — a table can have multiple bills simultaneously

        const order = await db.query.transactions.findFirst({
            where: eq(transactions.id, newOrder.id),
            with: {
                items: true,
                waiter: { columns: { id: true, name: true } },
                table: { columns: { id: true, number: true, section: true } },
            },
        })

        return NextResponse.json(order)
    } catch (error) {
        console.error("Failed to create order:", error)
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }
}
