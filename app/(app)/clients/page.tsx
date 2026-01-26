"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/mock-data"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import type { Client } from "@/lib/types"
import { Users, DollarSign, CreditCard, Search, User, Mail, Phone, MapPin, Calendar, History, Loader2 } from "lucide-react"
import { useClients } from "@/hooks/use-clients"
import { useTransactions } from "@/hooks/use-transactions"

export default function ClientsPage() {
  const [search, setSearch] = useState("")
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [showClientDetails, setShowClientDetails] = useState(false)

  const { clients, loading: clientsLoading } = useClients(search)
  const { transactions, fetchTransactions, loading: txLoading } = useTransactions()

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

  const getCreditUtilization = (client: any) => {
    const limit = Number.parseFloat(client.creditLimit)
    if (limit === 0) return 0
    return (Number.parseFloat(client.creditBalance) / limit) * 100
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Clients</h2>
        <p className="text-muted-foreground">Manage your customer database</p>
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
              placeholder="Search clients by name or email..."
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
                  <TableHead className="text-muted-foreground">Credit Balance</TableHead>
                  <TableHead className="text-muted-foreground">Credit Limit</TableHead>
                  <TableHead className="text-muted-foreground">Utilization</TableHead>
                  <TableHead className="text-muted-foreground">Since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Loading clients...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No clients found
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => {
                    const utilization = getCreditUtilization(client)
                    return (
                      <TableRow
                        key={client.id}
                        className="border-border cursor-pointer hover:bg-secondary/50"
                        onClick={() => handleClientClick(client)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
                              <User className="h-5 w-5 text-primary" />
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
                        <TableCell className="text-muted-foreground">
                          {new Date(client.createdAt).toLocaleDateString()}
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

      {/* Client Details Dialog */}
      <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Profile
            </DialogTitle>
            <DialogDescription>Detailed client information and transaction history</DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedClient.name}</h3>
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
                              txn.status === "completed" ? "bg-accent/20 text-accent" : "bg-warning/20 text-warning"
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
