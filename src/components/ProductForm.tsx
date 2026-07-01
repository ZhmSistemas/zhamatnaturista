"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { showToast } from "nextjs-toast-notify";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  stock: z.number().min(0, "La cantidad no puede ser negativa"),
  description: z.string().optional(),
  discount: z.number().min(0, "el descuento no puede ser negativo"),
  codigo: z.string().optional(),
  categoria: z.string().optional(),
  marca: z.string().optional(),
  precioCompra: z.number().min(0, "El precio de compra no puede ser negativo").optional(),
  componentes: z.string().optional(),
  formaConsumo: z.string().optional(),
});

interface ProductFormInputs {
  name: string;
  price: number;
  stock: number;  
  discount: number;
  description?: string;
  codigo?: string;
  categoria?: string;
  marca?: string;
  precioCompra?: number;
  componentes?: string;
  formaConsumo?: string;
}

type BrandOption = { _id: string; name: string };

export default function ProductForm() {
  const [imagen, setImagen] = useState<File | null>(null);  
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [categories, setCategories] = useState<BrandOption[]>([]);

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => setBrands(Array.isArray(data) ? data : []))
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProductFormInputs>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      stock: 0,
      description: "",
      discount: 0,
      codigo: "",
      categoria: "",
      marca: "",
      precioCompra: 0,
      componentes: "",
      formaConsumo: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setImagen(files[0]);
      // Crear URL de vista previa
      const objectUrl = URL.createObjectURL(files[0]);
      setPreviewUrl(objectUrl);
    }
  };

  const uploadImage = async (file: File) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );
    // Añade el nombre de la carpeta aquí
    formData.append("folder", "imageproduct");
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error("El nombre de la nube de Cloudinary no está definido");
      }

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Cloudinary error: ${errorData.error.message}`);
      }
      const data = await res.json();
      console.log(data.secure_url);

      return {
        public_id: data.public_id,
        image_url: data.secure_url,
      };
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      throw error;
    }
  };

  const onSubmit = async (form: ProductFormInputs) => {
    const {
      name,
      price,
      stock,
      description,
      discount,
      codigo,
      categoria,
      marca,
      precioCompra,
      componentes,
      formaConsumo,
    } = form;

    try {
      setIsLoading(true);

      if (!imagen) {
        throw new Error("No se ha seleccionado ninguna imagen");
      }

      const uploadedImage = await uploadImage(imagen);
      if (!uploadedImage || !uploadedImage.image_url) {
        throw new Error("No se pudo obtener la URL de la imagen subida");
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price,
          stock,
          description,
          discount,
          codigo,
          categoria,
          marca,
          precioCompra,
          componentes,
          formaConsumo,
          image_url: uploadedImage.image_url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el producto");
      }

      showToast.success("Producto creado exitosamente");
      if (window.parent !== window) {
        window.parent.postMessage(
          { type: "UPDATE_DASHBOARD_SELECTION", option: "muestraproducto" },
          "*"
        );
      }
      router.push("/dashboard/productos/mostrarproductos");
    } catch (error) {
      if (error instanceof Error) {
        showToast.error(error.message);
      } else {
        showToast.error("Ocurrio un error inesperado");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Crear Producto</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl bg-white p-8 shadow-lg"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre del Producto
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            aria-invalid={errors.name ? "true" : "false"}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
              Código 
            </label>
            <input
              id="codigo"
              type="text"
              required
              {...register("codigo")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="precioCompra" className="block text-sm font-medium text-gray-700">
              Precio de compra (Opcional)
            </label>
            <input
              id="precioCompra"
              type="number"
              min="0"              
              {...register("precioCompra", { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
            {errors.precioCompra && (
              <p className="mt-1 text-sm text-red-600">{errors.precioCompra.message}</p>
            )}
          </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            Precio de Venta
          </label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            aria-invalid={errors.price ? "true" : "false"}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-gray-700"
          >
            Cantidad (Stock)
          </label>
          <input
            id="stock"
            type="number"
            {...register("stock", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            aria-invalid={errors.stock ? "true" : "false"}
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="discount"
            className="block text-sm font-medium text-gray-700"
          >
            Precio con descuento (Opcional)
          </label>
          <input
            id="discount"
            type="number"
            min="0"
            step="0.01"
            {...register("discount", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
          {errors.discount && (
            <p className="mt-1 text-sm text-red-600">{errors.discount.message}</p>
          )}
        </div>

        
          

          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              id="categoria"
              {...register("categoria")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        

        
          <div>
            <label htmlFor="marca" className="block text-sm font-medium text-gray-700">
              Marca
            </label>
            <select
              id="marca"
              {...register("marca")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Seleccionar marca</option>
              {brands.map((b) => (
                <option key={b._id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          
        

        <div>
          <label htmlFor="componentes" className="block text-sm font-medium text-gray-700">
            Componentes (Opcional)
          </label>
          <textarea
            id="componentes"
            {...register("componentes")}
            rows={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="formaConsumo" className="block text-sm font-medium text-gray-700">
            Forma de Consumo (Opcional)
          </label>
          <input
            id="formaConsumo"
            type="text"
            {...register("formaConsumo")}
            placeholder="Ej: Tabletas, Cápsulas, Polvo, Líquido..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Descripción (Opcional)
          </label>
          <textarea
            id="description"
            {...register("description")}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="imagen"
            className="block text-sm font-medium text-gray-700"
          >
            Imagen del Producto
          </label>
          <input
            id="imagen"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {previewUrl && (
            <div className="mt-4">
              <img
                src={previewUrl}
                alt="Vista previa"
                className="h-32 w-32 rounded-md object-cover"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
        >
          {isLoading ? "Guardando..." : "Guardar Producto"}
        </button>
      </form>
    </div>
  );
}
