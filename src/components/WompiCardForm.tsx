'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Loader, Lock } from 'lucide-react'
import { showToast } from 'nextjs-toast-notify'
import { NEXT_PUBLIC_WOMPI_PUBLIC_KEY } from '@/lib/wompi'

const WOMPI_API_URL = NEXT_PUBLIC_WOMPI_PUBLIC_KEY.startsWith('pub_test_')
  ? 'https://sandbox.wompi.co/v1'
  : 'https://production.wompi.co/v1'

export type TransactionResult = { id: string; status: string; reference: string; cardType?: string; franchise?: string }

type Props = {
  amountInCents: number
  customerEmail?: string
  customerFullName: string
  description?: string
  onSuccess: (transaction: TransactionResult) => Promise<void>
  onRejected?: (transaction: TransactionResult) => Promise<void>
  onPending?: (transaction: TransactionResult) => Promise<void>
}

type FieldErrors = {
  number?: string
  expMonth?: string
  expYear?: string
  cvc?: string
  cardHolder?: string
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

function validateCard(number: string): FieldErrors {
  const errors: FieldErrors = {}
  const digits = number.replace(/\s/g, '')
  if (digits.length < 13 || digits.length > 19) errors.number = 'Número inválido'
  return errors
}

export default function WompiCardForm({ amountInCents, customerEmail, customerFullName, description, onSuccess, onRejected, onPending }: Props) {
  const router = useRouter()
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [installments, setInstallments] = useState(1)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [processing, setProcessing] = useState(false)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardType, setCardType] = useState<'CREDIT' | 'DEBIT' | null>(null)
  const binTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const submittedRef = useRef(false)

  const isDebit = cardType === 'DEBIT'

  useEffect(() => {
    if (isDebit && installments > 1) {
      setInstallments(1)
    }
  }, [isDebit])

  const detectBrand = useCallback((num: string) => {
    const digits = num.replace(/\s/g, '')
    if (/^4/.test(digits)) return 'Visa'
    if (/^5[1-5]/.test(digits)) return 'Mastercard'
    if (/^3[47]/.test(digits)) return 'Amex'
    return null
  }, [])

  useEffect(() => {
    return () => {
      if (binTimeoutRef.current) clearTimeout(binTimeoutRef.current)
    }
  }, [])

  const lookupBin = useCallback((bin: string) => {
    if (binTimeoutRef.current) clearTimeout(binTimeoutRef.current)
    if (bin.length < 6) {
      setCardType(null)
      return
    }
    binTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${WOMPI_API_URL}/card_bins/${bin.slice(0, 6)}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.data?.card_type) {
          setCardType(data.data.card_type)
        }
      } catch {
        // ignore BIN lookup errors
      }
    }, 400)
  }, [])

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setNumber(formatted)
    setCardBrand(detectBrand(formatted))
    const digits = formatted.replace(/\s/g, '')
    if (digits.length >= 6) lookupBin(digits)
    else setCardType(null)
    setErrors(prev => ({ ...prev, number: undefined }))
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value)
    setExpiry(formatted)
    setErrors(prev => ({ ...prev, expMonth: undefined, expYear: undefined }))
  }

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
    setCvc(digits)
    setErrors(prev => ({ ...prev, cvc: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittedRef.current) return
    submittedRef.current = true

    const fieldErrors: FieldErrors = {}
    const digits = number.replace(/\s/g, '')
    const expParts = expiry.split('/')
    const expMonth = expParts[0]?.padStart(2, '0') || ''
    const expYear = expParts[1] || ''

    if (digits.length < 13) fieldErrors.number = 'Número inválido'
    if (!expMonth || !expYear) { fieldErrors.expMonth = 'Fecha inválida'; fieldErrors.expYear = 'Fecha inválida' }
    if (cvc.length < 3) fieldErrors.cvc = 'CVC inválido'
    if (cardHolder.trim().length < 3) fieldErrors.cardHolder = 'Nombre requerido'

    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) {
      submittedRef.current = false
      return
    }

    setProcessing(true)

    let paymentData: { transaction?: TransactionResult; message?: string } | null = null

    try {
      const tokenRes = await fetch(`${WOMPI_API_URL}/tokens/cards`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NEXT_PUBLIC_WOMPI_PUBLIC_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: digits,
          cvc,
          exp_month: expMonth,
          exp_year: expYear,
          card_holder: cardHolder.trim(),
        }),
      })

      const tokenData = await tokenRes.json()

      if (!tokenRes.ok || tokenData.status !== 'CREATED') {
        throw new Error(tokenData?.message || tokenData?.error?.message || 'Error al validar tarjeta')
      }

      const cardToken = tokenData.data.id
      const tokenCardType = tokenData.data?.card_type
      const tokenFranchise = tokenData.data?.brand

      const paymentRes = await fetch('/api/wompi/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardToken,
          amountInCents,
          customerEmail: customerEmail || '',
          customerFullName,
          installments,
          cardType: tokenCardType || cardType,
          franchise: tokenFranchise || cardBrand?.toUpperCase(),
          ...(description && { description }),
        }),
      })

      const paymentResult = await paymentRes.json()
      paymentData = paymentResult

      console.log('🔍 [WompiCardForm] paymentResult:', paymentResult)
      console.log('🔍 [WompiCardForm] paymentRes.ok:', paymentRes.ok)
      console.log('🔍 [WompiCardForm] paymentRes.status:', paymentRes.status)

      if (paymentResult.pending && paymentResult.transaction?.status === 'PENDING') {
        console.log('🔍 [WompiCardForm] transaction PENDING, calling onPending')
        await onPending?.(paymentResult.transaction)
        return
      }

      if (!paymentRes.ok) {
        throw new Error(paymentResult.message || 'Error al procesar pago')
      }

      console.log('🔍 [WompiCardForm] calling onSuccess con transaction:', paymentResult.transaction)
      await onSuccess(paymentResult.transaction)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al procesar pago'
      console.log('🔍 [WompiCardForm] catch - msg:', msg)
      console.log('🔍 [WompiCardForm] catch - paymentData:', paymentData)
      console.log('🔍 [WompiCardForm] catch - paymentData?.transaction:', paymentData?.transaction)
      console.log('🔍 [WompiCardForm] catch - msg.includes("rechazado"):', msg.includes('rechazado'))
      console.log('🔍 [WompiCardForm] catch - msg.includes("declinado"):', msg.includes('declinado'))

      if ((msg.includes('rechazado') || msg.includes('declinado')) && paymentData?.transaction) {
        console.log('🔍 [WompiCardForm] calling onRejected')
        await onRejected?.(paymentData.transaction)
        return
      }
      if (msg.includes('rechazado') || msg.includes('declinado')) {
        console.log('🔍 [WompiCardForm] redirecting to rechazado via router')
        const encoded = encodeURIComponent(msg)
        router.push(`/checkout/rechazado?message=${encoded}`)
        return
      }
      console.log('🔍 [WompiCardForm] showing toast error')
      showToast.error(msg, { duration: 4000, position: 'top-center' })
    } finally {
      setProcessing(false)
      submittedRef.current = false
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Número de tarjeta</label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            value={number}
            onChange={handleNumberChange}
            className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-gray-900 text-lg tracking-wider outline-none transition-colors ${
              errors.number ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-green-500'
            }`}
            disabled={processing}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {cardBrand && (
              <span className="text-xs font-bold text-gray-400 uppercase">{cardBrand}</span>
            )}
            <CreditCard className={`w-5 h-5 ${errors.number ? 'text-red-400' : 'text-gray-300'}`} />
          </div>
        </div>
        {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vencimiento</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="MM/AA"
            value={expiry}
            onChange={handleExpiryChange}
            className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-gray-900 text-center text-lg outline-none transition-colors ${
              errors.expMonth || errors.expYear ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-green-500'
            }`}
            disabled={processing}
          />
          {(errors.expMonth || errors.expYear) && <p className="text-red-500 text-xs mt-1">Fecha inválida</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">CVC</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="123"
            value={cvc}
            onChange={handleCvcChange}
            className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-gray-900 text-center text-lg outline-none transition-colors ${
              errors.cvc ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-green-500'
            }`}
            disabled={processing}
          />
          {errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titular de la tarjeta</label>
        <input
          type="text"
          placeholder="Nombre completo"
          value={cardHolder}
          onChange={(e) => { setCardHolder(e.target.value); setErrors(prev => ({ ...prev, cardHolder: undefined })) }}
          className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-gray-900 outline-none transition-colors ${
            errors.cardHolder ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-green-500'
          }`}
          disabled={processing}
        />
        {errors.cardHolder && <p className="text-red-500 text-xs mt-1">{errors.cardHolder}</p>}
      </div>

      {!isDebit && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cuotas</label>
          <select
            value={installments}
            onChange={(e) => setInstallments(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 outline-none transition-colors focus:border-green-500 disabled:opacity-50"
            disabled={processing}
          >
            {[1, 2, 3, 4, 6, 12].map((num) => (
              <option key={num} value={num}>
                {num} cuota{num === 1 ? '' : 's'}
              </option>
            ))}
          </select>
          {cardType === 'DEBIT' && (
            <p className="text-xs text-gray-400 mt-1">Tarjeta débito — no requiere cuotas</p>
          )}
        </div>
      )}
      {isDebit && (
        <div className="rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-500">
            💳 Tarjeta débito detectada — las cuotas no aplican
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Lock className="w-3.5 h-3.5" />
        <span>Pago seguro procesado por Wompi</span>
      </div>

      <button
        type="submit"
        disabled={processing}
        className="w-full py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-green-500 to-emerald-500 hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pagar {`$${(amountInCents / 100).toLocaleString('es-CO')} COP`}
          </>
        )}
      </button>
    </form>
  )
}
