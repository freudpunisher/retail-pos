"use client"

import { useState, useEffect, useCallback } from "react"

export function usePurchaseOrders() {
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchPurchaseOrders = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/purchase-orders")
            if (!response.ok) throw new Error("Failed to fetch purchase orders")
            const data = await response.json()
            setPurchaseOrders(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPurchaseOrders()
    }, [fetchPurchaseOrders])

    return { purchaseOrders, loading, error, refresh: fetchPurchaseOrders }
}
