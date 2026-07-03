'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Leaf,
  ChevronRight,
  ShieldCheck,  
  ShoppingCart,
  Package,
} from 'lucide-react'
import { Product } from '@/lib/models/ProductModel'
import { formatPrice } from '@/lib/formatPrice'
import { useCart } from '@/context/CartContext'
import { showToast } from 'nextjs-toast-notify'
import Image from 'next/image'

export default function NaturalProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem, openCart } = useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        const items = Array.isArray(data) ? data : data.products
        setProducts(items ? items.slice(0, 6) : [])
      } catch {
        console.error('Error al cargar productos')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5" />
        </div>

        <div className="relative min-h-screen sectionone flex items-center">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source
              src="https://res.cloudinary.com/difisthcy/video/upload/q_auto/f_auto/v1781911862/imagen_movimiento_inicio_jgq8wy.mp4"
            />
          </video>
        
        </div>
      </div>

      {/* Products Section */}
      <div className="sectiondos relative py-20 px-6 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              NUESTROS{' '}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-green-600 to-emerald-600">PRODUCTOS</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              {products.length} producto{products.length !== 1 ? 's' : ''} disponible{products.length !== 1 ? 's' : ''}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, idx) => {
                const gradients = [
                  'from-emerald-500 to-teal-600',
                  'from-cyan-500 to-blue-600',
                  'from-green-500 to-emerald-600',
                  'from-violet-500 to-purple-600',
                  'from-amber-500 to-orange-600',
                  'from-rose-500 to-pink-600',
                ]
                const bgColors = [
                  'bg-emerald-500/10',
                  'bg-cyan-500/10',
                  'bg-green-500/10',
                  'bg-violet-500/10',
                  'bg-amber-500/10',
                  'bg-rose-500/10',
                ]
                const borderColors = [
                  'border-emerald-500/30',
                  'border-cyan-500/30',
                  'border-green-500/30',
                  'border-violet-500/30',
                  'border-amber-500/30',
                  'border-rose-500/30',
                ]
                const colorIdx = idx % gradients.length

                return (
                  <div
                    key={product._id}
                    className={`group relative rounded-2xl ${bgColors[colorIdx]} ${borderColors[colorIdx]} border p-6 backdrop-blur-sm hover:shadow-xl transition-all duration-500 overflow-hidden`}
                  >
                    <div className={`absolute inset-0 bg-linear-to-br ${gradients[colorIdx]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                    <div className="relative z-10">
                      {product.image && (
                        <div className="w-full h-48 rounded-xl overflow-hidden mb-5">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={800}
                            height={600}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${gradients[colorIdx]} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Package className="w-7 h-7" />
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>

                      {product.discount && product.discount > 0 ? (
                        <div className="flex gap-4 mb-3">
                          <div>
                            <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Precio Internet</span>
                            <p className="text-2xl font-black text-green-600">{formatPrice(product.discount)}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio en Tienda</span>
                            <p className="text-xl font-bold text-gray-700">{formatPrice(product.price)}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-green-600 mb-3">{formatPrice(product.price)}</p>
                      )}

                      <div className="flex items-center justify-between mb-5">
                        <span className={`text-sm px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/productos/${product._id}`}
                          className={`flex-1 py-3 rounded-lg font-semibold text-white bg-linear-to-r ${gradients[colorIdx]} hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3`}
                        >
                          Ver Producto
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                        {product.stock > 0 && (
                          <button
                            onClick={async () => {
                              try {
                                await addItem(product._id, 1)
                                openCart()
                                showToast.success(`${product.name} agregado al carrito`)
                              } catch {
                                showToast.error('Error al agregar al carrito')
                              }
                            }}
                            className={`py-3 px-4 rounded-lg font-semibold text-white bg-linear-to-r ${gradients[colorIdx]} hover:shadow-lg transition-all duration-300 flex items-center justify-center`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-linear-to-r from-green-500 to-emerald-500 text-white hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 transform hover:scale-105"
            >
              Ver Catálogo Completo
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative py-20 px-6 sm:px-12 lg:px-20 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                ¿Por qué elegir{' '}
                <span className="bg-clip-text text-transparent bg-linear-to-r from-green-600 to-emerald-600">
                  Tienda Naturista Zhamat
                </span>
                ?
              </h2>

              <div className="space-y-5">
                {[
                  'Ingredientes 100% naturales y orgánicos',
                  'Procesos de extracción de alta tecnología',
                  'Laboratorios certificados y regulados',
                  'Garantía de satisfacción o devolución',
                  'Envío discreto y seguro a todo el país',
                  'Atención personalizada especializada',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-green-500 to-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 text-lg group-hover:text-gray-900 transition-colors duration-300">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-96 flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-green-100 to-emerald-100 border border-green-200" />

              <div className="relative z-10 text-center px-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl">
                  <Leaf className="w-10 h-10 text-white" />
                </div>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-600 mb-3">
                  +25 Años
                </div>
                <p className="text-gray-600 text-lg">de experiencia en productos naturales</p>
                <div className="mt-6 inline-block px-6 py-3 rounded-full bg-green-100 border border-green-300 text-green-700 font-semibold">
                  Confianza Comprobada
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 px-6 sm:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-linear-to-r from-green-100 to-emerald-100 border border-green-200">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Transforma tu bienestar hoy</h2>
            <p className="text-gray-600 text-lg mb-8">
              Únete a miles de clientes satisfechos que ya confían en nuestros productos
            </p>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-lg font-bold text-lg bg-linear-to-r from-green-500 to-emerald-500 text-white hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 transform hover:scale-105"
            >
              <Leaf className="w-5 h-5" />
              Explorar Catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
