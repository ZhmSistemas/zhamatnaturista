"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  MapPin,
  Phone,
  User,
  Home,
  Building2,
  ShoppingCart,
  Loader,
} from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";

type ShippingItem = {
  productId: string;
  name: string;
  price: number;
  discount?: number;
  image?: string;
  quantity: number;
};

type ShippingData = {
  nombreCompleto: string;
  direccion: string;
  ciudad: string;
  whatsapp: string;
  barrio: string;
  items: ShippingItem[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
};

const confettiPieces = Array.from({ length: 15 }, (_, i) => {
  const colors = [
    "bg-green-400",
    "bg-emerald-400",
    "bg-yellow-400",
    "bg-green-300",
    "bg-lime-400",
    "bg-teal-400",
  ];
  const seeds = [
    0.23, 0.67, 0.12, 0.89, 0.45, 0.78, 0.34, 0.91, 0.56, 0.02, 0.73, 0.48,
    0.15, 0.82, 0.39, 0.64, 0.07, 0.51, 0.96, 0.28, 0.14, 0.61, 0.43, 0.88,
    0.19, 0.55, 0.31, 0.77, 0.09, 0.84,
  ];
  const s = seeds[i % seeds.length];
  const animIdx = i % 3;
  return {
    color: colors[i % colors.length],
    left: `${((s * 100) % 100).toFixed(1)}%`,
    delay: `${(s * 2).toFixed(2)}s`,
    size: `${(6 + s * 8).toFixed(1)}px`,
    duration: `${(2.5 + s * 2).toFixed(2)}s`,
    round: s > 0.5,
    anim: `confetti-fall-${['a', 'b', 'c'][animIdx]}`,
  };
});

function ConfirmacionContent() {
  const { status } = useSession();
  const router = useRouter();
  const [shipping, setShipping] = useState<ShippingData | null>(null);
  const [loading, setLoading] = useState(true);  

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "loading") return;

    const run = async () => {
      try {
        const res = await fetch("/api/shipping");
        if (res.ok) {
          const data = await res.json();
          if (data.items?.length > 0) {
            setShipping(data);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!shipping) {
    return (
      <div className="min-h-screen">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        </div>

        <div className="relative max-w-lg mx-auto px-6 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No hay pedidos</h2>
          <p className="text-gray-400 mb-8">
            Aún no has realizado ningún pedido
          </p>
          <Link
            href="/productos"
            className="inline-block px-8 py-3 rounded-xl font-bold text-white bg-linear-to-r from-green-500 to-emerald-500 hover:shadow-lg transition-all duration-300"
          >
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black max-w-[100vw] overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      <style>{`
        @keyframes confetti-fall-a {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 1; }
          20% { transform: translateY(20vh) translateX(12px) rotate(120deg); }
          40% { transform: translateY(40vh) translateX(-8px) rotate(240deg); }
          60% { transform: translateY(60vh) translateX(15px) rotate(400deg); }
          80% { transform: translateY(80vh) translateX(-5px) rotate(560deg); }
          100% { transform: translateY(110vh) translateX(5px) rotate(720deg); opacity: 0; }
        }
        @keyframes confetti-fall-b {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 1; }
          20% { transform: translateY(20vh) translateX(-10px) rotate(-100deg); }
          40% { transform: translateY(40vh) translateX(15px) rotate(-220deg); }
          60% { transform: translateY(60vh) translateX(-12px) rotate(-350deg); }
          80% { transform: translateY(80vh) translateX(8px) rotate(-500deg); }
          100% { transform: translateY(110vh) translateX(-8px) rotate(-720deg); opacity: 0; }
        }
        @keyframes confetti-fall-c {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 1; }
          25% { transform: translateY(30vh) translateX(20px) rotate(200deg); }
          50% { transform: translateY(55vh) translateX(-15px) rotate(380deg); }
          75% { transform: translateY(80vh) translateX(10px) rotate(560deg); }
          100% { transform: translateY(110vh) translateX(-20px) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .confetti-piece {
          position: fixed;
          pointer-events: none;
          z-index: 50;
        }
        .sparkle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: sparkle 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden max-w-[100vw]">
        {confettiPieces.map((p, i) => (
          <div
            key={i}
            className={`confetti-piece ${p.color}`}
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              borderRadius: p.round ? "50%" : "2px",
              animation: `${p.anim} ${p.duration} linear infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 py-12">
        <div
          className="text-center mb-12 animate-pulse-glow"
          style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
        >
          <div className="relative inline-flex mb-6">
            <div
              className="flex items-center justify-center animate-bounce"
              style={{ animationDuration: "1.5s" }}
            >
              <Image
                src="https://res.cloudinary.com/difisthcy/image/upload/q_auto/f_auto/v1781990057/ChatGPT_Image_20_jun_2026_16_10_26_erz2hk.png"
                alt="Confetti"
                width={80}
                height={80}
              />
            </div>
            <div
              className="sparkle top-0 -right-2 bg-yellow-400"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="sparkle top-2 -left-1 bg-green-300"
              style={{ animationDelay: "0.5s" }}
            />
            <div
              className="sparkle -bottom-1 -right-1 bg-emerald-400"
              style={{ animationDelay: "1s" }}
            />
            <div
              className="sparkle -top-1 left-1 bg-lime-400"
              style={{ animationDelay: "0.3s" }}
            />
          </div>
          <h1 className="text-3xl sm:text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-green-400 via-emerald-400 to-green-300 mb-4 wrap-break-words">
            ¡Felicitaciones!
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 font-medium max-w-lg mx-auto leading-relaxed px-4">
            Tu pedido está en proceso de despacho, muy pronto estaremos contactándote, para tus inquietudes escribenos al whatsapp
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-400" />
                Datos de envío
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Nombre</p>
                    <p className="text-white font-medium">
                      {shipping.nombreCompleto}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">WhatsApp</p>
                    <p className="text-white font-medium">
                      {shipping.whatsapp}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Home className="w-4 h-4 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Dirección</p>
                    <p className="text-white font-medium">
                      {shipping.direccion}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Ciudad</p>
                    <p className="text-white font-medium">{shipping.ciudad}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Barrio</p>
                    <p className="text-white font-medium">{shipping.barrio}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-400" />
                Productos pedidos
              </h3>
              <div className="space-y-3">
                {shipping.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 p-3 rounded-xl bg-green-500/5 border border-green-500/10"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0">
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
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">
                          Cant: {item.quantity}
                        </span>
                        <span className="text-gray-500">·</span>
                        {item.discount && item.discount > 0 ? (
                          <>
                            <span className="text-sm text-green-400 font-bold">
                              {formatPrice(item.discount)}
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(item.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-green-400 font-bold">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">
                        {formatPrice(
                          (item.discount ?? item.price) * item.quantity,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-4">Resumen</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white">
                    {formatPrice(shipping.subtotal)}
                  </span>
                </div>
                {shipping.discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Descuento</span>
                    <span>-{formatPrice(shipping.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Domicilio</span>
                  <span className="text-white">{formatPrice(shipping.delivery)}</span>
                </div>
                <div className="border-t border-green-500/20 pt-3 flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-green-400">
                    {formatPrice(shipping.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
       
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-green-500" />
      </div>
    }>
      <ConfirmacionContent />
    </Suspense>
  );
}
