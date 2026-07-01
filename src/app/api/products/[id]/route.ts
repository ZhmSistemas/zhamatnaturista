import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import ProductModel from '@/lib/models/ProductModel'

export const GET = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await dbConnect()
    const { id } = await params
    const product = await ProductModel.findById(id)
    
    if (!product) {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 })
    }
    
    return NextResponse.json(product, { status: 200 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}

export const PATCH = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()
    const { name, price, description, stock, image, discount, codigo, categoria, marca, precioCompra, componentes, formaConsumo } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (price !== undefined) updateData.price = Number(price)
    if (description !== undefined) updateData.description = description
    if (stock !== undefined) updateData.stock = Number(stock)
    if (image !== undefined) updateData.image = image
    if (discount !== undefined && discount !== null) updateData.discount = Number(discount)
    if (codigo !== undefined) updateData.codigo = codigo
    if (categoria !== undefined) updateData.categoria = categoria
    if (marca !== undefined) updateData.marca = marca
    if (precioCompra !== undefined && precioCompra !== null) updateData.precioCompra = Number(precioCompra)
    if (componentes !== undefined) updateData.componentes = componentes
    if (formaConsumo !== undefined) updateData.formaConsumo = formaConsumo

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    )

    if (!updatedProduct) {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Producto actualizado exitosamente', product: updatedProduct },
      { status: 200 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}

export const DELETE = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await dbConnect()
    const { id } = await params

    const deletedProduct = await ProductModel.findByIdAndDelete(id)

    if (!deletedProduct) {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Producto eliminado exitosamente' },
      { status: 200 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
