"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Loader2, ChefHat, Clock, CheckCircle, CookingPot,
    UtensilsCrossed, Bell, RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface KitchenOrder {
    id: string
    reference: string
    date: string
    orderStatus: string
    waiter?: { id: string; name: string }
    table?: { id: string; number: number }
    items: Array<{
        id: string
        productName: string
        quantity: number
    }>
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    pending: { label: "Pending", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-200" },
    preparing: { label: "Preparing", icon: CookingPot, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-200" },
    ready: { label: "Ready", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-200" },
}

export default function KitchenOrdersPage() {
    const [orders, setOrders] = useState<KitchenOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/orders/kitchen")
            if (res.ok) setOrders(await res.json())
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchOrders() }, [fetchOrders])

    const updateStatus = async (id: string, orderStatus: string) => {
        setUpdatingId(id)
        try {
            const res = await fetch("/api/orders/kitchen", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, orderStatus }),
            })
            if (res.ok) {
                setOrders((prev) =>
                    prev.map((o) => (o.id === id ? { ...o, orderStatus } : o))
                )
            }
        } catch (err) {
            console.error(err)
        } finally {
            setUpdatingId(null)
        }
    }

    const pendingOrders = orders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "preparing")
    const readyOrders = orders.filter((o) => o.orderStatus === "ready")

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <ChefHat className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kitchen Orders</h1>
                        <p className="text-sm text-muted-foreground">
                            {pendingOrders.length} in progress · {readyOrders.length} ready
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {pendingOrders.length > 0 && (
                        <Badge variant="secondary" className="gap-1.5 text-sm px-3 py-1">
                            <Bell className="h-4 w-4 text-amber-500" />
                            {pendingOrders.length} new
                        </Badge>
                    )}
                    <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
                        <RefreshCw className={cn("h-4 w-4 mr-1.5", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Pending", count: orders.filter(o => o.orderStatus === "pending").length, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { label: "Preparing", count: orders.filter(o => o.orderStatus === "preparing").length, icon: CookingPot, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Ready", count: readyOrders.length, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                ].map((s) => (
                    <Card key={s.label} className="border-border/50">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                                <p className="text-2xl font-bold mt-1">{s.count}</p>
                            </div>
                            <div className={`h-10 w-10 rounded-full ${s.bg} flex items-center justify-center`}>
                                <s.icon className={`h-5 w-5 ${s.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Orders Grid */}
            {loading && orders.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : orders.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium text-muted-foreground">No kitchen orders</p>
                        <p className="text-sm text-muted-foreground mt-1">Food orders from cashiers will appear here automatically</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {orders.map((order) => {
                        const config = statusConfig[order.orderStatus] || statusConfig.pending
                        const StatusIcon = config.icon
                        const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0)

                        return (
                            <Card key={order.id} className={cn("border-2", config.bg)}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <StatusIcon className={cn("h-4 w-4", config.color)} />
                                                {order.reference}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {new Date(order.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                {order.waiter && (
                                                    <>
                                                        <span>·</span>
                                                        <span>{order.waiter.name}</span>
                                                    </>
                                                )}
                                                {order.table && (
                                                    <>
                                                        <span>·</span>
                                                        <Badge variant="outline" className="text-xs">T{order.table.number}</Badge>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "text-xs capitalize",
                                            order.orderStatus === "ready" ? "bg-emerald-500 text-white" :
                                            order.orderStatus === "preparing" ? "bg-blue-500 text-white" :
                                            "bg-amber-500 text-white"
                                        )}>
                                            {order.orderStatus}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-1.5">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between text-sm bg-background/80 rounded-lg px-3 py-2">
                                                <span className="font-medium">{item.productName}</span>
                                                <Badge variant="secondary" className="text-xs font-mono shrink-0 ml-2">
                                                    ×{item.quantity}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{order.items.length} item(s)</span>
                                        <span>{totalQty} total</span>
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        {order.orderStatus === "pending" && (
                                            <Button
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => updateStatus(order.id, "preparing")}
                                                disabled={updatingId === order.id}
                                            >
                                                {updatingId === order.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                                ) : (
                                                    <CookingPot className="h-4 w-4 mr-1.5" />
                                                )}
                                                Start Preparing
                                            </Button>
                                        )}
                                        {order.orderStatus === "preparing" && (
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                                onClick={() => updateStatus(order.id, "ready")}
                                                disabled={updatingId === order.id}
                                            >
                                                {updatingId === order.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4 mr-1.5" />
                                                )}
                                                Mark as Ready
                                            </Button>
                                        )}
                                        {order.orderStatus === "ready" && (
                                            <Badge variant="outline" className="flex-1 justify-center py-2 text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20">
                                                <CheckCircle className="h-4 w-4 mr-1.5" />
                                                Ready to Serve
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
