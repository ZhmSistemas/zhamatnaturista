"use client";

import { useState, useEffect } from "react";
import { showToast } from "nextjs-toast-notify";
import ConfirmModal from "./ConfirmModal";

type ShippingItem = {
  productId: string;
  name: string;
  price: number;
  discount?: number;
  image?: string;
  quantity: number;
};

type Shipping = {
  _id: string;
  userId: string;
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
  paymentMethod?: string;
  status?: string;
  enviado: boolean;
  cardType?: string;
  franchise?: string;
  createdAt: string;
};

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  paid: "OK",
  rejected: "Rechazado",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const isRechazado = (status?: string) => status === "rejected";

type ConfirmAction =
  | { type: "enviado"; id: string; enviadoActual: boolean }
  | { type: "pagado"; id: string }
  | { type: "deshacerPago"; id: string }
  | null;

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState<Shipping[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction>(null);

  const fetchPedidos = async () => {
    try {
      const res = await fetch("/api/shipping/admin");
      if (!res.ok) throw new Error("Error al cargar pedidos");
      const data = await res.json();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showToast.error("Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const ejecutarToggleEnviado = async (id: string) => {
    try {
      const res = await fetch(`/api/shipping/admin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleEnviado: true }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      const updated = await res.json();
      setPedidos((prev) =>
        prev.map((p) => (p._id === id ? { ...p, enviado: updated.enviado } : p))
      );
      showToast.success(
        updated.enviado
          ? "Pedido marcado como enviado"
          : "Pedido marcado como no enviado"
      );
    } catch (error) {
      console.error(error);
      showToast.error("Error al actualizar el pedido");
    }
  };

  const ejecutarMarcarPagado = async (id: string) => {
    try {
      const res = await fetch(`/api/shipping/admin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      const updated = await res.json();
      setPedidos((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: updated.status } : p))
      );
      showToast.success("Pago marcado como recibido");
    } catch (error) {
      console.error(error);
      showToast.error("Error al actualizar el pago");
    }
  };

  const confirmarEnviado = (id: string, enviadoActual: boolean) => {
    setConfirm({ type: "enviado", id, enviadoActual });
  };

  const confirmarPagado = (id: string) => {
    setConfirm({ type: "pagado", id });
  };

  const confirmarDeshacerPago = (id: string) => {
    setConfirm({ type: "deshacerPago", id });
  };

  const ejecutarDeshacerPago = async (id: string) => {
    try {
      const res = await fetch(`/api/shipping/admin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending" }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      const updated = await res.json();
      setPedidos((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: updated.status } : p))
      );
      showToast.success("Pago revertido a pendiente");
    } catch (error) {
      console.error(error);
      showToast.error("Error al revertir el pago");
    }
  };

  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.type === "enviado") ejecutarToggleEnviado(confirm.id);
    if (confirm.type === "pagado") ejecutarMarcarPagado(confirm.id);
    if (confirm.type === "deshacerPago") ejecutarDeshacerPago(confirm.id);
    setConfirm(null);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Pedidos</h1>

      {pedidos.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No hay pedidos registrados</p>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const rechazado = isRechazado(pedido.status);

            return (
              <div
                key={pedido._id}
                className="rounded-xl bg-white shadow-lg overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedId(expandedId === pedido._id ? null : pedido._id)
                  }
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        rechazado
                          ? "bg-red-500"
                          : pedido.enviado
                            ? "bg-green-500"
                            : "bg-yellow-400"
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {pedido.nombreCompleto}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(pedido.createdAt)} — {pedido.items.length}{" "}
                        producto(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {formatPrice(pedido.total)}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[pedido.status ?? "pending"]
                      }`}
                    >
                      Pago: {statusLabel[pedido.status ?? "pending"] ?? pedido.status}
                    </span>
                    {!rechazado && (
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          pedido.enviado
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        Envío: {pedido.enviado ? "OK" : "Pendiente"}
                      </span>
                    )}
                  </div>
                </div>

                {expandedId === pedido._id && (
                  <div className="border-t border-gray-200 p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Dirección</p>
                        <p className="font-medium">
                          {pedido.direccion}, {pedido.barrio}, {pedido.ciudad}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">WhatsApp</p>
                        <p className="font-medium">{pedido.whatsapp}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Método de pago</p>
                        <p className="font-medium capitalize">
                          {pedido.paymentMethod ?? "No especificado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Estado del pago</p>
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            statusColors[pedido.status ?? "pending"]
                          }`}
                        >
                          {statusLabel[pedido.status ?? "pending"] ?? pedido.status}
                        </span>
                      </div>
                    </div>

                    {pedido.cardType && (
                      <div className="text-sm">
                        <p className="text-gray-500">Tipo de tarjeta</p>
                        <p className="font-medium">
                          {pedido.cardType === "DEBIT" ? "Débito" : pedido.cardType === "CREDIT" ? "Crédito" : pedido.cardType}
                          {pedido.franchise && <span className="text-gray-400"> — {pedido.franchise}</span>}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Productos
                      </p>
                      <div className="space-y-2">
                        {pedido.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatPrice(item.price)} x {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium text-sm">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span>{formatPrice(pedido.subtotal)}</span>
                      </div>
                      {pedido.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Descuento</span>
                          <span className="text-red-600">
                            -{formatPrice(pedido.discount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Envío</span>
                        <span>{formatPrice(pedido.delivery)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-base pt-1 border-t border-gray-200">
                        <span>Total</span>
                        <span>{formatPrice(pedido.total)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {pedido.paymentMethod === "efectivo" && pedido.status !== "paid" && (
                        <button
                          onClick={() => confirmarPagado(pedido._id)}
                          className="flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          Marcar como pagado
                        </button>
                      )}
                      {pedido.paymentMethod === "efectivo" && pedido.status === "paid" && (
                        <button
                          onClick={() => confirmarDeshacerPago(pedido._id)}
                          className="flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                        >
                          Deshacer pago
                        </button>
                      )}
                      <button
                        onClick={() => confirmarEnviado(pedido._id, pedido.enviado)}
                        disabled={rechazado}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          rechazado
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : pedido.enviado
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {rechazado
                          ? "No disponible (pago rechazado)"
                          : pedido.enviado
                            ? "Marcar como no enviado"
                            : "Marcar como enviado"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={confirm !== null}
        title={
          confirm?.type === "pagado"
            ? "Confirmar pago"
            : confirm?.type === "deshacerPago"
              ? "Revertir pago"
              : confirm?.type === "enviado"
                ? confirm.enviadoActual
                  ? "Confirmar"
                  : "Confirmar envío"
                : ""
        }
        message={
          confirm?.type === "pagado"
            ? "¿Estás seguro de marcar este pago como recibido?"
            : confirm?.type === "deshacerPago"
              ? "¿Estás seguro de revertir el pago a pendiente?"
              : confirm?.type === "enviado"
                ? confirm.enviadoActual
                  ? "¿Estás seguro de marcar este pedido como no enviado?"
                  : "¿Estás seguro de marcar este pedido como enviado?"
                : ""
        }
        confirmLabel="Sí, confirmar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
