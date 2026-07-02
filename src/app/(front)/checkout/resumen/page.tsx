'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Package, MapPin, Phone, User, Home, Building2, CreditCard, Banknote, Loader, AlertTriangle, PencilLine, CheckCircle } from 'lucide-react'
import { showToast } from 'nextjs-toast-notify'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/formatPrice'
import WompiCardForm from '@/components/WompiCardForm'

type ResumenData = {
  nombreCompleto: string
  direccion: string
  ciudad: string
  whatsapp: string
  barrio: string
  paymentMethod: string
}

export default function ResumenPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items, total, subtotal, discount, delivery, clearCart } = useCart()
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingTransaction, setPendingTransaction] = useState<{ id: string; status: string; reference: string } | null>(null)
  const pollingRef = useRef(false)
  const [data] = useState<ResumenData | null>(() => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem('zhamat_shipping_data')
    return stored ? JSON.parse(stored) : null
  })

  const handleEfectivo = useCallback(async () => {
    if (!data) return
    setSaving(true)
    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreCompleto: data.nombreCompleto,
          direccion: data.direccion,
          ciudad: data.ciudad,
          whatsapp: data.whatsapp,
          barrio: data.barrio,
          items,
          subtotal,
          discount,
          delivery,
          total,
          paymentMethod: 'efectivo',
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Error al confirmar el pedido')
      }

      await clearCart()
      localStorage.removeItem('zhamat_shipping_data')

      router.push('/checkout/confirmacion')
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : 'Error al confirmar', {
        duration: 4000,
        position: 'top-center',
      })
    } finally {
      setSaving(false)
    }
  }, [data, items, subtotal, discount, total, clearCart, router])

  const handleTarjetaRejected = useCallback(async (transaction: { id: string; status: string; reference: string }) => {
    console.log('🔍 [ResumenPage] handleTarjetaRejected called with:', transaction)
    if (!data) return
    try {
      await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreCompleto: data.nombreCompleto,
          direccion: data.direccion,
          ciudad: data.ciudad,
          whatsapp: data.whatsapp,
          barrio: data.barrio,
          items,
          subtotal,
          discount,
          delivery,
          total,
          paymentMethod: 'tarjeta',
          wompiTransactionId: transaction.id,
          wompiReference: transaction.reference,
          wompiStatus: 'DECLINED',
          status: 'rejected',
        }),
      })
    } catch {
      // ignore — still redirect to rejected page
    }
    const msg = encodeURIComponent('El pago fue rechazado por el banco emisor')
    router.push(`/checkout/rechazado?message=${msg}`)
  }, [data, items, subtotal, discount, total, router])

  const handleTarjetaSuccess = useCallback(async (transaction: { id: string; status: string; reference: string }) => {
    console.log('🔍 [ResumenPage] handleTarjetaSuccess called with:', transaction)
    if (!data) return

    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreCompleto: data.nombreCompleto,
          direccion: data.direccion,
          ciudad: data.ciudad,
          whatsapp: data.whatsapp,
          barrio: data.barrio,
          items,
          subtotal,
          discount,
          delivery,
          total,
          paymentMethod: 'tarjeta',
          wompiTransactionId: transaction.id,
          wompiReference: transaction.reference,
          wompiStatus: 'APPROVED',
          status: 'paid',
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Error al guardar el pedido')
      }

      await clearCart()
      localStorage.removeItem('zhamat_shipping_data')
      localStorage.setItem('wompi_debug_response', JSON.stringify(transaction))

      router.push('/checkout/confirmacion')
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : 'Error al guardar', {
        duration: 4000,
        position: 'top-center',
      })
    }
  }, [data, items, subtotal, discount, total, clearCart, router])

  const handleTarjetaPending = useCallback(async (transaction: { id: string; status: string; reference: string }) => {
    console.log('🔍 [ResumenPage] handleTarjetaPending called with:', transaction)
    if (!data) return

    try {
      await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreCompleto: data.nombreCompleto,
          direccion: data.direccion,
          ciudad: data.ciudad,
          whatsapp: data.whatsapp,
          barrio: data.barrio,
          items,
          subtotal,
          discount,
          delivery,
          total,
          paymentMethod: 'tarjeta',
          wompiTransactionId: transaction.id,
          wompiReference: transaction.reference,
          wompiStatus: 'PENDING',
          status: 'pending',
        }),
      })
    } catch {
      // ignore
    }

    setPendingTransaction(transaction)
  }, [data, items, subtotal, discount, delivery, total])

  useEffect(() => {
    if (!pendingTransaction) return
    if (pollingRef.current) return
    pollingRef.current = true

    const id = pendingTransaction.id
    let mounted = true

    const poll = async () => {
      try {
        const res = await fetch(`/api/wompi/transaction-status?id=${id}`)
        if (!res.ok) return
        const data = await res.json()
        const status = data.transaction?.status
        console.log('🔍 [ResumenPage] poll status:', status)

        if (status === 'APPROVED') {
          pollingRef.current = false
          if (mounted) {
            await fetch('/api/shipping', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                wompiStatus: 'APPROVED',
                status: 'paid',
                wompiTransactionId: data.transaction?.id,
                wompiReference: data.transaction?.reference,
              }),
            })
            localStorage.setItem('wompi_debug_response', JSON.stringify(data.transaction))
            await clearCart()
            localStorage.removeItem('zhamat_shipping_data')
            setPendingTransaction(null)
            router.push('/checkout/confirmacion')
          }
          return
        }

        if (status === 'DECLINED') {
          pollingRef.current = false
          if (mounted) {
            await fetch('/api/shipping', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                wompiStatus: 'DECLINED',
                status: 'rejected',
              }),
            })
            const msg = encodeURIComponent('El pago fue rechazado por el banco emisor')
            setPendingTransaction(null)
            router.push(`/checkout/rechazado?message=${msg}`)
          }
          return
        }

        setTimeout(poll, 3000)
      } catch {
        setTimeout(poll, 3000)
      }
    }

    poll()

    return () => { mounted = false }
  }, [pendingTransaction, clearCart, router])

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

  if (!data || items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay pedido pendiente</h2>
          <p className="text-gray-500 mb-8">Completa tus datos de envío y forma de pago primero</p>
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
          onClick={() => router.push('/checkout/pago')}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a método de pago</span>
        </button>

        <h1 className="text-4xl font-black text-gray-900 mb-2">Resumen del pedido</h1>
        <p className="text-gray-500 mb-8">Revisa todos los detalles antes de confirmar</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-500" />
                  Datos de envío
                </h3>
                <button
                  onClick={() => router.push('/checkout/envio')}
                  className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
                >
                  <PencilLine className="w-4 h-4" />
                  Editar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Nombre</p>
                    <p className="text-gray-900 font-medium">{data.nombreCompleto}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">WhatsApp</p>
                    <p className="text-gray-900 font-medium">{data.whatsapp}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Home className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Dirección</p>
                    <p className="text-gray-900 font-medium">{data.direccion}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Ciudad</p>
                    <p className="text-gray-900 font-medium">{data.ciudad}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Barrio</p>
                    <p className="text-gray-900 font-medium">{data.barrio}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {data.paymentMethod === 'efectivo' ? (
                    <Banknote className="w-5 h-5 text-green-500" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-green-500" />
                  )}
                  Forma de pago
                </h3>
                <button
                  onClick={() => router.push('/checkout/pago')}
                  className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
                >
                  <PencilLine className="w-4 h-4" />
                  Editar
                </button>
              </div>
              <p className="text-gray-900 font-medium capitalize">
                {data.paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta de crédito/débito'}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-500" />
                  Productos
                </h3>
                <button
                  onClick={() => router.push('/carrito')}
                  className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
                >
                  <PencilLine className="w-4 h-4" />
                  Editar
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-200"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                <div className="flex justify-between text-gray-500">
                  <span>Domicilio</span>
                  <span className="text-gray-900">{formatPrice(delivery)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-green-600">{formatPrice(total)}</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-400">
                {items.length} producto{items.length !== 1 ? 's' : ''}
              </div>
            </div>

{data?.paymentMethod === 'efectivo' ? (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={saving}
                className="w-full py-3 rounded-xl font-bold text-white bg-linear-to-r from-green-500 to-emerald-500 hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  'Confirmar pedido'
                )}
              </button>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-500" />
                  Pagar con tarjeta
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  Ingresa los datos de tu tarjeta para procesar el pago de forma segura.
                </p>
                <WompiCardForm
                  amountInCents={Math.round(total * 100)}
                  customerEmail={session?.user?.email || undefined}
                  customerFullName={data.nombreCompleto}
                  description={items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  onSuccess={handleTarjetaSuccess}
                  onRejected={handleTarjetaRejected}
                  onPending={handleTarjetaPending}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmOpen && data?.paymentMethod === 'efectivo' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-sm w-full mx-4 animate-popUp">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">¿Confirmar pedido?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              Pagarás en efectivo cuando recibas tu pedido.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-gray-700 border border-gray-300 hover:bg-gray-100 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEfectivo}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-linear-to-r from-green-500 to-emerald-500 hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Guardando
                  </>
                ) : (
                  'Sí, confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center">
            <Loader className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Verificando pago...</h3>
            <p className="text-gray-500 text-sm mb-4">
              Estamos confirmando tu pago con Wompi. Esto puede tomar unos segundos.
            </p>
            <p className="text-xs text-gray-400 font-mono break-all">
              ID: {pendingTransaction.id}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
