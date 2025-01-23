'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Menu as MenuIcon, X, Book, Phone, UserCircle, Bell, Trash2, Package, LayoutDashboard } from 'lucide-react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import CartItem from './Cart/CartItem'
import CartFooter from './Cart/CartFooter'
import { useNotifications } from '@/context/NotificationContext'
import NotificationItem from './Notifications/NotificationItem'
import axios from 'axios'
import url_Backend from '@/context/config'


export default function Navbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { cartItems, loading: cartLoading } = useCart()
  const { notifications, loading: notificationsLoading, markAsRead } = useNotifications()
  const [userRole, setUserRole] = useState(null)
  const [userId, setUserId] = useState(null)

  // Referencias para los menús
  const notificationRef = useRef(null)
  const userMenuRef = useRef(null)
  const cartRef = useRef(null)

  // Función para manejar clicks fuera de los menús
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

  // Verificar el token y obtener el rol cuando cambie la ruta
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.id);
        
        // Obtener información del usuario
        const fetchUserRole = async () => {
          try {
            const response = await axios.get(
              `http://${url_Backend}:8080/usuarios/obtenerusuario/${payload.id}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            setUserRole(response.data.rol);
          } catch (error) {
            console.error('Error al obtener rol del usuario:', error);
          }
        };

        fetchUserRole();
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    } else {
      setUserRole(null);
      setUserId(null);
    }
  }, [pathname]);

  // Función de logout (actualizar para limpiar el userRole)
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserRole(null);
    setUserId(null);
    setTimeout(() => {
      setIsUserMenuOpen(false);
      router.push('/account/login'); 
    }, 100);
  };

  const navigation = [
    { name: 'Menú', href: '/menu', icon: Book },
    { name: 'Contacto', href: '/contact/information', icon: Phone },
  ]

  const userNavigation = [
    { name: 'Perfil', href: '/account/profile', icon: UserCircle },
    { name: 'Mis Pedidos', href: '/account/orders', icon: Package },
    ...(userRole === 'ADMIN' ? [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard }
    ] : []),
    { name: 'Cerrar Sesión', href: '#', icon: LogOut, onClick: handleLogout },
  ]

  // Verificar si estamos en una ruta de autenticación
  const isAuthRoute = pathname?.startsWith('/account/login') || pathname?.startsWith('/account/register');
  
  // Si estamos en una ruta de autenticación, no renderizar el navbar
  if (isAuthRoute) {
    return null;
  }

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
              <button
                onClick={() => {
                  setIsNotificationMenuOpen(!isNotificationMenuOpen)
                  setIsCartOpen(false)
                  setIsUserMenuOpen(false)
                }}
                className="relative p-2 text-gray-600 hover:text-orange-500"
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                {notifications.filter(n => !n.leida).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.filter(n => !n.leida).length}
                  </span>
                )}
              </button>
              
              {/* Panel de notificaciones con AnimatePresence */}
              <AnimatePresence>
                {isNotificationMenuOpen && (
                  <>
                    {/* Overlay animado */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
                      onClick={() => setIsNotificationMenuOpen(false)}
                    />
                    
                    {/* Panel de notificaciones animado */}
                    <motion.div 
                      initial={{ 
                        opacity: 0,
                        y: '100%',
                        scale: 0.95,
                        ...(window.innerWidth >= 768 ? {
                          x: 20,
                          y: 0
                        } : {})
                      }}
                      animate={{ 
                        opacity: 1,
                        y: 0,
                        x: 0,
                        scale: 1
                      }}
                      exit={{ 
                        opacity: 0,
                        y: '100%',
                        scale: 0.95,
                        ...(window.innerWidth >= 768 ? {
                          x: 20,
                          y: 0
                        } : {})
                      }}
                      transition={{
                        duration: 0.2,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      className={`
                        fixed md:absolute 
                        inset-x-0 bottom-0 md:inset-auto 
                        md:right-0 md:top-full md:mt-2
                        z-50 md:z-10 
                        w-full md:w-[28rem] 
                        bg-white 
                        rounded-t-2xl md:rounded-lg 
                        shadow-lg
                      `}
                    >
                      <div className="flex flex-col h-[80vh] md:h-auto md:max-h-[calc(100vh-10rem)]">
                        {/* Indicador de arrastre para móviles */}
                        <motion.div 
                          className="h-1.5 w-12 bg-gray-300 rounded-full mx-auto my-2 md:hidden"
                          initial={{ width: '2rem' }}
                          animate={{ width: '3rem' }}
                          transition={{ duration: 0.2 }}
                        />

                        {/* Header */}
                        <div className="px-4 py-3 bg-gray-50 rounded-t-2xl md:rounded-t-lg">
                          <div className="flex items-center justify-between">
                            <motion.h3 
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.1 }}
                              className="text-sm font-medium text-gray-900"
                            >
                              Notificaciones
                            </motion.h3>
                            <div className="flex items-center gap-3">
                              <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-xs text-gray-500"
                              >
                                {notifications.filter(n => !n.leida).length} sin leer
                              </motion.span>
                              <motion.button 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                onClick={() => setIsNotificationMenuOpen(false)}
                                className="md:hidden -mr-1 p-2 text-gray-400 hover:text-gray-500"
                              >
                                <span className="sr-only">Cerrar</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        {/* Lista de notificaciones */}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="flex-1 overflow-y-auto overscroll-contain"
                        >
                          {notificationsLoading ? (
                            <div className="flex justify-center items-center h-32">
                              <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full"
                              />
                            </div>
                          ) : notifications.length === 0 ? (
                            <motion.div 
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="px-4 py-8 text-center"
                            >
                              <Package className="mx-auto h-8 w-8 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">No hay notificaciones</p>
                            </motion.div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {notifications.map((notification, index) => (
                                <motion.div
                                  key={notification.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <NotificationItem notification={notification} />
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </motion.div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                          <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="px-4 py-3 bg-gray-50 text-right border-t border-gray-100"
                          >
                            <button
                              onClick={() => {
                                Promise.all(
                                  notifications
                                    .filter(n => !n.leida)
                                    .map(n => markAsRead(n.id))
                                )
                                setIsNotificationMenuOpen(false)
                              }}
                              className="text-xs text-orange-600 hover:text-orange-700"
                            >
                              Marcar todas como leídas
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Carrito de Compras */}
            <motion.div className="relative mr-4" ref={cartRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsCartOpen(!isCartOpen)
                  setIsNotificationMenuOpen(false)
                  setIsUserMenuOpen(false)
                }}
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
                          {cartLoading ? (
                            <div className="flex justify-center items-center h-32">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            </div>
                          ) : cartItems.length === 0 ? (
                            <p className="text-gray-500 text-center">No hay items en el carrito</p>
                          ) : (
                            <div className="space-y-4">
                              {cartItems.map((item) => (
                                <CartItem key={item.id} item={item} />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer del carrito */}
                        <CartFooter onClose={() => setIsCartOpen(false)} />
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
                          {cartLoading ? (
                            <div className="flex justify-center items-center h-32">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            </div>
                          ) : cartItems.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No hay items en el carrito</p>
                          ) : (
                            <div className="space-y-4">
                              {cartItems.map((item) => (
                                <CartItem key={item.id} item={item} />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <CartFooter onClose={() => setIsCartOpen(false)} />
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
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen)
                  setIsNotificationMenuOpen(false)
                  setIsCartOpen(false)
                }}
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
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={item.onClick}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <item.icon className="mr-3 h-5 w-5 text-gray-400" />
                        {item.name}
                      </Link>
                    ))}
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