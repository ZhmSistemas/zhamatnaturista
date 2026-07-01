"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

function RechazadoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "El pago fue rechazado";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      <div className="relative max-w-md mx-auto px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Pago no completado
        </h1>
        <p className="text-gray-400 mb-2 text-lg">{message}</p>
        <p className="text-gray-500 text-sm mb-8">
          Tu pedido no fue procesado. Puedes intentar de nuevo o usar otro método
          de pago.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/checkout/resumen")}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-linear-to-r from-red-500 to-rose-500 hover:shadow-lg transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </button>
          <button
            onClick={() => router.push("/checkout/pago")}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white border border-gray-700 hover:bg-white/5 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Cambiar método de pago
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RechazadoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RechazadoContent />
    </Suspense>
  );
}
