import { notFound } from 'next/navigation'
import EditProductForm from '@/components/EditProductForm'
import { Product } from '@/lib/models/ProductModel'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/products/${id}`, { cache: 'no-store' })
    
    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error('Error al obtener producto')
    }
    
    return await res.json()
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function EditarProductoPage({ params }: EditProductPageProps) {
  const { id } = await params
  console.log('ID recibido:', id)
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="mx-auto w-full p-6 lg:w-1/2">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Editar Producto</h1>
      <EditProductForm product={product} />
    </div>
  )
}
