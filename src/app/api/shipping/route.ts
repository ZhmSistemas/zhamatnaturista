import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import ShippingModel from '@/lib/models/ShippingModel'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const PATCH = async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: 'No autenticado' }, { status: 401 })
    }

    await dbConnect()
    const body = await request.json()
    const updateFields: Record<string, unknown> = {}

    if (body.paymentMethod) {
      if (!['efectivo', 'tarjeta', 'nequi', 'efecty'].includes(body.paymentMethod)) {
        return Response.json({ message: 'Método de pago inválido' }, { status: 400 })
      }
      updateFields.paymentMethod = body.paymentMethod
    }

    if (body.wompiStatus) updateFields.wompiStatus = body.wompiStatus
    if (body.status) updateFields.status = body.status
    if (body.wompiTransactionId) updateFields.wompiTransactionId = body.wompiTransactionId
    if (body.wompiReference) updateFields.wompiReference = body.wompiReference

    if (Object.keys(updateFields).length === 0) {
      return Response.json({ message: 'No hay campos para actualizar' }, { status: 400 })
    }

    const shipping = await ShippingModel.findOneAndUpdate(
      { userId: session.user.id },
      updateFields,
      { sort: { createdAt: -1 }, new: true }
    )

    if (!shipping) {
      return Response.json({ message: 'No se encontró el envío' }, { status: 404 })
    }

    return Response.json(shipping, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message }, { status: 500 })
  }
}

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: 'No autenticado' }, { status: 401 })
    }

    await dbConnect()
    const shipping = await ShippingModel.findOne(
      { userId: session.user.id },
      {},
      { sort: { createdAt: -1 } }
    )

    return Response.json(shipping ?? {}, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message }, { status: 500 })
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: 'No autenticado' }, { status: 401 })
    }

    await dbConnect()

    try {
      await ShippingModel.collection.dropIndex('userId_1')
    } catch {
      // ignore if index doesn't exist
    }
    await ShippingModel.collection.createIndex({ userId: 1 })

    const body = await request.json()
    const { nombreCompleto, direccion, ciudad, whatsapp, barrio, items, subtotal, discount, delivery, total, paymentMethod, wompiTransactionId, wompiReference, wompiStatus, status } = body

    if (!nombreCompleto || !direccion || !ciudad || !whatsapp || !barrio) {
      return Response.json({ message: 'Todos los campos son obligatorios' }, { status: 400 })
    }

    if (!items || items.length === 0) {
      return Response.json({ message: 'No hay productos en el pedido' }, { status: 400 })
    }

    const shipping = await ShippingModel.create({
      userId: session.user.id,
      nombreCompleto,
      direccion,
      ciudad,
      whatsapp,
      barrio,
      items,
      subtotal: subtotal ?? 0,
      discount: discount ?? 0,
      delivery: delivery ?? 12000,
      total: total ?? 0,
      paymentMethod: paymentMethod ?? undefined,
      wompiTransactionId: wompiTransactionId ?? undefined,
      wompiReference: wompiReference ?? undefined,
      wompiStatus: wompiStatus ?? undefined,
      status: status ?? 'pending',
    })

    return Response.json(shipping, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message }, { status: 500 })
  }
}
