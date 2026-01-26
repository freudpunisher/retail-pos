"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { mockCreditRecords, getClientById, formatCurrency } from "@/lib/mock-data"
import type { CreditRecord } from "@/lib/types"
import { CreditCard, DollarSign, AlertTriangle, CheckCircle, Clock, Banknote, History } from "lucide-react"

export default function CreditManagementPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRecord, setSelectedRecord] = useState<CreditRecord | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")

  const filteredRecords = useMemo(() => {
    return mockCreditRecords.filter((record) => {
      return statusFilter === "all" || record.status === statusFilter
    })
  }, [statusFilter])

  const totalOutstanding = mockCreditRecords.reduce((sum, r) => sum + (r.amount - r.paidAmount), 0)
  const overdueCount = mockCreditRecords.filter((r) => r.status === "overdue").length
  const paidCount = mockCreditRecords.filter((r) => r.status === "paid").length
  const pendingCount = mockCreditRecords.filter((r) => r.status === "pending" || r.status === "partial").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-accent/20 text-accent">Paid</Badge>
      case "partial":
        return <Badge className="bg-primary/20 text-primary">Partial</Badge>
      case "pending":
        return <Badge className="bg-warning/20 text-warning">Pending</Badge>
      case "overdue":
        return <Badge className="bg-destructive/20 text-destructive">Overdue</Badge>
      default:
        return null
    }
  }

  const handleRecordPayment = () => {
    console.log("Recording payment:", paymentAmount, "for record:", selectedRecord?.id)
    setShowPaymentDialog(false)
    setPaymentAmount("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Credit Management</h2>
        <p className="text-muted-foreground">Track and manage credit sales and payments</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Outstanding</p>
                <p className="text-2xl font-bold text-warning">{formatCurrency(totalOutstanding)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending / Partial</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-accent">{paidCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Filter by status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Credit Records Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-muted-foreground">ID</TableHead>
                  <TableHead className="text-muted-foreground">Client</TableHead>
                  <TableHead className="text-muted-foreground">Transaction</TableHead>
                  <TableHead className="text-muted-foreground text-right">Amount</TableHead>
                  <TableHead className="text-muted-foreground text-right">Paid</TableHead>
                  <TableHead className="text-muted-foreground text-right">Remaining</TableHead>
                  <TableHead className="text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      No credit records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => {
                    const client = getClientById(record.clientId)
                    const remaining = record.amount - record.paidAmount
                    const progress = (record.paidAmount / record.amount) * 100
                    const isOverdue = new Date(record.dueDate) < new Date() && record.status !== "paid"

                    return (
                      <TableRow key={record.id} className="border-border">
                        <TableCell className="font-mono text-sm">{record.id}</TableCell>
                        <TableCell className="font-medium">{client?.name || "Unknown"}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {record.transactionId}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(record.amount)}</TableCell>
                        <TableCell className="text-right">
                          <div>
                            <span className="font-medium text-accent">{formatCurrency(record.paidAmount)}</span>
                            <Progress value={progress} className="mt-1 h-1.5 w-16" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={remaining > 0 ? "font-medium text-warning" : "text-muted-foreground"}>
                            {formatCurrency(remaining)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={isOverdue ? "text-destructive" : ""}>
                            {new Date(record.dueDate).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {record.status !== "paid" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedRecord(record)
                                  setShowPaymentDialog(true)
                                }}
                              >
                                <Banknote className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRecord(record)
                                setShowHistoryDialog(true)
                              }}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* Record Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a payment for credit record {selectedRecord?.id}</DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Client</span>
                  <span className="font-medium">{getClientById(selectedRecord.clientId)?.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium">{formatCurrency(selectedRecord.amount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Already Paid</span>
                  <span className="font-medium text-accent">{formatCurrency(selectedRecord.paidAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-bold text-warning">
                    {formatCurrency(selectedRecord.amount - selectedRecord.paidAmount)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} disabled={!paymentAmount || Number(paymentAmount) <= 0}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
            <DialogDescription>Payment history for {selectedRecord?.id}</DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">{formatCurrency(selectedRecord.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid:</span>
                  <span className="font-medium text-accent">{formatCurrency(selectedRecord.paidAmount)}</span>
                </div>
              </div>

              {selectedRecord.payments.length > 0 ? (
                <div className="space-y-2">
                  {selectedRecord.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                    >
                      <div>
                        <p className="font-mono text-sm">{payment.id}</p>
                        <p className="text-xs text-muted-foreground">{new Date(payment.date).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-accent">{formatCurrency(payment.amount)}</p>
                        <Badge variant="outline" className="text-xs">
                          {payment.method}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No payments recorded yet</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
