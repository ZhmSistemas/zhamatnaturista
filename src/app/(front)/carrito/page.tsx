'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ShoppingCart, Plus, Minus, Trash2, Package, ArrowLeft, Leaf, Truck, ShieldCheck, Loader, LogIn } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/formatPrice'
import { showToast } from 'nextjs-toast-notify'

export default function CartPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, removeItem, updateQuantity, clearCart, itemCount, subtotal, discount, total } = useCart()
  const [clearing, setClearing] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <div className="relative max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 py-12">
        <button
          onClick={() => router.push('/productos')}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Seguir comprando</span>
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900">Tu Carrito</h1>
            <p className="text-gray-500 mt-1">
              {itemCount > 0 ? `${itemCount} producto${itemCount !== 1 ? 's' : ''}` : '0 productos'}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={async () => {
                setClearing(true)
                await clearCart()
                setClearing(false)
                showToast.success('Carrito vaciado')
              }}
              disabled={clearing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-500 border border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {clearing ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Vaciar carrito
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-500 mb-8">Agrega productos para empezar</p>
            <Link
              href="/productos"
              className="px-8 py-3 rounded-xl font-bold text-white bg-linear-to-r from-green-500 to-emerald-500 hover:shadow-lg transition-all duration-300"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 flex gap-4"
                >
                  <Link href={`/productos/${item.productId}`} className="w-24 h-24 rounded-xl overflow-hidden bg-white flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          href={`/productos/${item.productId}`}
                          className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {item.discount && item.discount > 0 ? (
                            <>
                              <p className="text-lg font-bold text-green-600">{formatPrice(item.discount)}</p>
                              <p className="text-sm text-gray-400 line-through">{formatPrice(item.price)}</p>
                            </>
                          ) : (
                            <p className="text-lg font-bold text-green-600">{formatPrice(item.price)}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-10 text-center text-gray-900 font-semibold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 ml-auto">
                        Subtotal: <span className="font-bold text-gray-900">{formatPrice((item.discount ?? item.price) * item.quantity)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Resumen</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-green-600">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => router.push('/checkout/envio')}
                    className="w-full py-3 rounded-xl font-bold text-white bg-linear-to-r from-green-500 to-emerald-500 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {session ? null : <LogIn className="w-4 h-4" />}
                    Continuar compra
                  </button>
                  <Link
                    href="/productos"
                    className="block w-full text-sm font-medium text-center text-gray-500 hover:text-gray-700 transition-colors py-2"
                  >
                    Seguir comprando
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  {[
                    { icon: <Truck className="w-4 h-4" />, text: 'Envío a todo el país' },
                    { icon: <ShieldCheck className="w-4 h-4" />, text: 'Productos 100% naturales' },
                    { icon: <Leaf className="w-4 h-4" />, text: 'Calidad certificada' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-500 text-sm">
                      <span className="text-green-600">{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
