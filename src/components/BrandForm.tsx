"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "nextjs-toast-notify";

export default function BrandForm() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast.error("El nombre de la marca es obligatorio");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la marca");
      }

      showToast.success("Marca creada exitosamente");
      setName("");

      if (window.parent !== window) {
        window.parent.postMessage(
          { type: "UPDATE_DASHBOARD_SELECTION", option: "muestramarca" },
          "*"
        );
      }
      router.push("/dashboard/productos/mostrarproductos");
    } catch (error) {
      if (error instanceof Error) {
        showToast.error(error.message);
      } else {
        showToast.error("Ocurrió un error inesperado");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Crear Marca</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-xl bg-white p-8 shadow-lg"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre de la Marca
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Natura, Herbalife, etc."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
        >
          {isLoading ? "Guardando..." : "Guardar Marca"}
        </button>
      </form>
    </div>
  );
}
