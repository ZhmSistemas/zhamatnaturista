'use client'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import ListaPedidos from '@/components/ListaPedidos'

export default function PedidosPage() {
  const { status } = useSession()
  if (status === 'loading') return <div className="flex justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" /></div>
  if (status === 'unauthenticated') redirect('/auth/login')
  return <ListaPedidos />
}
