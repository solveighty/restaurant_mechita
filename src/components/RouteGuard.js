'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const publicPaths = ['/account/login', '/account/register']

export default function RouteGuard({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    authCheck(pathname)
  }, [pathname])

  function authCheck(url) {
    const token = localStorage.getItem('token')
    
    // Si no hay token y la ruta no es pública, redirigir a login
    if (!token && !publicPaths.includes(url)) {
      setAuthorized(false)
      router.replace('/account/login')
    } else if (token && publicPaths.includes(url)) {
      // Si hay token y está intentando acceder a una ruta pública, redirigir a home
      setAuthorized(false)
      router.replace('/')
    } else {
      setAuthorized(true)
    }
  }

  return authorized ? children : (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  )
} 