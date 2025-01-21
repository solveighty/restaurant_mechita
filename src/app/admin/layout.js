'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/Admin/AdminLayout'
import { redirect } from 'next/navigation'
import { decodeJwt } from 'jose'
import url_Backend from '@/context/config'

export default function Layout({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          redirect('/login')
          return
        }

        const decodedToken = decodeJwt(token)
        const response = await fetch(
          `http://${url_Backend}:8080/usuarios/${decodedToken.id}/esAdmin`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        
        const isAdminResponse = await response.json()
        
        if (!isAdminResponse) {
          redirect('/')
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error('Error verificando estado de admin:', error)
        redirect('/')
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null // El redirect se manejará en el useEffect
  }

  return <AdminLayout>{children}</AdminLayout>
} 