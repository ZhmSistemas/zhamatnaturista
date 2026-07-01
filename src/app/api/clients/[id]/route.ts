import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import ClientModel from '@/lib/models/ClientModel'

export const DELETE = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await dbConnect()
    const { id } = await params

    const deletedClient = await ClientModel.findByIdAndDelete(id)

    if (!deletedClient) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Cliente eliminado exitosamente' },
      { status: 200 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
