import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import BrandModel from '@/lib/models/BrandModel'

export const GET = async (request: NextRequest) => {
  try {
    await dbConnect()
    const brands = await BrandModel.find({}).sort({ createdAt: -1 })
    return Response.json(brands, { status: 200 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return Response.json(
        { message: 'El nombre es obligatorio' },
        { status: 422 }
      )
    }

    await dbConnect()
    const newBrand = new BrandModel({ name })
    await newBrand.save()

    return Response.json(
      { message: 'Marca creada exitosamente', brand: newBrand },
      { status: 201 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}
