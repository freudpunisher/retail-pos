import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import db from "@/lib/db"
import { transactions, transactionItems, products } from "@/lib/db/schema"
import { sql, eq, and, gte } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get("period") || "week"
    const sector = searchParams.get("sector")

    let startDate: Date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (period) {
      case "today":
        startDate = today
        break
      case "month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case "week":
      default:
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
        break
    }

    const salesData = sector
      ? await db
          .select({
            date: sql<string>`DATE(${transactions.date})`,
            totalSales: sql<number>`sum((${transactionItems.price} * ${transactionItems.quantity}) - ${transactionItems.discount})`,
            transactionCount: sql<number>`count(distinct ${transactions.id})`,
          })
          .from(transactionItems)
          .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
          .innerJoin(products, eq(transactionItems.productId, products.id))
          .where(
            and(
              gte(transactions.date, startDate),
              sql`${transactions.date} <= ${today.toISOString()}`,
              eq(transactions.status, "completed"),
              eq(products.sector, sector)
            )
          )
          .groupBy(sql`DATE(${transactions.date})`)
          .orderBy(sql`DATE(${transactions.date})`)
      : await db
          .select({
            date: sql<string>`DATE(${transactions.date})`,
            totalSales: sql<number>`sum(${transactions.total})`,
            transactionCount: sql<number>`count(*)`,
          })
          .from(transactions)
          .where(
            and(
              gte(transactions.date, startDate),
              sql`${transactions.date} <= ${today.toISOString()}`,
              eq(transactions.status, "completed")
            )
          )
          .groupBy(sql`DATE(${transactions.date})`)
          .orderBy(sql`DATE(${transactions.date})`)

    const result = salesData.map((row) => ({
      date: row.date,
      sales: Number(row.totalSales || 0),
      transactions: Number(row.transactionCount || 0),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch sales chart data:", error)
    return NextResponse.json({ error: "Failed to fetch sales chart data" }, { status: 500 })
  }
}
