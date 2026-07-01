import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import CategoryModel from '@/lib/models/CategoryModel'

export const GET = async (request: NextRequest) => {
  try {
    await dbConnect()
    const categories = await CategoryModel.find({}).sort({ createdAt: -1 })
    return Response.json(categories, { status: 200 })
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
    const newCategory = new CategoryModel({ name })
    await newCategory.save()

    return Response.json(
      { message: 'Categoría creada exitosamente', category: newCategory },
      { status: 201 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}
