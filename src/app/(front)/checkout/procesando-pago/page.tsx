'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { Loader } from 'lucide-react'

function ProcesandoPagoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items, total, subtotal, discount, clearCart } = useCart()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const transactionId = searchParams.get('transaction_id')
      const ref = searchParams.get('reference')
      const resultStatus = searchParams.get('status')

      if (!transactionId || resultStatus !== 'APPROVED') {
        if (!cancelled) {
          if (resultStatus === 'DECLINED') {
            const stored = localStorage.getItem('zhamat_shipping_data')
            if (stored && items.length > 0) {
              const data = JSON.parse(stored)
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
                    total,
                    paymentMethod: 'tarjeta',
                    wompiTransactionId: transactionId,
                    wompiReference: ref || '',
                    wompiStatus: 'DECLINED',
                    status: 'rejected',
                  }),
                })
              } catch {
                // ignore — still redirect to rejected page
              }
            }
            const msg = encodeURIComponent('El pago fue rechazado por el banco emisor')
            router.push(`/checkout/rechazado?message=${msg}`)
            return
          }
          setStatus('error')
          setMessage('El pago no se completó')
        }
        return
      }

      const stored = localStorage.getItem('zhamat_shipping_data')
      if (!stored || items.length === 0) {
        if (!cancelled) {
          setStatus('error')
          setMessage('No se encontraron datos del pedido')
        }
        return
      }

      const data = JSON.parse(stored)

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
            total,
            paymentMethod: 'tarjeta',
            wompiTransactionId: transactionId,
            wompiReference: ref || '',
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
        localStorage.setItem('wompi_debug_response', JSON.stringify({ id: transactionId, reference: ref, status: resultStatus }))

        if (!cancelled) {
          setStatus('success')
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error')
          setMessage(error instanceof Error ? error.message : 'Error al procesar el pedido')
        }
      }
    }

    run()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (status === 'success') {
      const t = setTimeout(() => router.push('/checkout/confirmacion'), 1500)
      return () => clearTimeout(t)
    }
  }, [status, router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-sm mx-auto px-6">
        {status === 'processing' && (
          <>
            <Loader className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Procesando pago</h1>
            <p className="text-gray-500">Estamos confirmando tu pago...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago confirmado</h1>
            <p className="text-gray-500">Redirigiendo...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago no completado</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <button
              onClick={() => router.push('/checkout/resumen')}
              className="px-8 py-3 rounded-xl font-bold text-white bg-linear-to-r from-green-500 to-emerald-500 hover:shadow-lg transition-all duration-300"
            >
              Volver al resumen
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function ProcesandoPagoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    }>
      <ProcesandoPagoContent />
    </Suspense>
  )
}
