import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import db from "@/lib/db"
import { transactions } from "@/lib/db/schema"
import { sql, eq, and, gte } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get("period") || "week"

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

    const salesData = await db
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
