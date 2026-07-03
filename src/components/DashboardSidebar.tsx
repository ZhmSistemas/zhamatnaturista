"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type MenuOption =
  | "creafactura"
  | "muestrafactura"
  | "creaproducto"
  | "muestraproducto"
  | "creacliente"
  | "muestracliente"
  | "usuarios"
  | "creamarca"
  | "creacategoria";

const menuItems: { id: MenuOption; label: string; icon: string }[] = [
  { id: "creafactura", label: "Crear Factura", icon: "📄" },
  { id: "muestrafactura", label: "Mostrar Factura", icon: "📋" },
  { id: "creaproducto", label: "Crear Productos", icon: "📦" },
  { id: "muestraproducto", label: "Mostrar Productos", icon: "📦" },
  { id: "creacliente", label: "Crear Cliente", icon: "👤" },
  { id: "muestracliente", label: "Mostrar Clientes", icon: "👤" },
  { id: "usuarios", label: "Mostrar Usuarios", icon: "👥" },
  { id: "creamarca", label: "Crear Marca", icon: "🏷️" },
  { id: "creacategoria", label: "Crear Categoría", icon: "📂" },
];

const optionRoutes: Record<MenuOption, string> = {
  creafactura: "/dashboard/facturas/creafactura",
  muestrafactura: "/dashboard/facturas/muestrafactura",
  creaproducto: "/dashboard/productos/creaproducto",
  muestraproducto: "/dashboard/productos/mostrarproductos",
  creacliente: "/dashboard/clientes/creacliente",
  muestracliente: "/dashboard/clientes/mostrarcliente",
  usuarios: "/dashboard/usuarios/listausuarios",
  creamarca: "/dashboard/marcas/creamarca",
  creacategoria: "/dashboard/categorias/creacategoria",
};

const pathToOption: Record<string, MenuOption> = {};
for (const [option, route] of Object.entries(optionRoutes)) {
  pathToOption[route] = option as MenuOption;
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentOption = pathToOption[pathname] ?? null;

  const handleMenuClick = (option: MenuOption) => {
    setSidebarOpen(false);
    router.push(optionRoutes[option]);
  };

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 right-4 z-30 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors lg:hidden"
        title={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 z-20 w-64 bg-gray-800 text-white p-4 space-y-2 h-full transition-transform duration-300 ease-in-out`}
      >
        <h2 className="text-xl font-bold mb-6 pl-10 lg:pl-0">
          <Link href="/dashboard">Dashboard</Link>
        </h2>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              currentOption === item.id
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
