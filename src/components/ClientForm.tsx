'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { showToast } from 'nextjs-toast-notify'

const clientSchema = z.object({
  establishmentName: z.string().min(2, 'El nombre del establecimiento debe tener al menos 2 caracteres'),
  contactName: z.string().min(2, 'El nombre de contacto debe tener al menos 2 caracteres'),
  whatsapp: z.string().min(10, 'El número de WhatsApp debe tener al menos 10 dígitos'),
  email: z.string().min(1, 'El correo electrónico es obligatorio').email('Correo electrónico inválido'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
})

type ClientFormInputs = z.infer<typeof clientSchema>

export default function ClientForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClientFormInputs>({
    resolver: zodResolver(clientSchema),
    defaultValues: { establishmentName: '', contactName: '', whatsapp: '', email: '', address: '' }
  })

  const onSubmit = async (data: ClientFormInputs) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear el cliente')
      }

      showToast.success('Cliente creado exitosamente!')
      reset()
      setTimeout(() => {
        // Notificar al dashboard padre que debe cambiar la selección
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'UPDATE_DASHBOARD_SELECTION',
            option: 'muestracliente'
          }, '*')
        }
        router.push('/dashboard/clientes/mostrarcliente')
      }, 1500)
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800">Crear Cliente</h2>

      <div>
        <label htmlFor="establishmentName" className="block text-sm font-medium text-gray-700">
          Nombre del Establecimiento
        </label>
        <input
          id="establishmentName"
          type="text"
          {...register('establishmentName')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        {errors.establishmentName && (
          <p className="mt-1 text-sm text-red-600">{errors.establishmentName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
          Nombre de Contacto
        </label>
        <input
          id="contactName"
          type="text"
          {...register('contactName')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        {errors.contactName && (
          <p className="mt-1 text-sm text-red-600">{errors.contactName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
          WhatsApp
        </label>
        <input
          id="whatsapp"
          type="tel"
          {...register('whatsapp')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        {errors.whatsapp && (
          <p className="mt-1 text-sm text-red-600">{errors.whatsapp.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo Electrónico
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Dirección
        </label>
        <textarea
          id="address"
          {...register('address')}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? 'Guardando...' : 'Guardar Cliente'}
      </button>
    </form>
  )
}
