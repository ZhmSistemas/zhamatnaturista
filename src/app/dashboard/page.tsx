"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  total: number;
  balance: number;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  totalInvoices: number;
  pendingCount: number;
  partialCount: number;
  paidCount: number;
  pendingAmount: number;
  partialAmount: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/invoices");
        if (!res.ok) throw new Error("Error al cargar facturas");
        const invoices: Invoice[] = await res.json();

        const pending = invoices.filter((inv) => inv.status === "pending");
        const partial = invoices.filter((inv) => inv.status === "partial");
        const paid = invoices.filter((inv) => inv.status === "paid");

        const pendingAmount = pending.reduce((sum, inv) => sum + inv.balance, 0);
        const partialAmount = partial.reduce((sum, inv) => sum + inv.balance, 0);
        const totalRevenue = paid.reduce((sum, inv) => sum + inv.total, 0);

        setStats({
          totalInvoices: invoices.length,
          pendingCount: pending.length,
          partialCount: partial.length,
          paidCount: paid.length,
          pendingAmount: pendingAmount + partialAmount,
          partialAmount,
          totalRevenue,
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      const millions = (price / 1000000).toFixed(1);
      return `$${millions.replace(".", ",")}M`;
    }
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Dashboard - Resumen
      </h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando estadísticas...</p>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Facturas
            </h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {stats.totalInvoices}
            </p>
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>
                ✅ Pagadas:{" "}
                <span className="font-semibold">{stats.paidCount}</span>
              </p>
              <p>
                ⚠️ Abonadas:{" "}
                <span className="font-semibold">{stats.partialCount}</span>
              </p>
              <p>
                ❌ Pendientes:{" "}
                <span className="font-semibold">{stats.pendingCount}</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
            <h3 className="text-lg font-semibold text-gray-700">
              Valor Pendiente de Pago
            </h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {formatPrice(stats.pendingAmount)}
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Incluye facturas pendientes y abonadas
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <h3 className="text-lg font-semibold text-gray-700">
              Ingresos (Facturas Pagadas)
            </h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {formatPrice(stats.totalRevenue)}
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Total recaudado en facturas pagadas
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600">
            <h3 className="text-lg font-semibold text-gray-700">
              Facturas Pendientes
            </h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {stats.pendingCount}
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Requieren pago completo
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600">
            <h3 className="text-lg font-semibold text-gray-700">
              Facturas Abonadas
            </h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {stats.partialCount}
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Saldo pendiente: {formatPrice(stats.partialAmount)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <h3 className="text-lg font-semibold text-gray-700">
              Acciones Rápidas
            </h3>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => router.push("/dashboard/facturas/creafactura")}
                className="w-full text-left px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                + Crear Nueva Factura
              </button>
              <button
                onClick={() => router.push("/dashboard/facturas/muestrafactura")}
                className="w-full text-left px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                📋 Ver Todas las Facturas
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Error al cargar las estadísticas</p>
        </div>
      )}
    </div>
  );
}
