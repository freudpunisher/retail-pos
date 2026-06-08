"use client"

import { useState, useCallback } from "react"

export function useTransactions() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchTransactions = useCallback(async (dateFrom?: string, dateTo?: string) => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (dateFrom) params.append("dateFrom", dateFrom)
            if (dateTo) params.append("dateTo", dateTo)
            const url = `/api/transactions${params.toString() ? `?${params.toString()}` : ""}`
            const response = await fetch(url)
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
