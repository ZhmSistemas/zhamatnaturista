"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  ArrowLeft,
  Leaf,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/formatPrice";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: Props) {
  const { items, loading, removeItem, updateQuantity, itemCount, subtotal, discount, delivery, total } =
    useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener("click", handleClickOutside), 0);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full w-full md:w-full md:max-w-md shadow-2xl flex flex-col bg-green-700/80 text-white"
        style={{ animation: "slideIn 0.3s ease-out" }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white">
              Carrito ({itemCount})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <Link
          href="/productos"
          onClick={onClose}
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group px-4"
        >
          <ArrowLeft className="w-5 h-5 text-white/70 group-hover:-translate-x-1 transition-transform" />
          <span>Seguir comprando</span>
        </Link>
        <div className="flex-1 overflow-y-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/60">
              <ShoppingCart className="w-12 h-12 mb-3" />
              <p className="text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 p-3 rounded-xl bg-white/20"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 border border-white/20">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-white/60" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-sm font-bold text-white">
                      {formatPrice(item.discount ?? item.price)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-white/30 hover:bg-white/50 transition-colors text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-white/30 hover:bg-white/50 transition-colors text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto p-1.5 hover:bg-red-400/30 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/20 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Resumen</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-200">
                  <span>Descuento</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-white/70">
                <span>Domicilio</span>
                <span className="text-white">{formatPrice(delivery)}</span>
              </div>
              <div className="border-t border-white/20 pt-2 flex justify-between text-base font-bold">
                <span className="text-white">Total</span>
                <span className="text-white">{formatPrice(total)}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/20 space-y-2">
              {[
                { icon: <Truck className="w-4 h-4" />, text: "Envío a todo el país" },
                { icon: <ShieldCheck className="w-4 h-4" />, text: "Productos 100% naturales" },
                { icon: <Leaf className="w-4 h-4" />, text: "Calidad certificada" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-white/60 text-xs">
                  <span className="text-green-200">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <Link
              href="/carrito"
              onClick={onClose}
              className="block w-full py-3 rounded-xl font-bold text-center text-green-800 bg-white hover:bg-white/90 transition-all duration-300"
            >
              Continuar compra
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
