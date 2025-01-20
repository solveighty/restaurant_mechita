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
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0)

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
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.data && response.data.items) {
        setCartItems(response.data.items)
      } else {
        setCartItems([])
      }
    } catch (error) {
      console.error('Error al obtener items del carrito:', error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  // Agregar item al carrito
  const addToCart = async (menuId, cantidad = 1) => {
    if (!userId) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      console.log('Token de autenticación:', token)
      const response = await axios.post(
        `http://localhost:8080/carrito/agregar/${userId}/${menuId}`,
        { cantidad },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.status === 200) {
        setCartUpdateTrigger(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error al agregar item al carrito:', error)
    } finally {
      setLoading(false)
    }
  }

  // Eliminar item del carrito
  const removeItem = async (itemId) => {
    if (!userId) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.delete(
        `http://localhost:8080/carrito/eliminar/${userId}/${itemId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (response.status === 200) {
        setCartUpdateTrigger(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error al eliminar item:', error)
    } finally {
      setLoading(false)
    }
  }

  // Actualizar cantidad de un item
  const updateItemQuantity = async (itemId, cantidad) => {
    if (!userId) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `http://localhost:8080/carrito/actualizar/${userId}/${itemId}`,
        { cantidad },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.status === 200) {
        setCartUpdateTrigger(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error)
    } finally {
      setLoading(false)
    }
  }

  // Procesar el pago
  const processPayment = async () => {
    if (!userId) return false

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `http://localhost:8080/carrito/pagar/${userId}`,
        { metodoPago: paymentMethod },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.status === 200) {
        setCartItems([])
        return true
      }
      return false
    } catch (error) {
      console.error('Error al procesar el pago:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Calcular total del carrito
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.menu.precio * item.cantidad), 0)
  }

  // Efecto para recargar items cuando cambie el userId o el trigger
  useEffect(() => {
    if (userId) {
      fetchCartItems()
    }
  }, [userId, cartUpdateTrigger])

  const value = {
    cartItems,
    loading,
    paymentMethod,
    setPaymentMethod,
    addToCart,
    removeItem,
    updateItemQuantity,
    processPayment,
    calculateTotal,
    fetchCartItems
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