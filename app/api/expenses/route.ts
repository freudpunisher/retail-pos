import { NextResponse } from "next/server"
import db from "@/lib/db"
import { expenses } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET() {
    try {
        const all = await db.query.expenses.findMany({
            with: { user: { columns: { name: true } } },
            orderBy: [desc(expenses.date)],
        })
        return NextResponse.json(all)
    } catch (error) {
        console.error("Failed to fetch expenses:", error)
        return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, amount, category, description, date, userId } = body
        if (!name || !amount || !category || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }
        const [expense] = await db.insert(expenses).values({
            name,
            amount: amount.toString(),
            category,
            description: description || null,
            date: date ? new Date(date) : new Date(),
            userId,
        }).returning()
        return NextResponse.json(expense)
    } catch (error) {
        console.error("Failed to create expense:", error)
        return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
    }
}
