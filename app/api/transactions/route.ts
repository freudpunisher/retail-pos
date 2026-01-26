import { NextResponse } from "next/server"
import db from "@/lib/db"
import { transactions, transactionItems, products, stockMovements, clients } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

export async function GET() {
    try {
        const allTransactions = await db.query.transactions.findMany({
            with: {
                items: true,
                client: true,
                user: true,
            },
            orderBy: (transactions, { desc }) => [desc(transactions.date)],
        })
        return NextResponse.json(allTransactions)
    } catch (error) {
        console.error("Failed to fetch transactions:", error)
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { type, total, status, paymentMethod, clientId, userId, items } = body

        if (!type || !total || !paymentMethod || !userId || !items || items.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Use a transaction to ensure atomicity
        const result = await db.transaction(async (tx) => {
            // 0. Check Credit Limit if applicable
            if (clientId && paymentMethod === "credit") {
                const [client] = await tx
                    .select()
                    .from(clients)
                    .where(eq(clients.id, clientId))

                if (client) {
                    const currentBalance = Number.parseFloat(client.creditBalance)
                    const limit = Number.parseFloat(client.creditLimit)
                    const newBalance = currentBalance + Number.parseFloat(total.toString())

                    if (newBalance > limit) {
                        throw new Error(`Credit limit exceeded. Available: ${(limit - currentBalance).toFixed(2)}`)
                    }
                }
            }

            // 1. Insert Transaction
            const [newTransaction] = await tx
                .insert(transactions)
                .values({
                    type,
                    total: total.toString(),
                    status: status || "completed",
                    paymentMethod,
                    clientId,
                    userId,
                })
                .returning()

            // 2. Insert Transaction Items and Update Stock
            for (const item of items) {
                await tx.insert(transactionItems).values({
                    transactionId: newTransaction.id,
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price.toString(),
                    discount: (item.discount || 0).toString(),
                })

                // 3. Update Product Stock
                const quantityChange = type === "sale" ? -item.quantity : item.quantity
                await tx
                    .update(products)
                    .set({
                        stock: sql`${products.stock} + ${quantityChange}`,
                    })
                    .where(sql`${products.id} = ${item.productId}`)

                // 4. Create Stock Movement Record
                await tx.insert(stockMovements).values({
                    productId: item.productId,
                    productName: item.productName,
                    type: type === "sale" ? "sale" : "purchase",
                    quantity: quantityChange,
                    userId,
                    notes: `Transaction ${newTransaction.id}`,
                })
            }

            // 5. Update Client Credit Balance if applicable
            if (clientId && paymentMethod === "credit") {
                await tx
                    .update(clients)
                    .set({
                        creditBalance: sql`${clients.creditBalance} + ${total}`,
                    })
                    .where(sql`${clients.id} = ${clientId}`)
            }

            return newTransaction
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Failed to create transaction:", error)
        const errorMessage = error.message || "Failed to create transaction"
        return NextResponse.json({ error: errorMessage }, { status: error.message ? 400 : 500 })
    }
}
