"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { showToast } from "nextjs-toast-notify";
import {
  ChevronDown,
  ChevronUp,
  Package,
  MapPin,
  Phone,
  User,
  Home,
  Building2,
  Banknote,
  CreditCard,
  Smartphone,
  Receipt,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/formatPrice";

type PedidoItem = {
  productId: string;
  name: string;
  price: number;
  discount?: number;
  image?: string;
  quantity: number;
};

type Pedido = {
  _id: string;
  userId: string;
  nombreCompleto: string;
  direccion: string;
  ciudad: string;
  whatsapp: string;
  barrio: string;
  items: PedidoItem[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  paymentMethod?: string;
  wompiStatus?: string;
  status?: string;
  createdAt: string;
};

export default function ListaPedidos() {
  const { data: session } = useSession();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPedido, setExpandedPedido] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    let ignore = false;

    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/pedidos");
        if (!res.ok) throw new Error("Error al cargar pedidos");
        const data = await res.json();
        if (!ignore) {
          const filtered = data.filter(
            (p: Pedido) =>
              p.paymentMethod === 'efectivo' || p.paymentMethod === 'nequi' || p.paymentMethod === 'daviplata' || p.paymentMethod === 'efecty' || p.wompiStatus === 'APPROVED'
          )
          setPedidos(filtered);
        }
      } catch (err) {
        if (!ignore) {
          showToast.error(
            err instanceof Error ? err.message : "Error al cargar pedidos"
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchPedidos();

    return () => {
      ignore = true;
    };
  }, [session]);

  const toggleExpand = (id: string) => {
    setExpandedPedido(expandedPedido === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full p-6 lg:w-5/6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Mis Pedidos</h1>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Usuario: {session?.user?.name}</p>
      </div>

      {pedidos.length > 0 && (
        <div className="mb-6 grid w-full grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
            <p className="text-xs font-medium text-green-600 uppercase">
              Totales
            </p>
            <p className="text-lg font-bold text-green-700">
              {formatPrice(
                pedidos.reduce((sum, p) => sum + p.total, 0)
              )}
            </p>
            <p className="mt-1 text-xs text-green-500">
              {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
            <p className="text-xs font-medium text-emerald-600 uppercase">
              Productos
            </p>
            <p className="text-lg font-bold text-emerald-700">
              {pedidos.reduce((sum, p) => sum + p.items.length, 0)}
            </p>
            <p className="mt-1 text-xs text-emerald-500">
              en total
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
            <p className="text-xs font-medium text-blue-600 uppercase">
              Último pedido
            </p>
            <p className="text-sm font-bold text-blue-700">
              {pedidos.length > 0
                ? formatDate(pedidos[0].createdAt)
                : "-"}
            </p>
          </div>
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-center">
            <p className="text-xs font-medium text-teal-600 uppercase">
              Descuento total
            </p>
            <p className="text-lg font-bold text-teal-700">
              {formatPrice(
                pedidos.reduce((sum, p) => sum + (p.discount || 0), 0)
              )}
            </p>
          </div>
        </div>
      )}

      {pedidos.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          No tienes pedidos registrados
        </div>
      ) : (
        <div className="space-y-2 w-full">
          {pedidos.map((pedido) => (
            <div
              key={pedido._id}
              className={`rounded-lg border shadow-sm transition-all duration-200 ${
                expandedPedido === pedido._id
                  ? "bg-green-50 border-green-300 ring-2 ring-green-400"
                  : "bg-white border-gray-200"
              }`}
            >
              <div
                className={`flex flex-col sm:flex-row cursor-pointer items-start sm:items-center justify-between p-4 gap-3 sm:gap-0 hover:bg-green-50`}
                onClick={() => toggleExpand(pedido._id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Pedido #{pedido._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {pedido.items.length} producto
                      {pedido.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-600">
                      Total:{" "}
                      <span className="font-semibold text-gray-900">
                        {formatPrice(pedido.total)}
                      </span>
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(pedido.createdAt)}
                  </div>
                  {expandedPedido === pedido._id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedPedido === pedido._id && (
                <div className="border-t border-gray-200 p-4">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="mb-3 font-semibold text-gray-900">
                        Datos de envío
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-green-600" />
                          <span className="text-gray-600">Nombre:</span>
                          <span className="font-medium text-gray-900">
                            {pedido.nombreCompleto}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-600" />
                          <span className="text-gray-600">WhatsApp:</span>
                          <span className="font-medium text-gray-900">
                            {pedido.whatsapp}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-green-600" />
                          <span className="text-gray-600">Dirección:</span>
                          <span className="font-medium text-gray-900">
                            {pedido.direccion}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-green-600" />
                          <span className="text-gray-600">Ciudad:</span>
                          <span className="font-medium text-gray-900">
                            {pedido.ciudad}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span className="text-gray-600">Barrio:</span>
                          <span className="font-medium text-gray-900">
                            {pedido.barrio}
                          </span>
                        </div>
                        {pedido.paymentMethod && (
                          <div className="flex items-center gap-2">
                            {pedido.paymentMethod === "efectivo" ? (
                              <Banknote className="w-4 h-4 text-green-600" />
                            ) : pedido.paymentMethod === "nequi" ? (
                              <Smartphone className="w-4 h-4 text-green-600" />
                            ) : pedido.paymentMethod === "daviplata" ? (
                              <Wallet className="w-4 h-4 text-green-600" />
                            ) : pedido.paymentMethod === "efecty" ? (
                              <Receipt className="w-4 h-4 text-green-600" />
                            ) : (
                              <CreditCard className="w-4 h-4 text-green-600" />
                            )}
                            <span className="text-gray-600">Forma de pago:</span>
                            <span className="font-medium text-gray-900 capitalize">
                              {pedido.paymentMethod === "efectivo"
                                ? "Efectivo"
                                : pedido.paymentMethod === "nequi"
                                ? "Nequi"
                                : pedido.paymentMethod === "daviplata"
                                ? "Daviplata"
                                : pedido.paymentMethod === "efecty"
                                ? "Efecty"
                                : "Tarjeta"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 font-semibold text-gray-900">
                        Productos
                      </h3>
                      <div className="space-y-2">
                        {pedido.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                          >
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-white flex-shrink-0 border">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Cant: {item.quantity} x{" "}
                                {formatPrice(item.discount ?? item.price)}
                              </p>
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              {formatPrice(
                                (item.discount ?? item.price) * item.quantity
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-green-50 p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                      <div>
                        <span className="text-gray-600">Subtotal:</span>
                        <p className="font-medium">
                          {formatPrice(pedido.subtotal)}
                        </p>
                      </div>
                      {pedido.discount > 0 && (
                        <div>
                          <span className="text-gray-600">Descuento:</span>
                          <p className="font-medium text-red-600">
                            -{formatPrice(pedido.discount)}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Domicilio:</span>
                        <p className="font-medium">
                          {formatPrice(pedido.delivery)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <p className="font-bold">
                          {formatPrice(pedido.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
