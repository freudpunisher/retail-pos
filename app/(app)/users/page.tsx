"use client"

import { UserManagement } from "@/components/user-management"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function UsersPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-foreground">Access denied</h2>
        <p className="text-muted-foreground">Only admins can manage users.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Users</h2>
        <p className="text-muted-foreground">Create and manage staff accounts</p>
      </div>
      <UserManagement />
    </div>
  )
}
