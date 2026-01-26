"use client"

import { useState, useEffect, useCallback } from "react"

export function useStockMovements() {
    const [movements, setMovements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchMovements = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/stock-movements")
            if (!response.ok) throw new Error("Failed to fetch stock movements")
            const data = await response.json()
            setMovements(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchMovements()
    }, [fetchMovements])

    const createMovement = async (movementData: any) => {
        try {
            const response = await fetch("/api/stock-movements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(movementData),
            })
            if (!response.ok) throw new Error("Failed to create stock movement")
            const newMovement = await response.json()
            setMovements((prev) => [newMovement, ...prev])
            return newMovement
        } catch (err: any) {
            setError(err.message)
            throw err
        }
    }

    return { movements, loading, error, refresh: fetchMovements, createMovement }
}
