"use client"

import { useState, useEffect, useCallback } from "react"

export function useStock() {
    const [stockItems, setStockItems] = useState<any[]>([])
    const [adjustments, setAdjustments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStock = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/stock")
            if (!response.ok) throw new Error("Failed to fetch stock status")
            const data = await response.json()
            setStockItems(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchAdjustments = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/stock/adjustments")
            if (!response.ok) throw new Error("Failed to fetch adjustments")
            const data = await response.json()
            setAdjustments(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const createAdjustment = async (adjustmentData: any) => {
        try {
            const response = await fetch("/api/stock/adjustments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(adjustmentData),
            })
            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.error || "Failed to create adjustment")
            }
            const newAdjustment = await response.json()
            fetchStock()
            fetchAdjustments()
            return newAdjustment
        } catch (err: any) {
            setError(err.message)
            throw err
        }
    }

    useEffect(() => {
        fetchStock()
        fetchAdjustments()
    }, [fetchStock, fetchAdjustments])

    return {
        stockItems,
        adjustments,
        loading,
        error,
        refresh: () => { fetchStock(); fetchAdjustments(); },
        createAdjustment
    }
}
