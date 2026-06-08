"use client"

import { useState, useMemo } from "react"
import { useOrders } from "@/hooks/use-orders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/mock-data"
import { Clock, ChefHat, Bell, Utensils, CheckCircle, XCircle, Loader2, User, Table2 } from "lucide-react"
import { useRouter } from "next/navigation"

const statusColors: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
    preparing: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
    ready: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
    served: "bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30",
    paid: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
    cancelled: "bg-red-500/20 text-red-700 dark:text-red-400",
}

export default function OrdersPage() {
    const router = useRouter()
    const { orders, loading, updateOrderStatus } = useOrders()
    const [filter, setFilter] = useState<string>("active")

    const activeOrders = useMemo(() => {
        return orders.filter((o) => !["paid", "cancelled"].includes(o.orderStatus))
    }, [orders])

    const filteredOrders = useMemo(() => {
        if (filter === "active") return activeOrders
        return orders.filter((o) => o.orderStatus === filter)
    }, [orders, activeOrders, filter])

    const handleStatus = async (id: string, status: string) => {
        try {
            await updateOrderStatus(id, { orderStatus: status })
        } catch (err: any) {
            console.error(err)
        }
    }

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { pending: 0, preparing: 0, ready: 0, served: 0, paid: 0, cancelled: 0 }
        orders.forEach((o) => { counts[o.orderStatus] = (counts[o.orderStatus] || 0) + 1 })
        return counts
    }, [orders])

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Orders</h2>
                    <p className="text-muted-foreground">Kitchen & bar order management</p>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
                {[
                    { key: "pending", label: "Pending", icon: Clock, count: statusCounts.pending },
                    { key: "preparing", label: "Preparing", icon: ChefHat, count: statusCounts.preparing },
                    { key: "ready", label: "Ready", icon: Bell, count: statusCounts.ready },
                    { key: "served", label: "Served", icon: Utensils, count: statusCounts.served },
                    { key: "active", label: "Active", icon: CheckCircle, count: activeOrders.length },
                ].map(({ key, label, icon: Icon, count }) => (
                    <Card
                        key={key}
                        className={`cursor-pointer transition-all hover:shadow-md ${filter === key ? "ring-2 ring-primary" : ""}`}
                        onClick={() => setFilter(key)}
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <Icon className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="text-2xl font-bold">{count}</p>
                                <p className="text-xs text-muted-foreground">{label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredOrders.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <CheckCircle className="h-12 w-12 mb-3 opacity-50" />
                        <p className="font-medium">No {filter} orders</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <Card key={order.id} className="border-border/50 hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3 flex flex-row items-start justify-between">
                                <div>
                                    <CardTitle className="text-sm font-mono">
                                        #{order.id.slice(0, 8)}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        {order.table && (
                                            <span className="flex items-center gap-1">
                                                <Table2 className="h-3 w-3" /> T{order.table.number}
                                                {order.table.section && ` (${order.table.section})`}
                                            </span>
                                        )}
                                        {order.waiter && (
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" /> {order.waiter.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Badge className={statusColors[order.orderStatus]}>
                                    {order.orderStatus}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1 mb-3">
                                    {order.items?.map((item: any) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span>{item.quantity}x {item.productName}</span>
                                            <span className="text-muted-foreground">{formatCurrency(Number(item.price) * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                    <span className="font-bold">{formatCurrency(Number(order.total))}</span>
                                    <div className="flex gap-1">
                                        {order.orderStatus === "pending" && (
                                            <Button size="sm" onClick={() => handleStatus(order.id, "preparing")}>
                                                <ChefHat className="h-3 w-3 mr-1" /> Prepare
                                            </Button>
                                        )}
                                        {order.orderStatus === "preparing" && (
                                            <Button size="sm" onClick={() => handleStatus(order.id, "ready")}>
                                                <Bell className="h-3 w-3 mr-1" /> Ready
                                            </Button>
                                        )}
                                        {order.orderStatus === "ready" && (
                                            <Button size="sm" onClick={() => handleStatus(order.id, "served")}>
                                                <Utensils className="h-3 w-3 mr-1" /> Serve
                                            </Button>
                                        )}
                                        {order.orderStatus === "served" && (
                                            <Button size="sm" variant="outline" onClick={() => router.push(`/sales?orderId=${order.id}`)}>
                                                Payment
                                            </Button>
                                        )}
                                        {!["paid", "cancelled"].includes(order.orderStatus) && (
                                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleStatus(order.id, "cancelled")}>
                                                <XCircle className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
