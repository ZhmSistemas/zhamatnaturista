import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import ShippingModel from '@/lib/models/ShippingModel'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const event = body?.event
    const transaction = body?.data?.transaction

    if (!event || !transaction) {
      return Response.json({ message: 'Evento inválido' }, { status: 400 })
    }

    const { id, reference, status } = transaction

    if (!id || !reference) {
      return Response.json({ message: 'Transacción inválida' }, { status: 400 })
    }

    await dbConnect()

    if (event === 'transaction.updated') {
      await ShippingModel.findOneAndUpdate(
        { wompiReference: reference },
        {
          wompiStatus: status,
          status: status === 'APPROVED' ? 'paid' : status === 'DECLINED' ? 'rejected' : 'pending',
          wompiTransactionId: id,
        }
      )
    }

    return Response.json({ received: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message }, { status: 500 })
  }
}
