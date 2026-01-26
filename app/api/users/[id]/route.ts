import { NextResponse } from "next/server"
import db from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const body = await request.json()
        const { name, email, role, avatar } = body

        const [updatedUser] = await db
            .update(users)
            .set({
                name,
                email,
                role,
                avatar,
            })
            .where(eq(users.id, id))
            .returning()

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("Failed to update user:", error)
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const [deletedUser] = await db.delete(users).where(eq(users.id, id)).returning()

        if (!deletedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "User deleted successfully" })
    } catch (error) {
        console.error("Failed to delete user:", error)
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }
}
