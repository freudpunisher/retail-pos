"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Product, CartItem, Client } from "./types"

interface CartContextType {
  items: CartItem[]
  selectedClient: Client | null
  setSelectedClient: (client: Client | null) => void
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateDiscount: (productId: string, discount: number) => void
  clearCart: () => void
  subtotal: number
  discount: number
  tax: number
  total: number
  taxRate: number
  setTaxRate: (rate: number) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [taxRate, setTaxRate] = useState(0) // Default tax rate 0%

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1, discount: 0 }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== productId))
    } else {
      setItems((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity } : item)))
    }
  }, [])

  const updateDiscount = useCallback((productId: string, discount: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, discount: Math.min(100, Math.max(0, discount)) } : item)),
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setSelectedClient(null)
    setTaxRate(0)
  }, [])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = items.reduce((sum, item) => sum + (item.price * item.quantity * (item.discount / 100)), 0)
  const tax = (subtotal - discount) * (taxRate / 100)
  const total = subtotal - discount + tax

  return (
    <CartContext.Provider
      value={{
        items,
        selectedClient,
        setSelectedClient,
        addItem,
        removeItem,
        updateQuantity,
        updateDiscount,
        clearCart,
        subtotal,
        discount,
        tax,
        total,
        taxRate,
        setTaxRate,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
