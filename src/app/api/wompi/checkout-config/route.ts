import { NextRequest } from 'next/server'
import { generateSignature, generateReference, WOMPI_PUBLIC_KEY, WOMPI_CURRENCY } from '@/lib/wompi-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amountInCents, customerEmail, customerFullName } = body

    if (!amountInCents || amountInCents <= 0) {
      return Response.json({ message: 'Monto inválido' }, { status: 400 })
    }

    const reference = generateReference()
    const signature = generateSignature(reference, amountInCents, WOMPI_CURRENCY)

    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const redirectUrl = `${origin}/checkout/confirmacion`

    return Response.json({
      publicKey: WOMPI_PUBLIC_KEY,
      currency: WOMPI_CURRENCY,
      reference,
      amountInCents,
      signature,
      redirectUrl,
      customerData: {
        ...(customerEmail && { email: customerEmail }),
        ...(customerFullName && { fullName: customerFullName }),
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message }, { status: 500 })
  }
}
