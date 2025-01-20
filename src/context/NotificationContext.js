'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { decodeJwt } from 'jose'
import url_Backend from './config'
import { toast } from 'react-toastify';

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
      const response = await axios.get(`http://${url_Backend}:8080/notificaciones/usuario/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Filtrar y ordenar notificaciones
      const filteredNotifications = response.data
        .filter(notification => notification.tipoNotificacion === 'USUARIO')
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      
      if (filteredNotifications.length > 0) {
        toast.success('Tienes una nueva notificación', { autoClose: 2000, closeOnClick: true, hideProgressBar: true, position: "bottom-right" });
      }

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
        `http://${url_Backend}:8080/notificaciones/marcar-leida/${notificationId}`,
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
      toast.success('Notificación marcada como leída', { autoClose: 2000, closeOnClick: true, hideProgressBar: true, position: "bottom-right" });
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