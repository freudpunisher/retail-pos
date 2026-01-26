"use client"

import { useState, useEffect, useCallback } from "react"

export function useDashboardStats() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/dashboard/stats")
            if (!response.ok) throw new Error("Failed to fetch dashboard stats")
            const data = await response.json()
            setStats(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    return { stats, loading, error, refresh: fetchStats }
}
