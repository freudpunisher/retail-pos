import { NextResponse } from "next/server"
import db from "@/lib/db"
import { products, categories, stock } from "@/lib/db/schema"
import { eq, desc, sql, and } from "drizzle-orm"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    try {
        let query = db
            .select({
                id: products.id,
                sku: products.sku,
                name: products.name,
                unit: products.unit,
                cost: products.cost,
                stock: products.stock,
                minStock: products.minStock,
                categoryId: products.categoryId,
                categoryName: categories.name,
                image: products.image,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .where(eq(products.type, 'raw_material'))

        if (search) {
            query = query.where(and(
                eq(products.type, 'raw_material'),
                sql`${products.name} ILIKE ${`%${search}%`} OR ${products.sku} ILIKE ${`%${search}%`}`
            )) as any
        }

        const rawMaterials = await query.orderBy(desc(products.name))

        return NextResponse.json(rawMaterials)
    } catch (error) {
        console.error("Failed to fetch raw materials:", error)
        return NextResponse.json({ error: "Failed to fetch raw materials" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, categoryId, cost, minStock, unit, image } = body
        let { sku } = body

        if (!name || !cost || !categoryId) {
            return NextResponse.json({ error: "Missing required fields (name, cost, category)" }, { status: 400 })
        }

        // Auto-generate SKU for raw materials
        if (!sku) {
            const prefix = "RM-" + name.substring(0, 3).toUpperCase()
            const random = Math.floor(1000 + Math.random() * 9000)
            sku = `${prefix}-${random}`
        }

        const result = await db.transaction(async (tx) => {
            const [newProduct] = await tx
                .insert(products)
                .values({
                    sku,
                    name,
                    categoryId,
                    type: 'raw_material',
                    sector: "Boulangerie",
                    unit: unit || 'kg',
                    price: '0', // Raw materials are not executed to be sold directly usually, or price is 0
                    cost: cost.toString(),
                    stock: 0,
                    minStock: minStock || 10,
                    image,
                })
                .returning()

            // Initialize stock record
            await tx.insert(stock).values({
                productId: newProduct.id,
                quantityOnHand: "0",
                quantityReserved: "0",
                reorderLevel: minStock || 10,
                reorderQuantity: 20
            })

            return newProduct
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("Failed to create raw material:", error)
        return NextResponse.json({ error: "Failed to create raw material" }, { status: 500 })
    }
}
