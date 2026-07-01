'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { showToast } from 'nextjs-toast-notify'
import { Pencil, Trash2, Plus, Search } from 'lucide-react'
import { Product } from '@/lib/models/ProductModel'
import { formatPrice } from '@/lib/formatPrice'

export default function ProductList({ products }: { products: Product[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products
    const q = normalize(search)
    return products.filter(
      (p) =>
        normalize(p.name).includes(q) ||
        (p.codigo && normalize(p.codigo).includes(q)),
    )
  }, [products, search])

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Error al eliminar producto')

      router.refresh()
      showToast.success('Producto eliminado exitosamente')
    } catch {
      showToast.error('Error al eliminar el producto')
    } finally {
      setIsDeleting(false)
      setProductToDelete(null)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Link
          href="/dashboard/productos/creaproducto"
          className="flex items-center gap-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Crear Producto
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Código</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Marca</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Precio Compra</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Precio</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Descuento</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  {search
                    ? 'No se encontraron productos'
                    : 'No hay productos registrados'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {product.codigo || '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {product.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {product.marca || '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {product.precioCompra
                      ? formatPrice(product.precioCompra)
                      : '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatPrice(product.price)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {product.discount && product.discount > 0 ? (
                      <span className="text-green-600">
                        {formatPrice(product.discount)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/productos/editaproducto/${product._id}`,
                          )
                        }
                        className="rounded-md p-2 text-indigo-600 transition hover:bg-indigo-50"
                        title="Editar producto"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setProductToDelete(product._id)}
                        className="rounded-md p-2 text-red-600 transition hover:bg-red-50"
                        title="Eliminar producto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Confirmar eliminación</h3>
            <p className="mb-6 text-gray-600">
              ¿Estás seguro de eliminar este producto?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setProductToDelete(null)}
                className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(productToDelete)}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
