'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Menu as MenuIcon, X, Book, Phone, UserCircle, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

const menuVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
}

const itemVariants = {
  closed: { opacity: 0, x: -16 },
  open: { opacity: 1, x: 0 }
}

export default function Navbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Referencias para los menús
  const notificationRef = useRef(null)
  const userMenuRef = useRef(null)

  // Cerrar menús al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationMenuOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Función de logout
  const handleLogout = () => { // Verifica si se llama a esta función
    localStorage.removeItem('token'); // Eliminar el token
    setTimeout(() => {
      setIsUserMenuOpen(false);
      router.push('/account/login'); 
    }, 100);
  };

  // Verificar si estamos en una ruta de autenticación
  const isAuthRoute = pathname?.startsWith('/account/')
  
  // Si estamos en una ruta de autenticación, no renderizar el navbar
  if (isAuthRoute) {
    return null
  }

  const navigation = [
    { name: 'Menú', href: '/menu', icon: Book },
    { name: 'Contacto', href: '/contact/information', icon: Phone },
  ]

  const userNavigation = [
    { name: 'Perfil', href: '/user/profile', icon: UserCircle },
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
                    <Link href="/user/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Perfil</Link>
                    <Link href="#" onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cerrar Sesión</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Botón de menú móvil */}
            <div className="flex items-center sm:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-orange-500 hover:bg-orange-50 focus:outline-none"
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <MenuIcon className="w-6 h-6" />
                  )}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="sm:hidden bg-white border-t border-gray-200"
          >
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <motion.div
                  key={item.name}
                  variants={itemVariants}
                  className="w-full"
                >
                  <NavLink
                    href={item.href}
                    className="flex items-center px-4 py-2 text-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </NavLink>
                </motion.div>
              ))}
            </div>
            <motion.div 
              variants={itemVariants}
              className="pt-4 pb-3 border-t border-gray-200"
            >
              <div className="space-y-1">
                {userNavigation.map((item) => (
                  <motion.div
                    key={item.name}
                    whileHover={{ backgroundColor: "#fff8f0" }}
                    className="w-full"
                  >
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        setIsMobileMenuOpen(false)
                        item.onClick?.(e)
                      }}
                      className="flex items-center px-4 py-2 text-base text-gray-600 hover:text-orange-500"
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
} 