'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { decodeJwt } from 'jose'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

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

  const fetchNotifications = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:8080/notificaciones/usuario/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Filtrar y ordenar notificaciones
      const filteredNotifications = response.data
        .filter(notification => notification.tipoNotificacion === 'USUARIO')
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

      setNotifications(filteredNotifications)
    } catch (error) {
      console.error('Error al obtener notificaciones:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `http://localhost:8080/notificaciones/marcar-leida/${notificationId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      // Actualizar el estado local
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId
            ? { ...notif, leida: true }
            : notif
        )
      )
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId])

  const value = {
    notifications,
    loading,
    fetchNotifications,
    markAsRead
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
} 