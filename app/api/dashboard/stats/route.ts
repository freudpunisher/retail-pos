import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import db from "@/lib/db"
import { transactions, products, clients, transactionItems } from "@/lib/db/schema"
import { desc, eq, sql, gt, and, like, gte } from "drizzle-orm"

function getPeriodDateRange(period: string = "today") {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let startDate: Date

  switch (period) {
    case "week":
      startDate = new Date(today)
      startDate.setDate(today.getDate() - 7)
      break
    case "month":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      break
    case "today":
    default:
      startDate = today
      break
  }

  return { startDate, endDate: today }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const period = searchParams.get("period") || "today"

        const { startDate, endDate } = getPeriodDateRange(period)

        // 1. Sales for period
        const salesPromise = db
            .select({
                total: sql<number>`sum(${transactions.total})`,
                count: sql<number>`count(*)`,
                creditCount: sql<number>`count(case when ${transactions.paymentMethod} = 'credit' then 1 end)`
            })
            .from(transactions)
            .where(
                and(
                    gte(transactions.date, startDate),
                    sql`${transactions.date} <= ${endDate.toISOString()}`,
                    eq(transactions.status, "completed")
                )
            )

        // 2. Revenue (for month, use monthly; for others just use sales)
        const revenuePromise = db
            .select({
                total: sql<number>`sum(${transactions.total})`
            })
            .from(transactions)
            .where(
                and(
                    period === "month"
                        ? gte(transactions.date, new Date(startDate.getFullYear(), startDate.getMonth(), 1))
                        : gte(transactions.date, startDate),
                    eq(transactions.status, "completed")
                )
            )

        // 3. Low Stock Items
        const lowStockPromise = db
            .select({ count: sql<number>`count(*)` })
            .from(products)
            .where(sql`${products.stock} <= ${products.minStock}`)

        // 4. Total Credit Balance
        const totalCreditPromise = db
            .select({ total: sql<number>`sum(${clients.creditBalance})` })
            .from(clients)

        // 5. Products sold in period
        const productsSoldPromise = db
            .select({
                quantity: sql<number>`sum(${transactionItems.quantity})`
            })
            .from(transactionItems)
            .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
            .where(
                and(
                    gte(transactions.date, startDate),
                    sql`${transactions.date} <= ${endDate.toISOString()}`,
                    eq(transactions.status, "completed")
                )
            )

        // 6. Recent Transactions
        const recentTransactionsPromise = db.query.transactions.findMany({
            where: eq(transactions.status, "completed"),
            orderBy: [desc(transactions.date)],
            limit: 5,
            with: {
                user: true,
                client: true
            }
        })

        const [salesResult, revenueResult, lowStockResult, totalCreditResult, productsSoldResult, recentTransactions] = await Promise.all([
            salesPromise,
            revenuePromise,
            lowStockPromise,
            totalCreditPromise,
            productsSoldPromise,
            recentTransactionsPromise
        ])

        const transactionCount = Number(salesResult[0]?.count || 0)
        const creditTransactionCount = Number(salesResult[0]?.creditCount || 0)
        const creditSalesRatio = transactionCount > 0 ? Math.round((creditTransactionCount / transactionCount) * 100) : 0

        const stats = {
            period,
            todaySales: Number(salesResult[0]?.total || 0),
            todayTransactionCount: transactionCount,
            monthlyRevenue: Number(revenueResult[0]?.total || 0),
            lowStockItems: Number(lowStockResult[0]?.count || 0),
            totalCreditBalance: Number(totalCreditResult[0]?.total || 0),
            productsCount: Number(productsSoldResult[0]?.quantity || 0),
            creditSalesRatio: creditSalesRatio,
            recentTransactions: recentTransactions
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
        return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
    }
}
