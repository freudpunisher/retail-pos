import { NextResponse } from "next/server"
import db from "@/lib/db"
import { stock, products, locations } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const locationId = searchParams.get("locationId")

        let query: any = db.query.stock.findMany({
            with: {
                product: true,
                location: true,
            },
            orderBy: [desc(stock.updatedAt)],
        })

        if (locationId) {
            query = db.query.stock.findMany({
                with: {
                    product: true,
                    location: true,
                },
                where: eq(stock.locationId, locationId),
                orderBy: [desc(stock.updatedAt)],
            })
        }

        const allStock = await query

        return NextResponse.json(allStock)
    } catch (error) {
        console.error("Failed to fetch stock status:", error)
        return NextResponse.json({ error: "Failed to fetch stock status" }, { status: 500 })
    }
}
