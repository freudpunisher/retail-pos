import { NextResponse } from "next/server"
import db from "@/lib/db"
import { stock, products } from "@/lib/db/schema"
import { desc } from "drizzle-orm"

export async function GET() {
    try {
        const allStock = await db.query.stock.findMany({
            with: {
                product: true,
            },
            orderBy: [desc(stock.updatedAt)]
        })

        return NextResponse.json(allStock)
    } catch (error) {
        console.error("Failed to fetch stock status:", error)
        return NextResponse.json({ error: "Failed to fetch stock status" }, { status: 500 })
    }
}
