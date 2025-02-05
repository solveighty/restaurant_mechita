'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { ChevronDown, ChevronUp, ShoppingCart, X } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import * as jose from 'jose'
import { toast } from 'react-toastify';
import url_Backend from '@/context/config'
import { useCart } from '@/context/CartContext'
import { useNotifications } from '@/context/NotificationContext'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
}

export default function MenuDisplay() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [userId, setUserId] = useState(null)
  const { fetchCartItems } = useCart()
  const { fetchNotifications } = useNotifications()

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

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No se encontró el token de autenticación')
        }

        const response = await axios.get(`http://${url_Backend}:8080/menu`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const menusWithCorrectImageUrls = response.data.map(menu => ({
          ...menu,
          imagen: menu.imagen.replace(':8080', ':81')
        }))

        setMenuItems(menusWithCorrectImageUrls)
        setLoading(false)
      } catch (error) {
        console.error('Error al obtener el menú:', error)
        setError('Error al cargar el menú')
        setLoading(false)
      }
    }

    fetchMenus()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const categories = [
    { id: 'COMIDAS_RAPIDAS', display: 'Comidas Rápidas' },
    { id: 'PLATOS_ESPECIALES', display: 'Platos Especiales' },
    { id: 'BOCADITOS', display: 'Bocaditos' }
  ]

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setQuantity(1)
  }

  const handleCloseModal = () => {
    setSelectedItem(null)
  }

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, quantity + change))
  }

  const handleAddToCart = async () => {
    if (!selectedItem || !quantity || !userId) {
      console.error('Faltan datos necesarios para agregar al carrito')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `http://${url_Backend}:8080/carrito/agregar`,
        {
          usuarioId: userId,
          menuId: selectedItem.id,
          cantidad: quantity
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.status === 200 || response.status === 201) {
        toast.success('Producto agregado al carrito exitosamente', { 
          autoClose: 2000, 
          closeOnClick: true, 
          hideProgressBar: true 
        });
        await fetchCartItems()
        handleCloseModal()
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error)
      toast.error('Error al agregar al carrito')
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#faf7f2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8"
    >
      {/* Encabezado responsive */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 sm:mb-16"
      >
        <motion.h1 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#2c1810] mb-3 sm:mb-4"
        >
          Nuestro Menú
        </motion.h1>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "6rem" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="h-1 bg-orange-500 mx-auto mb-3 sm:mb-4"
        />
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4"
        >
          Descubre nuestra selección de platos preparados con los mejores ingredientes
        </motion.p>
      </motion.div>

      {/* Categorías con grid responsive */}
      {categories.map((category) => (
        <motion.div
          key={category.id}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="mb-8 sm:mb-16 max-w-7xl mx-auto"
        >
          <motion.div 
            variants={itemVariants}
            className="text-center mb-6 sm:mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-serif text-[#2c1810] mb-2">
              {category.display}
            </h2>
            <div className="w-12 sm:w-16 h-0.5 bg-orange-400 mx-auto"></div>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4"
          >
            {menuItems
              .filter((item) => item.categoria === category.id)
              .map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden cursor-pointer border border-gray-100"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative h-48 sm:h-56 lg:h-64">
                    <Image 
                      src={item.imagen}
                      alt={item.nombre}
                      fill
                      className="object-fill"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={true}
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#2c1810] mb-2">
                      {item.nombre}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2">
                      {item.descripcion}
                    </p>
                    <p className="text-orange-500 font-bold text-lg sm:text-xl">
                      ${item.precio.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </motion.div>
      ))}

      {/* Modal responsive */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
            onClick={handleCloseModal}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-[95%] sm:max-w-4xl relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 z-10"
                onClick={handleCloseModal}
              >
                <X size={24} />
              </motion.button>

              <div className="flex flex-col md:flex-row">
                <motion.div 
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative w-full md:w-1/2 h-56 sm:h-64 md:h-auto"
                >
                  <Image 
                    src={selectedItem.imagen} 
                    alt={selectedItem.nombre}
                    fill
                    className="object-fill"
                  />
                </motion.div>
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="w-full md:w-1/2 p-4 sm:p-6 md:p-8"
                >
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2c1810] mb-3 sm:mb-4">
                    {selectedItem.nombre}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                    {selectedItem.descripcion}
                  </p>
                  <p className="text-orange-500 font-bold text-xl sm:text-2xl mb-4 sm:mb-6">
                    ${selectedItem.precio.toFixed(2)}
                  </p>
                  <div className="flex items-center justify-between mb-4 sm:mb-6 bg-gray-50 rounded-lg p-2 sm:p-3">
                    <button
                      className="text-gray-500 hover:text-orange-500 p-1 sm:p-2"
                      onClick={() => handleQuantityChange(-1)}
                    >
                      <ChevronDown size={20} className="sm:w-6 sm:h-6" />
                    </button>
                    <span className="text-xl sm:text-2xl font-semibold text-[#2c1810]">
                      {quantity}
                    </span>
                    <button
                      className="text-gray-500 hover:text-orange-500 p-1 sm:p-2"
                      onClick={() => handleQuantityChange(1)}
                    >
                      <ChevronUp size={20} className="sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold flex items-center justify-center space-x-2"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Agregar al carrito</span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
