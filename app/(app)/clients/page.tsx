"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/mock-data"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Client } from "@/lib/types"
import {
  Users,
  DollarSign,
  CreditCard,
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  History,
  Loader2,
  Plus,
  Edit2,
  Ban,
  CheckCircle,
  MoreVertical,
} from "lucide-react"
import { useClients } from "@/hooks/use-clients"
import { useTransactions } from "@/hooks/use-transactions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ClientsPage() {
  const [search, setSearch] = useState("")
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [showClientDetails, setShowClientDetails] = useState(false)
  const [showUpsertDialog, setShowUpsertDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { clients, loading: clientsLoading, createClient, updateClient, toggleClientStatus } = useClients(search)
  const { transactions, fetchTransactions, loading: txLoading } = useTransactions()

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    creditLimit: "0",
  })

  useEffect(() => {
    if (showClientDetails) {
      fetchTransactions()
    }
  }, [showClientDetails, fetchTransactions])

  const totalClients = clients.length
  const totalCreditBalance = clients.reduce((sum, c) => sum + Number.parseFloat(c.creditBalance), 0)
  const clientsWithCredit = clients.filter((c) => Number.parseFloat(c.creditBalance) > 0).length

  const getClientTransactions = (clientId: string) => {
    return transactions.filter((t: any) => t.clientId === clientId)
  }

  const handleClientClick = (client: Client) => {
    setSelectedClient(client)
    setShowClientDetails(true)
  }

  const handleOpenCreate = () => {
    setIsEditing(false)
    setFormData({ id: "", name: "", email: "", phone: "", address: "", creditLimit: "0" })
    setShowUpsertDialog(true)
  }

  const handleOpenEdit = (client: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setFormData({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      creditLimit: client.creditLimit,
    })
    setShowUpsertDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (isEditing) {
        await updateClient(formData.id, formData)
      } else {
        await createClient(formData)
      }
      setShowUpsertDialog(false)
    } catch (error) {
      console.error("Failed to save client:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (client: any, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleClientStatus(client.id, !client.isActive)
    } catch (error) {
      console.error("Failed to toggle status:", error)
    }
  }

  const getCreditUtilization = (client: any) => {
    const limit = Number.parseFloat(client.creditLimit)
    if (limit === 0) return 0
    return (Number.parseFloat(client.creditBalance) / limit) * 100
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clients</h2>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add New Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{clientsLoading ? "..." : totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Credit Balance</p>
                <p className="text-2xl font-bold text-warning">{clientsLoading ? "..." : formatCurrency(totalCreditBalance)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clients with Credit</p>
                <p className="text-2xl font-bold">{clientsLoading ? "..." : clientsWithCredit}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-muted-foreground">Client</TableHead>
                  <TableHead className="text-muted-foreground">Contact</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Credit Balance</TableHead>
                  <TableHead className="text-muted-foreground">Credit Limit</TableHead>
                  <TableHead className="text-muted-foreground">Utilization</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Loading clients...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No clients found
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => {
                    const utilization = getCreditUtilization(client)
                    return (
                      <TableRow
                        key={client.id}
                        className={`border-border cursor-pointer hover:bg-secondary/50 ${!client.isActive ? 'opacity-60' : ''}`}
                        onClick={() => handleClientClick(client)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${client.isActive ? 'bg-primary/20' : 'bg-muted'}`}>
                              <User className={`h-5 w-5 ${client.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                            <div>
                              <p className="font-medium">{client.name}</p>
                              <p className="text-sm text-muted-foreground">{client.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{client.phone}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={client.isActive ? "default" : "secondary"} className={client.isActive ? "bg-accent/20 text-accent font-bold ring-1 ring-accent/30" : ""}>
                            {client.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {Number.parseFloat(client.creditBalance) > 0 ? (
                            <span className="font-medium text-warning">{formatCurrency(Number.parseFloat(client.creditBalance))}</span>
                          ) : (
                            <Badge className="bg-accent/20 text-accent" variant="outline">No Balance</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(Number.parseFloat(client.creditLimit))}</TableCell>
                        <TableCell>
                          <div className="w-24">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>{utilization.toFixed(0)}%</span>
                            </div>
                            <Progress value={utilization} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => handleOpenEdit(client, e)}>
                                <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => handleToggleStatus(client, e)}
                                className={client.isActive ? "text-destructive" : "text-accent"}
                              >
                                {client.isActive ? (
                                  <><Ban className="mr-2 h-4 w-4" /> Deactivate</>
                                ) : (
                                  <><CheckCircle className="mr-2 h-4 w-4" /> Activate</>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showUpsertDialog} onOpenChange={setShowUpsertDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Client" : "Add New Client"}</DialogTitle>
              <DialogDescription>
                Fill in the client details below. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full Name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 890"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="creditLimit">Credit Limit</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  step="0.01"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Physical Address"
                  className="h-20"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowUpsertDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Client Details Dialog */}
      <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Profile
              </div>
              {selectedClient && (
                <Badge variant={selectedClient.isActive ? "default" : "secondary"}>
                  {selectedClient.isActive ? "Active" : "Inactive"}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>Detailed client information and transaction history</DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${selectedClient.isActive ? 'bg-primary/20' : 'bg-muted'}`}>
                  <User className={`h-8 w-8 ${selectedClient.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{selectedClient.name}</h3>
                    <Button variant="outline" size="sm" onClick={(e) => handleOpenEdit(selectedClient, e)}>
                      <Edit2 className="mr-2 h-3 w-3" /> Edit Profile
                    </Button>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{selectedClient.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{selectedClient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedClient.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Client since {new Date(selectedClient.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <p className="text-sm text-muted-foreground">Credit Balance</p>
                  <p className="text-2xl font-bold text-warning">{formatCurrency(Number.parseFloat(selectedClient.creditBalance))}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <p className="text-sm text-muted-foreground">Credit Limit</p>
                  <p className="text-2xl font-bold">{formatCurrency(Number.parseFloat(selectedClient.creditLimit))}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Credit Utilization</p>
                <Progress value={getCreditUtilization(selectedClient)} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {getCreditUtilization(selectedClient).toFixed(1)}% of credit limit used
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <History className="h-4 w-4" />
                  Recent Transactions
                </h4>
                {txLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : getClientTransactions(selectedClient.id).length > 0 ? (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {getClientTransactions(selectedClient.id).map((txn: any) => (
                      <div
                        key={txn.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
                      >
                        <div>
                          <p className="font-mono text-xs overflow-hidden text-ellipsis block max-w-[150px]">{txn.id}</p>
                          <p className="text-xs text-muted-foreground">{new Date(txn.date).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(Number.parseFloat(txn.total))}</p>
                          <Badge
                            className={
                              txn.status === "completed" ? "bg-accent/20 text-accent font-bold ring-1 ring-accent/30" : "bg-warning/20 text-warning font-bold ring-1 ring-warning/30"
                            }
                          >
                            {txn.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No transactions yet</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
