"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ClipboardList, Plus, Calendar, User, Loader2, ArrowRight, CheckCircle2, Clock, History as HistoryIcon } from "lucide-react"
import { useInventorySessions } from "@/hooks/use-inventory-sessions"
import { useUsers } from "@/hooks/use-users"

export default function InventoryCountPage() {
    const router = useRouter()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isStarting, setIsStarting] = useState(false)
    const [formData, setFormData] = useState({
        countedBy: "",
        notes: "",
    })

    const { sessions, loading, startSession } = useInventorySessions()
    const { users } = useUsers()

    const handleStartSession = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsStarting(true)
        try {
            const session = await startSession(formData)
            setIsDialogOpen(false)
            router.push(`/inventory/count/${session.id}`)
        } catch (error) {
            console.error("Failed to start session:", error)
        } finally {
            setIsStarting(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "reconciled":
                return <Badge className="bg-accent/20 text-accent font-bold ring-1 ring-accent/30 lowercase"><CheckCircle2 className="mr-1 h-3 w-3" /> Reconciled</Badge>
            case "completed":
                return <Badge className="bg-primary/20 text-primary font-bold ring-1 ring-primary/30 lowercase">Completed</Badge>
            case "in_progress":
                return <Badge className="bg-warning/20 text-warning font-bold ring-1 ring-warning/30 lowercase"><Clock className="mr-1 h-3 w-3" /> In Progress</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Physical Inventory Counts</h2>
                    <p className="text-muted-foreground">Start and manage physical stock verification sessions</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                            <Plus className="mr-2 h-4 w-4" />
                            New Count Session
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleStartSession}>
                            <DialogHeader>
                                <DialogTitle>Start Count Session</DialogTitle>
                                <DialogDescription>
                                    Select location and assign staff to begin a physical count.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Assign Staff</Label>
                                    <Select
                                        value={formData.countedBy}
                                        onValueChange={(val) => setFormData({ ...formData, countedBy: val })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Who is performing the count?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map(u => (
                                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Notes (Optional)</Label>
                                    <Textarea
                                        placeholder="Reason for count, specific instructions, etc."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="h-24 resize-none"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isStarting}>
                                    {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Begin Count
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-secondary/10 border-b border-border/50">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <HistoryIcon className="h-5 w-5 text-primary" />
                        Session History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-secondary/5 border-border/50">
                                <TableHead className="py-4 px-6 font-bold">Session ID</TableHead>
                                <TableHead className="py-4 px-6 font-bold">Date</TableHead>
                                <TableHead className="py-4 px-6 font-bold">Staff</TableHead>
                                <TableHead className="py-4 px-6 font-bold">Items</TableHead>
                                <TableHead className="py-4 px-6 font-bold">Status</TableHead>
                                <TableHead className="py-4 px-6 font-bold text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                        <p className="mt-2 text-sm text-muted-foreground">Fetching sessions...</p>
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && sessions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                                        No count sessions recorded yet.
                                    </TableCell>
                                </TableRow>
                            )}
                            {sessions.map((session) => (
                                <TableRow key={session.id} className="border-border/50 hover:bg-secondary/5 group transition-colors">
                                    <TableCell className="font-mono text-xs opacity-50 py-4 px-6">
                                        {session.id.substring(0, 8)}
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Calendar className="h-3 w-3 text-primary" />
                                            {new Date(session.countDate).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <User className="h-3 w-3 text-primary" />
                                            {session.user?.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <Badge variant="outline" className="font-mono font-bold">{session.items?.length || 0}</Badge>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        {getStatusBadge(session.status)}
                                    </TableCell>
                                    <TableCell className="text-right py-4 px-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="group/btn hover:text-primary transition-all font-bold"
                                            onClick={() => router.push(`/inventory/count/${session.id}`)}
                                        >
                                            {session.status === "reconciled" ? "View Details" : "Continue Count"}
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
