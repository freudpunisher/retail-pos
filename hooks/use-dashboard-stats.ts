"use client"

import { useState, useEffect, useCallback } from "react"

export function useDashboardStats(period: string = "today") {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = useCallback(async (p: string = period) => {
        setLoading(true)
        try {
            const url = new URL("/api/dashboard/stats", typeof window === "undefined" ? "http://localhost" : window.location.origin)
            url.searchParams.set("period", p)
            const response = await fetch(url.toString())
            if (!response.ok) throw new Error("Failed to fetch dashboard stats")
            const data = await response.json()
            setStats(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [period])

    useEffect(() => {
        fetchStats(period)
    }, [period, fetchStats])

    return { stats, loading, error, refresh: fetchStats }
}
