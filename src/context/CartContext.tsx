'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export type CartItemType = {
  productId: string
  name: string
  price: number
  discount?: number
  image?: string
  quantity: number
}

type CartContextType = {
  items: CartItemType[]
  loading: boolean
  addItem: (productId: string, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  itemCount: number
  subtotal: number
  discount: number
  total: number
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'zhamat_cart_items'

function loadItems(): CartItemType[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveItems(items: CartItemType[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([])
  const [initialized, setInitialized] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const openCart = useCallback(() => setCartOpen(true), [])
  const closeCart = useCallback(() => setCartOpen(false), [])

  useEffect(() => {
    setItems(loadItems())
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (initialized) saveItems(items)
  }, [items, initialized])

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    const res = await fetch(`/api/products/${productId}`)
    if (!res.ok) throw new Error('Producto no encontrado')

    const product = await res.json()
    if (product.stock < 1) throw new Error('Producto agotado')

    setItems(prev => {
      const existing = prev.find(i => i.productId === productId)
      if (existing) {
        return prev.map(i =>
          i.productId === productId
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        )
      }
      return [...prev, {
        productId: product._id,
        name: product.name,
        price: product.price,
        discount: product.discount || undefined,
        image: product.image || undefined,
        quantity: Math.min(quantity, product.stock),
      }]
    })
  }, [])

  const removeItem = useCallback(async (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }, [])

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.productId !== productId))
      return
    }
    setItems(prev =>
      prev.map(i =>
        i.productId === productId ? { ...i, quantity } : i
      )
    )
  }, [])

  const clearCart = useCallback(async () => {
    setItems([])
  }, [])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountTotal = items.reduce(
    (sum, item) => sum + ((item.discount ?? item.price) * item.quantity),
    0
  )
  const totalDiscount = subtotal - discountTotal

  return (
    <CartContext.Provider
      value={{
        items,
        loading: !initialized,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discount: totalDiscount,
        total: discountTotal,
        cartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider')
  }
  return context
}
