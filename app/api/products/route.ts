import { NextResponse } from "next/server"
import db from "@/lib/db"
import { products, categories, stock } from "@/lib/db/schema"
import { eq, desc, sql } from "drizzle-orm"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const search = searchParams.get("search")

    try {
        let query = db
            .select({
                id: products.id,
                sku: products.sku,
                name: products.name,
                price: products.price,
                cost: products.cost,
                stock: products.stock,
                minStock: products.minStock,
                image: products.image,
                categoryId: products.categoryId,
                categoryName: categories.name,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))

        if (categoryId) {
            query = query.where(eq(products.categoryId, categoryId)) as any
        }

        if (search) {
            query = query.where(sql`${products.name} ILIKE ${`%${search}%`} OR ${products.sku} ILIKE ${`%${search}%`}`) as any
        }

        const allProducts = await query.orderBy(desc(products.name))

        return NextResponse.json(allProducts)
    } catch (error) {
        console.error("Failed to fetch products:", error)
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, categoryId, price, cost, minStock, image } = body
        let { sku } = body

        if (!name || price === undefined) {
            return NextResponse.json({ error: "Missing required fields (name or price)" }, { status: 400 })
        }

        // Auto-generate SKU if not provided
        if (!sku) {
            const prefix = name.substring(0, 3).toUpperCase()
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
                    price: price.toString(),
                    cost: cost ? cost.toString() : null,
                    stock: 0, // Always 0 on creation
                    minStock: minStock || 10,
                    image,
                })
                .returning()

            // Initialize stock record
            await tx.insert(stock).values({
                productId: newProduct.id,
                quantityOnHand: 0,
                quantityReserved: 0,
                reorderLevel: minStock || 10,
                reorderQuantity: 20
            })

            return newProduct
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("Failed to create product:", error)
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }
}
