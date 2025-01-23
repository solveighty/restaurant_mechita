'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { decodeJwt } from 'jose'
import url_Backend from './config'
import { toast } from 'react-toastify';
import { useNotifications } from './NotificationContext'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO')

  const { fetchNotifications } = useNotifications()

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
      const response = await axios.get(`http://${url_Backend}:8080/carrito/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      
      // Asumiendo que la respuesta tiene la estructura correcta
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

  // Recargar items cuando cambie el userId
  useEffect(() => {
    if (userId) {
      fetchCartItems()
    }
  }, [userId])

  // Función para eliminar item del carrito
  const removeItem = async (itemId) => {
    if (!userId) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://${url_Backend}:8080/carrito/eliminar/${userId}/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      toast.success('Producto eliminado del carrito exitosamente', { autoClose: 2000, closeOnClick: true, hideProgressBar: true });
      
      // Recargar items después de eliminar
      await fetchCartItems()
    } catch (error) {
      console.error('Error al eliminar item:', error)
    }
  }

  // Función para procesar el pago
  const processPayment = async () => {
    if (!userId) return false

    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `http://${url_Backend}:8080/carrito/pagar/${userId}`,
        { metodoPago: paymentMethod },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.status === 200) {
        toast.success('Pago realizado exitosamente', { 
          autoClose: 2000, 
          closeOnClick: true, 
          hideProgressBar: true 
        });
        setCartItems([]) // Limpiar carrito
        await fetchNotifications() // Actualizar notificaciones
        return true
      }
      return false
    } catch (error) {
      toast.error('Error al procesar el pago', { 
        autoClose: 2000, 
        closeOnClick: true, 
        hideProgressBar: true 
      });
      console.error('Error al procesar el pago:', error)
      return false
    }
  }

  // Calcular total del carrito
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