'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Package, CreditCard, Banknote, Smartphone, Receipt, CheckCircle, Wallet } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/formatPrice'

type ShippingData = {
  nombreCompleto: string
  direccion: string
  ciudad: string
  whatsapp: string
  barrio: string
}

export default function PagoPage() {
  const { status } = useSession()
  const router = useRouter()
  const { items, total, subtotal, discount } = useCart()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [shipping] = useState<ShippingData | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zhamat_shipping_data')
      if (stored) return JSON.parse(stored)
    }
    return null
  })

  useEffect(() => {
    window.scrollTo(0, 0)
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
  }, [status, router])

  const handleContinue = () => {
    if (!selectedMethod || !shipping) return

    const data = { ...shipping, paymentMethod: selectedMethod }
    localStorage.setItem('zhamat_shipping_data', JSON.stringify(data))
    router.push('/checkout/resumen')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!shipping || items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay pedido pendiente</h2>
          <p className="text-gray-500 mb-8">Completa primero tus datos de envío</p>
          <button
            onClick={() => router.push('/checkout/envio')}
            className="px-8 py-3 rounded-xl font-bold text-white bg-linear-to-r from-green-500 to-emerald-500 hover:shadow-lg transition-all duration-300"
          >
            Ir a datos de envío
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 py-12">
        <button
          onClick={() => router.push('/checkout/envio')}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a datos de envío</span>
        </button>

        <h1 className="text-4xl font-black text-gray-900 mb-2">Método de pago</h1>
        <p className="text-gray-500 mb-8">Selecciona cómo deseas pagar tu pedido</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Forma de pago</h3>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('efectivo')}
                  className={`w-full flex items-center gap-5 p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedMethod === 'efectivo'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMethod === 'efectivo' ? 'bg-green-500' : 'bg-gray-100'
                  }`}>
                    <Banknote className={`w-6 h-6 ${selectedMethod === 'efectivo' ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Efectivo</p>
                    <p className="text-sm text-gray-500">Paga en efectivo al recibir tu pedido</p>
                  </div>
                  {selectedMethod === 'efectivo' && (
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('tarjeta')}
                  className={`w-full flex items-center gap-5 p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedMethod === 'tarjeta'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMethod === 'tarjeta' ? 'bg-green-500' : 'bg-gray-100'
                  }`}>
                    <CreditCard className={`w-6 h-6 ${selectedMethod === 'tarjeta' ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Tarjeta</p>
                    <p className="text-sm text-gray-500">Paga con tarjeta de crédito o débito</p>
                  </div>
                  {selectedMethod === 'tarjeta' && (
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('nequi')}
                  className={`w-full flex items-center gap-5 p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedMethod === 'nequi'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMethod === 'nequi' ? 'bg-green-500' : 'bg-gray-100'
                  }`}>
                    <Smartphone className={`w-6 h-6 ${selectedMethod === 'nequi' ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Nequi</p>
                    <p className="text-sm text-gray-500">Transferencia por Nequi (online)</p>
                  </div>
                  {selectedMethod === 'nequi' && (
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('daviplata')}
                  className={`w-full flex items-center gap-5 p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedMethod === 'daviplata'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMethod === 'daviplata' ? 'bg-green-500' : 'bg-gray-100'
                  }`}>
                    <Wallet className={`w-6 h-6 ${selectedMethod === 'daviplata' ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Daviplata</p>
                    <p className="text-sm text-gray-500">Transferencia por Daviplata (online)</p>
                  </div>
                  {selectedMethod === 'daviplata' && (
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('efecty')}
                  className={`w-full flex items-center gap-5 p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedMethod === 'efecty'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMethod === 'efecty' ? 'bg-green-500' : 'bg-gray-100'
                  }`}>
                    <Receipt className={`w-6 h-6 ${selectedMethod === 'efecty' ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Efecty</p>
                    <p className="text-sm text-gray-500">Transferencia bancaria por Efecty (online)</p>
                  </div>
                  {selectedMethod === 'efecty' && (
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Productos</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-200"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-semibold truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">Cant: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      {item.discount && item.discount > 0 ? (
                        <>
                          <p className="font-bold text-green-600">{formatPrice(item.discount)}</p>
                          <p className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</p>
                        </>
                      ) : (
                        <p className="font-bold text-green-600">{formatPrice(item.price)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4 sticky top-24">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
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
              <div className="mt-4 text-xs text-gray-400">
                {items.length} producto{items.length !== 1 ? 's' : ''}
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedMethod}
              className="w-full py-3 rounded-xl font-bold text-white bg-linear-to-r from-green-500 to-emerald-500 hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
