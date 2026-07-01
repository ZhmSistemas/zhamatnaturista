'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import ProfileEditForm from '@/components/ProfileEditForm'

export default function PerfilPage() {
  const { status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    redirect('/auth/login')
  }

  return <ProfileEditForm />
}
