export type UserRole = "admin" | "manager" | "cashier" | "waiter"
export type ProductType = "drink" | "food" | "ingredient"
export type OrderStatus = "pending" | "preparing" | "ready" | "served" | "paid" | "cancelled"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface Product {
  id: string
  sku: string
  name: string
  category: string
  productType: ProductType
  price: number
  stock: number
  minStock: number
  trackStock: boolean
  image?: string
}

export interface CartItem extends Product {
  quantity: number
  discount: number
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  creditBalance: number
  creditLimit: number
  createdAt: string
}

export interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

export interface Transaction {
  id: string
  type: "sale" | "purchase" | "credit_payment"
  date: string
  total: number
  status: "completed" | "pending" | "cancelled"
  orderStatus: OrderStatus
  paymentMethod?: "cash" | "credit" | "card"
  clientId?: string
  items: TransactionItem[]
  userId: string
  waiterId?: string
  tableId?: string
  waiter?: { id: string; name: string }
  table?: { id: string; number: number; section?: string }
}

export interface TransactionItem {
  productId: string
  productName: string
  quantity: number
  price: number
  discount: number
}

export interface PurchaseOrder {
  id: string
  supplierId: string
  date: string
  status: "pending" | "received" | "cancelled"
  total: number
  items: PurchaseOrderItem[]
}

export interface PurchaseOrderItem {
  productId: string
  productName: string
  quantity: number
  cost: number
}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  type: "sale" | "purchase" | "adjustment"
  quantity: number
  date: string
  userId: string
  notes?: string
}

export interface CreditRecord {
  id: string
  clientId: string
  transactionId: string
  amount: number
  paidAmount: number
  dueDate: string
  status: "paid" | "partial" | "overdue" | "pending"
  payments: CreditPayment[]
}

export interface CreditPayment {
  id: string
  amount: number
  date: string
  method: "cash" | "card"
}

export interface StoreSettings {
  name: string
  address: string
  phone: string
  email: string
  taxRate: number
  currency: string
  currencySymbol: string
}

export interface Category {
  id: string
  name: string
  description?: string
}

export interface Location {
  id: string
  name: string
  type: "principal" | "secondary"
  isActive: boolean
}

export interface RestoTable {
  id: string
  number: number
  capacity: number
  status: "free" | "occupied" | "reserved"
  section?: string
}

export interface StockTransfer {
  id: string
  productId: string
  fromLocationId: string
  toLocationId: string
  quantity: number
  userId: string
  date: string
  notes?: string
  product?: { name: string; sku: string }
  fromLocation?: { name: string }
  toLocation?: { name: string }
}
