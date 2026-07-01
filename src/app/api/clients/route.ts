import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import ClientModel from '@/lib/models/ClientModel'

export const GET = async (request: NextRequest) => {
  try {
    await dbConnect()
    const clients = await ClientModel.find({}).sort({ createdAt: -1 })
    return Response.json(clients, { status: 200 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { establishmentName, contactName, whatsapp, email, address } = body

    if (!establishmentName || !contactName || !whatsapp || !email || !address) {
      return Response.json(
        { message: 'Todos los campos son obligatorios' },
        { status: 422 }
      )
    }

    await dbConnect()
    const newClient = new ClientModel({ _id: whatsapp, establishmentName, contactName, whatsapp, email, address })
    await newClient.save()

    return Response.json(
      { message: 'Cliente creado exitosamente', client: newClient },
      { status: 201 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}
