import dbConnect from '@/lib/dbConnect'
import ShippingModel from '@/lib/models/ShippingModel'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getTransaction } from '@/lib/wompi-server'

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: 'No autenticado' }, { status: 401 })
    }

    await dbConnect()

    const pendings = await ShippingModel.find({
      userId: session.user.id,
      wompiStatus: 'PENDING',
    })

    const results: { reference: string; oldStatus: string; newStatus: string; error?: string }[] = []

    for (const shipping of pendings) {
      if (!shipping.wompiTransactionId) {
        results.push({
          reference: shipping.wompiReference || 'N/A',
          oldStatus: 'PENDING',
          newStatus: 'SKIPPED',
          error: 'Sin wompiTransactionId',
        })
        continue
      }

      const result = await getTransaction(shipping.wompiTransactionId)
      if (result.error || !result.transaction) {
        results.push({
          reference: shipping.wompiReference || 'N/A',
          oldStatus: 'PENDING',
          newStatus: 'ERROR',
          error: result.error || 'Error al consultar',
        })
        continue
      }

      const realStatus = result.transaction.status

      if (realStatus === 'APPROVED') {
        await ShippingModel.findByIdAndUpdate(shipping._id, {
          wompiStatus: 'APPROVED',
          status: 'paid',
        })
        results.push({
          reference: shipping.wompiReference || 'N/A',
          oldStatus: 'PENDING',
          newStatus: 'APPROVED',
        })
      } else if (realStatus === 'DECLINED') {
        await ShippingModel.findByIdAndUpdate(shipping._id, {
          wompiStatus: 'DECLINED',
          status: 'rejected',
        })
        results.push({
          reference: shipping.wompiReference || 'N/A',
          oldStatus: 'PENDING',
          newStatus: 'DECLINED',
        })
      } else {
        results.push({
          reference: shipping.wompiReference || 'N/A',
          oldStatus: 'PENDING',
          newStatus: realStatus,
        })
      }
    }

    return Response.json({ fixed: results.length, details: results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message }, { status: 500 })
  }
}
