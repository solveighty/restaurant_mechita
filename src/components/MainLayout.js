'use client'

import Navbar from '@/components/Navbar'
import { usePathname } from 'next/navigation'
import { CartProvider } from '@/context/CartContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function MainLayout({ children }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  return (
    <NotificationProvider>
      <CartProvider>
        {!isAdminRoute && <Navbar />}
        {children}
        <ToastContainer />
      </CartProvider>
    </NotificationProvider>
  )
} 