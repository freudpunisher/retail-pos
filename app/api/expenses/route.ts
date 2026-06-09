import { NextResponse } from "next/server"
import db from "@/lib/db"
import { expenses, cashFlow, users } from "@/lib/db/schema"
import { eq, desc, and, gte, lte, sql } from "drizzle-orm"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const category = searchParams.get("category")

    try {
        let query = db
            .select({
                id: expenses.id,
                description: expenses.description,
                amount: expenses.amount,
                category: expenses.category,
                date: expenses.date,
                paidBy: users.name,
                recipient: expenses.recipient,
                reference: expenses.reference,
            })
            .from(expenses)
            .leftJoin(users, eq(expenses.paidBy, users.id))

        const conditions = []
        if (startDate) conditions.push(gte(expenses.date, new Date(startDate)))
        if (endDate) conditions.push(lte(expenses.date, new Date(endDate)))
        if (category) conditions.push(eq(expenses.category, category as any))

        if (conditions.length > 0) {
            query.where(and(...conditions)) as any
        }

        const expensesList = await query.orderBy(desc(expenses.date))

        return NextResponse.json(expensesList)
    } catch (error) {
        console.error("Failed to fetch expenses:", error)
        return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { description, amount, category, userId, recipient, reference } = body

        if (!description || !amount || !category || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const result = await db.transaction(async (tx) => {
            // 1. Create Expense
            const [newExpense] = await tx
                .insert(expenses)
                .values({
                    description,
                    amount: amount.toString(),
                    category,
                    paidBy: userId,
                    recipient,
                    reference,
                    date: new Date()
                })
                .returning()

            // 2. Add to Cash Flow
            await tx.insert(cashFlow).values({
                date: new Date(),
                amount: amount.toString(),
                type: "outflow",
                category: "expenses",
                description: `Expense: ${description}`,
                referenceId: newExpense.id,
                referenceType: "expense"
            })

            return newExpense
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("Failed to create expense:", error)
        return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
    }
}
