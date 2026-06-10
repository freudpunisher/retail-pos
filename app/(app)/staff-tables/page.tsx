"use client"

import { useState, useMemo } from "react"
import { useUsers } from "@/hooks/use-users"
import { useTables } from "@/hooks/use-tables"
import { useOrders } from "@/hooks/use-orders"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StaffFormDialog } from "@/components/staff-tables/staff-form-dialog"
import { TableFormDialog } from "@/components/staff-tables/table-form-dialog"
import { toast } from "sonner"
import { Plus, Users, Table2, User, Mail, Shield, Pencil, Trash2, Loader2 } from "lucide-react"

export default function StaffTablesPage() {
  const { users, loading: usersLoading, createUser, updateUser, deleteUser } = useUsers()
  const { tables, loading: tablesLoading, createTable, updateTable, deleteTable } = useTables()
  const { orders } = useOrders()

  const [staffDialog, setStaffDialog] = useState<{ open: boolean; staff: any | null }>({ open: false, staff: null })
  const [tableDialog, setTableDialog] = useState<{ open: boolean; table: any | null }>({ open: false, table: null })

  const waiters = useMemo(() => users.filter((u) => u.role === "waiter"), [users])

  const occupiedTableIds = useMemo(() => {
    return new Set(
      orders
        .filter((o) => !["paid", "cancelled"].includes(o.orderStatus) && o.tableId)
        .map((o) => o.tableId),
    )
  }, [orders])

  const handleStaffSubmit = async (data: any) => {
    if (staffDialog.staff) {
      await updateUser(staffDialog.staff.id, data)
      toast.success("Staff updated")
    } else {
      await createUser(data)
      toast.success("Staff added")
    }
  }

  const handleTableSubmit = async (data: any) => {
    if (tableDialog.table) {
      await updateTable(tableDialog.table.id, data)
      toast.success("Table updated")
    } else {
      await createTable(data)
      toast.success("Table added")
    }
  }

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await deleteUser(id)
      toast.success("Staff deleted")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  const handleDeleteTable = async (id: string, number: number) => {
    if (!window.confirm(`Delete Table ${number}? This cannot be undone.`)) return
    try {
      await deleteTable(id)
      toast.success("Table deleted")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  const sections = useMemo(() => {
    const s = new Set<string>()
    tables.forEach((t) => { if (t.section) s.add(t.section) })
    return Array.from(s).sort()
  }, [tables])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Staff & Tables</h2>
        <p className="text-muted-foreground">Manage waiters, staff, and floor tables</p>
      </div>

      <Tabs defaultValue="staff" className="space-y-6">
        <TabsList>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Staff ({users.length})
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <Table2 className="h-4 w-4" /> Tables ({tables.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span><strong className="text-foreground">{waiters.length}</strong> waiters</span>
              <span>&middot;</span>
              <span><strong className="text-foreground">{users.length - waiters.length}</strong> other staff</span>
            </div>
            <Button onClick={() => setStaffDialog({ open: true, staff: null })}>
              <Plus className="h-4 w-4 mr-2" /> Add Staff
            </Button>
          </div>

          {usersLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <Users className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No staff yet</p>
              <p className="text-sm">Add your first team member to get started</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((u) => {
                const roleColors: Record<string, string> = {
                  admin: "bg-red-500/20 text-red-700 dark:text-red-400",
                  manager: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
                  cashier: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
                  waiter: "bg-green-500/20 text-green-700 dark:text-green-400",
                }
                return (
                  <Card key={u.id} className="border-border/50 hover:shadow-md transition-all group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" /> {u.email}
                            </div>
                          </div>
                        </div>
                        <Badge className={roleColors[u.role] || ""}>
                          <Shield className="h-3 w-3 mr-1" /> {u.role}
                        </Badge>
                      </div>
                      <div className="flex justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" onClick={() => setStaffDialog({ open: true, staff: u })}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteStaff(u.id, u.name)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {sections.map((section) => (
                <Badge key={section} variant="outline" className="text-xs">{section}</Badge>
              ))}
            </div>
            <Button onClick={() => setTableDialog({ open: true, table: null })}>
              <Plus className="h-4 w-4 mr-2" /> Add Table
            </Button>
          </div>

          {tablesLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tables.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <Table2 className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No tables configured</p>
              <p className="text-sm">Add your first table to start managing the floor</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tables.map((t) => {
                const isOccupied = occupiedTableIds.has(t.id)
                return (
                  <Card
                    key={t.id}
                    className={`border-border/50 transition-all group ${
                      isOccupied
                        ? "border-destructive/50 bg-destructive/5"
                        : "border-green-500/30 bg-green-500/5"
                    }`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isOccupied ? "bg-destructive/20" : "bg-green-500/20"}`}>
                          <Table2 className={`h-6 w-6 ${isOccupied ? "text-destructive" : "text-green-600"}`} />
                        </div>
                      </div>
                      <p className="text-lg font-bold">T{t.number}</p>
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" /> {t.capacity}p
                      </div>
                      <Badge variant="outline" className={`mt-2 ${isOccupied ? "text-destructive border-destructive/30" : "text-green-600 border-green-500/30"}`}>
                        {isOccupied ? "Occupied" : "Free"}
                      </Badge>
                      {t.section && <p className="text-xs text-muted-foreground mt-1">{t.section}</p>}
                      <div className="flex justify-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" onClick={() => setTableDialog({ open: true, table: t })}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {!isOccupied && (
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteTable(t.id, t.number)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <StaffFormDialog
        staff={staffDialog.staff}
        open={staffDialog.open}
        onOpenChange={(open) => setStaffDialog({ open, staff: open ? staffDialog.staff : null })}
        onSubmit={handleStaffSubmit}
      />

      <TableFormDialog
        table={tableDialog.table}
        open={tableDialog.open}
        onOpenChange={(open) => setTableDialog({ open, table: open ? tableDialog.table : null })}
        onSubmit={handleTableSubmit}
      />
    </div>
  )
}
