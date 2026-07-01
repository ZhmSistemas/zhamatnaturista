import crypto from 'crypto'

const WOMPI_INTEGRITY_SECRET = process.env.integridad || ''
const WOMPI_PUBLIC_KEY = process.env.llave_publica || ''
const WOMPI_PRIVATE_KEY = process.env.llave_privada || ''
const WOMPI_API_URL = process.env.WOMPI_API_URL || (WOMPI_PUBLIC_KEY.startsWith('pub_test_')
  ? 'https://sandbox.wompi.co/v1'
  : 'https://production.wompi.co/v1')

export { WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY, WOMPI_API_URL }

export const WOMPI_CURRENCY = 'COP'

export function generateReference(): string {
  return `ZMT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}

export function generateSignature(reference: string, amountInCents: number, currency: string): string {
  const text = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_SECRET}`
  return crypto.createHash('sha256').update(text, 'utf-8').digest('hex')
}

export async function getAcceptanceToken(): Promise<string | null> {
  try {
    const res = await fetch(`${WOMPI_API_URL}/merchants/${WOMPI_PUBLIC_KEY}`)
    if (!res.ok) return null
    const json = await res.json()
    return json?.data?.presigned_acceptance?.acceptance_token || null
  } catch {
    return null
  }
}

export type WompiTransactionResult = {
  transaction?: {
    id: string
    status: string
    reference: string
    amount_in_cents: number
  }
  error?: string
}

export async function createTransaction(params: {
  amountInCents: number
  reference: string
  currency: string
  customerEmail?: string
  customerFullName?: string
  redirectUrl: string
}): Promise<WompiTransactionResult> {
  try {
    const acceptanceToken = await getAcceptanceToken()
    if (!acceptanceToken) {
      return { error: 'No se pudo obtener el token de aceptación' }
    }

    const signature = generateSignature(params.reference, params.amountInCents, params.currency)

    const body: Record<string, unknown> = {
      amount_in_cents: params.amountInCents,
      currency: params.currency,
      reference: params.reference,
      signature: { integrity: signature },
      acceptance_token: acceptanceToken,
      redirect_url: params.redirectUrl,
    }

    if (params.customerEmail || params.customerFullName) {
      body.customer_data = {
        ...(params.customerEmail && { email: params.customerEmail }),
        ...(params.customerFullName && { full_name: params.customerFullName }),
      }
    }

    const res = await fetch(`${WOMPI_API_URL}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (!res.ok) {
      return { error: data?.message || data?.error?.message || 'Error al crear transacción' }
    }

    return { transaction: data?.data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error desconocido' }
  }
}

export async function getTransaction(id: string): Promise<WompiTransactionResult> {
  try {
    const res = await fetch(`${WOMPI_API_URL}/transactions/${id}`, {
      headers: { Authorization: `Bearer ${WOMPI_PRIVATE_KEY}` },
    })
    const data = await res.json()
    if (!res.ok) {
      return { error: data?.message || 'Error al consultar transacción' }
    }
    return { transaction: data?.data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error desconocido' }
  }
}
