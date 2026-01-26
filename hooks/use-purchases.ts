"use client"

import { useState, useEffect, useCallback } from "react"

export function usePurchases() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/purchase-orders")
            if (!response.ok) throw new Error("Failed to fetch purchase orders")
            const data = await response.json()
            setOrders(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const createOrder = async (orderData: any) => {
        try {
            const response = await fetch("/api/purchase-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            })
            if (!response.ok) throw new Error("Failed to create purchase order")
            const newOrder = await response.json()
            setOrders((prev) => [newOrder, ...prev])
            return newOrder
        } catch (err: any) {
            setError(err.message)
            throw err
        }
    }

    return { orders, loading, error, refresh: fetchOrders, createOrder }
}
