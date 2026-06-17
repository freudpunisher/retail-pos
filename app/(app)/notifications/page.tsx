"use client"

import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function NotificationsPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement...</span>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-foreground">Accès refusé</h2>
        <p className="text-muted-foreground">Seuls les administrateurs peuvent voir les notifications.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
        <p className="text-muted-foreground">Notifications système et événements récents</p>
      </div>
      <div className="rounded-lg border border-border p-6 text-muted-foreground">
        Aucune notification pour le moment.
      </div>
    </div>
  )
}
