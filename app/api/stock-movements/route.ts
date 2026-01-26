import { products, stockMovements } from "@/lib/db/schema"
import { desc, eq, sql } from "drizzle-orm"
import db from "@/lib/db/index"
import { NextResponse } from "next/server"
import type { ExtractTablesWithRelations } from "drizzle-orm"
import type { PgTransaction } from "drizzle-orm/pg-core"
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js"

type Transaction = PgTransaction<PostgresJsQueryResultHKT, typeof import("@/lib/db/schema"), ExtractTablesWithRelations<typeof import("@/lib/db/schema")>>


export async function GET() {
    try {
        const allMovements = await db.query.stockMovements.findMany({
            orderBy: [desc(stockMovements.date)],
            with: {
                product: true,
                user: true,
            },
        })
        return NextResponse.json(allMovements)
    } catch (error) {
        console.error("Failed to fetch stock movements:", error)
        return NextResponse.json({ error: "Failed to fetch stock movements" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { productId, type, quantity, notes, userId } = body

        if (!productId || !type || quantity === undefined || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Perform in a transaction
        const result = await db.transaction(async (tx: Transaction) => {
            // 1. Get product to ensure it exists and get its name
            const [product] = await tx.select().from(products).where(eq(products.id, productId))
            if (!product) throw new Error("Product not found")

            // 2. Insert stock movement
            const [newMovement] = await tx
                .insert(stockMovements)
                .values({
                    productId,
                    productName: product.name,
                    type,
                    quantity,
                    userId,
                    notes,
                })
                .returning()

            // 3. Update product stock
            await tx
                .update(products)
                .set({
                    stock: sql`${products.stock} + ${quantity}`,
                })
                .where(eq(products.id, productId))

            return newMovement
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Failed to create stock movement:", error)
        return NextResponse.json({ error: error.message || "Failed to create stock movement" }, { status: 500 })
    }
}
