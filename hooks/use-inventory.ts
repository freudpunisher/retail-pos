"use client"

import { useState, useEffect, useCallback } from "react"

export function useInventory() {
    const [inventoryItems, setInventoryItems] = useState<any[]>([])
    const [adjustments, setAdjustments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchInventory = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/inventory")
            if (!response.ok) throw new Error("Failed to fetch inventory")
            const data = await response.json()
            setInventoryItems(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchAdjustments = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/inventory/adjustments")
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
            const response = await fetch("/api/inventory/adjustments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(adjustmentData),
            })
            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.error || "Failed to create adjustment")
            }
            const newAdjustment = await response.json()
            fetchInventory()
            fetchAdjustments()
            return newAdjustment
        } catch (err: any) {
            setError(err.message)
            throw err
        }
    }

    useEffect(() => {
        fetchInventory()
        fetchAdjustments()
    }, [fetchInventory, fetchAdjustments])

    return {
        inventoryItems,
        adjustments,
        loading,
        error,
        refresh: () => { fetchInventory(); fetchAdjustments(); },
        createAdjustment
    }
}
