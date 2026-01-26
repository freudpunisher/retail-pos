"use client"

import { useState, useEffect, useCallback } from "react"

export function useClients(search?: string) {
    const [clients, setClients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchClients = useCallback(async (query?: string) => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            const activeQuery = query !== undefined ? query : search
            if (activeQuery) params.append("search", activeQuery)

            const response = await fetch(`/api/clients?${params.toString()}`)
            if (!response.ok) throw new Error("Failed to fetch clients")
            const data = await response.json()
            setClients(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [search])

    useEffect(() => {
        fetchClients()
    }, [fetchClients])

    const createClient = async (clientData: any) => {
        try {
            const response = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clientData),
            })
            if (!response.ok) throw new Error("Failed to create client")
            const newClient = await response.json()
            setClients((prev) => [newClient, ...prev])
            return newClient
        } catch (err: any) {
            setError(err.message)
            throw err
        }
    }

    return { clients, loading, error, refresh: fetchClients, createClient }
}
