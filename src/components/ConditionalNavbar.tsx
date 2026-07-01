'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Ocultar Navbar en rutas que empiecen con /dashboard
  if (pathname?.startsWith('/dashboard')) {
    return null
  }
  
  return <Navbar />
}
