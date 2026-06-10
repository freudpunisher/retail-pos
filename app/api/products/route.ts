import { NextResponse } from "next/server"
import db from "@/lib/db"
import { products, categories, stock } from "@/lib/db/schema"
import { eq, desc, sql } from "drizzle-orm"
<<<<<<< HEAD
import { requireAdmin } from "@/lib/auth-guard"
=======
import { resolveWarehouse } from "@/lib/db/location-utils"
>>>>>>> origin/alimentation

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
<<<<<<< HEAD
                type: products.type,
=======
                productType: products.productType,
>>>>>>> origin/alimentation
                price: products.price,
                stock: products.stock,
                minStock: products.minStock,
<<<<<<< HEAD
                unit: products.unit,
=======
                trackStock: products.trackStock,
>>>>>>> origin/alimentation
                image: products.image,
                categoryId: products.categoryId,
                categoryName: categories.name,
                sector: products.sector,
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
        const authError = await requireAdmin()
        if (authError) return authError

        const body = await request.json()
<<<<<<< HEAD
        const { name, categoryId, price, cost, minStock, unit, image, sector } = body
=======
        const { name, categoryId, productType, price, minStock, trackStock, image } = body
>>>>>>> origin/alimentation
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
<<<<<<< HEAD
                    unit: unit || "unit",
                    sector: sector || "Alimentation",
=======
                    productType: productType || "food",
>>>>>>> origin/alimentation
                    price: price.toString(),
                    stock: 0, // Always 0 on creation
                    minStock: minStock || 10,
                    trackStock: trackStock || false,
                    image,
                })
                .returning()

            // Initialize stock record at the correct warehouse (only for trackable products)
            const isTrackable = productType === "ingredient" || (productType === "drink" && trackStock)

            if (isTrackable) {
                const warehouse = await resolveWarehouse(tx, productType || "ingredient")

                await tx.insert(stock).values({
                    productId: newProduct.id,
                    locationId: warehouse.id,
                    quantityOnHand: 0,
                    quantityReserved: 0,
                    reorderLevel: minStock || 10,
                    reorderQuantity: 20
                })
            }

            return newProduct
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("Failed to create product:", error)
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }
}
