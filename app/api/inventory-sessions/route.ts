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

            // 2. Initialize items for all products from products table
            const allProducts = await tx.select().from(products)

            for (const p of allProducts) {
                await tx.insert(inventoryItems).values({
                    inventoryId: session.id,
                    productId: p.id,
                    quantityInStock: p.stock,
                    physicalQuantity: 0, // Initial state
                    variance: -p.stock, // Default variance if physical is 0
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
