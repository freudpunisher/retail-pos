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

    const updateOrder = async (id: string, data: any) => {
    const res = await fetch("/api/purchases", {
      method: "PATCH",
      body: JSON.stringify({ id, ...data }),
    });
    if (!res.ok) throw new Error(await res.text());
  };

  const markAsReceived = async (id: string, userId: string) => {
    const res = await fetch("/api/purchases", {
      method: "POST", // or use /receive if separate
      body: JSON.stringify({ id, userId }),
    });
    if (!res.ok) throw new Error(await res.text());
  };

  const cancelOrder = async (id: string) => {
    const res = await fetch("/api/purchases", {
      method: "POST",
      body: JSON.stringify({ id }), // adjust route if needed
    });
    if (!res.ok) throw new Error(await res.text());
  };

    return { orders, loading, error, refresh: fetchOrders, createOrder, updateOrder, markAsReceived, cancelOrder }
}
