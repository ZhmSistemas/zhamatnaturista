'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Client } from '@/lib/models/ClientModel'
import { showToast } from 'nextjs-toast-notify'

export default function ClientList({ clients }: { clients: Client[] }) {
  const router = useRouter()
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Error al eliminar cliente')

      showToast.success('Cliente eliminado exitosamente!')
      router.refresh()
    } catch {
      showToast.error('Error al eliminar el cliente')
    } finally {
      setIsDeleting(false)
      setClientToDelete(null)
    }
  }

  if (clients.length === 0) {
    return <p className="text-center text-gray-500">No hay clientes registrados</p>
  }

  return (
    <>
      <div className="space-y-4">
        {clients.map((client) => (
          <div key={client._id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{client.establishmentName}</h3>
                <p className="text-sm text-gray-600">Contacto: {client.contactName}</p>
              </div>
              <div className="text-sm text-gray-600">
                <p>WhatsApp: {client.whatsapp || client._id}</p>
                <p>Dirección: {client.address}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setClientToDelete(client._id)}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Confirmar eliminación</h3>
            <p className="mb-6 text-gray-600">¿Estás seguro de eliminar este cliente?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setClientToDelete(null)}
                className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(clientToDelete)}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
