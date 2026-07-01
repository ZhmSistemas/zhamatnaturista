import { NextRequest } from 'next/server'
import { getTransaction } from '@/lib/wompi-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('id')

    if (!transactionId) {
      return Response.json({ message: 'transactionId requerido' }, { status: 400 })
    }

    const result = await getTransaction(transactionId)

    if (result.error) {
      return Response.json({ message: result.error }, { status: 500 })
    }

    return Response.json({
      transaction: {
        id: result.transaction?.id,
        status: result.transaction?.status,
        reference: result.transaction?.reference,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message }, { status: 500 })
  }
}
