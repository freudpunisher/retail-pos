import { NextResponse } from "next/server"
import db from "@/lib/db"
import { users } from "@/lib/db/schema"
import { asc } from "drizzle-orm"

export async function GET() {
    try {
        const allUsers = await db.select().from(users).orderBy(asc(users.name))
        return NextResponse.json(allUsers)
    } catch (error) {
        console.error("Failed to fetch users:", error)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, role, avatar } = body

        if (!name || !email) {
            return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
        }

        const [newUser] = await db
            .insert(users)
            .values({
                name,
                email,
                role: role || "cashier",
                avatar,
            })
            .returning()

        return NextResponse.json(newUser)
    } catch (error) {
        console.error("Failed to create user:", error)
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }
}
