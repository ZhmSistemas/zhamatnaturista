import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import ShippingModel from '@/lib/models/ShippingModel'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return Response.json({ message: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    await dbConnect()
    const shipping = await ShippingModel.findById(id)
    if (!shipping) {
      return Response.json({ message: 'Pedido no encontrado' }, { status: 404 })
    }

    shipping.enviado = !shipping.enviado
    await shipping.save()

    return Response.json(shipping, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message }, { status: 500 })
  }
}
