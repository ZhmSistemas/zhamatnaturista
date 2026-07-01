"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { showToast } from "nextjs-toast-notify";
import {
  ChevronDown,
  ChevronUp,
  Package,
  X,
} from "lucide-react";
import Image from "next/image";

type InvoiceItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
};

type Payment = {
  amount: number;
  date: string;
  method: string;
};

type Invoice = {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  clientWhatsapp: string;
  invoiceDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  payments: Payment[];
  paidAmount: number;
  balance: number;
  status: "pending" | "partial" | "paid";
  image?: string;
  createdAt: string;
};

export default function ListaFacturas() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatPrice = (amount: number) => {
    const rounded = Math.round(amount);
    return "$" + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            Pagada
          </span>
        );
      case "partial":
        return (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
            Abonada
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
            Pendiente
          </span>
        );
    }
  };

  useEffect(() => {
    if (session?.user?.whatsapp) {
      fetchInvoices();
    }
  }, [session]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/invoices?clientWhatsapp=${session?.user?.whatsapp}`);
      if (!res.ok) throw new Error("Error al cargar facturas");
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : "Error al cargar facturas");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedInvoice(expandedInvoice === id ? null : id);
  };

  const addPayment = async (invoiceId: string, amount: string, method: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment: { amount: Number(amount), method },
        }),
      });

      if (!res.ok) throw new Error("Error al registrar abono");

      const { invoice: updatedInvoice } = await res.json();
      setInvoices(
        invoices.map((inv) => (inv._id === invoiceId ? updatedInvoice : inv))
      );
      showToast.success("Abono registrado exitosamente");
    } catch {
      showToast.error("Error al registrar el abono");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full p-6 lg:w-5/6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Mis Facturas</h1>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Usuario: {session?.user?.name}</p>        
      </div>

      {invoices.length > 0 && (
        <div className="mb-6 grid w-full grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-center">
            <p className="text-xs font-medium text-indigo-600 uppercase">Todas</p>
            <p className="text-lg font-bold text-indigo-700">
              {formatPrice(invoices.reduce((sum, inv) => sum + inv.total, 0))}
            </p>
            <p className="mt-1 text-xs text-indigo-500">
              {invoices.length} factura{invoices.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
            <p className="text-xs font-medium text-red-600 uppercase">Pendiente</p>
            <p className="text-lg font-bold text-red-700">
              {formatPrice(invoices.reduce((sum, inv) => sum + inv.balance, 0))}
            </p>
            <p className="mt-1 text-xs text-red-500">
              {invoices.filter((inv) => inv.balance > 0).length} factura{invoices.filter((inv) => inv.balance > 0).length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-center">
            <p className="text-xs font-medium text-yellow-600 uppercase">Abonos</p>
            <p className="text-lg font-bold text-yellow-700">
              {formatPrice(
                invoices
                  .filter((inv) => inv.status === "partial")
                  .reduce((sum, inv) => sum + inv.paidAmount, 0),
              )}
            </p>
            <p className="mt-1 text-xs text-yellow-500">
              {invoices.filter((inv) => inv.status === "partial").length} factura{invoices.filter((inv) => inv.status === "partial").length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
            <p className="text-xs font-medium text-green-600 uppercase">Pagada</p>
            <p className="text-lg font-bold text-green-700">
              {formatPrice(
                invoices
                  .filter((inv) => inv.status === "paid")
                  .reduce((sum, inv) => sum + inv.total, 0),
              )}
            </p>
            <p className="mt-1 text-xs text-green-500">
              {invoices.filter((inv) => inv.status === "paid").length} factura{invoices.filter((inv) => inv.status === "paid").length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          No tienes facturas registradas
        </div>
      ) : (
        <div className="space-y-2 w-full">
          {invoices.map((invoice) => (
            <div
              key={invoice._id}
              className={`rounded-lg border shadow-sm transition-all duration-200 ${
                expandedInvoice === invoice._id
                  ? invoice.status === "paid"
                    ? "bg-green-100 border-green-300 ring-2 ring-green-400"
                    : invoice.status === "partial"
                    ? "bg-yellow-100 border-yellow-300 ring-2 ring-yellow-400"
                    : "bg-red-100 border-red-300 ring-2 ring-red-400"
                  : invoice.status === "paid"
                  ? "bg-green-50 border-green-200"
                  : invoice.status === "partial"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div
                className={`flex flex-col sm:flex-row cursor-pointer items-start sm:items-center justify-between p-4 gap-3 sm:gap-0 ${
                  invoice.status === "paid"
                    ? "hover:bg-green-100"
                    : invoice.status === "partial"
                    ? "hover:bg-yellow-100"
                    : "hover:bg-red-100"
                }`}
                onClick={() => toggleExpand(invoice._id)}
              >
                <div className="flex items-center gap-4">
                  {invoice.image ? (
                    <div
                      className="h-12 w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border border-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(invoice.image!);
                      }}
                    >
                      <Image
                        src={invoice.image}
                        alt="Factura"
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                      <Package className="h-5 w-5 text-indigo-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {invoice.customerName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-600">
                      Total: {formatPrice(invoice.total)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Saldo:{" "}
                      <span
                        className={
                          invoice.balance > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {formatPrice(invoice.balance)}
                      </span>
                    </p>
                  </div>
                  {getStatusBadge(invoice.status)}
                  <div className="text-sm text-gray-500 hidden sm:block">
                    {formatDate(invoice.invoiceDate || invoice.createdAt)}
                  </div>
                  {expandedInvoice === invoice._id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedInvoice === invoice._id && (
                <div className="border-t border-gray-200 p-4">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="mb-3 font-semibold text-gray-900">
                        Productos
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[300px]">
                          <thead>
                            <tr className="border-b text-left text-gray-600">
                              <th className="pb-2">Producto</th>
                              <th className="pb-2">Cant</th>
                              <th className="pb-2">Precio</th>
                              <th className="pb-2">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoice.items.map((item, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="py-2">{item.productName}</td>
                                <td className="py-2">{item.quantity}</td>
                                <td className="py-2">
                                  {formatPrice(item.price)}
                                </td>
                                <td className="py-2">
                                  {formatPrice(item.subtotal)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 font-semibold text-gray-900">
                        Abonos / Pagos
                      </h3>
                      {invoice.payments.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Sin abonos registrados
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm min-w-[300px]">
                            <thead>
                              <tr className="border-b text-left text-gray-600">
                                <th className="pb-2">Monto</th>
                                <th className="pb-2">Método</th>
                                <th className="pb-2">Fecha</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoice.payments.map((payment, idx) => (
                                <tr key={idx} className="border-b">
                                  <td className="py-2">
                                    {formatPrice(payment.amount)}
                                  </td>
                                  <td className="py-2">
                                    {payment.method === "cash"
                                      ? "Efectivo"
                                      : payment.method === "card"
                                      ? "Tarjeta"
                                      : "Transferencia"}
                                  </td>
                                  <td className="py-2">
                                    {formatDate(payment.date)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                      <div>
                        <span className="text-gray-600">Subtotal:</span>
                        <p className="font-medium">
                          {formatPrice(invoice.subtotal)}
                        </p>
                      </div>
                      {invoice.discount > 0 && (
                        <div>
                          <span className="text-gray-600">Descuento:</span>
                          <p className="font-medium text-red-600">
                            -{formatPrice(invoice.discount)}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <p className="font-bold">
                          {formatPrice(invoice.total)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Abonado:</span>
                        <p className="font-medium text-green-600">
                          {formatPrice(invoice.paidAmount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Saldo:</span>
                        <p
                          className={`font-bold ${invoice.balance > 0 ? "text-red-600" : "text-green-600"}`}
                        >
                          {formatPrice(invoice.balance)}
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

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/40"
          >
            <X className="h-6 w-6" />
          </button>
          <Image
            src={selectedImage}
            alt="Factura ampliada"
            width={1200}
            height={1600}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
