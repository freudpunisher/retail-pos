import { NextResponse } from "next/server"
import db from "@/lib/db"
import { transactions, products, clients } from "@/lib/db/schema"
import { sql, eq, and, gte } from "drizzle-orm"

export async function GET() {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const monthStart = new Date()
        monthStart.setDate(1)
        monthStart.setHours(0, 0, 0, 0)

        // Today Sales
        const todaySalesResult = await db
            .select({
                total: sql<string>`SUM(${transactions.total})`,
            })
            .from(transactions)
            .where(and(eq(transactions.status, "completed"), gte(transactions.date, today)))

        // Monthly Revenue
        const monthlyRevenueResult = await db
            .select({
                total: sql<string>`SUM(${transactions.total})`,
            })
            .from(transactions)
            .where(and(eq(transactions.status, "completed"), gte(transactions.date, monthStart)))

        // Total Credit Balance
        const totalCreditResult = await db
            .select({
                total: sql<string>`SUM(${clients.creditBalance})`,
            })
            .from(clients)

        // Low Stock Items Count
        const lowStockResult = await db
            .select({
                count: sql<number>`COUNT(*)::int`,
            })
            .from(products)
            .where(sql`${products.stock} <= ${products.minStock}`)

        return NextResponse.json({
            todaySales: Number.parseFloat(todaySalesResult[0]?.total || "0"),
            monthlyRevenue: Number.parseFloat(monthlyRevenueResult[0]?.total || "0"),
            totalCreditBalance: Number.parseFloat(totalCreditResult[0]?.total || "0"),
            lowStockItems: lowStockResult[0]?.count || 0,
        })
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
        return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
    }
}
