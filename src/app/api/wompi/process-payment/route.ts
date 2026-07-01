import { NextRequest } from 'next/server'
import { generateSignature, generateReference, WOMPI_PUBLIC_KEY, WOMPI_CURRENCY, WOMPI_PRIVATE_KEY, WOMPI_API_URL } from '@/lib/wompi-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cardToken, amountInCents, customerEmail, customerFullName, installments = 1 } = body

    if (!cardToken || !amountInCents || amountInCents <= 0) {
      return Response.json({ message: 'Parámetros inválidos' }, { status: 400 })
    }

    const reference = generateReference()
    const signature = generateSignature(reference, amountInCents, WOMPI_CURRENCY)

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

    const transactionBody: Record<string, unknown> = {
      amount_in_cents: amountInCents,
      currency: WOMPI_CURRENCY,
      reference,
      signature,
      acceptance_token: acceptanceToken,
      ...(personalAuthToken && { accept_personal_auth: personalAuthToken }),
      customer_email: customerEmail || '',
      payment_method: {
        type: 'CARD',
        token: cardToken,
        installments,
      },
    }

    const res = await fetch(`${WOMPI_API_URL}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionBody),
    })

    const data = await res.json()
    console.log('🔍 [API process-payment] Wompi raw response:', JSON.stringify(data, null, 2))
    console.log('🔍 [API process-payment] res.status:', res.status)
    console.log('🔍 [API process-payment] res.ok:', res.ok)

    if (!res.ok) {
      console.error('Wompi transaction error:', res.status, JSON.stringify(data))
      const msg = data?.message || (data?.error && (typeof data.error === 'string' ? data.error : data.error.message)) || 'Error al procesar pago'
      return Response.json({ message: msg }, { status: 400 })
    }

    const transaction = data?.data
    console.log('🔍 [API process-payment] transaction from data?.data:', JSON.stringify(transaction))
    console.log('🔍 [API process-payment] transaction?.status:', transaction?.status)

    if (transaction?.status === 'DECLINED') {
      return Response.json({
        message: 'El pago fue rechazado por el banco emisor',
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
    return Response.json({ message }, { status: 500 })
  }
}
