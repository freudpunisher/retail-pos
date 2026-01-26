import { NextResponse } from "next/server"
import db from "@/lib/db"
import { inventory, products } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET() {
    try {
        const allInventory = await db.query.inventory.findMany({
            with: {
                product: {
                    with: {
                        category: true
                    }
                }
            },
            orderBy: [desc(inventory.updatedAt)]
        })
        return NextResponse.json(allInventory)
    } catch (error) {
        console.error("Failed to fetch inventory:", error)
        return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
    }
}
