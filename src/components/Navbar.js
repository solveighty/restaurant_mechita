'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Menu as MenuIcon, X, Book, Phone, UserCircle, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import * as jose from 'jose'
import axios from 'axios'
import Image from 'next/image'


export default function Navbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const pathname = usePathname()
  const router = useRouter()

  // Referencias para los menús
  const notificationRef = useRef(null)
  const userMenuRef = useRef(null)
  const cartRef = useRef(null)

  // Obtener userId del token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decodedToken = jose.decodeJwt(token)
        setUserId(decodedToken.id)
      } catch (error) {
        console.error('Error al decodificar el token:', error)
      }
    }
  }, [])

  // Cargar items del carrito
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userId) return

      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`http://localhost:8080/carrito/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        console.log('Respuesta del servidor:', response.data)
        console.log('Items del carrito:', response.data.items)
        setCartItems(response.data.items || [])
      } catch (error) {
        console.error('Error al obtener items del carrito:', error)
        setCartItems([])
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchCartItems()
    }
  }, [userId, isCartOpen])

  // Cerrar menús al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationMenuOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Función de logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setTimeout(() => {
      setIsUserMenuOpen(false);
      router.push('/account/login'); 
    }, 100);
  };

  // Verificar si estamos en una ruta de autenticación
  const isAuthRoute = pathname?.startsWith('/account/login') || pathname?.startsWith('/account/register');
  
  // Si estamos en una ruta de autenticación, no renderizar el navbar
  if (isAuthRoute) {
    return null;
  }

  const navigation = [
    { name: 'Menú', href: '/menu', icon: Book },
    { name: 'Contacto', href: '/contact/information', icon: Phone },
  ]

  const userNavigation = [
    { name: 'Perfil', href: '/account/profile', icon: UserCircle },
    { name: 'Cerrar Sesión', href: '#', icon: LogOut, onClick: handleLogout },
  ]

  const NavLink = ({ href, children, className = '', onClick }) => {
    const isActive = pathname === href
    
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          href={href}
          onClick={onClick}
          className={`${
            isActive 
              ? 'text-orange-500 font-semibold' 
              : 'text-gray-600 hover:text-orange-500'
          } ${className} transition-colors duration-200`}
        >
          {children}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-md sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y navegación principal */}
          <div className="flex">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 flex items-center"
            >
              <Link href="/" className="text-xl sm:text-2xl font-bold text-orange-500">
                Comidas Mechita
              </Link>
            </motion.div>
            
            {/* Enlaces de navegación - Desktop */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
              {navigation.map((item) => (
                <NavLink 
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Botón de usuario y menú móvil */}
          <div className="flex items-center">
            {/* Menú de notificaciones - Desktop y Mobile */}
            <div className="relative" ref={notificationRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}
                className="flex items-center text-gray-600 hover:text-orange-500 focus:outline-none p-2 rounded-full hover:bg-orange-50"
              >
                <Bell className="w-6 h-6" />
              </motion.button>

              {/* Menú de notificaciones */}
              <AnimatePresence>
                {isNotificationMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1"
                  >
                    <div className="py-2">
                      <p className="px-4 py-2 text-sm text-gray-700">No tienes nuevas notificaciones</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Carrito de Compras */}
            <motion.div className="relative mr-4" ref={cartRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="flex items-center text-gray-600 hover:text-orange-500 focus:outline-none p-2 rounded-full hover:bg-orange-50"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {/* Badge para cantidad de items */}
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItems.length}
                </span>
              </motion.button>

              <AnimatePresence>
                {isCartOpen && (
                  <>
                    {/* Overlay para móviles */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                      onClick={() => setIsCartOpen(false)}
                    />

                    {/* Carrito para móviles */}
                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                      className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 lg:hidden"
                    >
                      <div className="flex flex-col h-full">
                        {/* Encabezado del carrito */}
                        <div className="flex items-center justify-between p-4 border-b">
                          <h3 className="text-lg font-semibold">Carrito de Compras</h3>
                          <button
                            onClick={() => setIsCartOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Contenido del carrito - Mobile */}
                        <div className="flex-1 overflow-y-auto p-4">
                          {loading ? (
                            <div className="flex justify-center items-center h-32">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            </div>
                          ) : cartItems.length === 0 ? (
                            <p className="text-gray-500 text-center">No hay items en el carrito</p>
                          ) : (
                            <div className="space-y-4">
                              {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                                  <div className="relative h-16 w-16">
                                    <Image
                                      src={item.menu.imagen}
                                      alt={item.menu.nombre}
                                      fill
                                      className="object-cover rounded-md"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">{item.menu.nombre}</h4>
                                    <p className="text-sm text-gray-500">
                                      Cantidad: {item.cantidad}
                                    </p>
                                    <p className="text-orange-500 font-medium">
                                      ${(item.menu.precio * item.cantidad).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer del carrito */}
                        <div className="border-t p-4">
                          <div className="flex justify-between mb-4">
                            <span className="font-semibold">Total:</span>
                            <span className="font-semibold">
                              ${cartItems.reduce((total, item) => total + (item.menu.precio * item.cantidad), 0).toFixed(2)}
                            </span>
                          </div>
                          <button
                            className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                            disabled={cartItems.length === 0}
                          >
                            Ir a Pagar
                          </button>
                        </div>
                      </div>
                    </motion.div>

                    {/* Carrito para desktop */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-96 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden lg:block"
                    >
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Carrito de Compras</h3>
                        
                        {/* Lista de items */}
                        <div className="max-h-96 overflow-y-auto mb-4">
                          {loading ? (
                            <div className="flex justify-center items-center h-32">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            </div>
                          ) : cartItems.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No hay items en el carrito</p>
                          ) : (
                            <div className="space-y-4">
                              {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                                  <div className="relative h-16 w-16">
                                    <Image
                                      src={item.menu.imagen}
                                      alt={item.menu.nombre}
                                      fill
                                      className="object-cover rounded-md"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">{item.menu.nombre}</h4>
                                    <p className="text-sm text-gray-500">
                                      Cantidad: {item.cantidad}
                                    </p>
                                    <p className="text-orange-500 font-medium">
                                      ${(item.menu.precio * item.cantidad).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="border-t pt-4">
                          <div className="flex justify-between mb-4">
                            <span className="font-semibold">Total:</span>
                            <span className="font-semibold">
                              ${cartItems.reduce((total, item) => total + (item.menu.precio * item.cantidad), 0).toFixed(2)}
                            </span>
                          </div>
                          <button
                            className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            disabled={cartItems.length === 0}
                          >
                            Ir a Pagar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Menú de usuario - Desktop y Mobile */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center text-gray-600 hover:text-orange-500 focus:outline-none p-2 rounded-full hover:bg-orange-50"
              >
                <User className="w-6 h-6" />
              </motion.button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1"
                  >
                    <Link href="/account/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Perfil</Link>
                    <Link href="#" onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cerrar Sesión</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
} 