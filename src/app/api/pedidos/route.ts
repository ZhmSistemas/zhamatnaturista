import dbConnect from '@/lib/dbConnect'
import ShippingModel from '@/lib/models/ShippingModel'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: 'No autenticado' }, { status: 401 })
    }

    await dbConnect()
    const pedidos = await ShippingModel.find(
      { userId: session.user.id },
      {},
      { sort: { createdAt: -1 } }
    )

    return Response.json(pedidos, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message }, { status: 500 })
  }
}
