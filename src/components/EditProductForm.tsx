'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { showToast } from 'nextjs-toast-notify'
import { Save, ArrowLeft } from 'lucide-react'
import type { Product } from '@/lib/models/ProductModel'
import Image from 'next/image'

type FormData = {
  name: string
  price: number
  description: string
  stock: number
  discount?: number
  codigo?: string
  categoria?: string
  marca?: string
  precioCompra?: number
  componentes?: string
  formaConsumo?: string
}

type Option = { _id: string; name: string }

export default function EditProductForm({ product }: { product: Product }) {
  const [isLoading, setIsLoading] = useState(false)
  const [imagen, setImagen] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(product.image || "")
  const [brands, setBrands] = useState<Option[]>([])
  const [categories, setCategories] = useState<Option[]>([])
  const router = useRouter()

  useEffect(() => {
    return () => {
      if (previewUrl && !previewUrl.startsWith('http')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => setBrands(Array.isArray(data) ? data : []))
      .catch(() => setBrands([]))
  }, [])

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
  }, [])

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    defaultValues: {
      name: product.name,
      price: product.price,
      description: product.description || '',
      stock: product.stock || 0,
      discount: product.discount || 0,
      codigo: product.codigo || '',
      categoria: product.categoria || '',
      marca: product.marca || '',
      precioCompra: product.precioCompra || 0,
      componentes: product.componentes || '',
      formaConsumo: product.formaConsumo || '',
    }
  })

  useEffect(() => {
    if (categories.length > 0 && product.categoria) {
      setValue('categoria', product.categoria)
    }
  }, [categories, product.categoria, setValue])

  useEffect(() => {
    if (brands.length > 0 && product.marca) {
      setValue('marca', product.marca)
    }
  }, [brands, product.marca, setValue])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      setImagen(files[0])
      const objectUrl = URL.createObjectURL(files[0])
      setPreviewUrl(objectUrl)
    }
  }

  const uploadImage = async (file: File) => {
    if (!file) return null
    const formData = new FormData()
    formData.append("file", file)
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    )
    formData.append("folder", "imageproduct")
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      if (!cloudName) {
        throw new Error("El nombre de la nube de Cloudinary no está definido")
      }

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      )
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(`Cloudinary error: ${errorData.error.message}`)
      }
      const data = await res.json()
      return {
        public_id: data.public_id,
        image_url: data.secure_url,
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error)
      throw error
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      let imageUrl = product.image || ""

      if (imagen) {
        const uploadedImage = await uploadImage(imagen)
        if (!uploadedImage || !uploadedImage.image_url) {
          throw new Error("No se pudo obtener la URL de la imagen subida")
        }
        imageUrl = uploadedImage.image_url
      }

      const response = await fetch(`/api/products/${product._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, image: imageUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al actualizar el producto')
      }

      showToast.success('Producto actualizado exitosamente')
      setTimeout(() => {
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'UPDATE_DASHBOARD_SELECTION',
            option: 'muestraproducto'
          }, '*')
        }
        router.push('/dashboard/productos/mostrarproductos')
      }, 1500)
    } catch (error) {
      if (error instanceof Error) {
        showToast.error(error.message)
      } else {
        showToast.error('Ocurrió un error inesperado')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Producto
            </label>
            <input
              type="text"
              {...register('name', { required: 'El nombre es obligatorio' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register('price', { 
                  required: 'El precio es obligatorio',
                  min: { value: 0, message: 'El precio debe ser mayor a 0' }
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock
              </label>
              <input
                type="number"
                min="0"
                {...register('stock', { 
                  required: 'El stock es obligatorio',
                  min: { value: 0, message: 'El stock no puede ser negativo' }
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Precio con descuento (Opcional)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              {...register('discount', {
                setValueAs: (v) => {
                  const n = Number(v)
                  return isNaN(n) ? undefined : n
                }
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Código (Opcional)
              </label>
              <input
                type="text"
                {...register('codigo')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Categoría
              </label>
              <select
                {...register('categoria')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Marca
              </label>
              <select
                {...register('marca')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Seleccionar marca</option>
                {brands.map((b) => (
                  <option key={b._id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio de compra (Opcional)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register('precioCompra', {
                  setValueAs: (v) => {
                    const n = Number(v)
                    return isNaN(n) ? undefined : n
                  }
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Componentes (Opcional)
            </label>
            <textarea
              {...register('componentes')}
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Forma de Consumo (Opcional)
            </label>
            <input
              type="text"
              {...register('formaConsumo')}
              placeholder="Ej: cantidad en la mañana..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Imagen del Producto
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {previewUrl && (
              <div className="mt-4">
                <Image
                  src={previewUrl}
                  alt="Vista previa"
                  className="h-32 w-32 rounded-md object-cover"
                  width={128}
                  height={128}
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  )
}
