"use client"

import type React from "react"
import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { useAuth } from "@/lib/auth-context"

function LayoutSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="w-64 border-r border-border bg-card animate-pulse" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="h-16 border-b border-border bg-card animate-pulse" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
          <div className="h-96 bg-muted rounded animate-pulse" />
        </main>
      </div>
    </div>
  )
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <Breadcrumbs />
          </div>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  )
}
