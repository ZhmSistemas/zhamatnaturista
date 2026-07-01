import { Product } from '@/lib/models/ProductModel'
import ProductList from '@/components/ProductList'

async function getProducts() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Error al obtener productos')
  const products: Product[] = await res.json()
  return products
}

export default async function MostrarProductosPage() {
  const products = await getProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Lista de Productos</h1>
      <ProductList products={products} />
    </div>
  )
}
