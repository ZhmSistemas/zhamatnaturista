import { Client } from '@/lib/models/ClientModel'
import ClientList from '@/components/ClientList'

async function getClients() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/clients`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Error al obtener clientes')
  const clients: Client[] = await res.json()
  return clients
}

export default async function MostrarClientePage() {
  const clients = await getClients()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Lista de Clientes</h1>
      <ClientList clients={clients} />
    </div>
  )
}
