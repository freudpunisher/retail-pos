"use client"

import { useState, useCallback } from "react"

export function useTransactions() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchTransactions = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/transactions")
            if (!response.ok) throw new Error("Failed to fetch transactions")
            const data = await response.json()
            setTransactions(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const processTransaction = useCallback(async (transactionData: any) => {
        setLoading(true)
        try {
            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transactionData),
            })
            if (!response.ok) throw new Error("Failed to process transaction")
            const data = await response.json()
            return data
        } catch (err: any) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    return { transactions, processTransaction, fetchTransactions, loading, error }
}
