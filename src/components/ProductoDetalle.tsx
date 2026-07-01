'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Leaf, ChevronLeft, ShoppingCart, Truck, ShieldCheck, Clock } from 'lucide-react'
import { Product } from '@/lib/models/ProductModel'
import Image from 'next/image'
import AddToCartButton from './AddToCartButton'
import { formatPrice } from '@/lib/formatPrice'

export default function ProductoDetalle({ id }: { id: string }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) throw new Error('Producto no encontrado')
        const data = await res.json()
        setProduct(data)
      } catch {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-6">Producto no encontrado</p>
          <button
            onClick={() => router.push('/productos')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver a productos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 py-12">
        <button
          onClick={() => router.push('/productos')}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a productos</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative">
            {product.image ? (
              <div className="rounded-2xl overflow-hidden border bg-white border-gray-200">
                <Image
                  src={product.image}
                  alt={product.name}
                  className="w-full h-125 object-contain bg-white"
                  width={500}
                  height={500}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 h-125 flex items-center justify-center">
                <Package className="w-24 h-24 text-gray-300" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-300 text-green-700 text-sm font-medium mb-4">
                <Leaf className="w-3 h-3" />
                100% Natural
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-3">
                {product.name}
              </h1>

              {product.discount && product.discount > 0 ? (
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <p className="text-4xl font-bold text-green-600">{formatPrice(product.discount)}</p>
                  <p className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</p>
                  <span className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">EN OFERTA</span>
                </div>
              ) : (
                <p className="text-4xl font-bold text-green-600">{formatPrice(product.price)}</p>
              )}
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                product.stock > 0
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {product.stock > 0 ? `${product.stock} unidades en stock` : 'Producto agotado'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-200">
              {[
                { icon: <Truck className="w-5 h-5" />, label: 'Envío 24h', sub: 'A todo el país' },
                { icon: <ShieldCheck className="w-5 h-5" />, label: 'Calidad', sub: 'Certificada' },
                { icon: <Clock className="w-5 h-5" />, label: 'Garantía', sub: 'Satisfacción' },
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center text-green-600 mx-auto mb-2">
                    {item.icon}
                  </div>
                  <p className="text-gray-900 text-sm font-semibold">{item.label}</p>
                  <p className="text-gray-500 text-xs">{item.sub}</p>
                </div>
              ))}
            </div>

            <AddToCartButton
              productId={product._id}
              productName={product.name}
              stock={product.stock}
              className="w-full py-4 rounded-xl font-bold text-lg bg-linear-to-r from-green-500 to-emerald-500 text-white hover:shadow-2xl hover:shadow-green-500/50"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
