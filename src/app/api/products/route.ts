import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import ProductModel from '@/lib/models/ProductModel'

export const GET = async (request: NextRequest) => {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const discounted = searchParams.get('discounted')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '0', 10)

    const query: Record<string, unknown> = {}
    if (discounted === 'true') {
      query.discount = { $gt: 0 }
    }

    const totalProducts = await ProductModel.countDocuments(query)

    if (limit > 0) {
      const skip = (page - 1) * limit
      const products = await ProductModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
      return Response.json(
        {
          products,
          totalProducts,
          totalPages: Math.ceil(totalProducts / limit),
          currentPage: page,
        },
        { status: 200 }
      )
    }

    const products = await ProductModel.find(query).sort({ createdAt: -1 })
    return Response.json({ products, totalProducts, totalPages: 1, currentPage: 1 }, { status: 200 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { image_url, name, price, description, stock, discount, codigo, categoria, marca, precioCompra, componentes, formaConsumo } = body

    if (!name || !price) {
      return Response.json(
        { message: 'Nombre y precio son obligatorios' },
        { status: 422 }
      )
    }

    await dbConnect()
    const newProduct = new ProductModel({      
      name,
      price: Number(price),
      description,
      stock: Number(stock) || 0,
      ...(discount != null && !isNaN(Number(discount)) ? { discount: Number(discount) } : {}),
      image: image_url,
      codigo,
      categoria,
      marca,
      ...(precioCompra != null && !isNaN(Number(precioCompra)) ? { precioCompra: Number(precioCompra) } : {}),
      componentes,
      formaConsumo,
    })

    await newProduct.save()
    return Response.json(
      { message: 'Producto creado exitosamente', product: newProduct },
      { status: 201 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}
