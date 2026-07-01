'use client'

import { useState } from 'react'
import { ShoppingCart, Check, Loader } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { showToast } from 'nextjs-toast-notify'

type Props = {
  productId: string
  productName: string
  stock: number
  className?: string
}

export default function AddToCartButton({ productId, productName, stock, className = '' }: Props) {
  const { addItem, openCart } = useCart()
  const [added, setAdded] = useState(false)
  const [adding, setAdding] = useState(false)

  const handleClick = async () => {
    if (adding || stock === 0) return
    setAdding(true)
    try {
      await addItem(productId, 1)
      setAdded(true)
      openCart()
      showToast.success(`${productName} agregado al carrito`)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      showToast.error('Error al agregar al carrito')
    } finally {
      setAdding(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={stock === 0 || adding}
      className={`flex items-center justify-center gap-2 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {adding ? (
        <Loader className="w-5 h-5 animate-spin" />
      ) : added ? (
        <Check className="w-5 h-5" />
      ) : (
        <ShoppingCart className="w-5 h-5" />
      )}
      {stock > 0 ? (added ? 'Agregado' : 'Agregar al carrito') : 'Agotado'}
    </button>
  )
}
