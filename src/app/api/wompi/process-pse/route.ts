import { NextRequest } from 'next/server'
import { generateSignature, generateReference, WOMPI_PUBLIC_KEY, WOMPI_CURRENCY, WOMPI_PRIVATE_KEY, WOMPI_API_URL } from '@/lib/wompi-server'

type PSEPaymentMethod = 'nequi' | 'daviplata' | 'efecty'

const PSE_PAYMENT_TYPE_MAP: Record<PSEPaymentMethod, string> = {
  nequi: 'NEQUI',
  daviplata: 'DAVIPLATA',
  efecty: 'BANK_TRANSFER', // Efecty se procesa como transferencia bancaria en Wompi
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentMethod, amountInCents, customerEmail, customerFullName, redirectUrl } = body

    if (!paymentMethod || !['nequi', 'daviplata', 'efecty'].includes(paymentMethod)) {
      return Response.json({ message: 'Método de pago inválido' }, { status: 400 })
    }

    if (!amountInCents || amountInCents <= 0) {
      return Response.json({ message: 'Monto inválido' }, { status: 400 })
    }

    if (!redirectUrl) {
      return Response.json({ message: 'URL de redirección requerida' }, { status: 400 })
    }

    const reference = generateReference()
    const signature = generateSignature(reference, amountInCents, WOMPI_CURRENCY)

    // Obtener tokens de aceptación
    const merchantRes = await fetch(`${WOMPI_API_URL}/merchants/${WOMPI_PUBLIC_KEY}`)
    if (!merchantRes.ok) {
      const errText = await merchantRes.text()
      console.error('Error fetching merchant:', merchantRes.status, errText)
      return Response.json({ message: 'Error al obtener token de aceptación' }, { status: 500 })
    }

    const merchantData = await merchantRes.json()
    const acceptanceToken = merchantData?.data?.presigned_acceptance?.acceptance_token
    const personalAuthToken = merchantData?.data?.presigned_personal_data_auth?.acceptance_token

    if (!acceptanceToken) {
      return Response.json({ message: 'No se pudo obtener token de aceptación' }, { status: 500 })
    }

    // Construir el body de la transacción PSE
    const transactionBody: Record<string, unknown> = {
      amount_in_cents: amountInCents,
      currency: WOMPI_CURRENCY,
      reference,
      signature,
      acceptance_token: acceptanceToken,
      ...(personalAuthToken && { accept_personal_auth: personalAuthToken }),
      customer_email: customerEmail || '',
      redirect_url: redirectUrl,
      payment_method: {
        type: PSE_PAYMENT_TYPE_MAP[paymentMethod],
      },
    }

    // Si es BANK_TRANSFER (Efecty), agregar datos bancarios si es necesario
    if (paymentMethod === 'efecty') {
      // Wompi maneja Efecty automáticamente con el tipo BANK_TRANSFER
    }

    console.log('🔍 [API process-pse] Sending to Wompi:', JSON.stringify(transactionBody, null, 2))

    const res = await fetch(`${WOMPI_API_URL}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionBody),
    })

    const data = await res.json()
    console.log('🔍 [API process-pse] Wompi response:', JSON.stringify(data, null, 2))

    if (!res.ok) {
      console.error('Wompi PSE error:', res.status, JSON.stringify(data))
      const msg = data?.message || (data?.error && (typeof data.error === 'string' ? data.error : data.error.message)) || 'Error al procesar pago'
      return Response.json({ message: msg }, { status: 400 })
    }

    const transaction = data?.data

    // Para PSE, Wompi retorna un link de redirección que el usuario debe seguir
    if (transaction?.processing_url) {
      return Response.json({
        transaction,
        processingUrl: transaction.processing_url,
      })
    }

    if (transaction?.status === 'DECLINED') {
      return Response.json({
        message: 'El pago fue rechazado',
        transaction: { id: transaction.id, status: transaction.status, reference: transaction.reference },
      }, { status: 400 })
    }

    if (transaction?.status === 'PENDING') {
      return Response.json({
        message: 'El pago está siendo verificado',
        pending: true,
        transaction: { id: transaction.id, status: transaction.status, reference: transaction.reference },
      })
    }

    return Response.json({ transaction })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('🔍 [API process-pse] Error:', message)
    return Response.json({ message }, { status: 500 })
  }
}
