import { NextResponse } from "next/server"
import db from "@/lib/db"
import { inventory, inventoryItems, stock, products } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"

export async function GET() {
    try {
        const sessions = await db.query.inventory.findMany({
            with: {
                user: true,
                items: true,
            },
            orderBy: [desc(inventory.createdAt)]
        })
        return NextResponse.json(sessions)
    } catch (error) {
        console.error("Failed to fetch inventory sessions:", error)
        return NextResponse.json({ error: "Failed to fetch inventory sessions" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { countedBy, notes } = body

        if (!countedBy) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const result = await db.transaction(async (tx) => {
            // 1. Create session
            const [session] = await tx
                .insert(inventory)
                .values({
                    countedBy,
                    notes,
                    status: "in_progress",
                })
                .returning()

            // 2. Initialize items for all products from stock table
            const currentStock = await tx.select().from(stock)

            for (const item of currentStock) {
                await tx.insert(inventoryItems).values({
                    inventoryId: session.id,
                    productId: item.productId,
                    quantityInStock: item.quantityOnHand,
                    physicalQuantity: 0, // Initial state
                    variance: -item.quantityOnHand, // Default variance if physical is 0
                })
            }

            return session
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("Failed to start inventory session:", error)
        return NextResponse.json({ error: "Failed to start inventory session" }, { status: 500 })
    }
}
