'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

type MenuOption =  'creafactura' | 'muestrafactura' | 'creaproducto' | 'muestraproducto' | 'creacliente' | 'muestracliente' | 'usuarios' | 'creamarca' | 'creacategoria' | null

interface Invoice {
  _id: string
  invoiceNumber: string
  customerName: string
  total: number
  balance: number
  status: string
  createdAt: string
}

interface DashboardStats {
  totalInvoices: number
  pendingCount: number
  partialCount: number
  paidCount: number
  pendingAmount: number
  partialAmount: number
  totalRevenue: number
}

export default function DashboardPage() {
  const [selectedOption, setSelectedOption] = useState<MenuOption>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetTimer, setResetTimer] = useState<NodeJS.Timeout | null>(null)

  const menuItems = [    
    { id: 'creafactura' as MenuOption, label: 'Crear Factura', icon: '📄' },
    { id: 'muestrafactura' as MenuOption, label: 'Mostrar Factura', icon: '📋' },
    { id: 'creaproducto' as MenuOption, label: 'Crear Productos', icon: '📦' },
    { id: 'muestraproducto' as MenuOption, label: 'Mostrar Productos', icon: '📦' },
    { id: 'creacliente' as MenuOption, label: 'Crear Cliente', icon: '👤' },
    { id: 'muestracliente' as MenuOption, label: 'Mostrar Clientes', icon: '👤' },
    { id: 'usuarios' as MenuOption, label: 'Mostrar Usuarios', icon: '👥' },
    { id: 'creamarca' as MenuOption, label: 'Crear Marca', icon: '🏷️' },
    { id: 'creacategoria' as MenuOption, label: 'Crear Categoría', icon: '📂' },
  ]

  const getIframeSrc = () => {
    switch (selectedOption) {
      case 'creafactura':
        return '/dashboard/facturas/creafactura'
      case 'muestrafactura':
        return '/dashboard/facturas/muestrafactura'
      case 'creaproducto':
        return '/dashboard/productos/creaproducto'
      case 'muestraproducto':
        return '/dashboard/productos/mostrarproductos'
      case 'creacliente':
        return '/dashboard/clientes/creacliente'
      case 'muestracliente':
        return '/dashboard/clientes/mostrarcliente'
      case 'usuarios':
        return '/dashboard/usuarios/listausuarios'
      case 'creamarca':
        return '/dashboard/marcas/creamarca'
      case 'creacategoria':
        return '/dashboard/categorias/creacategoria'
      default:
        return null
    }
  }

  const handleMenuClick = (option: MenuOption) => {
    setSelectedOption(option)
    setSidebarOpen(false)

    // Limpiar timer anterior si existe
    if (resetTimer) {
      clearTimeout(resetTimer)
    }
    
  }

  const handleBackToHome = () => {
    setSelectedOption(null)
    if (resetTimer) {
      clearTimeout(resetTimer)
      setResetTimer(null)
    }
  }

  const getMenuOptionFromUrl = (url: string): MenuOption => {
    if (url.includes('/dashboard/facturas/creafactura')) return 'creafactura'
    if (url.includes('/dashboard/facturas/muestrafactura')) return 'muestrafactura'
    if (url.includes('/dashboard/productos/creaproducto')) return 'creaproducto'
    if (url.includes('/dashboard/productos/mostrarproductos')) return 'muestraproducto'
    if (url.includes('/dashboard/clientes/creacliente')) return 'creacliente'
    if (url.includes('/dashboard/clientes/mostrarcliente')) return 'muestracliente'
    if (url.includes('/dashboard/usuarios/listausuarios')) return 'usuarios'
    if (url.includes('/dashboard/marcas/creamarca')) return 'creamarca'
    if (url.includes('/dashboard/categorias/creacategoria')) return 'creacategoria'
    return null
  }

  const handleIframeLoad = () => {
    try {
      const iframe = document.querySelector('iframe')
      if (iframe && iframe.contentWindow) {
        // Intentar obtener la URL del iframe
        const iframeUrl = iframe.src || iframe.contentDocument?.location?.href
        if (iframeUrl) {
          const option = getMenuOptionFromUrl(iframeUrl)
          if (option && option !== selectedOption) {
            setSelectedOption(option)
            // Reiniciar el timer si es necesario
            if (resetTimer) {
              clearTimeout(resetTimer)
            }
          }
        }
      }
    } catch (error) {
      // Ignorar errores de CORS
      console.log('No se pudo acceder al contenido del iframe', error)
    }
  }

  // Escuchar mensajes desde las páginas hijas
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'UPDATE_DASHBOARD_SELECTION') {
        const option = event.data.option as MenuOption
        if (option !== selectedOption) {
          setSelectedOption(option)
          // Reiniciar el timer si es necesario
          if (resetTimer) {
            clearTimeout(resetTimer)
          }          
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [selectedOption, resetTimer])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/invoices')
        if (!res.ok) throw new Error('Error al cargar facturas')
        const invoices: Invoice[] = await res.json()

        const pending = invoices.filter(inv => inv.status === 'pending')
        const partial = invoices.filter(inv => inv.status === 'partial')
        const paid = invoices.filter(inv => inv.status === 'paid')

        const pendingAmount = pending.reduce((sum, inv) => sum + inv.balance, 0)
        const partialAmount = partial.reduce((sum, inv) => sum + inv.balance, 0)
        const totalRevenue = paid.reduce((sum, inv) => sum + inv.total, 0)

        setStats({
          totalInvoices: invoices.length,
          pendingCount: pending.length,
          partialCount: partial.length,
          paidCount: paid.length,
          pendingAmount: pendingAmount + partialAmount,
          partialAmount,
          totalRevenue
        })
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Limpiar timer al desmontar el componente
  useEffect(() => {
    return () => {
      if (resetTimer) {
        clearTimeout(resetTimer)
      }
    }
  }, [resetTimer])

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      const millions = (price / 1000000).toFixed(1)
      return `$${millions.replace('.', ',')}M`
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] relative">
      {/* Botón toggle sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 right-4 z-30 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors lg:hidden"
        title={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar overlay en móvil / estático en desktop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative lg:translate-x-0 z-20 w-64 bg-gray-800 text-white p-4 space-y-2 h-full transition-transform duration-300 ease-in-out`}
      >
        <h2 className="text-xl font-bold mb-6 pl-10 lg:pl-0"><Link href="/">Dashboard</Link></h2>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
              selectedOption === item.id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden bg-gray-100">
        {selectedOption ? (
          <div className="h-full flex flex-col">
            {/* Header con botón de volver */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToHome}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                  title="Volver al inicio del dashboard"
                >
                  ← Volver al Inicio
                </button>
                <span className="text-gray-500 text-sm">
                  {menuItems.find(i => i.id === selectedOption)?.label}
                </span>
              </div>              
            </div>

            {/* Iframe con el contenido */}
            <iframe
              src={getIframeSrc()!}
              className="flex-1 w-full border-0"
              title={menuItems.find(i => i.id === selectedOption)?.label}
              onLoad={handleIframeLoad}
            />
          </div>
        ) : (
          <div className="p-6 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard - Resumen</h1>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Cargando estadísticas...</p>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Facturas */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
                  <h3 className="text-lg font-semibold text-gray-700">Total Facturas</h3>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.totalInvoices}</p>
                  <div className="mt-4 text-sm text-gray-600 space-y-1">
                    <p>✅ Pagadas: <span className="font-semibold">{stats.paidCount}</span></p>
                    <p>⚠️ Abonadas: <span className="font-semibold">{stats.partialCount}</span></p>
                    <p>❌ Pendientes: <span className="font-semibold">{stats.pendingCount}</span></p>
                  </div>
                </div>

                {/* Valor Pendiente */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
                  <h3 className="text-lg font-semibold text-gray-700">Valor Pendiente de Pago</h3>
                  <p className="text-3xl font-bold text-red-600 mt-2">{formatPrice(stats.pendingAmount)}</p>
                  <p className="mt-4 text-sm text-gray-600">
                    Incluye facturas pendientes y abonadas
                  </p>
                </div>

                {/* Ingresos Totales */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
                  <h3 className="text-lg font-semibold text-gray-700">Ingresos (Facturas Pagadas)</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{formatPrice(stats.totalRevenue)}</p>
                  <p className="mt-4 text-sm text-gray-600">
                    Total recaudado en facturas pagadas
                  </p>
                </div>

                {/* Facturas Pendientes */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600">
                  <h3 className="text-lg font-semibold text-gray-700">Facturas Pendientes</h3>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingCount}</p>
                  <p className="mt-4 text-sm text-gray-600">
                    Requieren pago completo
                  </p>
                </div>

                {/* Facturas Abonadas */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600">
                  <h3 className="text-lg font-semibold text-gray-700">Facturas Abonadas</h3>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.partialCount}</p>
                  <p className="mt-4 text-sm text-gray-600">
                    Saldo pendiente: {formatPrice(stats.partialAmount)}
                  </p>
                </div>

                {/* Acciones Rápidas */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
                  <h3 className="text-lg font-semibold text-gray-700">Acciones Rápidas</h3>
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => handleMenuClick('creafactura')}
                      className="w-full text-left px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      + Crear Nueva Factura
                    </button>
                    <button
                      onClick={() => handleMenuClick('muestrafactura')}
                      className="w-full text-left px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      📋 Ver Todas las Facturas
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Error al cargar las estadísticas</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}