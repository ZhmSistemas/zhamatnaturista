'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { showToast } from 'nextjs-toast-notify'
import { Eye, EyeOff } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  whatsapp: string
  isAdmin: boolean
  isUser: boolean
}

type EditSection = 'email' | 'whatsapp' | 'password' | null

export default function ProfileEditForm() {
  const { data: session, update: updateSession } = useSession()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editSection, setEditSection] = useState<EditSection>(null)
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

  // Estados para editar cada campo
  const [formData, setFormData] = useState({
    email: '',
    whatsapp: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch('/api/users/profile')
        if (!res.ok) {
          if (res.status === 401) {
            showToast.error('No autorizado. Por favor inicia sesión de nuevo.')
          } else {
            throw new Error('Error al cargar el perfil')
          }
          return
        }

        const userData = await res.json()
        setUser(userData)
        setFormData({
          email: userData.email,
          whatsapp: userData.whatsapp,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } catch (error) {
        showToast.error(error instanceof Error ? error.message : 'Error al cargar el perfil')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchUserProfile()
    }
  }, [session?.user?.id])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateWhatsapp = (whatsapp: string) => {
    const whatsappRegex = /^[0-9]{7,15}$/
    return whatsappRegex.test(whatsapp)
  }

  const handleEditEmail = () => {
    setErrors({})
    setFormData(prev => ({ ...prev, email: user?.email || '' }))
    setEditSection('email')
  }

  const handleEditWhatsapp = () => {
    setErrors({})
    setFormData(prev => ({ ...prev, whatsapp: user?.whatsapp || '' }))
    setEditSection('whatsapp')
  }

  const handleEditPassword = () => {
    setErrors({})
    setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
    setEditSection('password')
    setShowPasswords({ current: false, new: false, confirm: false })
  }

  const handleCancel = () => {
    setEditSection(null)
    setErrors({})
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        whatsapp: user.whatsapp,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
    }
  }

  const handleSaveEmail = async () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Correo inválido'
    } else if (formData.email === user?.email) {
      newErrors.email = 'Ingresa un correo diferente al actual'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar el correo')
      }

      setUser(data.user)
      setEditSection(null)
      showToast.success('Correo actualizado exitosamente')

      // Actualizar sesión
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          email: data.user.email,
        },
      })
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : 'Error al actualizar el correo')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveWhatsapp = async () => {
    const newErrors: Record<string, string> = {}

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'El número de WhatsApp es requerido'
    } else if (!validateWhatsapp(formData.whatsapp)) {
      newErrors.whatsapp = 'El número debe tener entre 7 y 15 dígitos'
    } else if (formData.whatsapp === user?.whatsapp) {
      newErrors.whatsapp = 'Ingresa un número diferente al actual'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp: formData.whatsapp }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar el WhatsApp')
      }

      setUser(data.user)
      setEditSection(null)
      showToast.success('Número de WhatsApp actualizado exitosamente')

      // Actualizar sesión
      await updateSession({
        ...session,
        user: {
          ...session?.user,
        },
      })
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : 'Error al actualizar el WhatsApp')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePassword = async () => {
    const newErrors: Record<string, string> = {}

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'La contraseña actual es requerida'
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'La nueva contraseña es requerida'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al cambiar la contraseña')
      }

      setEditSection(null)
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
      showToast.success('Contraseña actualizada exitosamente')
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : 'Error al cambiar la contraseña')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Error al cargar el perfil</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

        {/* Información del Usuario */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Información Personal</h2>

          <div className="space-y-4">
            {/* Nombre (solo lectura) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                value={user.name}
                disabled
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Correo</label>
                {/* {editSection !== 'email' && (
                  <button
                    onClick={handleEditEmail}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    Editar
                  </button>
                )} */}
              </div>

              {editSection === 'email' ? (
                <div className="space-y-3">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }))
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="nuevo@correo.com"
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEmail}
                      disabled={saving}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-not-allowed"
                />
              )}
            </div>

            {/* WhatsApp */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Celular (WhatsApp)</label>
               {/*  {editSection !== 'whatsapp' && (
                  <button
                    onClick={handleEditWhatsapp}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    Editar
                  </button>
                )} */}
              </div>

              {editSection === 'whatsapp' ? (
                <div className="space-y-3">
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, whatsapp: e.target.value }))
                      if (errors.whatsapp) setErrors(prev => ({ ...prev, whatsapp: '' }))
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="3001234567"
                  />
                  {errors.whatsapp && <p className="text-sm text-red-600">{errors.whatsapp}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveWhatsapp}
                      disabled={saving}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <input
                  type="tel"
                  value={user.whatsapp}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-not-allowed"
                />
              )}
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Seguridad</h2>

          {editSection === 'password' ? (
            <div className="space-y-4">
              {/* Contraseña Actual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, currentPassword: e.target.value }))
                      if (errors.currentPassword) setErrors(prev => ({ ...prev, currentPassword: '' }))
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                    placeholder="Tu contraseña actual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.currentPassword}</p>
                )}
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, newPassword: e.target.value }))
                      if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' }))
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                    placeholder="Tu nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>}
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))
                      if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }))
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                    placeholder="Confirma tu nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSavePassword}
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                  {saving ? 'Guardando...' : 'Cambiar Contraseña'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">Gestiona tu contraseña de forma segura</p>
              <button
                onClick={handleEditPassword}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Cambiar Contraseña
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
