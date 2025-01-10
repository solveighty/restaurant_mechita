'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Menu as MenuIcon, X, Home, Book, Phone, UserCircle } from 'lucide-react'

export default function Navbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Menú', href: '/menu', icon: Book },
    { name: 'Contacto', href: '/contact/information', icon: Phone },
  ]

  const userNavigation = [
    { name: 'Perfil', href: '/user/profile', icon: UserCircle },
    { name: 'Cerrar Sesión', href: '#', icon: LogOut, onClick: () => console.log('Cerrar sesión') },
  ]

  const NavLink = ({ href, children, className = '' }) => {
    const isActive = pathname === href
    
    return (
      <Link
        href={href}
        className={`${
          isActive 
            ? 'text-orange-500 font-semibold' 
            : 'text-gray-600 hover:text-orange-500'
        } ${className} transition-colors duration-200`}
      >
        {children}
      </Link>
    )
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y navegación principal */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-orange-500">
                Delicias Express
              </Link>
            </div>
            
            {/* Enlaces de navegación - Desktop */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
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
            {/* Menú de usuario - Desktop */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center text-gray-600 hover:text-orange-500 focus:outline-none"
                >
                  <User className="w-6 h-6" />
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                    >
                      <div className="py-1">
                        {userNavigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={item.onClick}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                          >
                            <item.icon className="w-4 h-4 mr-2" />
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Botón de menú móvil */}
            <div className="flex items-center sm:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-orange-500 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <MenuIcon className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden"
          >
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-2"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </NavLink>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1">
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={item.onClick}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-orange-500"
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
} 