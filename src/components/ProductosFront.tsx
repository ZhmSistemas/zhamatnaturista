"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ChevronRight,
  Leaf,
  ShieldCheck,
  Truck,
  Star,
  ShoppingCart,
} from "lucide-react";
import { Product } from "@/lib/models/ProductModel";
import { useCart } from "@/context/CartContext";
import { showToast } from "nextjs-toast-notify";
import { formatPrice } from "@/lib/formatPrice";
import Image from "next/image";

export default function ProductosFront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (res.ok) {
          setProducts(data);
        } else {
          console.error("Error API:", data.message);
          setProducts([]);
        }
      } catch {
        console.error("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay productos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative py-20 px-6 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Catálogo{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-green-600 to-emerald-600">
                Completo
              </span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              {products.length} producto{products.length !== 1 ? "s" : ""}{" "}
              disponible{products.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, idx) => {
              const gradients = [
                "from-emerald-500 to-teal-600",
                "from-cyan-500 to-blue-600",
                "from-green-500 to-emerald-600",
                "from-violet-500 to-purple-600",
                "from-amber-500 to-orange-600",
                "from-rose-500 to-pink-600",
              ];
              const bgColors = [
                "bg-emerald-500/10",
                "bg-cyan-500/10",
                "bg-green-500/10",
                "bg-violet-500/10",
                "bg-amber-500/10",
                "bg-rose-500/10",
              ];
              const borderColors = [
                "border-emerald-500/30",
                "border-cyan-500/30",
                "border-green-500/30",
                "border-violet-500/30",
                "border-amber-500/30",
                "border-rose-500/30",
              ];
              const colorIdx = idx % gradients.length;

              return (
                <div
                  key={product._id}
                  className={`group relative rounded-2xl ${bgColors[colorIdx]} ${borderColors[colorIdx]} border p-6 backdrop-blur-sm hover:shadow-xl transition-all duration-500 overflow-hidden`}
                >
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${gradients[colorIdx]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

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

                    <div
                      className={`w-14 h-14 rounded-xl bg-linear-to-br ${gradients[colorIdx]} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <Package className="w-7 h-7" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>

                    {product.discount && product.discount > 0 ? (
                      <div className="flex gap-4 mb-3">
                        <div>
                          <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                            Precio Internet
                          </span>
                          <p className="text-2xl font-black text-green-600">
                            {formatPrice(product.discount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Precio en Tienda
                          </span>
                          <p className="text-xl font-bold text-gray-700">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-green-600 mb-3">
                        {formatPrice(product.price)}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-5">
                      <span
                        className={`text-sm px-3 py-1 rounded-full ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {product.stock > 0
                          ? `${product.stock} en stock`
                          : "Agotado"}
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
                              await addItem(product._id, 1);
                              openCart();
                              showToast.success(
                                `${product.name} agregado al carrito`,
                              );
                            } catch {
                              showToast.error("Error al agregar al carrito");
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
