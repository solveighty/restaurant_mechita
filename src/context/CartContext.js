'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { decodeJwt } from 'jose'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO')

  // Obtener userId del token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decodedToken = decodeJwt(token)
        setUserId(decodedToken.id)
      } catch (error) {
        console.error('Error al decodificar el token:', error)
      }
    }
  }, [])

  // Cargar items del carrito
  const fetchCartItems = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:8080/carrito/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log('Respuesta del carrito:', response.data)
      setCartItems(response.data.items || [])
    } catch (error) {
      console.error('Error al obtener items del carrito:', error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  // Recargar items cuando cambie el userId
  useEffect(() => {
    if (userId) {
      fetchCartItems()
    }
  }, [userId]) // Solo depende de userId

  // Agregar una función para recargar el carrito manualmente
  const refreshCart = () => {
    if (userId) {
      fetchCartItems()
    }
  }

  // Eliminar item del carrito
  const removeItem = async (itemId) => {
    if (!userId) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:8080/carrito/eliminar/${userId}/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId))
    } catch (error) {
      console.error('Error al eliminar item:', error)
    }
  }

  // Procesar pago
  const processPayment = async () => {
    if (!userId || cartItems.length === 0) return

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `http://localhost:8080/carrito/pagar/${userId}`,
        { metodoPago: paymentMethod },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      setCartItems([])
      return true
    } catch (error) {
      console.error('Error al procesar el pago:', error)
      return false
    }
  }

  // Calcular total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.menu.precio * item.cantidad), 0)
  }

  const value = {
    cartItems,
    loading,
    paymentMethod,
    setPaymentMethod,
    removeItem,
    processPayment,
    calculateTotal,
    fetchCartItems, // Solo exportar si es necesario para actualizaciones manuales
    refreshCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 